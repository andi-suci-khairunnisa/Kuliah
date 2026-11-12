import { CONFIG } from './config.js';

// Supervisory EMS (signature unchanged: applyEMS(requested, socPct, batteryTempC)).
//
// requested: { wireless, usb, led, display } booleans (led = "LED level requested > 0", display optional).
// Priority (shed order when SOC is low): wireless -> USB -> e-paper updates -> LED (last).
// The controller, sensors, BMS monitoring and the fan are never shed by the EMS.
//
// Returns the M1 fields { active, actions, protected } plus:
//   requested, shed (names), shedDetails [{ load, reason }], mode, reason, chargeAllowed, ledLevelCap.
export function applyEMS(requested, socPct, batteryTempC) {
  const { battery, ems } = CONFIG;
  const active = { ...requested };
  const actions = [];
  const shedDetails = [];

  const shed = (load, text, reason) => {
    if (active[load]) {
      active[load] = false;
      actions.push(text);
      shedDetails.push({ load, reason });
    }
  };

  let mode = 'NORMAL';
  let ledLevelCap = 1;

  if (batteryTempC >= battery.noncriticalShutdownTempC) {
    mode = 'THERMAL PROTECTION';
    // M1 behaviour kept: every noncritical user load (including LED) is shed at 55 C.
    shed('wireless', 'Wireless shed: thermal protection', `T >= ${battery.noncriticalShutdownTempC} °C`);
    shed('usb', 'USB shed: thermal protection', `T >= ${battery.noncriticalShutdownTempC} °C`);
    shed('display', 'E-paper update suspended: thermal protection', `T >= ${battery.noncriticalShutdownTempC} °C`);
    shed('led', 'LED shed: thermal protection', `T >= ${battery.noncriticalShutdownTempC} °C`);
  } else {
    if (socPct < ems.shedWirelessBelowSocPct) shed('wireless', `Wireless shed: SOC < ${ems.shedWirelessBelowSocPct}%`, `SOC < ${ems.shedWirelessBelowSocPct}%`);
    if (socPct < ems.shedUsbBelowSocPct) shed('usb', `USB shed: SOC < ${ems.shedUsbBelowSocPct}%`, `SOC < ${ems.shedUsbBelowSocPct}%`);
    if (socPct < ems.shedDisplayBelowSocPct) shed('display', `E-paper update suspended: SOC < ${ems.shedDisplayBelowSocPct}%`, `SOC < ${ems.shedDisplayBelowSocPct}%`);
    if (socPct < ems.capLedBelowSocPct) ledLevelCap = ems.ledCapLevel;
    if (socPct < ems.shedLedBelowSocPct) shed('led', `LED shed: SOC < ${ems.shedLedBelowSocPct}%`, `SOC < ${ems.shedLedBelowSocPct}%`);
    if (socPct < ems.shedWirelessBelowSocPct) mode = 'SOC PROTECTION';
  }

  // Charge permission (EMS decision, consumed by the physical model).
  const chargeAllowed = batteryTempC < battery.maxChargeTempC && socPct < battery.maxSocPct;

  return {
    active,
    actions,
    protected: actions.length > 0,
    requested: { ...requested },
    shed: shedDetails.map((d) => d.load),
    shedDetails,
    mode,
    reason: actions.join('; '),
    chargeAllowed,
    ledLevelCap,
  };
}
