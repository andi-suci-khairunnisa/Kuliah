import './style.css';
import { CONFIG } from './simulation/config.js';
import { createInitialState, advanceSimulation, previewState } from './simulation/model.js';
import { PIDController } from './simulation/pid.js';
import { BenchScene } from './scene/bench3d.js';
import { createCharts, appendChartSample, clearCharts } from './ui/charts.js';
import { readInputs, setFanMode, bindInputLabels, renderDashboard, setDefaultLabels, syncLoadToggles, setLightingMode } from './ui/dashboard.js';

const scene = new BenchScene(document.getElementById('scene-container'));
const charts = createCharts();
const pid = new PIDController();
let state = createInitialState();
let running = true;
let accumulator = 0;
let lastFrame = performance.now();
let stepsSinceSample = 0;
let currentInputs = readInputs();

function recalculateInstantPreview() {
  currentInputs = readInputs();
  // Same PV / lighting / EMS / load code as the integration step; no physics is duplicated here.
  state = previewState(state, currentInputs);
  renderDashboard(state, currentInputs, running);
  syncLoadToggles(state.effectiveLoads, state.shedLoads);
  scene.updateState(state);
}

function resetSimulation() {
  state = createInitialState();
  state.batteryTempC = currentInputs.ambientTempC;
  pid.reset();
  accumulator = 0;
  stepsSinceSample = 0;
  clearCharts(charts);
  recalculateInstantPreview();
  appendChartSample(charts, state);
}

function tickSimulation() {
  currentInputs = readInputs();
  state = advanceSimulation(state, currentInputs, pid);
  stepsSinceSample += 1;
  if (stepsSinceSample >= CONFIG.simulation.chartSampleEverySteps) {
    appendChartSample(charts, state);
    stepsSinceSample = 0;
  }
  renderDashboard(state, currentInputs, running);
  syncLoadToggles(state.effectiveLoads, state.shedLoads);
  scene.updateState(state);
}

function frame(now) {
  const elapsed = Math.min((now - lastFrame) / 1000, 0.25);
  lastFrame = now;
  if (running) {
    accumulator += elapsed * CONFIG.simulation.stepsPerSecondRealtime;
    const stepWallInterval = 1; // accumulator is measured in numerical steps
    let steps = 0;
    while (accumulator >= stepWallInterval && steps < 120) {
      tickSimulation();
      accumulator -= stepWallInterval;
      steps += 1;
    }
  }
  requestAnimationFrame(frame);
}

function bindControls() {
  bindInputLabels();
  setDefaultLabels();
  setFanMode('auto');
  setLightingMode('auto');

  for (const id of ['irradiance', 'ambient', 'heat-input', 'pid-setpoint', 'manual-fan', 'wireless-toggle', 'usb-toggle', 'led-toggle', 'display-toggle', 'ambient-lux', 'pir-toggle', 'manual-led-level']) {
    document.getElementById(id).addEventListener('input', recalculateInstantPreview);
    document.getElementById(id).addEventListener('change', recalculateInstantPreview);
  }

  document.getElementById('mode-auto').addEventListener('click', () => {
    setFanMode('auto');
    pid.reset();
    recalculateInstantPreview();
  });
  document.getElementById('mode-manual').addEventListener('click', () => {
    setFanMode('manual');
    pid.reset();
    recalculateInstantPreview();
  });
  document.getElementById('light-auto').addEventListener('click', () => {
    setLightingMode('auto');
    recalculateInstantPreview();
  });
  document.getElementById('light-manual').addEventListener('click', () => {
    setLightingMode('manual');
    recalculateInstantPreview();
  });
  document.getElementById('pause-btn').addEventListener('click', (event) => {
    running = !running;
    event.currentTarget.textContent = running ? 'Pause' : 'Resume';
    renderDashboard(state, readInputs(), running);
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    running = true;
    document.getElementById('pause-btn').textContent = 'Pause';
    resetSimulation();
  });
  document.getElementById('clear-history').addEventListener('click', () => {
    clearCharts(charts);
    appendChartSample(charts, state);
  });
  document.getElementById('view-reset').addEventListener('click', () => scene.resetCamera());
}

bindControls();
state.batteryTempC = currentInputs.ambientTempC;
recalculateInstantPreview();
appendChartSample(charts, state);
renderDashboard(state, currentInputs, running);
requestAnimationFrame(frame);

window.addEventListener('beforeunload', () => scene.dispose());
