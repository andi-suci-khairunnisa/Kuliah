// Parameter baseline M1 v0.3 + M3 shelter integration.
// Tags: DATASHEET = product specification, ASSUMPTION = model assumption,
//       PROJECT_POLICY = limit/rule chosen for this simulation, STC = standard test condition.
// All simulation numbers live here; do not hardcode them in other files.
export const CONFIG = Object.freeze({
  battery: {
    capacityAh: 20, // DATASHEET (ECTIVE LC20L LiFePO4)
    nominalVoltageV: 12.8, // DATASHEET
    energyWh: 256, // DATASHEET (12.8 V x 20 Ah)
    initialSocPct: 60, // PROJECT_POLICY (start condition)
    maxSocPct: 95, // PROJECT_POLICY (M1 saturation bound)
    minSocPct: 5, // PROJECT_POLICY
    internalResistanceOhm: 0.05, // DATASHEET upper bound, used as conservative thermal-model value
    chargeVoltageV: 14.6, // DATASHEET
    maxChargeCurrentA: 4, // DATASHEET recommended charge current used as design limit (20 A is the manufacturer maximum)
    maxDischargeCurrentA: 20, // DATASHEET
    chargeEfficiencyPath: 0.95, // ASSUMPTION (DC/DC charge path, not coulombic efficiency)
    dischargeEfficiencyPath: 0.95, // ASSUMPTION (DC/DC discharge path)
    coulombicEfficiency: 1.0, // ASSUMPTION (SOC counting uses unity; reference only, see model.js)
    maxChargeTempC: 45, // DATASHEET charge upper limit
    maxDischargeTempC: 60, // DATASHEET discharge upper limit
    warningTempC: 40, // PROJECT_POLICY
    noncriticalShutdownTempC: 55, // PROJECT_POLICY
    // DATASHEET hardware BMS values. Reference only: the EMS must act before these, never use them as normal thresholds.
    bmsHighTempCutoffC: 75,
    bmsReconnectTempC: 53,
  },
  pv: {
    activeAreaM2: 0.6, // ASSUMPTION
    referenceEfficiency: 0.20, // ASSUMPTION
    stcPowerW: 120, // derived design value: 0.6 m2 x 1000 W/m2 x 0.20
    referenceCellTempC: 25, // STC
    tempCoefficientPerC: -0.004, // ASSUMPTION
    mpptEfficiency: 0.95, // ASSUMPTION
    // ASSUMPTION: simple cell-temperature rise above ambient for the prototype (kept from M1).
    cellTempRiseAboveAmbientC: 5,
  },
  loads: {
    controllerW: 3, // M1 aggregate: controller + BMS monitoring + ambient light sensor + PIR (sensors are NOT counted again)
    wirelessW: 20, // DC-bus input power, not power received by the phone
    usbW: 18, // DC-bus input power
    ledW: 8, // LED at 100% (P_LED = ledW x level; linear dimming is a simplification)
    fanMaxW: 1.68, // fan candidate specification (P_fan = fanMaxW x u^3, fan-affinity approximation)
    // ASSUMPTION: average power of the WHOLE e-paper subsystem (DC/DC + controller + panel updates).
    // This is not the continuous consumption of the bistable panel itself.
    displayAvgW: 1,
    // PROJECT_POLICY: fan command above this counts as "fan operating" (state flag only, no effect on power).
    fanRunningThreshold: 0.01,
  },
  display: {
    // ASSUMPTION: refresh scheduling used only to flag displayRefreshActive for status and 3D.
    // It does NOT change the average display power (displayAvgW already covers the update energy).
    refreshIntervalS: 300,
    refreshDurationS: 15,
  },
  lighting: {
    // PROJECT_POLICY: initial thresholds, not lighting standards.
    darkThresholdLux: 80,
    brightThresholdLux: 120,
    dimLevel: 0.25,
    fullLevel: 1.0,
    motionHoldSeconds: 300, // simulation seconds (about 5 real seconds at 60x)
    defaultAmbientLux: 500,
    maxAmbientLux: 1000,
  },
  thermal: {
    // C_th = 2.55 kg * 1000 J/(kg K), estimate only.
    capacityJPerK: 2550, // ASSUMPTION
    naturalConductanceWPerK: 2.5, // ASSUMPTION
    fanConductanceAtFullWPerK: 2.538, // ASSUMPTION; effective, not free-air fan flow, not experimentally validated
  },
  simulation: {
    stepSeconds: 2.5,
    stepsPerSecondRealtime: 24, // 24 x 2.5 s = 60 simulated seconds per wall-clock second (60x)
    chartMaxPoints: 120,
    chartSampleEverySteps: 24,
  },
  pid: {
    // Initial demonstration gains only. Not tuned against a measured enclosure (provisional).
    kpPerC: 0.22,
    kiPerCSecond: 0.00035,
    kdSecondsPerC: 0.6,
    derivativeFilter: 0.2,
  },
  ems: {
    // PROJECT_POLICY (not manufacturer BMS trip specifications). The first three are the M1 values.
    shedWirelessBelowSocPct: 20,
    shedUsbBelowSocPct: 15,
    shedLedBelowSocPct: 10,
    // PROJECT_POLICY, new in M3: e-paper updates are suspended after USB and before safety lighting.
    shedDisplayBelowSocPct: 12,
    // PROJECT_POLICY, new in M3: LED brightness cap before the LED is shed entirely.
    capLedBelowSocPct: 15,
    ledCapLevel: 0.25,
  },
});
