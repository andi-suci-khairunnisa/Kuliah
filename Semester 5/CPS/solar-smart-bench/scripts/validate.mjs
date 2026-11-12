// Headless validation of the simulation core (no DOM, no Three.js, no new dependencies).
// Run: npm run validate
import { createInitialState, advanceSimulation, previewState } from '../src/simulation/model.js';
import { PIDController } from '../src/simulation/pid.js';
import { CONFIG } from '../src/simulation/config.js';

let failures = 0;
const check = (name, ok, detail = '') => { if (!ok) failures += 1; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const f = (n, d = 2) => Number(n).toFixed(d);

const inputs = (o = {}) => ({
  irradianceWm2: 0, ambientTempC: 30, heatInputW: 0, pidSetpointC: 33, manualFanSpeed: 0, fanMode: 'manual',
  requestedLoads: { wireless: false, usb: false, led: false },
  ambientLux: 500, motionDetected: false, displayRequested: false, lightingMode: 'auto', manualLedLevel: 1,
  ...o,
});
function run(inp, seconds, init = {}, pid = new PIDController(), hook = null) {
  let s = { ...createInitialState(), ...init };
  const n = Math.round(seconds / CONFIG.simulation.stepSeconds);
  for (let i = 0; i < n; i++) { s = advanceSimulation(s, typeof inp === 'function' ? inp(s) : inp, pid); if (hook) hook(s); }
  return s;
}

console.log('\nM1 regression (legacy inputs: no lux/PIR/display; controller only unless stated)');
for (const [G, expPv, expSoc] of [[800, 87.55, 95], [300, 32.83, 89.12], [0, 0, 56.30]]) {
  const s = run(inputs({ irradianceWm2: G }), 3 * 3600, { batteryTempC: 30 });
  check(`Exp1 G=${G}: PV=${expPv} W, SOC(3 h)=${expSoc}%`, near(s.pvPowerW, expPv, 0.01) && near(s.socPct, expSoc, 0.1), `PV ${f(s.pvPowerW)} W, SOC ${f(s.socPct)}%`);
}
const legacyFull = { requestedLoads: { wireless: true, usb: true, led: true }, lightingMode: undefined, ambientLux: undefined, displayRequested: undefined };
{ const s = previewState(createInitialState(), inputs({ ...legacyFull, ambientLux: undefined, lightingMode: undefined, displayRequested: undefined }));
  check('Legacy full load = 49 W (M1 maximum)', near(s.totalLoadEffectiveW, 49, 1e-9), `${f(s.totalLoadEffectiveW)} W`); }
// Thermal steady state (charging at the 4 A limit, ambient 30 C): Exp3 / Exp4
for (const [Q, exp] of [[0, 30.32], [6, 32.72], [12, 35.12]]) {
  const s = run(inputs({ irradianceWm2: 800, heatInputW: Q }), 3 * 3600, { batteryTempC: 30, socPct: 20 });
  check(`Exp3 Q_aux=${Q} W fan off → ${exp} °C`, near(s.batteryTempC, exp, 0.05), `${f(s.batteryTempC)} °C`);
}
{ const s = run(inputs({ irradianceWm2: 800, heatInputW: 12, manualFanSpeed: 1 }), 3 * 3600, { batteryTempC: 30, socPct: 20 });
  check('Exp4 fan 100%, Q_aux=12 W → 32.55 °C', near(s.batteryTempC, 32.55, 0.05), `${f(s.batteryTempC)} °C`); }
{ const a = run(inputs({ requestedLoads: { wireless: true, usb: true, led: true }, lightingMode: 'manual' }), 3600, { socPct: 90 });
  const b = run(inputs({ requestedLoads: { wireless: true, usb: true, led: true }, lightingMode: 'manual', displayRequested: true }), 3600, { socPct: 90 });
  check('Display 1 W adds ≈1% SOC per ~2.5 h of discharge (1 W / (0.95·12.8 V) / 20 Ah)', near((a.socPct - b.socPct) * 2.5, 1.03, 0.1), `ΔSOC(1 h) = ${f(a.socPct - b.socPct, 3)} %-points`); }

console.log('\nTest 1 — Sunny daylight');
{ const s = run(inputs({ irradianceWm2: 800, ambientLux: 500, requestedLoads: { wireless: true, usb: true, led: true }, displayRequested: true }), 600, { socPct: 60, batteryTempC: 30 });
  check('PV ≈ 87.55 W', near(s.pvPowerW, 87.552, 0.01), f(s.pvPowerW));
  check('LED OFF, 0 W', s.ledMode === 'OFF' && s.ledPowerW === 0);
  check('Battery CHARGING (PV > effective load)', s.batteryFlowDirection === 'CHARGING' && s.chargeCurrentA > 0, `${f(s.chargeCurrentA)} A, net ${f(s.netPowerW)} W`);
  check('E-paper not suspended (image stays; 3D panel is static texture)', s.displayStatus !== 'UPDATE SUSPENDED'); }

console.log('\nTest 2 — Dark, no passenger');
const t2 = run(inputs({ ambientLux: 30, requestedLoads: { wireless: false, usb: false, led: true }, displayRequested: true }), 600, { socPct: 60 });
{ check('LED DIM_25, ≈2 W', t2.ledMode === 'DIM_25' && near(t2.ledPowerW, 2, 1e-9), `${t2.ledMode} ${f(t2.ledPowerW)} W`);
  check('Battery discharging, SOC < 60', t2.batteryFlowDirection === 'DISCHARGING' && t2.socPct < 60, `SOC ${f(t2.socPct, 3)}%`); }

console.log('\nTest 3 — Dark with passenger (+ PIR hold)');
const t3 = run(inputs({ ambientLux: 30, motionDetected: true, requestedLoads: { wireless: false, usb: false, led: true }, displayRequested: true }), 600, { socPct: 60 });
{ check('motionActive, LED FULL_100, 8 W', t3.motionActive && t3.ledMode === 'FULL_100' && near(t3.ledPowerW, 8, 1e-9), `${t3.ledMode} ${f(t3.ledPowerW)} W`);
  check('Discharges faster than Test 2', t3.dischargeCurrentA > t2.dischargeCurrentA, `${f(t3.dischargeCurrentA, 3)} A vs ${f(t2.dischargeCurrentA, 3)} A`);
  let s = t3; const pid = new PIDController(); const base = inputs({ ambientLux: 30, requestedLoads: { wireless: false, usb: false, led: true }, displayRequested: true });
  const at = (sec) => { while (s.timeSeconds < t3.timeSeconds + sec) s = advanceSimulation(s, base, pid); return s; };
  check('Motion removed: still FULL for ≈295 s', at(295).ledMode === 'FULL_100' && at(295).motionActive);
  check('After 300 s hold: back to DIM_25', at(310).ledMode === 'DIM_25' && !at(310).motionActive); }

console.log('\nTest 4 — Hysteresis');
{ let s = createInitialState(); const pid = new PIDController(); const out = [];
  for (const lux of [70, 100, 130, 100, 70]) { for (let i = 0; i < 4; i++) s = advanceSimulation(s, inputs({ ambientLux: lux, requestedLoads: { led: true } }), pid); out.push(`${lux} lx→${s.darkState ? 'DARK' : 'BRIGHT'}/${s.ledMode}`); }
  console.log('   ', out.join('  '));
  check('70 dark; 100 keeps dark; 130 bright/OFF; 100 keeps bright; 70 dark again', out[0].includes('DARK') && out[1].includes('DARK') && out[2].includes('BRIGHT/OFF') && out[3].includes('BRIGHT') && out[4].includes('DARK')); }

console.log('\nTest 5 — Heat disturbance, PID AUTO (ambient 30 °C, Q_aux 12 W)');
{ const log = []; const pid = new PIDController();
  const s = run(inputs({ heatInputW: 12, fanMode: 'auto' }), 3 * 3600, { batteryTempC: 30 }, pid, (st) => { if (Math.round(st.timeSeconds) % 1800 === 0) log.push(`${f(st.timeSeconds / 60, 0)} min: T=${f(st.batteryTempC)} °C fan=${f(st.fanSpeed * 100, 0)}% P_fan=${f(st.fanPowerW, 3)} W UA=${f(st.totalConductanceWPerK, 3)}`); });
  console.log('   ' + log.join('\n    '));
  const noFan = run(inputs({ heatInputW: 12 }), 3 * 3600, { batteryTempC: 30 });
  check('Fan engages above setpoint and conductance exceeds 2.5 W/K', s.fanSpeed > 0.01 && s.totalConductanceWPerK > CONFIG.thermal.naturalConductanceWPerK, `fan ${f(s.fanSpeed * 100, 0)}%`);
  check('Temperature lower than without fan after 3 h', s.batteryTempC < noFan.batteryTempC, `${f(s.batteryTempC)} vs ${f(noFan.batteryTempC)} °C`); }

console.log('\nTest 6 — Low SOC and EMS (wireless + USB requested)');
{ const base = inputs({ requestedLoads: { wireless: true, usb: true, led: false } });
  for (const [soc, w, u] of [[25, true, true], [18, false, true], [14, false, false]]) {
    const s = previewState({ ...createInitialState(), socPct: soc }, base);
    check(`SOC ${soc}%: wireless ${w ? 'on' : 'shed'}, USB ${u ? 'on' : 'shed'}`, s.effectiveLoads.wireless === w && s.effectiveLoads.usb === u && s.totalLoadEffectiveW <= s.totalLoadRequestedW, `req ${f(s.totalLoadRequestedW)} W / eff ${f(s.totalLoadEffectiveW)} W, shed=[${s.shedLoads}] (${s.emsReason})`); } }

console.log('\nTest 7 — E-paper suspension');
{ const base = inputs({ requestedLoads: { wireless: false, usb: false, led: true }, displayRequested: true, ambientLux: 30 });
  for (const soc of [13, 11, 9]) { const s = previewState({ ...createInitialState(), socPct: soc }, base);
    console.log(`    SOC ${soc}%: display=${s.displayStatus} (${s.displaySuspendReason}) P_disp=${f(s.displayPowerW)} W, LED=${s.ledMode} cap/eff ${f(s.ledLevel)} (req ${s.ledRequestedMode}), shed=[${s.shedLoads}]`); }
  const a = previewState({ ...createInitialState(), socPct: 11 }, base), b = previewState({ ...createInitialState(), socPct: 13 }, base), c = previewState({ ...createInitialState(), socPct: 9 }, base);
  check('SOC 13%: updates still allowed, LED capped to 25%', b.displayStatus !== 'UPDATE SUSPENDED' && b.ledLevel <= 0.25);
  check('SOC 11%: display suspended by EMS, power 0 W, LED still on (shed last)', a.displayStatus === 'UPDATE SUSPENDED' && a.displaySuspendReason === 'EMS' && a.displayPowerW === 0 && a.ledLevel > 0);
  check('SOC 9%: LED shed last', c.ledLevel === 0 && c.shedLoads.includes('led')); }

console.log('\nTest 8 — PV unavailable (G=0, wireless+USB+LED+display enabled), 60 % start');
{ const events = []; let prev = '';
  const s = run(inputs({ requestedLoads: { wireless: true, usb: true, led: true }, lightingMode: 'manual', manualLedLevel: 1, displayRequested: true }), 6 * 3600, { socPct: 60 }, new PIDController(), (st) => { const key = `${st.shedLoads}`; if (key !== prev) { events.push(`t=${f(st.timeSeconds / 60, 0)} min SOC=${f(st.socPct)}% shed=[${key}]`); prev = key; } });
  console.log('   ' + events.join('\n    '));
  check('PV 0 W, battery discharged, SOC decreased and EMS acted', s.pvPowerW === 0 && s.socPct < 60 && events.length > 1, `final SOC ${f(s.socPct)}%`); }

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
