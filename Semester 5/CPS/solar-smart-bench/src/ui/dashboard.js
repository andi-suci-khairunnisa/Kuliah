import { CONFIG } from '../simulation/config.js';

const $ = (id) => document.getElementById(id);
const fmt = (n, digits = 1) => Number(n).toFixed(digits);

export function readInputs() {
  return {
    irradianceWm2: Number($('irradiance').value),
    ambientTempC: Number($('ambient').value),
    heatInputW: Number($('heat-input').value),
    pidSetpointC: Number($('pid-setpoint').value),
    manualFanSpeed: Number($('manual-fan').value) / 100,
    fanMode: document.body.dataset.fanMode || 'auto',
    requestedLoads: {
      wireless: $('wireless-toggle').checked,
      usb: $('usb-toggle').checked,
      led: $('led-toggle').checked, // master LED enable; the level comes from lightingMode
    },
    ambientLux: Number($('ambient-lux').value),
    motionDetected: $('pir-toggle').checked, // simulated PIR input, not a real sensor
    displayRequested: $('display-toggle').checked,
    lightingMode: document.body.dataset.lightingMode || 'auto',
    manualLedLevel: Number($('manual-led-level').value),
  };
}

export function setLightingMode(mode) {
  document.body.dataset.lightingMode = mode;
  $('light-auto').classList.toggle('active', mode === 'auto');
  $('light-manual').classList.toggle('active', mode === 'manual');
  $('manual-led-row').classList.toggle('disabled-control', mode !== 'manual');
}

export function setFanMode(mode) {
  document.body.dataset.fanMode = mode;
  $('mode-auto').classList.toggle('active', mode === 'auto');
  $('mode-manual').classList.toggle('active', mode === 'manual');
  $('manual-fan-row').classList.toggle('disabled-control', mode !== 'manual');
}

export function bindInputLabels() {
  const pairs = [
    ['irradiance', 'irr-value'],
    ['ambient', 'ambient-value'],
    ['heat-input', 'heat-value'],
    ['pid-setpoint', 'setpoint-value'],
    ['manual-fan', 'manual-fan-value'],
    ['ambient-lux', 'lux-value'],
  ];
  for (const [inputId, outputId] of pairs) {
    $(inputId).addEventListener('input', () => {
      const value = Number($(inputId).value);
      $(outputId).textContent = inputId === 'pid-setpoint' ? fmt(value) : inputId === 'manual-fan' ? String(value) : String(value);
    });
  }
}

export function renderDashboard(state, inputs, isRunning) {
  $('kpi-soc').innerHTML = `${fmt(state.socPct)}<span>%</span>`;
  $('soc-progress').style.width = `${state.socPct}%`;
  $('soc-caption').textContent = `${CONFIG.battery.capacityAh} Ah · ${CONFIG.battery.energyWh} Wh`;
  $('kpi-temp').innerHTML = `${fmt(state.batteryTempC)}<span>°C</span>`;
  $('temp-caption').textContent = `Target PID ${fmt(inputs.pidSetpointC)} °C`;
  $('temp-status').textContent = state.thermalStatus;
  $('temp-status').className = `status-text ${state.thermalStatus === 'NORMAL' ? '' : 'status-warning'}`;
  $('kpi-pv').innerHTML = `${fmt(state.pvPowerW)}<span>W</span>`;
  $('irr-caption').textContent = `${inputs.irradianceWm2} W/m² · cell ${fmt(state.cellTempC)} °C`;
  $('kpi-load').innerHTML = `${fmt(state.totalLoadEffectiveW)}<span>W</span>`;
  const userLoads = ['wireless', 'usb', 'led', 'display'];
  const activeCount = userLoads.filter((k) => state.effectiveLoads[k]).length;
  $('load-caption').textContent = `${activeCount} of 4 user loads active · requested ${fmt(state.totalLoadRequestedW)} W`;
  $('fan-caption').textContent = `FAN ${Math.round(state.fanSpeed * 100)}%`;
  $('pid-output').textContent = `${Math.round(state.fanSpeed * 100)}%`;
  $('pid-bar').style.width = `${state.fanSpeed * 100}%`;
  $('chart-soc-value').textContent = `${fmt(state.socPct)}%`;
  $('chart-temp-value').textContent = `${fmt(state.batteryTempC)} °C`;
  $('chart-pv-value').textContent = `${fmt(state.pvPowerW)} W`;
  $('chart-load-value').textContent = `${fmt(state.totalLoadEffectiveW)} W`;
  $('scene-telemetry').textContent = `PV ${fmt(state.pvPowerW)} W  ·  LOAD ${fmt(state.totalLoadEffectiveW)} W · LED ${state.ledMode}`;

  const balance = state.netPowerW;
  $('balance-value').innerHTML = `${balance < 0 ? '−' : '+'}${fmt(Math.abs(balance))} <small>W</small>`;
  $('balance-caption').textContent = state.energyMode;
  $('system-status').textContent = state.unmetLoadW > 0 ? 'LOAD NOT FULLY SUPPLIED' : state.thermalStatus === 'NORMAL' ? 'SYSTEM NORMAL' : state.thermalStatus;
  $('system-indicator').classList.toggle('warning', state.unmetLoadW > 0 || state.thermalStatus !== 'NORMAL');
  $('ems-pill').textContent = state.emsActions.length ? 'EMS PROTECTING' : 'EMS READY';
  $('ems-detail').textContent = state.emsActions.length ? state.emsReason : 'EMS active · load priority enabled';

  $('flow-pv').textContent = `${fmt(state.pvPowerW)} W available`;
  $('flow-bus').textContent = `${fmt(state.totalLoadEffectiveW)} W demand`;
  $('flow-battery').textContent = state.energyMode;
  $('flow-loads').textContent = state.unmetLoadW > 0 ? `${fmt(state.totalLoadEffectiveW - state.unmetLoadW)} W supplied` : `${fmt(state.totalLoadEffectiveW)} W supplied`;
  $('flow-arrow-label').textContent = balance >= 0 ? '→' : '←';
  $('run-state').textContent = isRunning ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED';
  document.querySelector('.live-dot').classList.toggle('paused', !isRunning);
  $('sim-time').textContent = formatTime(state.timeSeconds);
  renderStatusPanel(state, inputs);
}

const onOff = (v) => (v ? 'ON' : 'OFF');

function renderStatusPanel(state, inputs) {
  const set = (id, text, warn = false) => { $(id).textContent = text; $(id).classList.toggle('warn', warn); };
  // Energy
  set('st-load-req', `${fmt(state.totalLoadRequestedW)} W`);
  set('st-load-eff', `${fmt(state.totalLoadEffectiveW)} W`, state.totalLoadEffectiveW < state.totalLoadRequestedW - 1e-9);
  set('st-charge', `${fmt(state.chargeCurrentA, 2)} A`);
  set('st-discharge', `${fmt(state.dischargeCurrentA, 2)} A`);
  set('st-flow', state.batteryFlowDirection);
  set('st-charge-perm', state.chargeAllowed ? 'ALLOWED' : 'INHIBITED', !state.chargeAllowed);
  // Thermal
  set('st-temp', `${fmt(state.batteryTempC)} °C`);
  set('st-ambient', `${fmt(inputs.ambientTempC)} °C`);
  set('st-fan-mode', inputs.fanMode === 'auto' ? 'AUTO PID' : 'MANUAL');
  set('st-fan', `${Math.round(state.fanSpeed * 100)} %`);
  set('st-fan-w', `${fmt(state.fanPowerW, 2)} W`);
  set('st-thermal', state.thermalStatus, state.thermalStatus !== 'NORMAL');
  // Lighting
  set('st-lux', `${fmt(state.ambientLux, 0)} lux`);
  set('st-dark', state.darkState ? 'DARK' : 'BRIGHT');
  set('st-pir', state.motionDetected ? 'MOTION' : 'NO MOTION');
  set('st-hold', state.motionActive ? (state.motionDetected ? 'ACTIVE (PIR)' : `HOLD ${Math.ceil(state.motionHoldRemainingS)} s`) : 'INACTIVE');
  set('st-led-mode', state.ledMode === state.ledRequestedMode ? state.ledMode : `${state.ledMode} (req. ${state.ledRequestedMode})`, state.ledMode !== state.ledRequestedMode);
  set('st-led', `${Math.round(state.ledLevel * 100)} % · ${fmt(state.ledPowerW)} W`);
  // E-paper + EMS
  const reason = state.displaySuspendReason === 'EMS' ? ' (EMS)' : state.displaySuspendReason === 'USER' ? ' (user)' : '';
  set('st-display', `${state.displayStatus}${reason}`, state.displayStatus === 'UPDATE SUSPENDED' && state.displaySuspendReason === 'EMS');
  set('st-display-en', state.displayRequested ? 'ENABLED' : 'DISABLED');
  set('st-display-w', `${fmt(state.displayPowerW)} W`);
  set('st-ems', state.emsStatus, state.emsStatus !== 'NORMAL');
  const names = { wireless: 'wireless', usb: 'USB', led: 'LED', display: 'e-paper', fan: 'fan' };
  const active = Object.keys(names).filter((k) => state.effectiveLoads[k]).map((k) => names[k]);
  set('st-active', active.length ? active.join(', ') : 'controller only');
  set('st-shed', state.shedLoads.length ? `${state.shedLoads.map((k) => names[k]).join(', ')} — ${state.emsReason}` : 'none', state.shedLoads.length > 0);
}

export function setDefaultLabels() {
  $('irr-value').textContent = $('irradiance').value;
  $('ambient-value').textContent = $('ambient').value;
  $('heat-value').textContent = $('heat-input').value;
  $('setpoint-value').textContent = fmt(Number($('pid-setpoint').value));
  $('manual-fan-value').textContent = $('manual-fan').value;
  $('lux-value').textContent = $('ambient-lux').value;
}

export function syncLoadToggles(effectiveLoads, shedLoads = []) {
  // Visual state reflects EMS decisions; requested state remains in the user's controls.
  for (const [key, id] of Object.entries({ wireless: 'wireless-toggle', usb: 'usb-toggle', display: 'display-toggle' })) {
    $(id).closest('.load-switch').classList.toggle('ems-shed', $(id).checked && !effectiveLoads[key]);
  }
  // The LED effective flag is also false in bright daylight (nothing shed), so the LED uses the EMS shed list.
  $('led-toggle').closest('.load-switch').classList.toggle('ems-shed', shedLoads.includes('led'));
}

export function formatTime(seconds) {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
