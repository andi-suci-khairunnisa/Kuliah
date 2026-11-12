import { CONFIG } from './config.js';

export class PIDController {
  constructor() {
    this.reset();
  }

  reset() {
    this.integral = 0;
    this.previousMeasurement = null;
    this.filteredDerivative = 0;
    this.output = 0;
  }

  update({ measurement, setpoint, dtSeconds, enabled = true }) {
    if (!enabled) {
      this.reset();
      return 0;
    }

    const { kpPerC: kp, kiPerCSecond: ki, kdSecondsPerC: kd, derivativeFilter } = CONFIG.pid;
    const error = measurement - setpoint; // positive when battery is warmer than target
    const rawDerivative = this.previousMeasurement === null
      ? 0
      : (measurement - this.previousMeasurement) / Math.max(dtSeconds, 1e-6);
    this.filteredDerivative += derivativeFilter * (rawDerivative - this.filteredDerivative);

    const proportional = kp * error;
    const derivative = kd * this.filteredDerivative;
    const unsaturated = proportional + ki * this.integral + derivative;
    const saturated = clamp(unsaturated, 0, 1);

    // Conditional integration anti-windup: integrate only when not pushing farther into saturation.
    const pushingHigh = unsaturated >= 1 && error > 0;
    const pushingLow = unsaturated <= 0 && error < 0;
    if (!pushingHigh && !pushingLow) {
      this.integral += error * dtSeconds;
    }

    const corrected = clamp(proportional + ki * this.integral + derivative, 0, 1);
    this.previousMeasurement = measurement;
    this.output = corrected;
    return corrected;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
