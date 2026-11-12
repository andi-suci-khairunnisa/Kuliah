import { CONFIG } from './config.js';
import { applyEMS } from './ems.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createInitialState() {
  return {
    timeSeconds: 0,
    socPct: CONFIG.battery.initialSocPct,
    batteryTempC: 30,
    fanSpeed: 0, // normalized 0..1 (unchanged M1 convention); the UI shows percent
    pvPowerW: 0,
    loadPowerW: 0, // total EFFECTIVE load (alias of totalLoadEffectiveW, kept for M1 consumers)
    baseLoadW: CONFIG.loads.controllerW,
    netPowerW: 0,
    batteryCurrentA: 0,
    chargeCurrentA: 0,
    dischargeCurrentA: 0,
    curtailedPowerW: 0,
    unmetLoadW: 0,
    cellTempC: 35,
    energyMode: 'IDLE',
    emsActions: [],
    effectiveLoads: { wireless: true, usb: true, led: false, display: true, fan: false },
    thermalStatus: 'NORMAL',
    // --- M3 fields ---
    requestedLoads: { wireless: true, usb: true, led: false, display: true },
    totalLoadRequestedW: 0,
    totalLoadEffectiveW: 0,
    ambientLux: CONFIG.lighting.defaultAmbientLux,
    darkState: false,
    motionDetected: false, // raw PIR input
    motionActive: false, // latched by the motion hold timer
    motionHoldRemainingS: 0,
    lightingMode: 'auto',
    ledRequestedLevel: 0,
    ledRequestedMode: 'OFF',
    ledLevel: 0, // EFFECTIVE level after EMS (what the 3D scene shows)
    ledMode: 'OFF',
    ledPowerW: 0,
    displayRequested: true,
    displayStatus: 'STANDBY', // STANDBY | REFRESH | UPDATE SUSPENDED
    displaySuspendReason: null, // null | 'USER' | 'EMS'
    displayRefreshActive: false,
    displayPowerW: 0,
    fanPowerW: 0,
    batteryFlowDirection: 'IDLE', // CHARGING | DISCHARGING | IDLE
    emsStatus: 'NORMAL',
    emsReason: '',
    shedLoads: [],
    chargeAllowed: true,
  };
}

export function calculatePvPower(irradianceWm2, ambientTempC) {
  const { activeAreaM2, referenceEfficiency, referenceCellTempC, tempCoefficientPerC, mpptEfficiency, cellTempRiseAboveAmbientC } = CONFIG.pv;
  const cellTempC = ambientTempC + cellTempRiseAboveAmbientC;
  const temperatureFactor = Math.max(0, 1 + tempCoefficientPerC * (cellTempC - referenceCellTempC));
  const rawPowerW = activeAreaM2 * Math.max(0, irradianceWm2) * referenceEfficiency * temperatureFactor;
  return {
    cellTempC,
    availablePowerW: rawPowerW * mpptEfficiency,
  };
}

// loads: booleans { wireless, usb, led, display? }. extras.ledLevel (0..1) scales the LED power;
// when omitted the LED counts at 100% (M1 behaviour). A missing loads.display counts as 0 W (M1 behaviour).
export function computeLoadPower(loads, fanSpeed, extras = {}) {
  const { controllerW, wirelessW, usbW, ledW, fanMaxW, displayAvgW } = CONFIG.loads;
  const ledLevel = Number.isFinite(extras.ledLevel) ? clamp(extras.ledLevel, 0, 1) : 1;
  const wirelessWNow = loads.wireless ? wirelessW : 0;
  const usbWNow = loads.usb ? usbW : 0;
  const ledWNow = loads.led ? ledW * ledLevel : 0; // P_LED = P_LED_max x L
  const displayWNow = loads.display ? displayAvgW : 0; // P_display = P_avg x enabled
  const fanWNow = fanMaxW * Math.pow(clamp(fanSpeed, 0, 1), 3); // P_fan = P_fan_max x u^3
  return {
    controllerW,
    wirelessW: wirelessWNow,
    usbW: usbWNow,
    ledW: ledWNow,
    displayW: displayWNow,
    fanW: fanWNow,
    totalW: controllerW + wirelessWNow + usbWNow + ledWNow + displayWNow + fanWNow,
  };
}

// ---- Automatic lighting (rule-based, not PID) -------------------------------------------------

export function levelToMode(level) {
  if (level <= 0) return 'OFF';
  return level >= CONFIG.lighting.fullLevel ? 'FULL_100' : 'DIM_25';
}

// Lux hysteresis: dark at <= 80 lux, bright at >= 120 lux, otherwise keep the previous state.
export function updateDarkState(previousDark, ambientLux) {
  const { darkThresholdLux, brightThresholdLux } = CONFIG.lighting;
  if (ambientLux <= darkThresholdLux) return true;
  if (ambientLux >= brightThresholdLux) return false;
  return Boolean(previousDark);
}

// PIR hold timer (simulation seconds): re-armed while motion is detected, counts down afterwards.
export function updateMotionHold(previousRemainingS, motionDetected, dtSeconds) {
  if (motionDetected) return CONFIG.lighting.motionHoldSeconds;
  return Math.max(0, previousRemainingS - dtSeconds);
}

function evaluateLighting(state, inputs, dtSeconds) {
  const lux = Number.isFinite(inputs.ambientLux) ? Math.max(0, inputs.ambientLux) : CONFIG.lighting.defaultAmbientLux;
  const darkState = updateDarkState(state.darkState, lux);
  const motionDetected = Boolean(inputs.motionDetected);
  // dt = 0 is the paused instant preview: the hold timer is not advanced, only re-armed by an active PIR.
  const motionHoldRemainingS = dtSeconds > 0
    ? updateMotionHold(state.motionHoldRemainingS ?? 0, motionDetected, dtSeconds)
    : (motionDetected ? CONFIG.lighting.motionHoldSeconds : state.motionHoldRemainingS ?? 0);
  const motionActive = motionDetected || motionHoldRemainingS > 0;

  // Legacy inputs (no lightingMode) behave like M1: LED on = full brightness.
  const lightingMode = inputs.lightingMode ?? 'manual';
  const manualLevel = clamp(Number.isFinite(inputs.manualLedLevel) ? inputs.manualLedLevel : CONFIG.lighting.fullLevel, 0, 1);
  const autoLevel = !darkState ? 0 : motionActive ? CONFIG.lighting.fullLevel : CONFIG.lighting.dimLevel;
  const ledEnabled = Boolean(inputs.requestedLoads.led); // master LED switch
  const requestedLevel = !ledEnabled ? 0 : lightingMode === 'manual' ? manualLevel : autoLevel;

  return { lux, darkState, motionDetected, motionHoldRemainingS, motionActive, lightingMode, requestedLevel };
}

// Everything that must be decided BEFORE the battery is evaluated: lighting request -> EMS -> effective loads/display.
function evaluateSupervision(state, inputs, dtSeconds, timeSeconds) {
  const lighting = evaluateLighting(state, inputs, dtSeconds);
  const displayRequested = Boolean(inputs.displayRequested);
  const requestedLoads = {
    wireless: Boolean(inputs.requestedLoads.wireless),
    usb: Boolean(inputs.requestedLoads.usb),
    led: lighting.requestedLevel > 0,
    display: displayRequested,
  };
  const ems = applyEMS(requestedLoads, state.socPct, state.batteryTempC);
  // EMS has priority over the user and over automation: shed -> 0, cap -> min(request, cap).
  const ledLevel = ems.active.led ? clamp(Math.min(lighting.requestedLevel, ems.ledLevelCap), 0, 1) : 0;
  const effectiveLoads = { ...ems.active, led: ledLevel > 0 };

  const { refreshIntervalS, refreshDurationS } = CONFIG.display;
  const displayEffective = Boolean(effectiveLoads.display);
  const displayRefreshActive = displayEffective && (timeSeconds % refreshIntervalS) < refreshDurationS;
  const displayStatus = !displayEffective ? 'UPDATE SUSPENDED' : displayRefreshActive ? 'REFRESH' : 'STANDBY';
  const displaySuspendReason = displayEffective ? null : (displayRequested ? 'EMS' : 'USER');

  return { lighting, requestedLoads, ems, ledLevel, effectiveLoads, displayRequested, displayRefreshActive, displayStatus, displaySuspendReason };
}

function writeSupervisionFields(next, sup, fanSpeed) {
  const requested = computeLoadPower(sup.requestedLoads, fanSpeed, { ledLevel: sup.lighting.requestedLevel });
  const effective = computeLoadPower(sup.effectiveLoads, fanSpeed, { ledLevel: sup.ledLevel });

  next.ambientLux = sup.lighting.lux;
  next.darkState = sup.lighting.darkState;
  next.motionDetected = sup.lighting.motionDetected;
  next.motionActive = sup.lighting.motionActive;
  next.motionHoldRemainingS = sup.lighting.motionHoldRemainingS;
  next.lightingMode = sup.lighting.lightingMode;
  next.ledRequestedLevel = sup.lighting.requestedLevel;
  next.ledRequestedMode = levelToMode(sup.lighting.requestedLevel);
  next.ledLevel = sup.ledLevel;
  next.ledMode = levelToMode(sup.ledLevel);

  next.displayRequested = sup.displayRequested;
  next.displayStatus = sup.displayStatus;
  next.displaySuspendReason = sup.displaySuspendReason;
  next.displayRefreshActive = sup.displayRefreshActive;

  next.requestedLoads = sup.requestedLoads;
  next.effectiveLoads = { ...sup.effectiveLoads, fan: fanSpeed > CONFIG.loads.fanRunningThreshold };
  next.emsActions = sup.ems.actions;
  next.emsStatus = sup.ems.mode;
  next.emsReason = sup.ems.reason;
  next.shedLoads = sup.ems.shed;
  next.chargeAllowed = sup.ems.chargeAllowed;

  next.loadBreakdown = effective;
  next.requestedLoadBreakdown = requested;
  next.totalLoadRequestedW = requested.totalW;
  next.totalLoadEffectiveW = effective.totalW;
  next.loadPowerW = effective.totalW;
  next.ledPowerW = effective.ledW;
  next.displayPowerW = effective.displayW;
  next.fanPowerW = effective.fanW;
  return effective;
}

// Instant (non-integrating) evaluation for a paused simulation or an input change between steps.
// Uses the same PV / lighting / EMS / load code as advanceSimulation; time, SOC and temperature do not move.
export function previewState(state, inputs) {
  const next = { ...state };
  const pv = calculatePvPower(inputs.irradianceWm2, inputs.ambientTempC);
  next.cellTempC = pv.cellTempC;
  next.pvPowerW = pv.availablePowerW;
  const sup = evaluateSupervision(state, inputs, 0, state.timeSeconds);
  const load = writeSupervisionFields(next, sup, state.fanSpeed);
  next.netPowerW = next.pvPowerW - load.totalW;
  return next;
}

export function advanceSimulation(state, inputs, pidController) {
  const dt = CONFIG.simulation.stepSeconds; // simulation seconds per step (independent of frame time)
  const next = { ...state, timeSeconds: state.timeSeconds + dt };

  const pv = calculatePvPower(inputs.irradianceWm2, inputs.ambientTempC);
  next.cellTempC = pv.cellTempC;
  next.pvPowerW = pv.availablePowerW;

  // Lighting request and EMS are resolved before the effective load reaches the battery.
  const sup = evaluateSupervision(state, inputs, dt, next.timeSeconds);

  if (inputs.fanMode === 'auto') {
    next.fanSpeed = pidController.update({
      measurement: state.batteryTempC,
      setpoint: inputs.pidSetpointC,
      dtSeconds: dt,
      enabled: true,
    });
  } else {
    pidController.update({ measurement: state.batteryTempC, setpoint: inputs.pidSetpointC, dtSeconds: dt, enabled: false });
    next.fanSpeed = clamp(inputs.manualFanSpeed, 0, 1);
  }

  const load = writeSupervisionFields(next, sup, next.fanSpeed);
  next.netPowerW = next.pvPowerW - load.totalW;

  let batteryCurrentA = 0;
  let chargeCurrentA = 0;
  let dischargeCurrentA = 0;
  let curtailedPowerW = 0;
  let unmetLoadW = 0;
  let energyMode = 'BALANCED';

  if (next.netPowerW >= 0) {
    const canCharge = sup.ems.chargeAllowed; // EMS charge permission (T < 45 C and SOC below the upper bound)
    if (canCharge) {
      const maximumChargeBusW = CONFIG.battery.maxChargeCurrentA * CONFIG.battery.chargeVoltageV / CONFIG.battery.chargeEfficiencyPath;
      const chargeBusW = Math.min(next.netPowerW, maximumChargeBusW);
      chargeCurrentA = Math.min(CONFIG.battery.maxChargeCurrentA, CONFIG.battery.chargeEfficiencyPath * chargeBusW / CONFIG.battery.chargeVoltageV);
      const deltaSoc = chargeCurrentA * dt / (3600 * CONFIG.battery.capacityAh) * 100;
      next.socPct = Math.min(CONFIG.battery.maxSocPct, state.socPct + deltaSoc);
      curtailedPowerW = Math.max(0, next.netPowerW - chargeBusW);
      energyMode = chargeCurrentA > 0 ? 'CHARGING' : 'PV SURPLUS';
    } else {
      curtailedPowerW = next.netPowerW;
      energyMode = state.batteryTempC >= CONFIG.battery.maxChargeTempC ? 'CHARGE INHIBIT' : 'SOC LIMIT';
    }
  } else {
    const deficitW = -next.netPowerW;
    const allowedToDischarge = state.batteryTempC < CONFIG.battery.maxDischargeTempC && state.socPct > CONFIG.battery.minSocPct;
    if (allowedToDischarge) {
      const maximumBatteryBusW = CONFIG.battery.maxDischargeCurrentA * CONFIG.battery.nominalVoltageV * CONFIG.battery.dischargeEfficiencyPath;
      const suppliedBusW = Math.min(deficitW, maximumBatteryBusW);
      dischargeCurrentA = Math.min(CONFIG.battery.maxDischargeCurrentA, suppliedBusW / (CONFIG.battery.dischargeEfficiencyPath * CONFIG.battery.nominalVoltageV));
      const deltaSoc = dischargeCurrentA * dt / (3600 * CONFIG.battery.capacityAh) * 100;
      next.socPct = Math.max(CONFIG.battery.minSocPct, state.socPct - deltaSoc);
      unmetLoadW = Math.max(0, deficitW - suppliedBusW);
      energyMode = 'DISCHARGING';
    } else {
      unmetLoadW = deficitW;
      energyMode = state.batteryTempC >= CONFIG.battery.maxDischargeTempC ? 'DISCHARGE INHIBIT' : 'LOW SOC';
    }
  }

  batteryCurrentA = chargeCurrentA - dischargeCurrentA;
  next.batteryCurrentA = batteryCurrentA;
  next.chargeCurrentA = chargeCurrentA;
  next.dischargeCurrentA = dischargeCurrentA;
  next.batteryFlowDirection = chargeCurrentA > 0 ? 'CHARGING' : dischargeCurrentA > 0 ? 'DISCHARGING' : 'IDLE';
  next.curtailedPowerW = curtailedPowerW;
  next.unmetLoadW = unmetLoadW;
  next.energyMode = energyMode;
  next.socPct = clamp(next.socPct, CONFIG.battery.minSocPct, CONFIG.battery.maxSocPct);

  // Lumped thermal model. Q_aux is a user-set hypothetical heat disturbance (not electrical load power).
  const iAbs = Math.abs(batteryCurrentA);
  const ohmicHeatW = iAbs * iAbs * CONFIG.battery.internalResistanceOhm;
  const fanConductance = CONFIG.thermal.fanConductanceAtFullWPerK * next.fanSpeed;
  const totalConductance = CONFIG.thermal.naturalConductanceWPerK + fanConductance;
  const coolingW = totalConductance * (state.batteryTempC - inputs.ambientTempC);
  const dTemp = (ohmicHeatW + inputs.heatInputW - coolingW) * dt / CONFIG.thermal.capacityJPerK;
  next.batteryTempC = clamp(state.batteryTempC + dTemp, -10, 90);
  next.thermalStatus = getThermalStatus(next.batteryTempC);
  next.ohmicHeatW = ohmicHeatW;
  next.totalConductanceWPerK = totalConductance;

  return next;
}

export function getThermalStatus(tempC) {
  if (tempC >= CONFIG.battery.maxDischargeTempC) return 'DISCHARGE LIMIT';
  if (tempC >= CONFIG.battery.noncriticalShutdownTempC) return 'LOAD SHED';
  if (tempC >= CONFIG.battery.maxChargeTempC) return 'CHARGE INHIBIT';
  if (tempC >= CONFIG.battery.warningTempC) return 'WARNING';
  return 'NORMAL';
}
