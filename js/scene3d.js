/* =========================================================================
   ESCENA 3D DEL HERO — Animalitos de peluche durmiendo sobre una nube
   -------------------------------------------------------------------------
   - Solo geometrías primitivas de Three.js (sin modelos externos).
   - Materiales mate (Lambert) en la paleta de la web, sin sombras reales.
   - Respiración + flotación lenta + parallax suave con el ratón.
   - Se pausa si el hero no se ve o la pestaña está oculta.
   - Con prefers-reduced-motion se pinta un único fotograma estático.
   main.js carga este módulo de forma diferida (import dinámico).
   ========================================================================= */

import {
  WebGLRenderer, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight,
  Group, Mesh, IcosahedronGeometry, SphereGeometry, CapsuleGeometry, ConeGeometry,
  TorusGeometry, OctahedronGeometry, PlaneGeometry, MeshLambertMaterial, MeshBasicMaterial,
  CanvasTexture, Clock, MathUtils,
} from 'three';

/* ---------- Paleta (igual que css/styles.css) ---------- */
const COLORS = {
  nube: 0xffffff,
  nubeSombra: 0xeaf6f0,
  manta: 0xbfe5d4,
  tinta: 0x3a3140,
  rosa: 0xf4afbf,
  estrella: 0xfbebb5,
  osito: 0xe7bfa3, ositoClaro: 0xfdeee6,
  conejito: 0xd9cff0, conejitoClaro: 0xf7f3fd,
  zorrito: 0xf4b595, zorritoClaro: 0xfffbf6,
  ovejitaLana: 0xfffdf7, ovejitaCara: 0xfbebb5, ovejitaOreja: 0xf3de9a,
};

/* ---------- Geometrías y materiales compartidos (menos memoria) ---------- */
const GEO = {
  bola: new IcosahedronGeometry(1, 2),          // "low-poly" suave
  bolaFina: new SphereGeometry(1, 16, 12),
  ojo: new TorusGeometry(0.075, 0.017, 6, 14, Math.PI),
  oreja: new CapsuleGeometry(0.11, 0.55, 4, 10),
  cono: new ConeGeometry(0.2, 0.42, 5),
  estrella: new OctahedronGeometry(0.09, 0),
};
const matCache = new Map();
function mat(color, { basic = false, flat = true } = {}) {
  const key = `${color}-${basic}-${flat}`;
  if (!matCache.has(key)) {
    matCache.set(key, basic
      ? new MeshBasicMaterial({ color })
      : new MeshLambertMaterial({ color, flatShading: flat }));
  }
  return matCache.get(key);
}

// Atajo: crea una esfera escalada en una posición
function blob(color, [x, y, z], [sx, sy = sx, sz = sx], opts) {
  const m = new Mesh(opts?.fine ? GEO.bolaFina : GEO.bola, mat(color, opts));
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}

/* ---------- Cara dormida (ojos cerrados, mofletes, nariz) ---------- */
function sleepyFace(head, { r = 0.55, nose = COLORS.tinta } = {}) {
  const z = r * 0.92;
  [-1, 1].forEach((side) => {
    // Ojos cerrados: medio toro con la curva hacia abajo ( ‿ )
    const eye = new Mesh(GEO.ojo, mat(COLORS.tinta, { basic: true }));
    eye.position.set(side * r * 0.36, r * 0.08, z * 0.98);
    eye.rotation.z = Math.PI;
    eye.rotation.y = side * 0.35;
    head.add(eye);
    // Mofletes rosados
    const cheek = blob(COLORS.rosa, [side * r * 0.55, -r * 0.14, z * 0.8], [0.1, 0.06, 0.04], { basic: true });
    head.add(cheek);
  });
  head.add(blob(nose, [0, -r * 0.12, z * 1.12], [0.06, 0.045, 0.045], { fine: true, flat: false }));
}

/* ---------- Animalitos ---------- */
// Todos comparten estructura: cuerpo tumbado + cabeza delante apoyada.
// Devuelven { group, body, head } para animar la respiración.
function baseAnimal(bodyColor, headColor = bodyColor) {
  const group = new Group();
  const body = blob(bodyColor, [0, 0.42, -0.45], [0.72, 0.5, 0.82]);
  const head = new Group();
  head.position.set(0, 0.62, 0.2);
  head.add(blob(headColor, [0, 0, 0], [0.55, 0.5, 0.52]));
  // Patitas delanteras bajo la barbilla
  [-1, 1].forEach((s) => group.add(blob(bodyColor, [s * 0.24, 0.18, 0.52], [0.17, 0.12, 0.2])));
  group.add(body, head);
  return { group, body, head };
}

function makeOsito() {
  const a = baseAnimal(COLORS.osito);
  [-1, 1].forEach((s) => {
    a.head.add(blob(COLORS.osito, [s * 0.38, 0.4, -0.05], [0.18, 0.18, 0.1]));
    a.head.add(blob(COLORS.rosa, [s * 0.38, 0.4, 0.02], [0.09, 0.09, 0.05]));
  });
  a.head.add(blob(COLORS.ositoClaro, [0, -0.15, 0.42], [0.22, 0.15, 0.14]));
  sleepyFace(a.head);
  return a;
}

function makeConejito() {
  const a = baseAnimal(COLORS.conejito);
  // Una oreja de pie y otra caída
  const e1 = new Mesh(GEO.oreja, mat(COLORS.conejito));
  e1.position.set(-0.18, 0.66, -0.05); e1.rotation.set(-0.15, 0, 0.18);
  const e2 = new Mesh(GEO.oreja, mat(COLORS.conejito));
  e2.position.set(0.42, 0.45, -0.05); e2.rotation.set(0.2, 0, -1.15);
  a.head.add(e1, e2);
  a.head.add(blob(COLORS.conejitoClaro, [0, -0.15, 0.42], [0.18, 0.13, 0.12]));
  // Colita de algodón
  a.group.add(blob(0xffffff, [0, 0.55, -1.22], [0.18]));
  sleepyFace(a.head, { nose: COLORS.rosa });
  return a;
}

function makeZorrito() {
  const a = baseAnimal(COLORS.zorrito);
  [-1, 1].forEach((s) => {
    const ear = new Mesh(GEO.cono, mat(COLORS.zorrito));
    ear.position.set(s * 0.32, 0.47, -0.04);
    ear.rotation.z = -s * 0.35;
    a.head.add(ear);
  });
  // Mejillas y pecho blancos
  a.head.add(blob(COLORS.zorritoClaro, [0, -0.16, 0.36], [0.34, 0.2, 0.2]));
  a.group.add(blob(COLORS.zorritoClaro, [0, 0.35, 0.05], [0.36, 0.26, 0.2]));
  // Cola enroscada alrededor del cuerpo
  const tail = new Group();
  tail.add(blob(COLORS.zorrito, [0, 0, 0], [0.22, 0.2, 0.5]));
  tail.add(blob(COLORS.zorritoClaro, [0, 0, 0.45], [0.17, 0.16, 0.17]));
  tail.position.set(0.66, 0.3, -0.05);
  tail.rotation.y = -0.35;
  a.group.add(tail);
  sleepyFace(a.head);
  return a;
}

function makeOvejita() {
  const group = new Group();
  // Cuerpo de lana: varias bolitas
  const body = new Group();
  [[0, 0.45, -0.45, 0.5], [-0.38, 0.4, -0.35, 0.36], [0.38, 0.4, -0.35, 0.36], [0, 0.72, -0.5, 0.36],
    [-0.28, 0.6, -0.75, 0.34], [0.28, 0.6, -0.75, 0.34], [0, 0.4, -0.95, 0.38]]
    .forEach(([x, y, z, r]) => body.add(blob(COLORS.ovejitaLana, [x, y, z], [r])));
  const head = new Group();
  head.position.set(0, 0.6, 0.2);
  head.add(blob(COLORS.ovejitaCara, [0, 0, 0], [0.48, 0.44, 0.46]));
  // Flequillo de lana
  [-0.22, 0, 0.22].forEach((x, i) => head.add(blob(COLORS.ovejitaLana, [x, 0.36 + (i === 1 ? 0.06 : 0), 0.05], [0.18])));
  // Orejitas horizontales
  [-1, 1].forEach((s) => {
    const ear = blob(COLORS.ovejitaOreja, [s * 0.52, 0.06, -0.02], [0.2, 0.08, 0.12]);
    ear.rotation.z = s * -0.35;
    head.add(ear);
  });
  [-1, 1].forEach((s) => group.add(blob(COLORS.ovejitaCara, [s * 0.22, 0.17, 0.5], [0.13, 0.1, 0.16])));
  sleepyFace(head, { r: 0.48 });
  group.add(body, head);
  return { group, body, head };
}

/* ---------- Nube / manta mullida ---------- */
function makeCloud() {
  const cloud = new Group();
  // Base de manta menta
  cloud.add(blob(COLORS.manta, [0, -0.55, 0.1], [3.9, 0.32, 1.45]));
  // Bolas de nube
  const puffs = [
    [-3.0, -0.1, 0.1, 0.85], [-2.0, 0.05, 0.4, 1.0], [-0.9, 0.12, 0.2, 1.1], [0.3, 0.1, 0.35, 1.08],
    [1.45, 0.06, 0.2, 1.05], [2.6, -0.05, 0.25, 0.92], [3.35, -0.25, 0.0, 0.62],
    [-1.4, -0.05, -0.65, 0.95], [0.9, 0.0, -0.7, 0.98], [-2.6, -0.2, -0.5, 0.7], [2.3, -0.15, -0.55, 0.75],
  ];
  puffs.forEach(([x, y, z, r]) => cloud.add(blob(COLORS.nube, [x, y, z], [r, r * 0.62, r * 0.85])));
  // Bolas inferiores con un toque de color para dar volumen
  [[-1.8, -0.45, 0.6, 0.7], [0.0, -0.5, 0.75, 0.75], [1.9, -0.45, 0.6, 0.7]]
    .forEach(([x, y, z, r]) => cloud.add(blob(COLORS.nubeSombra, [x, y, z], [r, r * 0.45, r * 0.6])));
  return cloud;
}

/* ---------- Sombra falsa (degradado radial, sin sombras reales) ---------- */
function makeFakeShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(162,140,190,0.45)');
  g.addColorStop(1, 'rgba(162,140,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const m = new Mesh(new PlaneGeometry(9, 2.6), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = -1.45;
  return m;
}

/* =========================================================================
   API pública: initScene(container, { reducedMotion })
   Es asíncrona y cede el hilo principal entre pasos para no bloquear la página.
   ========================================================================= */
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
const FPS = 30;   // la respiración es lenta: 30 fps bastan y ahorran batería

export async function initScene(container, { reducedMotion = false } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer;
  try {
    // Con densidad de píxeles alta el antialiasing apenas se nota y cuesta mucho
    renderer = new WebGLRenderer({ antialias: dpr < 2, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    console.warn('[3D] WebGL no disponible:', err);
    return null;   // se queda la ilustración SVG
  }
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');   // decorativo: la descripción está en el <img> alternativo

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 60);
  const LOOK_AT = { x: 0, y: 0.55, z: 0 };

  // Luz suave: cielo cálido + rebote lavanda + una direccional sin sombras
  scene.add(new HemisphereLight(0xfffaf3, 0xd9cff0, 2.2));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  // Montaje
  const world = new Group();
  scene.add(world);
  const cloud = makeCloud();
  world.add(cloud, makeFakeShadow());

  const animals = [
    { a: makeOsito(), x: -2.4, z: 0.2, ry: 0.32, s: 1.08 },
    { a: makeConejito(), x: -0.8, z: 0.42, ry: 0.1, s: 1.04 },
    { a: makeZorrito(), x: 0.82, z: 0.38, ry: -0.12, s: 1.04 },
    { a: makeOvejita(), x: 2.42, z: 0.18, ry: -0.34, s: 1.1 },
  ].map(({ a, x, z, ry, s }, i) => {
    a.group.position.set(x, 0.22, z);
    a.group.rotation.y = ry;
    a.group.scale.setScalar(s);
    cloud.add(a.group);
    return { ...a, phase: i * 1.3, baseHeadY: a.head.position.y };
  });

  // Estrellitas flotantes
  const stars = [[-3.2, 2.2, -1.5], [-1.4, 2.6, -2], [1.6, 2.4, -1.6], [3.3, 1.9, -1.2], [0.1, 2.9, -2.5], [-2.6, 3.0, -2.8]]
    .map(([x, y, z], i) => {
      const st = new Mesh(GEO.estrella, mat(i % 2 ? COLORS.rosa : COLORS.estrella));
      st.position.set(x, y, z);
      st.userData.phase = i * 0.9;
      world.add(st);
      return st;
    });

  await nextTask();   // cede el hilo tras montar la escena

  /* ---------- Tamaño y encuadre ---------- */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Distancia necesaria para que quepa la nube completa (ancho ~ ±4 unidades)
    const tanHalf = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(2.7 / tanHalf, 4.2 / (tanHalf * camera.aspect));
    camera.userData.dist = dist;
    camera.updateProjectionMatrix();
    placeCamera(0, 0);
  }
  function placeCamera(px, py) {
    const d = camera.userData.dist || 12;
    camera.position.set(px * 0.9, 2.3 + py * 0.5, d);
    camera.lookAt(LOOK_AT.x, LOOK_AT.y, LOOK_AT.z);
  }

  /* ---------- Animación ---------- */
  const clock = new Clock();
  const pointer = { x: 0, y: 0, cx: 0, cy: 0 };

  function update(t) {
    // Flotación lenta de toda la nube
    cloud.position.y = Math.sin(t * 0.55) * 0.08;
    cloud.rotation.z = Math.sin(t * 0.35) * 0.012;
    // Respiración: el cuerpo se hincha un poco y la cabeza sube y baja
    animals.forEach((an) => {
      const b = Math.sin(t * 1.35 + an.phase);
      an.body.scale.y = (an.body.userData.sy ??= an.body.scale.y) * (1 + b * 0.045);
      an.body.scale.x = (an.body.userData.sx ??= an.body.scale.x) * (1 + b * 0.02);
      an.head.position.y = an.baseHeadY + b * 0.025;
      an.head.rotation.z = Math.sin(t * 0.4 + an.phase) * 0.03;
    });
    stars.forEach((st) => {
      const k = 0.75 + 0.35 * Math.sin(t * 1.6 + st.userData.phase);
      st.scale.setScalar(k);
      st.rotation.y = t * 0.4 + st.userData.phase;
    });
    // Parallax suave (interpolado)
    pointer.cx += (pointer.x - pointer.cx) * 0.04;
    pointer.cy += (pointer.y - pointer.cy) * 0.04;
    placeCamera(pointer.cx, pointer.cy);
  }

  let rafId = 0;
  let visible = true;
  let running = false;
  let ready = false;   // true tras compilar y pintar el primer fotograma

  let last = 0;
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (now - last < 1000 / FPS - 2) return;   // limita a ~30 fps
    last = now;
    update(clock.getElapsedTime());
    renderer.render(scene, camera);
  }
  function start() {
    if (running || reducedMotion || !ready) return;
    running = true;
    clock.start();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    clock.stop();
  }
  const sync = () => (visible && !document.hidden ? start() : stop());

  // Pausa si el hero sale de pantalla o la pestaña se oculta
  const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; sync(); });
  io.observe(container);
  document.addEventListener('visibilitychange', sync);

  // Parallax con ratón (solo punteros finos: en móvil no gasta batería)
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // Redimensionado
  const ro = new ResizeObserver(() => {
    resize();
    if (!running && ready) renderer.render(scene, camera);
  });
  ro.observe(container);

  // Si se pierde el contexto WebGL, volvemos a la ilustración
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    container.classList.remove('is-3d-ready');
  });

  // Primer fotograma: compila los shaders en segundo plano si el navegador lo permite
  container.appendChild(canvas);
  resize();
  update(reducedMotion ? 1.2 : 0);
  try { await renderer.compileAsync(scene, camera); } catch { /* sin soporte: compila al renderizar */ }
  await nextTask();
  renderer.render(scene, camera);
  ready = true;
  requestAnimationFrame(() => container.classList.add('is-3d-ready'));
  sync();

  return {
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      renderer.dispose();
      canvas.remove();
      container.classList.remove('is-3d-ready');
    },
  };
}
