import Chart from 'chart.js/auto';
import { CONFIG } from '../simulation/config.js';

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#172522',
      titleColor: '#e8f1ec',
      bodyColor: '#c8d8d0',
      borderColor: 'rgba(177,205,190,.18)',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(190,208,198,.08)' },
      ticks: { color: '#81928a', maxTicksLimit: 5, font: { size: 10 } },
      border: { display: false },
      title: { display: true, text: 'Simulated time (min)', color: '#71847b', font: { size: 9, weight: '600' } },
    },
    y: {
      grid: { color: 'rgba(190,208,198,.08)' },
      ticks: { color: '#81928a', font: { size: 10 } },
      border: { display: false },
    },
  },
};

function makeChart(canvasId, label, color, unit, min = 0, max = undefined) {
  const canvas = document.getElementById(canvasId);
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.22,
      }],
    },
    options: {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        y: {
          ...baseOptions.scales.y,
          min,
          ...(max === undefined ? {} : { max }),
          title: { display: true, text: unit, color: '#71847b', font: { size: 9, weight: '600' } },
        },
      },
    },
  });
}

export function createCharts() {
  return {
    soc: makeChart('soc-chart', 'SOC', '#b5dc91', '%', 0, 100),
    temp: makeChart('temp-chart', 'Temperature', '#e8ad75', '°C'),
    pv: makeChart('pv-chart', 'PV power', '#79c9bd', 'W', 0),
    load: makeChart('load-chart', 'DC load', '#9caaf2', 'W', 0),
  };
}

export function appendChartSample(charts, state) {
  const minutes = (state.timeSeconds / 60).toFixed(1);
  const maxPoints = CONFIG.simulation.chartMaxPoints;
  const entries = [
    [charts.soc, state.socPct],
    [charts.temp, state.batteryTempC],
    [charts.pv, state.pvPowerW],
    [charts.load, state.loadPowerW],
  ];
  for (const [chart, value] of entries) {
    chart.data.labels.push(minutes);
    chart.data.datasets[0].data.push(Number(value.toFixed(3)));
    if (chart.data.labels.length > maxPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update('none');
  }
}

export function clearCharts(charts) {
  Object.values(charts).forEach((chart) => {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update('none');
  });
}
