// Flor 3D en tiempo real (three.js): una forma orgánica que respira, con núcleo ciruela,
// borde rosado y destellos dorados. Sigue al puntero y cambia de lugar según la sección
// (las posiciones se definen en main.js, en BLOOM_SPOTS). Si no hay WebGL, queda el orbe CSS.
import * as THREE from "three";

const canvas = document.querySelector(".js-bloom");
const scene = document.querySelector(".scene");
const halo = document.querySelector(".scene__halo");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 767px)").matches;

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertex = /* glsl */ `
uniform float uTime; uniform vec2 uMouse;
varying vec3 vNormal; varying vec3 vWorld; varying float vDisp;
${noise}
float field(vec3 p){
  float t = uTime;
  // ondas lentas (respiración) + detalle fino + pétalos suaves alrededor del eje
  float n = snoise(p * 0.85 + vec3(t * 0.16, t * 0.11, uMouse.x * 0.4)) * 0.34;
  n += snoise(p * 2.1 - vec3(t * 0.22)) * 0.07;
  float ang = atan(p.y, p.x);
  n += 0.07 * sin(5.0 * ang + t * 0.35) * smoothstep(0.2, 1.0, 1.0 - abs(normalize(p).z));
  return n;
}
vec3 displace(vec3 p){ return p + normalize(p) * field(p); }
void main(){
  vec3 p = position;
  vec3 n = normalize(p);
  vec3 tangent = normalize(cross(n, abs(n.y) > 0.9 ? vec3(1.0,0.0,0.0) : vec3(0.0,1.0,0.0)));
  vec3 bitangent = normalize(cross(n, tangent));
  float e = 0.01;
  vec3 d0 = displace(p);
  vec3 d1 = displace(p + tangent * e);
  vec3 d2 = displace(p + bitangent * e);
  vec3 nn = normalize(cross(d1 - d0, d2 - d0));
  if (dot(nn, n) < 0.0) nn = -nn;
  vDisp = field(p);
  vNormal = normalize(normalMatrix * nn);
  vec4 world = modelMatrix * vec4(d0, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const fragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal; varying vec3 vWorld; varying float vDisp;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(vec3(-0.55, 0.75, 0.6));
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
  float diff = max(dot(N, L), 0.0);

  vec3 plumDeep = vec3(0.17, 0.06, 0.12);
  vec3 plum     = vec3(0.48, 0.18, 0.31);
  vec3 rose     = vec3(0.95, 0.66, 0.74);
  vec3 gold     = vec3(0.93, 0.80, 0.56);
  vec3 petrol   = vec3(0.16, 0.42, 0.47);

  vec3 col = mix(plumDeep, plum, smoothstep(0.0, 1.0, diff * 0.9 + vDisp * 0.8));
  col = mix(col, petrol, smoothstep(0.55, 1.0, 1.0 - N.y) * 0.25);
  // iridiscencia suave en el borde
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.18, 0.36) + fres * 0.9 + vDisp * 1.2 + uTime * 0.02));
  col += rose * fres * 0.95;
  col += gold * pow(fres, 3.5) * 0.9;
  col = mix(col, col + irid * 0.25, fres);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 28.0);
  col += vec3(1.0, 0.94, 0.88) * spec * 0.35;
  gl_FragColor = vec4(col, 1.0);
}`;

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return; // sin WebGL: se queda el orbe CSS
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const geometry = new THREE.IcosahedronGeometry(1.25, small ? 40 : 72);
  const uniforms = { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } };
  const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
  const mesh = new THREE.Mesh(geometry, material);
  world.add(mesh);

  let vw = 0, vh = 0;
  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    vw = vh * camera.aspect;
  };
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  const init = window.__bloom || { x: 0, y: 0, s: 1 };
  const state = { x: init.x, y: init.y, s: init.s, mx: 0, my: 0 };
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });

  const frame = () => {
    const t = clock.getElapsedTime();
    const target = window.__bloom || { x: 0, y: 0, s: 1 };
    const k = 0.045;
    state.x += (target.x - state.x) * k;
    state.y += (target.y - state.y) * k;
    state.s += (target.s - state.s) * k;
    state.mx += (pointer.x - state.mx) * 0.05;
    state.my += (pointer.y - state.my) * 0.05;

    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(state.mx, state.my);
    mesh.position.set((state.x * vw) / 2 + state.mx * 0.15, (state.y * vh) / 2 + state.my * 0.1, 0);
    const fit = Math.min(1, Math.max(vw, vh * 0.8) / 6.2);
    mesh.scale.setScalar(state.s * fit);
    mesh.rotation.y = t * 0.12 + state.mx * 0.35;
    mesh.rotation.x = Math.sin(t * 0.2) * 0.15 - state.my * 0.25;

    // El halo sigue a la flor
    const px = 50 + state.x * 50, py = 50 - state.y * 50;
    halo.style.left = px + "%";
    halo.style.top = py + "%";

    renderer.render(world, camera);
  };

  const loop = () => {
    if (!running) return;
    // En secciones de "día" la escena está oculta: no dibujamos para ahorrar batería
    if (document.body.dataset.theme !== "day") frame();
    requestAnimationFrame(loop);
  };

  frame();
  scene.classList.add("is-live");
  if (reduceMotion) window.addEventListener("resize", frame);
  if (!reduceMotion) loop();
}

if (canvas) start();
