import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ---------------------------------------------------------------------------
// Layout constants (shelter-local metres; +z is the open passenger side).
// ---------------------------------------------------------------------------
const DEFAULT_CAMERA = {
  position: [7.2, 3.5, 9.6],
  target: [1.0, 1.35, 0.1],
};

// Canopy slab: tilted so the front edge is lower than the rear edge.
const ROOF = { y: 2.72, z: 0.05, tilt: 0.1, thickness: 0.14, width: 6.8, depth: 2.6 };

// Utility column (battery cabinet, fan, MPPT / DC-DC, DC bus, SOLAR POWERED sign).
const COLUMN = { x: 2.95, z: 0.78, width: 0.7, depth: 0.55, cabinetDepth: 0.62, cabinetHeight: 0.95 };
const COLUMN_FRONT_Z = COLUMN.z + COLUMN.depth / 2;

// Passenger benches: hollow stainless-steel (SS304) frame with a charging module at EACH end.
const SEAT_TOP = 0.52;
const BENCH = { z: -0.3, depth: 0.6, moduleW: 0.44, moduleH: 0.5, wall: 0.012, plateT: 0.02 };
const BENCH_LAYOUT = [
  { id: 'A', x0: -3.0, x1: -0.8 },
  { id: 'B', x0: -0.4, x1: 1.8 },
];
const RAIL_Y = 0.455; // centre height of the hollow rails under the seat
const PAD_Z = BENCH.z - 0.05; // wireless pad centre on the module top plate
const USB_FACE_Z = BENCH.z + BENCH.depth / 2; // front face of the end modules
const USB_Y = 0.26;

// Visual normalisation only (particle speed / PV sheen). No physics here.
const PV_VISUAL_FULL_W = 120;
const FAN_MAX_RAD_PER_S = 9;
// Animation is "live" only while updateState keeps being called
// (so a paused simulation also freezes particles and the fan).
const LIVE_WINDOW_MS = 400;
// Draw a seated passenger while state.motionDetected is true (set false to disable).
const SHOW_PASSENGER_ON_MOTION = true;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// LED brightness handed over by the simulation (visual mapping only, no control logic):
//   state.ledLevel  : 0 | 0.25 | 1            (preferred)
//   state.ledMode   : 'OFF' | 'DIM_25' | 'FULL_100'   (fallback)
//   neither present : 1 (legacy behaviour, LED simply on when effectiveLoads.led is true)
const LED_MODE_LEVEL = { OFF: 0, DIM: 0.25, DIM_25: 0.25, FULL: 1, FULL_100: 1 };
function resolveLedLevel(state) {
  if (Number.isFinite(state.ledLevel)) return clamp01(state.ledLevel);
  if (typeof state.ledMode === 'string' && state.ledMode in LED_MODE_LEVEL) return LED_MODE_LEVEL[state.ledMode];
  return 1;
}

const SOC_STYLE = {
  off: { color: new THREE.Color('#40554d'), emissive: new THREE.Color('#000000'), intensity: 0 },
  low: { color: new THREE.Color('#e0825f'), emissive: new THREE.Color('#6a2414'), intensity: 0.6 },
  mid: { color: new THREE.Color('#e6c25c'), emissive: new THREE.Color('#5c4a14'), intensity: 0.55 },
  ok: { color: new THREE.Color('#86c79a'), emissive: new THREE.Color('#1f4b34'), intensity: 0.5 },
};

// Body colours of the indicator materials: bright when active, dark when idle.
const INDICATOR_COLORS = {
  led: { on: new THREE.Color('#ffe2a8'), off: new THREE.Color('#3a3630') },
  wireless: { on: new THREE.Color('#86c9b8'), off: new THREE.Color('#2b3a37') },
  usb: { on: new THREE.Color('#6fdcae'), off: new THREE.Color('#2a3a35') },
};

const FLOW_COLORS = {
  supply: '#ffc857', // PV -> MPPT -> DC bus
  charge: '#6fe3a6', // DC bus -> battery
  discharge: '#ff9a5a', // battery -> DC bus
  load: '#7fe3f0', // wireless + USB (through the hollow bench frames)
  led: '#ffe2a0', // LED lighting
  display: '#c9d4ff', // e-paper controller / refresh pulse
  controller: '#9fe0b0', // controller + sensors (always powered)
  fan: '#8fd0ff', // cooling fan
};

// ---------------------------------------------------------------------------
// Canvas helpers (static artwork only; no simulation logic).
// ---------------------------------------------------------------------------
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function drawPvTexture(ctx, w, h) {
  const rand = seededRandom(7);
  ctx.fillStyle = '#0a1726';
  ctx.fillRect(0, 0, w, h);
  const cols = 7;
  const rows = 2;
  const mw = w / cols;
  const mh = h / rows;
  const cellCols = 6;
  const cellRows = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * mw;
      const y0 = r * mh;
      ctx.fillStyle = '#b9c3c9'; // aluminium module frame
      ctx.fillRect(x0 + 2, y0 + 2, mw - 4, mh - 4);
      const pad = 8;
      ctx.fillStyle = '#081525';
      ctx.fillRect(x0 + pad, y0 + pad, mw - pad * 2, mh - pad * 2);
      const cw = (mw - pad * 2 - 6) / cellCols;
      const ch = (mh - pad * 2 - 6) / cellRows;
      for (let cy = 0; cy < cellRows; cy++) {
        for (let cx = 0; cx < cellCols; cx++) {
          const px = x0 + pad + 3 + cx * cw;
          const py = y0 + pad + 3 + cy * ch;
          const v = rand();
          ctx.fillStyle = `rgb(${Math.round(13 + v * 8)}, ${Math.round(44 + v * 18)}, ${Math.round(86 + v * 28)})`;
          ctx.fillRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
          ctx.fillStyle = 'rgba(160, 196, 226, 0.38)'; // bus bars
          ctx.fillRect(px + cw * 0.33, py + 1.5, 1.3, ch - 3);
          ctx.fillRect(px + cw * 0.66, py + 1.5, 1.3, ch - 3);
        }
      }
    }
  }
}

// E-paper route / schedule panel: reflective paper look, ink + red + yellow only.
function drawEPaperTexture(ctx, w, h) {
  const PAPER = '#dcdacd';
  const INK = '#181818';
  const RED = '#b3261e';
  const YEL = '#d8b21a';
  const GRID = '#bdbbae';
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const rand = seededRandom(33);
  ctx.fillStyle = 'rgba(80, 78, 68, 0.10)'; // e-ink grain
  for (let i = 0; i < 2600; i++) ctx.fillRect(rand() * w, rand() * h, 2, 2);

  // Header
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, 120);
  ctx.fillStyle = PAPER;
  roundRectPath(ctx, 28, 24, 78, 72, 12);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(40, 36, 54, 18);
  ctx.beginPath(); ctx.arc(52, 82, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(84, 82, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = '800 50px Arial';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('BUS STOP', 126, 50);
  ctx.font = '600 26px Arial';
  ctx.fillText('ROUTE MAP · SCHEDULE', 128, 92);

  // Street grid
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 6;
  for (let gx = 40; gx < w; gx += 100) { ctx.beginPath(); ctx.moveTo(gx, 140); ctx.lineTo(gx, 560); ctx.stroke(); }
  for (let gy = 170; gy < 560; gy += 85) { ctx.beginPath(); ctx.moveTo(14, gy); ctx.lineTo(w - 14, gy); ctx.stroke(); }

  // Routes
  const routes = [
    { color: INK, pts: [[40, 530], [140, 440], [140, 330], [270, 255], [400, 255], [560, 170]] },
    { color: RED, pts: [[60, 175], [160, 255], [270, 255], [270, 385], [400, 470], [560, 530]] },
    { color: YEL, pts: [[560, 305], [420, 335], [270, 385], [140, 440], [50, 385]] },
  ];
  routes.forEach((route) => {
    ctx.strokeStyle = route.color;
    ctx.lineWidth = 13;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    route.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
    route.pts.forEach(([px, py]) => {
      ctx.fillStyle = PAPER;
      ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  });
  ctx.fillStyle = RED; // "you are here"
  ctx.beginPath(); ctx.arc(270, 385, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = '800 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('★', 270, 386);

  // Timetable
  ctx.fillStyle = INK;
  ctx.fillRect(0, 585, w, 3);
  const rows = [[INK, 'L12', 'Terminal Kota', '04 min'], [RED, 'L24', 'Pelabuhan', '11 min'], [YEL, 'L31', 'Bandara', '19 min']];
  rows.forEach(([color, line, dest, eta], i) => {
    const y = 612 + i * 62;
    ctx.fillStyle = color;
    roundRectPath(ctx, 28, y, 84, 46, 10);
    ctx.fill();
    ctx.fillStyle = color === YEL ? INK : PAPER;
    ctx.font = '800 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(line, 70, y + 24);
    ctx.fillStyle = INK;
    ctx.font = '600 30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(dest, 134, y + 24);
    ctx.font = '800 30px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(eta, w - 28, y + 24);
  });
  ctx.fillStyle = '#6a685c';
  ctx.font = '600 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('E-PAPER · LOW POWER · schematic', 28, 818);
}

function drawSolarSignTexture(ctx, w, h) {
  ctx.fillStyle = '#0e1619';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1f8f80';
  ctx.lineWidth = 6;
  roundRectPath(ctx, 8, 8, w - 16, h - 16, 18);
  ctx.stroke();
  const cx = w / 2;
  const cy = h * 0.3;
  ctx.fillStyle = '#ffc13a';
  ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffc13a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
    ctx.lineTo(cx + Math.cos(a) * 82, cy + Math.sin(a) * 82);
    ctx.stroke();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 66px Arial';
  ctx.fillText('SOLAR', cx, h * 0.6);
  ctx.fillText('POWERED', cx, h * 0.74);
  ctx.fillStyle = '#7ee0b5';
  ctx.font = '600 28px Arial';
  ctx.fillText('CLEAN ENERGY', cx, h * 0.88);
}

// Printed label on the USB plate of every bench end module (ports are 3D geometry on the right).
function drawUsbLabelTexture(ctx, w, h) {
  ctx.fillStyle = '#0b0f11';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#2b363c';
  ctx.lineWidth = 4;
  roundRectPath(ctx, 5, 5, w - 10, h - 10, 12);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 58px Arial';
  ctx.fillText('USB-A', w * 0.05, h * 0.3);
  ctx.fillText('USB-C', w * 0.05, h * 0.7);
  ctx.fillStyle = '#7f948a';
  ctx.font = '600 24px Arial';
  ctx.fillText('5V · 3A', w * 0.05, h * 0.5);
}

// Top plate of the end module (wireless pad is 3D geometry; the text sits at the front edge).
function drawModulePlateTexture(ctx, w, h) {
  ctx.fillStyle = '#0b0e10';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1d262b';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = '#9fb7ad';
  ctx.font = '700 26px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WIRELESS', w / 2, h - 34);
}

function drawBusSignTexture(ctx, w, h) {
  ctx.fillStyle = '#1f5fbf';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  roundRectPath(ctx, 12, 12, w - 24, h - 24, 18);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  roundRectPath(ctx, w * 0.2, h * 0.2, w * 0.6, h * 0.46, 22);
  ctx.fill();
  ctx.fillStyle = '#1f5fbf';
  roundRectPath(ctx, w * 0.27, h * 0.27, w * 0.46, h * 0.16, 8);
  ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.34, h * 0.6, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.66, h * 0.6, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 38px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BUS', w / 2, h * 0.8);
}

function drawPavingTexture(ctx, w, h) {
  ctx.fillStyle = '#6b7a74';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#5a6862';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
  ctx.stroke();
}

export class BenchScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#182724');
    this.scene.fog = new THREE.Fog('#182724', 18, 38);
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.2, 100);
    this.camera.position.set(...DEFAULT_CAMERA.position);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    // PCFSoftShadowMap was removed in recent three.js; PCFShadowMap is already filtered.
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(...DEFAULT_CAMERA.target);
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI * 0.48;

    this.materials = {};
    this.dynamic = {};
    this._textures = [];
    this._geo = {};
    this._lastStateAt = 0;
    this._lastFrameAt = performance.now();
    this._fanSpeed = 0;
    this._socKey = '';
    this.createMaterials();
    this.createEnvironment();
    this.createBench();
    this.createEnergyPaths();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);
  }

  material(color, roughness = 0.55, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  box(parent, name, size, position, material, castShadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  cylinder(parent, name, radiusTop, radiusBottom, height, position, material, radialSegments = 24) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // -- Extra helpers (new, internal) -----------------------------------------

  createMaterials() {
    const m = this.materials;
    m.steel = this.material('#2b3136', 0.42, 0.78);
    m.steelDark = this.material('#1a1e22', 0.5, 0.7);
    m.steelLight = this.material('#4a535a', 0.38, 0.8);
    m.aluminum = this.material('#b3bdc3', 0.28, 0.9);
    // Brushed stainless steel 304 (hollow bench frame and end modules).
    m.stainless = this.material('#b9bfc3', 0.36, 1.0);
    m.wood = this.material('#a8764c', 0.7, 0.02);
    m.woodLight = this.material('#c29363', 0.68, 0.02);
    m.cabinet = this.material('#222a2e', 0.5, 0.6);
    m.cabinetDoor = this.material('#2f393e', 0.42, 0.6);
    m.copper = this.material('#c9873a', 0.35, 0.85);
    m.cable = this.material('#d8663a', 0.5, 0.1);
    m.teal = this.material('#1f8f80', 0.4, 0.5);
    m.black = this.material('#05080a', 0.6, 0.1);
    m.plateBlack = this.material('#0b0e10', 0.25, 0.3);
    m.concrete = this.material('#5f6d67', 0.92);
    m.curb = this.material('#8d9a94', 0.85);
    m.asphalt = this.material('#252b2d', 0.95);
    m.yellow = this.material('#d6b43c', 0.7);
    m.lane = this.material('#cfd6d2', 0.8);
    m.glass = new THREE.MeshPhysicalMaterial({
      color: '#a9d6dd',
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.21,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
      depthWrite: false,
    });
  }

  makeTexture(width, height, draw, { repeat, anisotropy = true } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (anisotropy) texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    if (repeat) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...repeat);
    }
    this._textures.push(texture);
    return texture;
  }

  // Flat panel with a texture. glow > 0 adds a little self-illumination so printed
  // artwork stays legible under the shaded canopy (no real backlight is implied).
  texturedPlane(parent, name, width, height, position, texture, glow = 0.2, roughness = 0.5) {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: '#ffffff',
      emissiveIntensity: glow,
      roughness,
      metalness: 0,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    mesh.name = name;
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }

  roundedShape(width, height, radius) {
    const x = -width / 2;
    const y = -height / 2;
    const s = new THREE.Shape();
    s.moveTo(x + radius, y);
    s.lineTo(x + width - radius, y);
    s.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
    s.lineTo(x + width, y + height - radius);
    s.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
    s.lineTo(x + radius, y + height);
    s.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + radius);
    s.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  cachedGeometry(key, factory) {
    return (this._geo[key] ||= factory());
  }

  // Rectangular hollow section (SS304 tube): real hole through the profile, open at both ends.
  hollowTube(parent, name, w, h, wall, length, axis, position, material) {
    const geometry = this.cachedGeometry(`tube:${w}:${h}:${wall}:${length}`, () => {
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, -h / 2);
      shape.lineTo(w / 2, -h / 2);
      shape.lineTo(w / 2, h / 2);
      shape.lineTo(-w / 2, h / 2);
      shape.closePath();
      const iw = w / 2 - wall;
      const ih = h / 2 - wall;
      const hole = new THREE.Path();
      hole.moveTo(-iw, -ih);
      hole.lineTo(-iw, ih);
      hole.lineTo(iw, ih);
      hole.lineTo(iw, -ih);
      hole.closePath();
      shape.holes.push(hole);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
      geo.translate(0, 0, -length / 2);
      return geo;
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    if (axis === 'x') mesh.rotation.y = Math.PI / 2;
    else if (axis === 'y') mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Height of the canopy underside at a given shelter z (the slab is tilted about x).
  roofUnderY(z) {
    const { y, z: rz, tilt, thickness } = ROOF;
    const half = thickness / 2;
    const lz = (z - rz + half * Math.sin(tilt)) / Math.cos(tilt);
    return y - half * Math.cos(tilt) - lz * Math.sin(tilt);
  }

  post(parent, name, x, z, material = this.materials.steel, size = 0.11) {
    const top = this.roofUnderY(z) + 0.05; // embedded into the slab, no visible gap
    this.box(parent, name, [size, top, size], [x, top / 2, z], material);
    this.box(parent, `${name}-base`, [0.2, 0.025, 0.2], [x, 0.0125, z], this.materials.steelLight);
  }

  // -- Environment ------------------------------------------------------------

  createEnvironment() {
    // Image-based light gives metal, glass and PV a believable sheen.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this._envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    this.scene.environment = this._envTarget.texture;
    this.scene.environmentIntensity = 0.55;

    const hemi = new THREE.HemisphereLight('#dcece1', '#39443d', 0.9);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight('#fff0d6', 3.2);
    key.position.set(-5.5, 9, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.035;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight('#7eb7ad', 0.9);
    fill.position.set(7, 4, -5);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight('#bcd9ff', 0.8);
    rim.position.set(3, 5, -9);
    this.scene.add(rim);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), this.material('#283b35', 0.95));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.06;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(40, 40, '#50635b', '#40524a');
    grid.position.y = -0.055;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((m) => { m.transparent = true; m.opacity = 0.14; });
    this.scene.add(grid);

    // Sidewalk platform (top at y = 0.1 is the shelter floor), curb, road.
    const env = new THREE.Group();
    env.name = 'street';
    this.scene.add(env);
    this.box(env, 'sidewalk', [24, 0.096, 4.2], [0, 0.048, 0], this.materials.concrete, false);
    const paving = this.makeTexture(256, 256, drawPavingTexture, { repeat: [16, 3] });
    const pavingMat = new THREE.MeshStandardMaterial({ map: paving, roughness: 0.92 });
    const pavingMesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 4.2), pavingMat);
    pavingMesh.rotation.x = -Math.PI / 2;
    pavingMesh.position.y = 0.1;
    pavingMesh.receiveShadow = true;
    env.add(pavingMesh);
    this.box(env, 'curb', [24, 0.12, 0.16], [0, 0.05, 2.14], this.materials.curb, false);
    this.box(env, 'tactile-strip', [8.2, 0.012, 0.26], [0.3, 0.106, 1.72], this.materials.yellow, false);
    this.box(env, 'road', [40, 0.05, 6], [0, -0.025, 5.2], this.materials.asphalt, false);
    for (let i = -4; i <= 4; i++) {
      this.box(env, 'lane-mark', [1.4, 0.004, 0.12], [i * 2.6, 0.004, 5.2], this.materials.lane, false);
    }

    // Bus stop sign beside the shelter.
    const sign = new THREE.Group();
    sign.position.set(5.2, 0.1, 1.45);
    env.add(sign);
    this.cylinder(sign, 'sign-pole', 0.035, 0.035, 2.5, [0, 1.25, 0], this.materials.steel, 12);
    this.box(sign, 'sign-plate', [0.54, 0.76, 0.03], [0, 2.2, 0], this.materials.steelDark);
    const signTex = this.makeTexture(256, 360, drawBusSignTexture);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.72), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 }));
    plate.position.set(0, 2.2, 0.0165);
    sign.add(plate);
  }

  // -- Shelter ---------------------------------------------------------------

  createBench() {
    const ledMat = new THREE.MeshStandardMaterial({ color: '#3a3630', emissive: '#ffb35a', emissiveIntensity: 0.0, roughness: 0.3 });
    const wirelessMat = new THREE.MeshStandardMaterial({ color: '#2b3a37', emissive: '#4dbf9d', emissiveIntensity: 0.15, metalness: 0.35, roughness: 0.3 });
    const usbLedMat = new THREE.MeshStandardMaterial({ color: '#2a3a35', emissive: '#18d487', emissiveIntensity: 0.05, roughness: 0.35 });
    this.dynamic.ledMat = ledMat;
    this.dynamic.wirelessMat = wirelessMat;
    this.dynamic.usbLedMat = usbLedMat;

    const shelter = new THREE.Group();
    shelter.name = 'smart-solar-bus-shelter';
    shelter.position.y = 0.1; // sidewalk surface
    this.scene.add(shelter);
    this.benchGroup = shelter;
    this.shelterGroup = shelter;

    this.buildStructure(shelter);
    this.buildCanopy(shelter);
    this.buildGlazing(shelter);
    this.buildBenches(shelter, wirelessMat, usbLedMat);
    this.buildPassenger(shelter);
    this.buildRouteDisplay(shelter);
    this.buildUtilityColumn(shelter);
    this.buildLighting(shelter, ledMat);

    this.addLabel(shelter, 'PV ARRAY', [-1.2, 3.25, 0.1], 0.9);
    this.addLabel(shelter, 'BATTERY + BMS', [COLUMN.x, 0.25, COLUMN_FRONT_Z + 0.45], 0.8);
    this.addLabel(shelter, 'MPPT / DC-DC', [COLUMN.x + COLUMN.width / 2 + 0.7, 1.95, COLUMN.z], 0.75);
    this.addLabel(shelter, 'DC BUS', [COLUMN.x + COLUMN.width / 2 + 0.55, 1.34, COLUMN.z], 0.5);
    // One WIRELESS label per bench (the pad is printed on every module top plate too).
    BENCH_LAYOUT.forEach((b) => {
      this.addLabel(shelter, 'WIRELESS', [b.x0 + BENCH.moduleW / 2, SEAT_TOP + 0.5, PAD_Z + 0.15], 0.7);
    });
    this.addLabel(shelter, 'SS304 HOLLOW FRAME', [(BENCH_LAYOUT[1].x0 + BENCH_LAYOUT[1].x1) / 2, 0.2, BENCH.z + 0.75], 1.0);
  }

  buildStructure(g) {
    const rearZ = -1.0;
    [-3.1, -1.03, 1.03, 3.1].forEach((x, i) => this.post(g, `post-rear-${i}`, x, rearZ));
    this.post(g, 'post-front-left', -3.1, 0.9);
    this.post(g, 'post-front-mid', -0.6, 0.9);
    const topY = this.roofUnderY(rearZ) - 0.02;
    this.box(g, 'rail-rear-top', [6.2, 0.06, 0.06], [0, topY, rearZ], this.materials.steel);
    this.box(g, 'rail-rear-bottom', [6.2, 0.09, 0.07], [0, 0.3, rearZ], this.materials.steel);
  }

  buildCanopy(g) {
    const m = this.materials;
    const canopy = new THREE.Group();
    canopy.name = 'canopy';
    canopy.position.set(0, ROOF.y, ROOF.z);
    canopy.rotation.x = ROOF.tilt; // positive: front edge lower than rear edge
    g.add(canopy);

    const hw = ROOF.width / 2;
    const hd = ROOF.depth / 2;
    this.box(canopy, 'roof-slab', [ROOF.width, ROOF.thickness, ROOF.depth], [0, 0, 0], m.steelDark);
    this.box(canopy, 'roof-fascia-front', [ROOF.width + 0.08, 0.22, 0.09], [0, -0.035, hd + 0.005], m.steel);
    this.box(canopy, 'roof-fascia-back', [ROOF.width + 0.08, 0.22, 0.09], [0, -0.035, -hd - 0.005], m.steel);
    this.box(canopy, 'roof-fascia-left', [0.09, 0.22, ROOF.depth], [-hw - 0.005, -0.035, 0], m.steel);
    this.box(canopy, 'roof-fascia-right', [0.09, 0.22, ROOF.depth], [hw + 0.005, -0.035, 0], m.steel);

    // PV array: aluminium rim + one textured laminate (module frames and cell lines).
    this.box(canopy, 'pv-frame', [6.64, 0.04, 2.34], [0, 0.092, 0], m.aluminum);
    const pvTexture = this.makeTexture(2048, 694, drawPvTexture);
    const pvMat = new THREE.MeshStandardMaterial({
      map: pvTexture,
      emissiveMap: pvTexture,
      emissive: '#ffffff',
      emissiveIntensity: 0.03,
      roughness: 0.2,
      metalness: 0.35,
      envMapIntensity: 0.9,
    });
    const pv = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 2.2), pvMat);
    pv.name = 'pv-surface';
    pv.rotation.x = -Math.PI / 2;
    pv.position.set(0, 0.113, 0);
    pv.receiveShadow = true;
    canopy.add(pv);
    this.dynamic.pvSurface = canopy;
    this.dynamic.pvMat = pvMat;

    this.buildSensors(canopy);
  }

  // Physical representation only: ambient light (lux) sensor and PIR motion sensor on the front
  // roof edge. The scene never measures anything; the simulation decides the LED level.
  buildSensors(canopy) {
    const frontZ = ROOF.depth / 2 + 0.05;

    // Ambient light sensor: small housing + clear lens, facing outward / slightly up.
    const lux = new THREE.Group();
    lux.name = 'lux-sensor';
    lux.position.set(1.9, -0.035, frontZ);
    lux.rotation.x = -0.25;
    canopy.add(lux);
    this.box(lux, 'lux-sensor-housing', [0.2, 0.12, 0.05], [0, 0, 0.025], this.materials.steelLight, false);
    const lensMat = new THREE.MeshPhysicalMaterial({ color: '#fff1c8', emissive: '#ffd98a', emissiveIntensity: 0.35, roughness: 0.1, clearcoat: 1 });
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), lensMat);
    lens.name = 'lux-sensor-lens';
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 0.05);
    lux.add(lens);
    this.dynamic.luxSensor = lux;
    this.addLabel(canopy, 'LUX SENSOR', [1.9, 0.36, frontZ + 0.07], 0.7);

    // PIR motion sensor: faceted white Fresnel dome, tilted down toward the waiting area.
    const pir = new THREE.Group();
    pir.name = 'pir-sensor';
    pir.position.set(-0.6, -0.035, frontZ);
    pir.rotation.x = 0.55;
    canopy.add(pir);
    this.box(pir, 'pir-sensor-housing', [0.22, 0.13, 0.05], [0, 0, 0.025], this.materials.steelLight, false);
    const domeMat = new THREE.MeshStandardMaterial({ color: '#f1f1ea', roughness: 0.45, flatShading: true });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dome.name = 'pir-sensor-dome';
    dome.rotation.x = Math.PI / 2;
    dome.position.set(0, 0, 0.05);
    pir.add(dome);
    const pirLedMat = new THREE.MeshStandardMaterial({ color: '#552018', emissive: '#ff4a3a', emissiveIntensity: 0.08, roughness: 0.4 });
    const pirLed = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), pirLedMat);
    pirLed.name = 'pir-status-led';
    pirLed.position.set(0.085, 0.045, 0.052);
    pir.add(pirLed);
    this.dynamic.pirSensor = pir;
    this.dynamic.pirLedMat = pirLedMat;
    this.addLabel(canopy, 'PIR SENSOR', [-0.6, 0.36, frontZ + 0.07], 0.7);
  }

  buildGlazing(g) {
    const glass = this.materials.glass;
    const addPane = (name, w, h, pos) => {
      const mesh = this.box(g, name, [w, h, 0.016], pos, glass, false);
      mesh.receiveShadow = false;
      mesh.renderOrder = 2;
    };
    const rearZ = -1.0;
    const top = this.roofUnderY(rearZ) + 0.005;
    const bottom = 0.34;
    const edges = [-3.1, -1.03, 1.03, 3.1];
    for (let i = 0; i < 3; i++) {
      const w = edges[i + 1] - edges[i] - 0.11;
      addPane(`glass-rear-${i}`, w, top - bottom, [(edges[i] + edges[i + 1]) / 2, (top + bottom) / 2, rearZ]);
    }
    // Side panes follow the roof slope.
    const sidePane = (name, x, zA, zB) => {
      const shape = new THREE.Shape();
      shape.moveTo(-zA, bottom);
      shape.lineTo(-zB, bottom);
      shape.lineTo(-zB, this.roofUnderY(zB) + 0.005);
      shape.lineTo(-zA, this.roofUnderY(zA) + 0.005);
      shape.closePath();
      const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.016, bevelEnabled: false }), glass);
      mesh.name = name;
      mesh.rotation.y = Math.PI / 2; // shape x -> -z, extrusion -> +x
      mesh.position.set(x - 0.008, 0, 0);
      mesh.renderOrder = 2;
      g.add(mesh);
    };
    sidePane('glass-side-left', -3.1, -0.945, 0.845);
    sidePane('glass-side-right', 3.1, -0.945, 0.45);
  }

  // Two benches. Frame = hollow SS304 sections so the DC cables run inside the frame to the
  // charging modules at BOTH ends of each bench (wireless pad on top, USB-A + USB-C on the front).
  buildBenches(g, wirelessMat, usbLedMat) {
    const m = this.materials;
    const { z: zc, moduleW: mw } = BENCH;
    const d_ = this.dynamic;
    d_.benches = [];
    d_.wirelessRings = [];
    d_.usbPanels = [];
    d_.usbBezels = [];
    d_.benchModules = [];

    const plateTex = this.makeTexture(220, 300, drawModulePlateTexture);
    const plateTopMat = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.28, metalness: 0.25 });
    const platMats = [m.plateBlack, m.plateBlack, plateTopMat, m.plateBlack, m.plateBlack, m.plateBlack];
    const usbTex = this.makeTexture(380, 250, drawUsbLabelTexture);

    BENCH_LAYOUT.forEach(({ id, x0, x1 }) => {
      const bench = new THREE.Group();
      bench.name = `bench-${id}`;
      g.add(bench);
      d_.benches.push(bench);
      const cx = (x0 + x1) / 2;
      const span = x1 - x0 - 2 * mw;

      // Wooden seat slats between the two end modules.
      for (let i = 0; i < 5; i++) {
        this.box(bench, `seat-slat-${id}-${i}`, [span, 0.04, 0.1], [cx, SEAT_TOP - 0.02, zc - 0.25 + i * 0.125], i % 2 ? m.wood : m.woodLight);
      }
      // Hollow rails: rear one carries the wireless cable, front one carries the USB cable.
      this.hollowTube(bench, `rail-rear-${id}`, 0.05, 0.05, 0.004, span, 'x', [cx, RAIL_Y, zc - 0.2], m.stainless);
      this.hollowTube(bench, `rail-front-${id}`, 0.05, 0.05, 0.004, span, 'x', [cx, RAIL_Y, zc + 0.2], m.stainless);
      this.hollowTube(bench, `rail-tie-${id}`, 0.05, 0.05, 0.004, 0.4, 'z', [cx, RAIL_Y, zc], m.stainless);
      this.hollowTube(bench, `centre-leg-${id}`, 0.06, 0.06, 0.004, 0.43, 'y', [cx, 0.215, zc], m.stainless);
      this.box(bench, `centre-foot-${id}`, [0.14, 0.01, 0.14], [cx, 0.005, zc], m.stainless, false);

      // End modules (left opens to -x, right opens to +x so the hollow interior is visible).
      [{ side: 'L', x: x0 + mw / 2, dir: -1 }, { side: 'R', x: x1 - mw / 2, dir: 1 }].forEach(({ side, x, dir }) => {
        const parts = this.buildEndModule(bench, `${id}${side}`, x, dir, wirelessMat, usbLedMat, platMats, usbTex);
        d_.wirelessRings.push(parts.ring);
        d_.usbPanels.push(parts.usbPlate);
        d_.usbBezels.push(...parts.bezels);
        d_.benchModules.push({ id: `${id}${side}`, x, bench: id });
      });
    });
    // Backward-compatible single references (first module).
    d_.wirelessRing = d_.wirelessRings[0];
    d_.usbPanel = d_.usbPanels[0];
  }

  buildEndModule(parent, tag, x, dir, wirelessMat, usbLedMat, plateMats, usbTex) {
    const m = this.materials;
    const { z: zc, depth: d, moduleW: mw, moduleH: mh, wall, plateT } = BENCH;
    const mod = new THREE.Group();
    mod.name = `end-module-${tag}`;
    parent.add(mod);

    // Hollow shell: C-shaped SS304 section, open on the outer end so the inside is visible.
    const shellGeo = this.cachedGeometry('mod-shell', () => {
      const s = new THREE.Shape();
      s.moveTo(-mw / 2, -d / 2);
      s.lineTo(mw / 2, -d / 2);
      s.lineTo(mw / 2, d / 2);
      s.lineTo(-mw / 2, d / 2);
      s.lineTo(-mw / 2, d / 2 - wall);
      s.lineTo(mw / 2 - wall, d / 2 - wall);
      s.lineTo(mw / 2 - wall, -d / 2 + wall);
      s.lineTo(-mw / 2, -d / 2 + wall);
      s.closePath();
      return new THREE.ExtrudeGeometry(s, { depth: mh, bevelEnabled: false });
    });
    const shellGroup = new THREE.Group();
    shellGroup.position.set(x, 0, zc);
    shellGroup.rotation.y = dir > 0 ? Math.PI : 0; // base shape opens toward -x
    const shell = new THREE.Mesh(shellGeo, m.stainless);
    shell.name = `mod-shell-${tag}`;
    shell.rotation.x = -Math.PI / 2; // extrusion axis -> +y
    shell.castShadow = true;
    shell.receiveShadow = true;
    shellGroup.add(shell);
    mod.add(shellGroup);

    // DC cable inside the hollow mod.
    const cableX = x - dir * (mw / 2 - wall - 0.07);
    const cable = this.cylinder(mod, `mod-cable-${tag}`, 0.018, 0.018, 0.44, [cableX, 0.26, zc], m.cable, 10);
    cable.castShadow = false;

    // Top plate, flush with the seat surface.
    const plate = this.box(mod, `mod-plate-${tag}`, [mw, plateT, d], [x, mh + plateT / 2, zc], plateMats);

    // Wireless pad: concentric rings on the plate (shared wirelessMat -> state.effectiveLoads.wireless).
    const padY = mh + plateT;
    const ringGeo = this.cachedGeometry('pad-ring', () => new THREE.TorusGeometry(0.15, 0.011, 10, 56));
    const ring2Geo = this.cachedGeometry('pad-ring2', () => new THREE.TorusGeometry(0.085, 0.008, 10, 48));
    const coreGeo = this.cachedGeometry('pad-core', () => new THREE.CircleGeometry(0.032, 28));
    const ring = new THREE.Mesh(ringGeo, wirelessMat);
    ring.name = `wireless-ring-${tag}`;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, padY + 0.008, PAD_Z);
    mod.add(ring);
    const ring2 = new THREE.Mesh(ring2Geo, wirelessMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set(x, padY + 0.006, PAD_Z);
    mod.add(ring2);
    const core = new THREE.Mesh(coreGeo, wirelessMat);
    core.rotation.x = -Math.PI / 2;
    core.position.set(x, padY + 0.003, PAD_Z);
    mod.add(core);

    // USB plate on the front face: USB-A + USB-C, each on a lit bezel (shared usbLedMat).
    const fz = USB_FACE_Z;
    const usbPlate = this.box(mod, `usb-panel-${tag}`, [0.38, 0.26, 0.012], [x, USB_Y, fz + 0.006], m.plateBlack, false);
    this.texturedPlane(mod, `usb-label-${tag}`, 0.36, 0.24, [x, USB_Y, fz + 0.0125], usbTex, 0.25);
    const px = x + 0.085;
    const yA = USB_Y + 0.055;
    const yC = USB_Y - 0.06;
    const bezelA = this.box(mod, `usb-a-bezel-${tag}`, [0.19, 0.095, 0.005], [px, yA, fz + 0.0145], usbLedMat, false);
    this.box(mod, `usb-a-opening-${tag}`, [0.15, 0.05, 0.008], [px, yA, fz + 0.0165], m.black, false);
    this.box(mod, `usb-a-tongue-${tag}`, [0.1, 0.012, 0.004], [px, yA, fz + 0.0225], m.steelLight, false);
    const bezelCGeo = this.cachedGeometry('usb-c-bezel', () => new THREE.ExtrudeGeometry(this.roundedShape(0.15, 0.08, 0.04), { depth: 0.005, bevelEnabled: false }));
    const openCGeo = this.cachedGeometry('usb-c-open', () => new THREE.ExtrudeGeometry(this.roundedShape(0.1, 0.04, 0.02), { depth: 0.008, bevelEnabled: false }));
    const bezelC = new THREE.Mesh(bezelCGeo, usbLedMat);
    bezelC.name = `usb-c-bezel-${tag}`;
    bezelC.position.set(px, yC, fz + 0.012);
    mod.add(bezelC);
    const openC = new THREE.Mesh(openCGeo, m.black);
    openC.position.set(px, yC, fz + 0.0125);
    mod.add(openC);

    return { ring, usbPlate, plate, bezels: [bezelA, bezelC] };
  }

  // Simple seated figure, visible only while state.motionDetected is true (PIR trigger cue).
  buildPassenger(g) {
    const p = new THREE.Group();
    p.name = 'passenger';
    p.position.set(0.7, SEAT_TOP, BENCH.z);
    p.visible = false;
    g.add(p);
    const cloth = this.material('#5a6f86', 0.8);
    const skin = this.material('#c9a27d', 0.7);
    const add = (geo, mat, pos) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      p.add(mesh);
    };
    add(new THREE.CapsuleGeometry(0.13, 0.3, 4, 10), cloth, [0, 0.4, -0.08]);
    add(new THREE.SphereGeometry(0.09, 14, 12), skin, [0, 0.77, -0.08]);
    add(new THREE.BoxGeometry(0.26, 0.11, 0.42), cloth, [0, 0.06, 0.1]);
    add(new THREE.BoxGeometry(0.2, 0.5, 0.1), cloth, [0, -0.25, 0.3]);
    this.dynamic.passenger = p;
  }

  // Single e-paper route / schedule panel on the centre rear glass (reflective, no backlight).
  buildRouteDisplay(g) {
    const m = this.materials;
    const rz = -1.0;
    this.box(g, 'route-frame', [1.28, 1.74, 0.05], [0, 1.5, rz + 0.045], m.steelDark);
    const tex = this.makeTexture(600, 840, drawEPaperTexture);
    const panel = this.texturedPlane(g, 'epaper-route-display', 1.14, 1.6, [0, 1.5, rz + 0.0705], tex, 0.15, 0.9);
    this.dynamic.routeDisplay = panel;
    this.addLabel(g, 'E-PAPER ROUTE INFO', [0, 2.52, rz + 0.12], 0.9);
  }

  buildUtilityColumn(g) {
    const m = this.materials;
    const { x: cx, z: cz, width, depth, cabinetDepth, cabinetHeight } = COLUMN;
    const col = new THREE.Group();
    col.name = 'utility-column';
    g.add(col);

    const colTop = this.roofUnderY(cz) + 0.05;
    this.box(col, 'column-body', [width, colTop - cabinetHeight, depth], [cx, (colTop + cabinetHeight) / 2, cz], m.steel);

    // --- Battery enclosure (base of the column) ---
    const cabFront = cz + cabinetDepth / 2;
    this.box(col, 'battery-enclosure', [width + 0.08, cabinetHeight, cabinetDepth], [cx, cabinetHeight / 2, cz], m.cabinet);
    this.box(col, 'battery-door', [0.66, 0.82, 0.015], [cx, 0.47, cabFront + 0.0075], m.cabinetDoor);
    this.box(col, 'battery-handle', [0.025, 0.18, 0.02], [cx + 0.28, 0.4, cabFront + 0.025], m.aluminum, false);
    this.box(col, 'soc-housing', [0.62, 0.24, 0.012], [cx, 0.74, cabFront + 0.021], m.black, false);
    this.dynamic.socSegments = [];
    for (let i = 0; i < 10; i++) {
      const seg = this.box(col, 'soc-segment', [0.049, 0.18, 0.016], [cx - 0.2925 + i * 0.065, 0.74, cabFront + 0.035], this.material('#5f786d', 0.4, 0.2), false);
      this.dynamic.socSegments.push(seg);
    }

    // --- Cooling fan on the +x face of the cabinet ---
    const fx = cx + (width + 0.08) / 2;
    const fanY = 0.36;
    const recess = this.cylinder(col, 'fan-recess', 0.22, 0.22, 0.02, [fx + 0.008, fanY, cz], m.black, 40);
    recess.rotation.z = Math.PI / 2;
    const guard = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.014, 8, 40), m.aluminum);
    guard.rotation.y = Math.PI / 2;
    guard.position.set(fx + 0.02, fanY, cz);
    col.add(guard);
    this.box(col, 'fan-guard-v', [0.008, 0.42, 0.012], [fx + 0.052, fanY, cz], m.aluminum, false);
    this.box(col, 'fan-guard-h', [0.008, 0.012, 0.42], [fx + 0.052, fanY, cz], m.aluminum, false);
    const fan = new THREE.Group();
    fan.name = 'cooling-fan';
    fan.position.set(fx + 0.03, fanY, cz);
    col.add(fan);
    const hub = this.cylinder(fan, 'fan-hub', 0.045, 0.045, 0.045, [0, 0, 0], m.aluminum, 20);
    hub.rotation.z = Math.PI / 2;
    const bladeMat = this.material('#cfd8dc', 0.4, 0.5);
    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * Math.PI * 2) / 6;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.15, 0.07), bladeMat);
      blade.position.y = 0.115;
      blade.rotation.y = 0.5;
      pivot.add(blade);
      fan.add(pivot);
    }
    this.dynamic.fan = fan;

    // --- MPPT / DC-DC converter and DC bus on the +x face (nodes of the energy flow) ---
    const sx = cx + width / 2;
    this.box(col, 'power-box', [0.1, 1.05, 0.46], [sx + 0.05, 1.67, cz], m.steelDark);
    this.box(col, 'mppt-module', [0.03, 0.34, 0.36], [sx + 0.115, 1.95, cz], m.teal, false);
    for (let i = 0; i < 4; i++) {
      this.box(col, 'mppt-fin', [0.02, 0.012, 0.34], [sx + 0.14, 1.85 + i * 0.07, cz], m.aluminum, false);
    }
    this.box(col, 'dc-bus-bar', [0.03, 0.08, 0.38], [sx + 0.115, 1.34, cz], m.copper, false);

    // --- SOLAR POWERED identity sign (the charging ports now live on the benches) ---
    this.box(col, 'solar-sign-backing', [0.64, 0.84, 0.02], [cx, 1.65, COLUMN_FRONT_Z + 0.01], m.steelDark);
    const signTex = this.makeTexture(480, 640, drawSolarSignTexture);
    this.texturedPlane(col, 'solar-sign', 0.6, 0.8, [cx, 1.65, COLUMN_FRONT_Z + 0.0215], signTex, 0.7);
  }

  buildLighting(g, ledMat) {
    const stripY = (z) => this.roofUnderY(z) - 0.02;
    // Warm-white LED strips under the canopy (brightness: 0 / 25% / 100% from the simulation).
    const front = this.box(g, 'canopy-led-strip', [6.0, 0.025, 0.05], [0, stripY(0.98), 0.98], ledMat, false);
    this.box(g, 'canopy-led-strip-rear', [5.6, 0.025, 0.05], [0, stripY(-0.5), -0.5], ledMat, false);
    [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].forEach((x, i) => {
      const spot = this.cylinder(g, `downlight-${i}`, 0.05, 0.05, 0.012, [x, this.roofUnderY(0.15) - 0.008, 0.15], ledMat, 20);
      spot.rotation.x = ROOF.tilt;
      spot.castShadow = false;
    });
    this.dynamic.led = front;

    const ledLight = new THREE.PointLight('#ffd58d', 0, 6.5, 2);
    ledLight.position.set(0.0, this.roofUnderY(0.3) - 0.25, 0.3);
    g.add(ledLight);
    this.dynamic.ledLight = ledLight;
    this.dynamic.ledExtraLights = [-2.1, 2.1].map((x) => {
      const light = new THREE.PointLight('#ffd58d', 0, 4.5, 2);
      light.position.set(x, this.roofUnderY(0.0) - 0.25, 0.0);
      g.add(light);
      return light;
    });
  }

  addLabel(parent, text, position, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(12, 24, 21, 0.78)';
    roundRectPath(ctx, 6, 6, 500, 116, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(125, 224, 191, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
    let size = 68;
    ctx.font = `700 ${size}px Arial`;
    while (ctx.measureText(text).width > 450 && size > 24) {
      size -= 2;
      ctx.font = `700 ${size}px Arial`;
    }
    ctx.fillStyle = '#e3f2e8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 66);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this._textures.push(texture);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(...position);
    sprite.scale.set(scale, scale * 0.25, 1);
    parent.add(sprite);
    return sprite;
  }

  // -- Energy flow -------------------------------------------------------------
  // Visual only: Solar PV -> MPPT/DC-DC -> DC bus -> {battery, wireless, USB, LED}.
  // Wireless and USB cables run through the hollow SS304 rails to the four bench end modules.
  // Every path is driven by simulation state in updateState().

  createEnergyPaths() {
    const P = (x, y, z) => new THREE.Vector3(x, y, z);
    const U = (z) => this.roofUnderY(z);
    const sx = COLUMN.x + COLUMN.width / 2; // +x face of the column
    const bx = sx + 0.22; // cable corridor just outside the power box
    const cz = COLUMN.z;
    const stripEndY = U(0.98) - 0.02;

    // Bench modules ordered from the one nearest the column to the farthest one.
    const mods = [];
    [...BENCH_LAYOUT].reverse().forEach(({ x0, x1 }) => {
      mods.push(x1 - BENCH.moduleW / 2, x0 + BENCH.moduleW / 2);
    });
    const loadRoute = (padY, padZ, railZ) => {
      const pts = [P(bx, padY === USB_Y ? 1.36 : 1.3, padY === USB_Y ? 0.9 : 0.95), P(sx + 0.1, 0.65, 1.3), P(COLUMN.x - 0.4, 0.14, 1.3), P(mods[0] + 0.4, 0.15, 0.3)];
      mods.forEach((mx, i) => {
        pts.push(P(mx, padY, padZ));
        if (i < mods.length - 1) {
          const nx = mods[i + 1];
          if (i % 2 === 0) pts.push(P(mx - 0.3, RAIL_Y, railZ), P(nx + 0.3, RAIL_Y, railZ)); // inside the bench rail
          else pts.push(P(mx - 0.2, 0.25, railZ), P(nx + 0.2, 0.25, railZ)); // hop between benches
        }
      });
      return pts;
    };

    const defs = {
      // Solar PV -> MPPT/DC-DC converter
      pv: { color: FLOW_COLORS.supply, pts: [P(1.6, U(0.1) - 0.04, 0.1), P(3.0, U(0.45) - 0.04, 0.45), P(bx + 0.02, 2.4, 0.6), P(bx + 0.03, 2.2, 0.7), P(bx, 2.12, cz)] },
      // MPPT/DC-DC -> DC bus
      converter: { color: FLOW_COLORS.supply, pts: [P(bx, 1.78, cz), P(bx + 0.07, 1.58, cz), P(bx, 1.4, cz)] },
      // DC bus <-> battery + BMS (direction follows charge / discharge)
      battery: { color: FLOW_COLORS.charge, pts: [P(bx, 1.3, cz), P(bx + 0.07, 1.05, cz), P(bx + 0.04, 0.82, cz), P(sx - 0.1, 0.78, cz)] },
      // DC bus -> wireless pads on all four end modules (rear hollow rails)
      wireless: { color: FLOW_COLORS.load, pts: loadRoute(SEAT_TOP + 0.02, PAD_Z, BENCH.z - 0.2) },
      // DC bus -> USB ports on all four end modules (front hollow rails)
      usb: { color: FLOW_COLORS.load, pts: loadRoute(USB_Y, USB_FACE_Z, BENCH.z + 0.2) },
      // DC bus -> LED strips under the canopy
      // DC bus -> DC/DC regulator -> e-paper controller -> panel (rear glass). Follows the display state only.
      display: { color: FLOW_COLORS.display, pts: [P(bx, 1.45, cz - 0.12), P(bx + 0.1, 2.2, 0.3), P(bx - 0.05, U(-0.6) - 0.08, -0.6), P(1.6, U(-0.85) - 0.08, -0.85), P(0.45, 2.38, -0.9)] },
      // DC bus -> controller / BMS monitoring / ambient light + PIR sensors on the front roof edge
      controller: { color: FLOW_COLORS.controller, pts: [P(bx, 1.4, cz + 0.15), P(bx + 0.12, 2.05, cz + 0.25), P(bx - 0.05, 2.45, 1.15), P(2.6, U(1.4) + 0.02, 1.4), P(1.9, U(1.4) + 0.02, 1.4), P(0.6, U(1.4) + 0.02, 1.4), P(-0.6, U(1.4) + 0.02, 1.4)] },
      // DC bus -> cooling fan on the battery cabinet
      fan: { color: FLOW_COLORS.fan, pts: [P(bx, 1.3, cz + 0.12), P(bx + 0.08, 0.95, cz + 0.12), P(bx + 0.1, 0.55, cz + 0.05), P(3.45, 0.38, cz)] },
      led: { color: FLOW_COLORS.led, pts: [P(bx, 1.4, 1.0), P(bx + 0.1, 2.0, 1.03), P(bx - 0.08, 2.42, 1.05), P(2.9, stripEndY, 0.98), P(1.0, stripEndY, 0.98), P(-1.2, stripEndY, 0.98), P(-2.6, stripEndY, 0.98)] },
    };

    const sphere = new THREE.SphereGeometry(0.03, 12, 12);
    this.dynamic.energyPaths = {};
    this.dynamic.energyParticles = [];
    Object.entries(defs).forEach(([key, def]) => {
      const curve = new THREE.CatmullRomCurve3(def.pts, false, 'centripetal');
      const length = curve.getLength();
      const lineMat = new THREE.LineDashedMaterial({ color: def.color, dashSize: 0.1, gapSize: 0.07, transparent: true, opacity: 0.14, depthTest: false });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(48, Math.round(length * 24)))), lineMat);
      line.name = `energy-path-${key}`;
      line.computeLineDistances();
      line.renderOrder = 10;
      this.benchGroup.add(line);

      const particleMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.95, depthTest: false });
      const count = Math.max(3, Math.round(length * 2.6));
      const particles = [];
      for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(sphere, particleMat);
        p.renderOrder = 11;
        p.visible = false;
        this.benchGroup.add(p);
        particles.push(p);
        this.dynamic.energyParticles.push(p);
      }
      this.dynamic.energyPaths[key] = { key, curve, length, line, lineMat, particleMat, particles, phase: 0, active: false, dir: 1, speed: 0, color: def.color };
    });
    this.dynamic.energyLine = this.dynamic.energyPaths.pv.line;
    this._tmpVec = new THREE.Vector3();
  }

  setFlow(path, active, dir = 1, speed = 0, color = path.color) {
    path.active = active;
    path.dir = dir;
    path.speed = speed;
    if (color !== path.color) {
      path.color = color;
      path.lineMat.color.set(color);
      path.particleMat.color.set(color);
    }
    path.lineMat.opacity = active ? 0.7 : 0.14;
    path.particles.forEach((p) => { p.visible = active; });
    if (active) this.placeParticles(path);
  }

  placeParticles(path) {
    const n = path.particles.length;
    for (let i = 0; i < n; i++) {
      const t = (((path.phase + i / n) % 1) + 1) % 1;
      const p = path.particles[i];
      path.curve.getPointAt(t, this._tmpVec);
      p.position.copy(this._tmpVec);
      p.scale.setScalar(0.4 + 0.6 * Math.sin(Math.PI * t)); // fade in/out at the ends
    }
  }

  advanceFlow(dt) {
    Object.values(this.dynamic.energyPaths).forEach((path) => {
      if (!path.active) return;
      path.phase = (path.phase + (path.dir * path.speed * dt) / path.length) % 1;
      this.placeParticles(path);
    });
  }

  // -- State -> visuals ----------------------------------------------------------
  // Reads (all optional except the first group, as before):
  //   pvPowerW, socPct, fanSpeed, chargeCurrentA, dischargeCurrentA, effectiveLoads.{led,wireless,usb}
  //   ledLevel | ledMode   -> LED brightness (0 / 0.25 / 1); effectiveLoads.led = false forces OFF
  //   motionDetected       -> PIR status LED; motionActive (hold-latched) -> passenger figure
  //   effectiveLoads.{display,fan}, displayRefreshActive, loadBreakdown.controllerW -> e-paper / fan / controller flows
  // The scene performs no physics, PID, EMS or lighting logic: it only displays the final simulation state.

  updateState(state) {
    const d = this.dynamic;
    this._lastStateAt = performance.now();

    const loads = state.effectiveLoads ?? {};
    const wirelessActive = Boolean(loads.wireless);
    const usbActive = Boolean(loads.usb);
    const ledLevel = loads.led ? resolveLedLevel(state) : 0; // EMS / user switch has priority
    const ledOn = ledLevel > 0;
    const pvPowerW = state.pvPowerW ?? 0;
    const chargeA = state.chargeCurrentA ?? 0;
    const dischargeA = state.dischargeCurrentA ?? 0;

    // LED lighting: OFF / DIM 25% / FULL 100%
    d.ledMat.emissiveIntensity = ledOn ? 2.0 * ledLevel : 0.02;
    d.ledMat.color.copy(ledOn ? INDICATOR_COLORS.led.on : INDICATOR_COLORS.led.off);
    d.ledLight.intensity = 3.4 * ledLevel;
    d.ledExtraLights.forEach((light) => { light.intensity = 1.7 * ledLevel; });

    // Wireless + USB (shared materials -> all four end modules)
    d.wirelessMat.emissiveIntensity = wirelessActive ? 1.8 : 0.12;
    d.wirelessMat.color.copy(wirelessActive ? INDICATOR_COLORS.wireless.on : INDICATOR_COLORS.wireless.off);
    d.usbLedMat.emissiveIntensity = usbActive ? 1.3 : 0.05;
    d.usbLedMat.color.copy(usbActive ? INDICATOR_COLORS.usb.on : INDICATOR_COLORS.usb.off);

    // PIR sensor: status LED and a seated passenger while motion is reported by the simulation.
    const motionRaw = Boolean(state.motionDetected);
    const motionShown = Boolean(state.motionActive ?? state.motionDetected);
    d.pirLedMat.emissiveIntensity = motionRaw ? 2.6 : 0.08;
    d.passenger.visible = SHOW_PASSENGER_ON_MOTION && motionShown;

    // Battery SOC indicator (SOC itself comes from the simulation).
    const soc = Number.isFinite(state.socPct) ? state.socPct : 0;
    const segmentCount = Math.round(soc / 10);
    const level = soc < 20 ? 'low' : soc < 45 ? 'mid' : 'ok';
    const socKey = `${segmentCount}:${level}`;
    if (socKey !== this._socKey) {
      this._socKey = socKey;
      d.socSegments.forEach((segment, index) => {
        const style = index < segmentCount ? SOC_STYLE[level] : SOC_STYLE.off;
        segment.material.color.copy(style.color);
        segment.material.emissive.copy(style.emissive);
        segment.material.emissiveIntensity = style.intensity;
      });
    }

    // Cooling fan (rotation advances in animate() at a rate set by the PID output).
    this._fanSpeed = clamp01(state.fanSpeed ?? 0);

    // PV array sheen follows available PV power.
    d.pvMat.emissiveIntensity = 0.03 + 0.25 * clamp01(pvPowerW / PV_VISUAL_FULL_W);
    d.pvSurface.rotation.z = 0;

    // Energy flow
    const paths = d.energyPaths;
    const pvOn = pvPowerW > 1;
    const pvSpeed = 0.35 + 0.65 * clamp01(pvPowerW / PV_VISUAL_FULL_W);
    this.setFlow(paths.pv, pvOn, 1, pvSpeed);
    this.setFlow(paths.converter, pvOn, 1, pvSpeed);

    if (chargeA > 0.01 && chargeA >= dischargeA) {
      this.setFlow(paths.battery, true, 1, 0.35 + 0.65 * clamp01(chargeA / 4), FLOW_COLORS.charge);
    } else if (dischargeA > 0.01) {
      this.setFlow(paths.battery, true, -1, 0.35 + 0.65 * clamp01(dischargeA / 20), FLOW_COLORS.discharge);
    } else {
      this.setFlow(paths.battery, false, 1, 0);
    }

    this.setFlow(paths.wireless, wirelessActive, 1, 0.6);
    this.setFlow(paths.usb, usbActive, 1, 0.6);
    this.setFlow(paths.led, ledOn, 1, 0.25 + 0.35 * ledLevel); // dim LED -> slower, calmer flow

    // E-paper: the route image is a static texture and stays visible in every state. Refresh = short particle
    // pulse; standby = faint dashed line only (no continuous stream); suspended = path dark.
    const displayEnabled = Boolean(loads.display);
    if (displayEnabled && state.displayRefreshActive) {
      this.setFlow(paths.display, true, 1, 0.5);
    } else {
      this.setFlow(paths.display, false, 1, 0);
      if (displayEnabled) paths.display.lineMat.opacity = 0.32;
    }
    // Controller + sensors are always powered (slow, calm flow); fan follows the fan operating state.
    this.setFlow(paths.controller, (state.loadBreakdown?.controllerW ?? 0) > 0, 1, 0.3);
    this.setFlow(paths.fan, Boolean(loads.fan), 1, 0.3 + 0.7 * clamp01(state.fanSpeed ?? 0));
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  resetCamera() {
    this.camera.position.set(...DEFAULT_CAMERA.position);
    this.controls.target.set(...DEFAULT_CAMERA.target);
    this.controls.update();
  }

  animate() {
    const now = performance.now();
    const dt = Math.min((now - this._lastFrameAt) / 1000, 0.1);
    this._lastFrameAt = now;
    // Only animate while the simulation keeps feeding updateState (frozen when paused).
    if (now - this._lastStateAt < LIVE_WINDOW_MS) {
      this.dynamic.fan.rotation.x += this._fanSpeed * FAN_MAX_RAD_PER_S * dt;
      this.advanceFlow(dt);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      mats.forEach((mat) => mat.dispose());
    });
    this._textures.forEach((t) => t.dispose());
    this._envTarget?.dispose();
    this.renderer.dispose();
  }
}