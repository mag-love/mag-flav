/* Cabeça 3D do Fern virando pra onde o mouse (ou o dedo) passa, com glitch e trocas de visual.
   Dois modos, nenhum com rosto gerado por IA:
   1. MODELO: cabeça escaneada de verdade (iPhone + Object Capture no Mac) em assets/head3d/cabeca.obj (+ .mtl e textura).
      O ajuste de pose fica em assets/head3d/pose.json { "rx":0, "ry":0, "rz":0, "y":0, "scale":1 } (graus).
   2. RELEVO (enquanto o modelo não existe): foto real recortada + mapa de profundidade (Depth Anything V2 rodado no Mac). */
import * as THREE from './vendor/three.module.min.js';

const box = document.getElementById('head3d');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// visual compartilhado pelos dois modos: 0 foto · 1 portátil verde em pixel · 2 TV de tubo · 3 duotone MAG · 4 xerox de fanzine
const SKIN_GLSL = `
  uniform sampler2D photo; uniform float glitch, time, skin, px;
  float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
  vec2 skinUv(vec2 uv){
    if (skin > .5 && skin < 1.5) uv = (floor(uv * px) + .5) / px;
    float band = step(.92, fract(sin(floor(gl_FragCoord.y / 9. + time * 9.) * 91.7) * 43758.5)) * glitch;
    return uv + vec2(band * .03, 0.);
  }
  vec3 skinColor(vec4 c, vec2 uv, float light){
    if (glitch > 0.) { c.r = texture2D(photo, uv + vec2(.006 * glitch, 0.)).r; c.b = texture2D(photo, uv - vec2(.006 * glitch, 0.)).b; }
    float l = lum(c.rgb) * light;
    if (skin > .5 && skin < 1.5) {
      float q = floor(clamp(l * 1.15, 0., .999) * 4.);
      return q < 1. ? vec3(.06,.22,.06) : q < 2. ? vec3(.19,.38,.19) : q < 3. ? vec3(.55,.67,.06) : vec3(.61,.74,.06);
    }
    if (skin > 1.5 && skin < 2.5) {
      float s = .72 + .28 * sin(gl_FragCoord.y * 1.6 + time * 4.);
      vec3 k = vec3(texture2D(photo, uv + vec2(.004, 0.)).r, c.g, texture2D(photo, uv - vec2(.004, 0.)).b);
      return k * light * s * 1.18 * (.92 + .08 * sin(time * 50.));
    }
    if (skin > 2.5 && skin < 3.5) return mix(vec3(.17,.23,.56), vec3(1.,.55,.72), smoothstep(.18, .78, l));
    if (skin > 3.5) {
      vec2 g = fract(gl_FragCoord.xy / 5.) - .5;
      return mix(vec3(.96,.94,.88), vec3(.08), step(length(g), (1. - l) * .62));
    }
    return c.rgb * light;
  }`;

function uniforms(photo, extra = {}) {
  return { photo: { value: photo }, glitch: { value: 0 }, time: { value: 0 }, skin: { value: 0 }, px: { value: new THREE.Vector2(70, 97) }, ...extra };
}

const load = src => new Promise((ok, no) => new THREE.TextureLoader().load(src, ok, undefined, no));

// modo 1: cabeça escaneada
async function buildModel() {
  const base = 'assets/head3d/';
  const ok = await fetch(base + 'cabeca.obj', { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  if (!ok) return null;
  const [{ OBJLoader }, { MTLLoader }] = await Promise.all([import('./vendor/OBJLoader.js'), import('./vendor/MTLLoader.js')]);
  const pose = await fetch(base + 'pose.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const mtl = await new MTLLoader().setPath(base).loadAsync('cabeca.mtl').catch(() => null);
  const obj = new OBJLoader();
  if (mtl) { mtl.preload(); obj.setMaterials(mtl); }
  const root = await obj.setPath(base).loadAsync('cabeca.obj');

  let photo = null;
  root.traverse(o => { if (o.isMesh && !photo) photo = o.material.map || null; });
  if (!photo) photo = await load(base + 'textura.png').catch(() => null);
  if (!photo) return null;
  photo.colorSpace = THREE.NoColorSpace; // o shader devolve os pixels como estão
  photo.anisotropy = 4;

  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms(photo, { px: { value: new THREE.Vector2(180, 180) } }),
    vertexShader: `
      varying vec2 vUv; varying vec3 vN;
      void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: SKIN_GLSL + `
      varying vec2 vUv; varying vec3 vN;
      void main(){
        vec2 uv = skinUv(vUv);
        vec4 c = texture2D(photo, uv);
        float light = .78 + .3 * max(dot(normalize(vN), normalize(vec3(-.35, .4, 1.))), 0.);
        gl_FragColor = vec4(skinColor(c, uv, light), 1.);
      }`
  });
  root.traverse(o => { if (o.isMesh) { o.geometry.computeVertexNormals(); o.material = mat; } });

  // centraliza e ajusta o tamanho ao mesmo quadro do relevo
  const d = Math.PI / 180;
  root.rotation.set((pose.rx || 0) * d, (pose.ry || 0) * d, (pose.rz || 0) * d);
  const holder = new THREE.Group(); holder.add(root);
  const bb = new THREE.Box3().setFromObject(holder), sz = bb.getSize(new THREE.Vector3()), ct = bb.getCenter(new THREE.Vector3());
  root.position.sub(ct);
  holder.scale.setScalar(1.75 / sz.y * (pose.scale || 1));
  holder.position.y = pose.y || 0;
  return { mesh: holder, mat };
}

// modo 2: relevo da foto
async function buildRelief() {
  const [photo, depth] = await Promise.all([load('assets/head.png'), load('assets/head_depth.png')]);
  photo.anisotropy = 4;
  const W = 1.45, H = W * 580 / 420;
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: uniforms(photo, { depth: { value: depth }, amp: { value: .62 } }),
    vertexShader: `
      uniform sampler2D depth; uniform float amp;
      varying vec2 vUv; varying float vD;
      void main(){
        vUv = uv;
        float d = texture2D(depth, uv).r;
        vD = d;
        vec3 p = position;
        p.z += (d - .35) * amp;
        p.z -= pow(abs(uv.x - .5) * 2., 2.4) * .18; // arredonda as laterais
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      }`,
    fragmentShader: SKIN_GLSL + `
      varying vec2 vUv; varying float vD;
      void main(){
        vec2 uv = skinUv(vUv);
        vec4 c = texture2D(photo, uv);
        if (c.a < .45) discard;
        if (vUv.y < .115 + pow(abs(vUv.x - .5) * 2., 2.) * .06) discard; // corte no pescoço
        gl_FragColor = vec4(skinColor(c, uv, .9 + vD * .16), 1.);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H, 210, 290), mat);
  mesh.position.y = -.05;
  return { mesh, mat };
}

try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 100);
  camera.position.set(0, 0, 4.6);

  let head = null;
  try { head = await buildModel(); } catch (e) { console.warn('head3d modelo:', e); }
  const full = !!head;           // modelo completo pode girar mais (tem nuca)
  if (!head) head = await buildRelief();
  const { mat } = head;
  const pivot = new THREE.Group();
  pivot.add(head.mesh);
  scene.add(pivot);
  box.dataset.mode = full ? 'model' : 'relief';

  function size() {
    const r = box.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(box);
  size();

  const YAW = full ? 1.0 : .5, PITCH = full ? .45 : .36;
  let tx = 0, ty = 0, rx = 0, ry = 0, idle = 0, t0 = performance.now(), glitchT = 0;
  function aim(cx, cy) {
    const r = box.getBoundingClientRect();
    const dx = (cx - (r.left + r.width / 2)) / innerWidth, dy = (cy - (r.top + r.height * .45)) / innerHeight;
    ty = Math.max(-1, Math.min(1, dx * 2.2)) * YAW;
    tx = Math.max(-1, Math.min(1, dy * 2.2)) * PITCH;
    idle = 0;
  }
  addEventListener('pointermove', e => aim(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });

  // clique = glitch e troca de visual; sozinho, troca a cada ~7 s (sempre passando pelo glitch)
  const SKINS = 5;
  let skin = 0, nextSwap = 7, swapAt = -1;
  function swap() { glitchT = 1; swapAt = .35; }
  box.addEventListener('click', swap);

  function frame(now) {
    requestAnimationFrame(frame);
    if (location.hash && location.hash !== '#poke') return; // home coberta: não gasta GPU
    const t = (now - t0) / 1000;
    idle += 1 / 60;
    let gx = tx, gy = ty;
    if (idle > 4) { gy = Math.sin(t * .5) * YAW * .7; gx = Math.sin(t * .37) * .08; } // sem mouse: olha em volta sozinho
    const k = still ? 1 : .08;
    rx += (gx - rx) * k; ry += (gy - ry) * k;
    pivot.rotation.set(rx, ry, 0);
    pivot.position.y = still ? 0 : Math.sin(t * 1.3) * .015;
    if (!still && t > nextSwap) { nextSwap = t + 7; swap(); }
    if (swapAt >= 0 && glitchT < swapAt) { skin = (skin + 1) % SKINS; mat.uniforms.skin.value = skin; swapAt = -1; nextSwap = t + 7; }
    glitchT = Math.max(0, glitchT - .04);
    mat.uniforms.glitch.value = glitchT;
    mat.uniforms.time.value = t;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  box.classList.add('ready');
} catch (e) {
  console.warn('head3d:', e);
  box.classList.add('flat');
}
