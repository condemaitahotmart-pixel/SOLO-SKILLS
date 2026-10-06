// Escena 3D en tiempo real (three.js):
// 1) Fondo "aurora": seda de luz ciruela, petróleo, rosa y dorado que fluye y reacciona al puntero.
// 2) Flor de loto que se abre al entrar, con pétalos iridiscentes que respiran, centro dorado que brilla
//    y polen luminoso flotando. La flor cambia de lugar según la sección (BLOOM_SPOTS en main.js).
// Si no hay WebGL, queda el orbe en CSS. Con "reducir movimiento" se dibuja una sola imagen quieta.
import * as THREE from "three";

const canvas = document.querySelector(".js-bloom");
const sceneEl = document.querySelector(".scene");
const halo = document.querySelector(".scene__halo");
const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 767px)").matches;

// ---------- Shaders ----------
const noiseGLSL = /* glsl */ `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = r * p * 2.02 + 3.1; a *= 0.5; }
  return v;
}`;

const auroraFrag = /* glsl */ `
uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse;
${noiseGLSL}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime;
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t * 0.035)), fbm(p * 1.3 + vec2(5.2, 1.3) - t * 0.03));
  vec2 m = uMouse * 0.12;
  float r = fbm(p * 1.7 + 2.2 * q + vec2(1.7, 9.2) + t * 0.045 + m);

  vec3 night  = vec3(0.10, 0.05, 0.08);
  vec3 plum   = vec3(0.33, 0.11, 0.22);
  vec3 petrol = vec3(0.09, 0.27, 0.31);
  vec3 rose   = vec3(0.86, 0.48, 0.60);
  vec3 gold   = vec3(0.92, 0.76, 0.48);

  vec3 col = mix(night, plum, smoothstep(0.25, 0.85, r));
  col = mix(col, petrol, smoothstep(0.45, 0.95, q.x) * 0.7);
  col += rose * pow(smoothstep(0.5, 1.0, r), 2.0) * 0.7;
  // hebras de seda que cruzan la luz
  float silk = 0.5 + 0.5 * sin((p.x * 1.6 + p.y * 0.9 + r * 3.2 - t * 0.08) * 6.2831);
  col += mix(rose, gold, q.y) * pow(silk, 14.0) * 0.12 * smoothstep(0.3, 0.9, r);
  col += gold * pow(smoothstep(0.7, 1.0, r * (0.6 + q.y)), 3.0) * 0.22;
  // viñeta suave para que el texto respire
  col *= 1.0 - 0.55 * smoothstep(0.2, 1.1, length(p * vec2(0.85, 1.0)));
  gl_FragColor = vec4(col, 1.0);
}`;

const quadVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const quadFrag = /* glsl */ `uniform sampler2D tMap; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tMap, vUv); }`;

const petalVert = /* glsl */ `
uniform float uTime; uniform float uSeed;
varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorld;
void main(){
  vUv = uv;
  vec3 p = position;
  // ondulación viva en el borde del pétalo
  p.z += sin(uTime * 1.4 + uv.y * 3.5 + uSeed) * 0.035 * uv.y;
  p.x += sin(uTime * 0.9 + uv.y * 2.0 + uSeed * 2.0) * 0.015 * uv.y;
  vNormal = normalize(normalMatrix * normal);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const petalFrag = /* glsl */ `
uniform float uTime; uniform float uLayer;
varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorld;
void main(){
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(vec3(-0.4, 0.9, 0.7));
  float v = vUv.y;               // 0 base, 1 punta
  float u = vUv.x * 2.0 - 1.0;   // -1 a 1 a lo ancho

  vec3 deep  = vec3(0.30, 0.09, 0.19);
  vec3 plum  = vec3(0.56, 0.20, 0.36);
  vec3 rose  = vec3(0.95, 0.62, 0.72);
  vec3 cream = vec3(1.00, 0.92, 0.88);
  vec3 gold  = vec3(0.95, 0.80, 0.52);

  float inner = uLayer;          // 0 capa exterior, 1 capa interior (más clara)
  vec3 col = mix(deep, plum, smoothstep(0.0, 0.3, v));
  col = mix(col, rose, smoothstep(0.2, 0.75, v + inner * 0.25));
  col = mix(col, cream, smoothstep(0.7, 1.05, v + inner * 0.2) * 0.75);
  // nervaduras finas
  float vein = pow(abs(sin(u * 3.14159 * 4.0)), 40.0) * (1.0 - v) * 0.12;
  col -= vein;

  float diff = 0.55 + 0.45 * max(dot(N, L), 0.0);
  col *= diff;
  float back = pow(max(dot(-N, L), 0.0), 2.0);     // luz que atraviesa el pétalo
  col += rose * back * 0.28;
  float rim = pow(1.0 - abs(dot(N, V)), 2.4);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.2, 0.42) + rim * 0.8 + v * 0.6 + uTime * 0.03));
  col += mix(rose, gold, v) * rim * 0.55 + irid * rim * 0.12;
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 24.0);
  col += vec3(1.0, 0.95, 0.9) * spec * 0.25;
  gl_FragColor = vec4(col, 1.0);
}`;

const coreFrag = /* glsl */ `
uniform float uTime;
varying vec3 vNormal; varying vec3 vWorld;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 1.5);
  vec3 gold = vec3(0.98, 0.80, 0.45);
  vec3 hot = vec3(1.0, 0.95, 0.80);
  float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
  gl_FragColor = vec4(mix(gold, hot, rim) * pulse * 1.1, 1.0);
}`;
const coreVert = /* glsl */ `varying vec3 vNormal; varying vec3 vWorld;
void main(){ vNormal = normalize(normalMatrix * normal); vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const pollenVert = /* glsl */ `
uniform float uTime; uniform float uPR;
attribute float aSeed; attribute float aSize;
varying float vSeed; varying float vAlpha;
void main(){
  vSeed = aSeed;
  vec3 p = position;
  p.y = mod(p.y + uTime * (0.08 + aSeed * 0.12) + 3.0, 6.0) - 3.0;
  p.x += sin(uTime * 0.4 + aSeed * 12.0) * 0.25;
  p.z += cos(uTime * 0.3 + aSeed * 9.0) * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPR * (11.0 / -mv.z);
  vAlpha = (0.45 + 0.55 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 30.0)) * smoothstep(3.0, 1.8, abs(p.y));
  gl_Position = projectionMatrix * mv;
}`;
const pollenFrag = /* glsl */ `
varying float vSeed; varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.6);
  vec3 col = mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.7, 0.8), step(0.6, vSeed));
  gl_FragColor = vec4(col, a * vAlpha);
}`;

// ---------- Geometría de pétalo ----------
function petalGeometry(len, wid, cup, bend, segU = 12, segV = 26) {
  const pos = [], uvs = [], idx = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    // pétalo ancho y redondeado, con punta suave
    const w = wid * (Math.pow(Math.sin(Math.PI * Math.pow(v, 0.62)), 0.55) * 0.9 + 0.1 * (1 - v));
    for (let i = 0; i <= segU; i++) {
      const u = (i / segU) * 2 - 1;
      const x = u * w;
      const y = v * len;
      const z = -cup * u * u * w + bend * v * v;
      pos.push(x, y, z);
      uvs.push(i / segU, v);
    }
  }
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    return; // sin WebGL: se queda el orbe CSS
  }
  const PR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(PR);
  renderer.autoClear = false;

  // --- Fondo aurora (se dibuja a baja resolución y se escala: es suave por naturaleza) ---
  const bgScene = new THREE.Scene();
  const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const aurora = new THREE.ShaderMaterial({
    vertexShader: quadVert, fragmentShader: auroraFrag, depthTest: false, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2() } },
  });
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), aurora));
  const rt = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const blitScene = new THREE.Scene();
  blitScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: quadVert, fragmentShader: quadFrag, depthTest: false, depthWrite: false, uniforms: { tMap: { value: rt.texture } },
  })));

  // --- Flor ---
  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const flower = new THREE.Group();     // posición y escala por sección
  const tilt = new THREE.Group();       // inclinación para ver el interior
  const spin = new THREE.Group();       // giro lento
  flower.add(tilt); tilt.add(spin); world.add(flower);
  tilt.rotation.x = 0.62;

  const LAYERS = [
    { n: 8, len: 1.6, wid: 0.72, cup: 0.75, bend: 0.28, open: 1.28, closed: 0.18, off: 0, inner: 0.0 },
    { n: 8, len: 1.42, wid: 0.66, cup: 0.8, bend: 0.18, open: 0.95, closed: 0.12, off: 0.5, inner: 0.3 },
    { n: 7, len: 1.2, wid: 0.58, cup: 0.85, bend: 0.08, open: 0.6, closed: 0.08, off: 0.25, inner: 0.6 },
    { n: 5, len: 0.92, wid: 0.48, cup: 0.9, bend: 0.0, open: 0.28, closed: 0.04, off: 0.75, inner: 0.9 },
  ];
  const petals = [];
  const petalMats = [];
  LAYERS.forEach((L, li) => {
    const geo = petalGeometry(L.len, L.wid, L.cup, L.bend);
    for (let k = 0; k < L.n; k++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: petalVert, fragmentShader: petalFrag, side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uSeed: { value: Math.random() * 10 }, uLayer: { value: L.inner } },
      });
      petalMats.push(mat);
      const pivot = new THREE.Group();
      pivot.rotation.y = ((k + L.off) / L.n) * Math.PI * 2;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = 0.06 + li * 0.01;
      pivot.add(mesh);
      spin.add(pivot);
      petals.push({ mesh, L, li, seed: Math.random() * 6.28 });
    }
  });

  // Centro dorado + estambres
  const coreMat = new THREE.ShaderMaterial({ vertexShader: coreVert, fragmentShader: coreFrag, uniforms: { uTime: { value: 0 } } });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), coreMat);
  core.scale.y = 0.7;
  core.position.y = 0.12;
  spin.add(core);
  const stamenGeo = new THREE.SphereGeometry(0.035, 10, 8);
  const stamens = new THREE.InstancedMesh(stamenGeo, coreMat, 34);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 34; i++) {
    const a = i * 2.39996, r = 0.18 + (i % 3) * 0.06;
    m4.makeTranslation(Math.cos(a) * r, 0.2 + (i % 4) * 0.035, Math.sin(a) * r);
    stamens.setMatrixAt(i, m4);
  }
  spin.add(stamens);

  // Resplandor
  const glowTex = glowTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  glow.scale.set(1.1, 1.1, 1);
  glow.position.y = 0.2;
  spin.add(glow);
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xd9779a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.22 }));
  aura.scale.set(5.2, 5.2, 1);
  aura.renderOrder = -1;
  flower.add(aura);

  // Polen luminoso
  const COUNT = small ? 140 : 260;
  const pPos = new Float32Array(COUNT * 3), pSeed = new Float32Array(COUNT), pSize = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 0.8 + Math.random() * 2.6, a = Math.random() * Math.PI * 2;
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = Math.random() * 6 - 3;
    pPos[i * 3 + 2] = Math.sin(a) * r * 0.6;
    pSeed[i] = Math.random();
    pSize[i] = 3 + Math.random() * 7;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(pSeed, 1));
  pGeo.setAttribute("aSize", new THREE.BufferAttribute(pSize, 1));
  const pollenMat = new THREE.ShaderMaterial({
    vertexShader: pollenVert, fragmentShader: pollenFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: PR } },
  });
  flower.add(new THREE.Points(pGeo, pollenMat));

  // --- Tamaño ---
  let vw = 0, vh = 0;
  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    vw = vh * camera.aspect;
    const s = small ? 0.33 : 0.4;
    rt.setSize(Math.max(2, Math.round(w * s)), Math.max(2, Math.round(h * s)));
    aurora.uniforms.uRes.value.set(rt.width, rt.height);
  };
  resize();

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  const init = window.__bloom || { x: 0, y: 0, s: 1 };
  const state = { x: init.x, y: init.y, s: init.s, mx: 0, my: 0, open: reduceMotion ? 1 : 0 };
  const clock = new THREE.Clock();
  const ease = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const target = window.__bloom || { x: 0, y: 0, s: 1 };
    // Suavizado según el tiempo real (igual de fluido a 30 o a 120 fps)
    const k = 1 - Math.exp(-dt * 2.8), km = 1 - Math.exp(-dt * 3.2);
    state.x += (target.x - state.x) * k;
    state.y += (target.y - state.y) * k;
    state.s += (target.s - state.s) * k;
    state.mx += (pointer.x - state.mx) * km;
    state.my += (pointer.y - state.my) * km;
    // La flor se abre cuando termina la intro
    if (root.classList.contains("is-ready") && state.open < 1) state.open = Math.min(1, state.open + dt / 2.6);

    aurora.uniforms.uTime.value = t;
    aurora.uniforms.uMouse.value.set(state.mx, state.my);
    petalMats.forEach((m) => (m.uniforms.uTime.value = t));
    coreMat.uniforms.uTime.value = t;
    pollenMat.uniforms.uTime.value = t;

    petals.forEach(({ mesh, L, li, seed }) => {
      const p = ease(state.open * 1.25 - li * 0.08);
      const breathe = Math.sin(t * 0.9 + seed) * 0.035 * p;
      mesh.rotation.x = L.closed + (L.open - L.closed) * p + breathe;
    });
    const bloomScale = 0.55 + 0.45 * ease(state.open);
    spin.rotation.y = t * 0.12 + state.mx * 0.4;
    tilt.rotation.x = 0.62 - state.my * 0.25 + Math.sin(t * 0.35) * 0.05;
    tilt.rotation.z = Math.sin(t * 0.27) * 0.06;

    const fit = Math.min(1, Math.max(vw, vh * 0.8) / 6.2);
    flower.position.set((state.x * vw) / 2 + state.mx * 0.15, (state.y * vh) / 2 + state.my * 0.1 - 0.35, 0);
    flower.scale.setScalar(state.s * fit * bloomScale);

    halo.style.left = 50 + state.x * 50 + "%";
    halo.style.top = 50 - state.y * 50 + "%";

    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(bgScene, orthoCam);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(blitScene, orthoCam);
    renderer.render(world, camera);
  };

  let running = true;
  const loop = () => {
    if (!running) return;
    // En secciones de "día" la escena está oculta: no dibujamos para ahorrar batería
    if (document.body.dataset.theme !== "day") frame();
    requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !reduceMotion) { clock.getDelta(); loop(); } });
  window.addEventListener("resize", () => { resize(); if (reduceMotion) frame(); });

  frame();
  sceneEl.classList.add("is-live");
  if (!reduceMotion) loop();
}

if (canvas) start();
