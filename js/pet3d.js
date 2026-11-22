/* FERN.PET em 3D: um ovo de bolso vintage (plástico perolado, corrente, botões) e, na tela dele,
   o quarto do editor com o Fern vivendo a vida: deita na cama, senta no computador, pega breja na geladeira,
   descansa no pufe, recebe job na porta e come. A lógica das necessidades continua em pet.js (FernPet). */
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host = document.getElementById('pet3d');
const poke = document.getElementById('poke');

/* ---------- utilidades ---------- */
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, ...o });
function box(w, h, d, m, x, y, z, parent) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true;
  if (parent) parent.add(o);
  return o;
}
function mesh(geo, m, x, y, z, parent) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true;
  if (parent) parent.add(o);
  return o;
}
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { c, g };
  return t;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, k) => a + (b - a) * k;
function angLerp(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }

/* ícones pixelados que flutuam sobre a cabeça */
const ICONS = {
  z: ['1111.', '...1.', '..1..', '.1...', '1111.'],
  beer: ['11111..', '1.1.111', '1...1.1', '1...1.1', '1...111', '11111..'],
  heart: ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'],
  job: ['..111..', '..1.1..', '1111111', '1.....1', '1..1..1', '1111111'],
  work: ['1111111', '1.....1', '1.111.1', '1.....1', '1111111', '..111..']
};
const ICON_COLOR = { z: '#9fd3ff', beer: '#f6b73c', heart: '#ff4f7b', job: '#ffe66b', work: '#7ee0b0' };
function iconTex(k) {
  const rows = ICONS[k];
  return ctex(64, 64, (g) => {
    const s = 7, w = rows[0].length * s, h = rows.length * s, ox = (64 - w) / 2, oy = (64 - h) / 2;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(4, 4, 56, 56, 14); g.fill();
    g.fillStyle = ICON_COLOR[k];
    rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === '1') g.fillRect(ox + i * s, oy + j * s, s, s); }));
  });
}

/* ---------- o quarto do editor ---------- */
function buildRoom() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#25304d');

  // piso de taco
  const wood = ctex(512, 512, (g, w, h) => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) {
      const off = (r % 2) * 85;
      g.fillStyle = `hsl(${26 + rnd(-3, 3)},${42 + rnd(-6, 6)}%,${46 + rnd(-6, 6)}%)`;
      g.fillRect(c * 170 + off - 170, r * 64, 170, 64); g.fillRect(c * 170 + off, r * 64, 170, 64);
      g.fillStyle = '#0003'; g.fillRect(c * 170 + off, r * 64, 2, 64); g.fillRect(0, r * 64, w, 2);
    }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(60,30,10,${rnd(.03, .1)})`; g.fillRect(rnd(0, w), rnd(0, h), rnd(10, 60), 1); }
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
  const floor = box(8, .3, 8, mat('#fff', { map: wood, roughness: .55 }), 0, -.15, 0, scene);
  floor.castShadow = false;

  // paredes: papel listrado (fundo) e verde-sálvia (esquerda)
  const paper = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#e8d5b0'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) { g.fillStyle = '#d9bf93'; g.fillRect(x, 0, 12, h); g.fillStyle = '#c75b3b55'; g.fillRect(x + 20, 0, 2, h); }
  });
  paper.wrapS = THREE.RepeatWrapping; paper.repeat.set(6, 1);
  box(8.25, 4, .25, mat('#fff', { map: paper }), -.12, 2, -4.12, scene);
  box(.25, 4, 8, mat('#9fb08f'), -4.12, 2, 0, scene);
  const trim = mat('#5a3a26', { roughness: .5 });
  box(8, .22, .06, trim, 0, .11, -3.97, scene); box(.06, .22, 8, trim, -3.97, .11, 0, scene);

  // janela com a cidade à noite
  const city = ctex(256, 200, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#0d1633'); sky.addColorStop(1, '#3b3f78');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(200, 40, 16, 0, 7); g.fill();
    for (let x = 0; x < w; x += rnd(18, 34)) {
      const bh = rnd(50, 130), bw = rnd(16, 30); g.fillStyle = '#111830'; g.fillRect(x, h - bh, bw, bh);
      for (let yy = h - bh + 6; yy < h - 4; yy += 9) for (let xx = x + 3; xx < x + bw - 4; xx += 7) if (Math.random() < .35) { g.fillStyle = Math.random() < .5 ? '#ffd36b' : '#9fd3ff'; g.fillRect(xx, yy, 3, 4); }
    }
  });
  box(1.8, 1.45, .1, mat('#f3efe6'), -.6, 2.35, -3.97, scene);
  mesh(new THREE.PlaneGeometry(1.6, 1.25), new THREE.MeshBasicMaterial({ map: city }), -.6, 2.35, -3.91, scene);
  box(1.6, .05, .06, mat('#f3efe6'), -.6, 2.35, -3.89, scene); box(.05, 1.25, .06, mat('#f3efe6'), -.6, 2.35, -3.89, scene);

  // cama
  const bedWood = mat('#7a4a2c', { roughness: .55 });
  box(1.95, .4, 2.75, bedWood, -2.95, .22, -2.6, scene);
  box(1.95, 1.15, .12, bedWood, -2.95, .6, -3.94, scene);
  box(1.82, .25, 2.6, mat('#f4f1ea'), -2.95, .55, -2.6, scene);
  box(1.86, .13, 1.75, mat('#9a2257', { roughness: .9 }), -2.95, .7, -2.0, scene);
  box(1.86, .02, .2, mat('#f4f1ea'), -2.95, .77, -2.86, scene);
  box(1.15, .2, .5, mat('#ffffff'), -2.95, .76, -3.55, scene);

  // abajur de pé
  mesh(new THREE.CylinderGeometry(.03, .03, 1.7), mat('#2a2a2a', { metalness: .6, roughness: .3 }), -1.55, .85, -3.6, scene);
  mesh(new THREE.CylinderGeometry(.2, .2, .03), mat('#2a2a2a'), -1.55, .02, -3.6, scene);
  const shade = mesh(new THREE.CylinderGeometry(.18, .32, .36, 24, 1, true), mat('#f2d99b', { side: THREE.DoubleSide, emissive: '#ffcc77', emissiveIntensity: .7 }), -1.55, 1.75, -3.6, scene);
  shade.castShadow = false;
  const lamp = new THREE.PointLight('#ffbf6b', 9, 7, 1.6); lamp.position.set(-1.55, 1.6, -3.4); scene.add(lamp);

  // mesa, cadeira e computador
  const desk = mat('#3b2b22', { roughness: .45 });
  box(2.3, .08, .95, desk, 1.7, 1.0, -3.45, scene);
  for (const [dx, dz] of [[-1.05, -.4], [1.05, -.4], [-1.05, .4], [1.05, .4]]) box(.07, 1, .07, desk, 1.7 + dx, .5, -3.45 + dz, scene);
  const beige = mat('#d8ccb0', { roughness: .6 });
  box(.95, .78, .8, beige, 1.6, 1.44, -3.55, scene);
  box(.6, .5, .4, beige, 1.6, 1.4, -3.95, scene);
  const tl = ctex(320, 240, () => {});
  const screen = mesh(new THREE.PlaneGeometry(.74, .56), new THREE.MeshBasicMaterial({ map: tl }), 1.6, 1.46, -3.14, scene);
  screen.castShadow = false;
  const monitorGlow = new THREE.PointLight('#8fc6ff', 3, 3.5, 1.6); monitorGlow.position.set(1.6, 1.45, -2.8); scene.add(monitorGlow);
  box(.75, .04, .26, mat('#e8e0cc'), 1.55, 1.06, -3.0, scene);
  box(.14, .04, .2, mat('#e8e0cc'), 2.15, 1.06, -3.0, scene);
  box(.5, .3, .02, mat('#ddd'), 2.45, 1.2, -3.6, scene); // claquete na mesa
  box(.5, .07, .03, mat('#111'), 2.45, 1.38, -3.59, scene);
  const chair = mat('#1e1e22', { roughness: .5 });
  box(.62, .08, .6, chair, 1.6, .56, -2.45, scene);
  box(.62, .72, .08, chair, 1.6, .95, -2.13, scene);
  mesh(new THREE.CylinderGeometry(.04, .04, .5), mat('#888', { metalness: .8, roughness: .3 }), 1.6, .3, -2.45, scene);
  mesh(new THREE.CylinderGeometry(.3, .3, .04, 5), mat('#333'), 1.6, .04, -2.45, scene);
  const deskCan = mesh(new THREE.CylinderGeometry(.06, .06, .2, 16), mat('#2f8a4f', { metalness: .7, roughness: .3 }), .85, 1.14, -3.2, scene);

  // pôster do trabalho dele
  new THREE.TextureLoader().load('assets/stuff/02_amarelo_netflix.jpg', t => {
    t.colorSpace = THREE.SRGBColorSpace;
    box(1.32, 1.04, .04, mat('#111'), 1.7, 2.75, -3.97, scene);
    mesh(new THREE.PlaneGeometry(1.24, .96), mat('#fff', { map: t, roughness: .4 }), 1.7, 2.75, -3.94, scene);
  });

  // estante de prêmios (os 6 do jogo)
  box(.32, .06, 1.9, mat('#5a3a26'), -3.84, 2.1, 2.7, scene);
  const gold = mat('#d8a93b', { metalness: 1, roughness: .28 });
  for (let i = 0; i < 6; i++) {
    const z = 1.95 + i * .3;
    mesh(new THREE.CylinderGeometry(.07, .03, .16, 16), gold, -3.84, 2.27, z, scene);
    box(.1, .05, .1, mat('#222'), -3.84, 2.15, z, scene);
  }

  // porta
  box(.08, 2.2, 1.1, mat('#8b5a35', { roughness: .6 }), -3.96, 1.1, -.35, scene);
  box(.02, 2.0, .9, mat('#7a4c2c'), -3.91, 1.1, -.35, scene);
  mesh(new THREE.SphereGeometry(.05), mat('#d8a93b', { metalness: 1, roughness: .3 }), -3.88, 1.05, .05, scene);

  // geladeira retrô com porta que abre
  const cream = mat('#ece3cb', { roughness: .35 });
  box(.9, 1.7, .85, cream, -3.5, .85, 1.3, scene);
  box(.84, 1.6, .02, mat('#fff8e0', { emissive: '#fff1c4', emissiveIntensity: .5 }), -3.06, .85, 1.3, scene).castShadow = false;
  const fridgeDoor = new THREE.Group(); fridgeDoor.position.set(-3.03, .85, 1.72); scene.add(fridgeDoor);
  box(.07, 1.66, .84, cream, 0, 0, -.42, fridgeDoor);
  box(.06, .5, .05, mat('#bbb', { metalness: .9, roughness: .2 }), .06, .2, -.75, fridgeDoor);
  for (let i = 0; i < 3; i++) mesh(new THREE.CylinderGeometry(.05, .05, .18, 12), mat(['#2f8a4f', '#c9a227', '#2f8a4f'][i], { metalness: .7, roughness: .3 }), -3.3, 1.2, 1.05 + i * .2, scene);
  const fridgeLight = new THREE.PointLight('#fff1c4', 0, 2.2, 2); fridgeLight.position.set(-2.8, 1, 1.3); scene.add(fridgeLight);

  // pufe, tapete e planta
  mesh(new THREE.SphereGeometry(.62, 32, 16), mat('#d9a13b', { roughness: .95 }), .9, .3, 1.05, scene).scale.set(1, .5, 1);
  // cantinho do videogame: rack, TV de tubo e console
  const rackWood = mat('#6b4a2f', { roughness: .8 });
  box(1.1, .42, .5, rackWood, .9, .21, -.75, scene);
  box(.84, .62, .58, mat('#3a3633', { roughness: .5 }), .9, .74, -.78, scene);
  const game = ctex(160, 120, () => {});
  const gameScr = mesh(new THREE.PlaneGeometry(.64, .46), new THREE.MeshBasicMaterial({ map: game }), .9, .75, -.485, scene); gameScr.castShadow = false;
  box(.36, .07, .26, mat('#8f8a80'), .55, .46, -.72, scene);
  box(.05, .02, .02, mat('#c0392b', { emissive: '#ff3b30', emissiveIntensity: 1 }), .45, .47, -.585, scene);
  const tvLight = new THREE.PointLight('#7fb0ff', 0, 2.6, 2); tvLight.position.set(.9, .8, -.1); scene.add(tvLight);
  const rugT = ctex(256, 256, (g, w) => { for (let r = 8; r > 0; r--) { g.fillStyle = r % 2 ? '#2b3b8f' : '#e9dcc2'; g.beginPath(); g.arc(128, 128, r * 16, 0, 7); g.fill(); } });
  const rug = mesh(new THREE.CylinderGeometry(1.7, 1.7, .02, 48), mat('#fff', { map: rugT }), .6, .01, .4, scene); rug.castShadow = false;
  mesh(new THREE.CylinderGeometry(.22, .17, .4, 16), mat('#b5552f'), 3.45, .2, -3.45, scene);
  for (let i = 0; i < 7; i++) {
    const l = mesh(new THREE.ConeGeometry(.12, .9, 6), mat('#3f7d3a'), 3.45, .75, -3.45, scene);
    l.rotation.set(rnd(-.5, .5), i, rnd(-.5, .5));
  }

  // luz: lua pela janela + ambiente quente
  scene.add(new THREE.HemisphereLight('#fff0d8', '#4a4560', 2.4));
  const sun = new THREE.DirectionalLight('#fff6ea', 2.8); sun.position.set(6, 10, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  sun.shadow.bias = -.0015; sun.shadow.normalBias = .03; scene.add(sun);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 60);
  camera.position.set(10, 8.6, 10); camera.lookAt(0, .9, 0);

  return { scene, camera, tl, fridgeDoor, fridgeLight, deskCan, monitorGlow, game, tvLight };
}

/* ---------- o Fern (boneco low-poly, sem rosto inventado: barba, careca, camiseta preta) ---------- */
function buildFern() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skin = mat('#c48862', { roughness: .65 }), tee = mat('#18181b'), jeans = mat('#2d3f66'), shoe = mat('#f1f1f1'), dark = mat('#231914');
  const limb = (r, h) => new THREE.CapsuleGeometry(r, h, 4, 10);
  const leg = x => { const p = new THREE.Group(); p.position.set(x, .92, 0); body.add(p); mesh(limb(.12, .62), jeans, 0, -.42, 0, p); box(.22, .12, .34, shoe, 0, -.86, .06, p); return p; };
  const legL = leg(-.15), legR = leg(.15);
  const torso = box(.6, .72, .34, tee, 0, 1.32, 0, body);
  box(.42, .2, .02, mat('#e8dfc8'), 0, 1.45, .18, body); // estampa "MAG"
  const arm = x => { const p = new THREE.Group(); p.position.set(x, 1.62, 0); body.add(p); mesh(limb(.09, .26), tee, 0, -.16, 0, p); mesh(limb(.075, .3), skin, 0, -.5, 0, p); const hand = new THREE.Group(); hand.position.set(0, -.7, .02); p.add(hand); return [p, hand]; };
  const [armL, handL] = arm(-.39), [armR, handR] = arm(.39);
  const head = new THREE.Group(); head.position.set(0, 1.92, 0); body.add(head);
  mesh(new THREE.CylinderGeometry(.1, .11, .14, 12), skin, 0, -.1, 0, head);
  const skull = mesh(new THREE.SphereGeometry(.27, 24, 18), skin, 0, .14, 0, head); skull.scale.set(1, 1.15, 1.02);
  const beard = mesh(new THREE.SphereGeometry(.26, 20, 12, 0, Math.PI * 2, Math.PI * .52, Math.PI * .48), dark, 0, .12, .02, head); beard.scale.set(1.04, 1.2, 1.06);
  box(.2, .04, .04, dark, 0, .08, .25, head); // bigode
  for (const x of [-.1, .1]) { box(.07, .05, .02, mat('#111'), x, .2, .265, head); box(.1, .025, .02, dark, x, .27, .262, head); }
  for (const x of [-.27, .27]) mesh(new THREE.SphereGeometry(.06, 10, 8), skin, x, .14, 0, head);
  box(.06, .1, .05, skin, 0, .14, .28, head); // nariz
  const can = mesh(new THREE.CylinderGeometry(.06, .06, .2, 16), mat('#2f8a4f', { metalness: .7, roughness: .3 }), 0, 0, .05, handR); can.visible = false;
  const env = box(.3, .2, .03, mat('#fffaf0', { emissive: '#ffe08a', emissiveIntensity: .3 }), 0, 0, .1, handL);
  box(.08, .08, .02, mat('#c0392b'), 0, 0, .02, env); env.visible = false;
  const pad = box(.42, .07, .17, mat('#2a2a2e', { roughness: .4 }), 0, 1.22, .5, body); pad.visible = false;
  for (const [x, c] of [[-.12, '#888'], [.1, '#c0392b'], [.15, '#2b3b8f']]) box(.05, .03, .05, mat(c), x, .045, 0, pad);
  const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex('heart'), depthTest: false })); icon.scale.set(.55, .55, 1); icon.position.y = 2.75; icon.visible = false; root.add(icon);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legL, legR, armL, armR, head, torso, handR, handL, can, env, icon, pad };
}

/* ---------- vida no quarto ---------- */
function makeLife(room, fern) {
  const SPOT = {
    bed: { x: -1.65, z: -2.3, lie: { x: -2.95, y: .86, z: -1.45 } },
    desk: { x: 1.6, z: -2.45, face: Math.PI, pose: 'type', via: { x: 1.6, z: -1.5 } },
    fridge: { x: -2.45, z: 1.3, face: -Math.PI / 2, pose: 'stand' },
    bean: { x: .9, z: 1.12, face: Math.PI, pose: 'bean' },
    door: { x: -3.15, z: -.35, face: -Math.PI / 2, pose: 'stand' },
    window: { x: -.6, z: -3.15, face: Math.PI, pose: 'stand' },
    shelf: { x: -3.1, z: 2.7, face: -Math.PI / 2, pose: 'stand' },
    mid: { x: -.5, z: .3, face: Math.PI / 4, pose: 'stand' }
  };
  const P = fern.root.position; P.set(-.5, 0, .3);
  fern.root.rotation.order = 'YXZ'; room.scene.add(fern.icon); // ícone fica no quarto, não gira com o corpo
  let task = null, pose = 'stand', idleT = 2, walkPh = 0, iconK = null, iconT = 0, eat = 0, drink = 0, hop = 0, face = Math.PI / 4;
  const icons = {}; for (const k in ICONS) icons[k] = iconTex(k);
  function showIcon(k, t = 2.2) { iconK = k; iconT = t; fern.icon.material.map = icons[k]; fern.icon.visible = true; }

  function go(name, hold, cb) {
    if (task && task.name === name && task.arrived) { task.hold = hold; task.t = 0; task.cb = cb; return; }
    standUp();
    const s = SPOT[name], path = [];
    if (s.via) path.push(s.via);
    path.push(s);
    task = { name, s, path, hold, cb, arrived: false, t: 0 };
  }
  function standUp() {
    if (!task || !task.arrived) return;
    if (task.s.lie) P.set(task.s.x, 0, task.s.z);
    if (task.s.via) P.set(task.s.via.x, 0, task.s.via.z);
    fern.root.rotation.x = 0; pose = 'stand';
  }
  function finish() { const cb = task && task.cb; standUp(); task = null; idleT = rnd(3, 7); cb && cb('done'); }

  // ações vindas dos botões (pet.js chama isto)
  function onAct(k) {
    if (k === 'job') go('door', 3.2, ev => {
      if (ev === 'arrive') { fern.env.visible = true; fern.env.scale.setScalar(.01); eat = 3.2; showIcon('job', 1.2); }
      if (ev === 'done') { fern.env.visible = false; showIcon('heart'); hop = 1; }
    });
    if (k === 'breja') go('fridge', 1.3, ev => {
      if (ev === 'arrive') room.fridgeLight.intensity = 3;
      if (ev === 'done') {
        room.fridgeLight.intensity = 0; fern.can.visible = true;
        go('bean', 6, e2 => { if (e2 === 'arrive') { drink = 6; showIcon('beer'); } if (e2 === 'done') fern.can.visible = false; });
      }
    });
    if (k === 'trampo') go('desk', 8);
    if (k === 'work') { showIcon('work', 1); }
  }

  function update(dt, t) {
    const st = FernPet.state();
    const cutOpen = document.getElementById('cutgame') && !document.getElementById('cutgame').hidden;
    if (st.sleeping && (!task || task.name !== 'bed')) go('bed', null);
    if (!st.sleeping && task && task.name === 'bed' && task.arrived) { finish(); showIcon('heart'); }
    if (cutOpen && (!task || task.name !== 'desk')) go('desk', null);
    if (!cutOpen && task && task.name === 'desk' && task.hold === null) finish();

    const slow = st.mood === 'sad' ? .65 : 1;
    let moving = false;
    if (task && !task.arrived) {
      const tgt = task.path[0], dx = tgt.x - P.x, dz = tgt.z - P.z, d = Math.hypot(dx, dz);
      if (d < .06) {
        task.path.shift();
        if (!task.path.length) {
          task.arrived = true; task.t = 0;
          if (task.s.lie) { P.set(task.s.lie.x, task.s.lie.y, task.s.lie.z); face = 0; fern.root.rotation.y = 0; pose = 'lie'; }
          else { P.set(task.s.x, 0, task.s.z); face = task.s.face; pose = task.s.pose; }
          task.cb && task.cb('arrive');
        }
      } else {
        const sp = Math.min(d, 1.7 * slow * dt); P.x += dx / d * sp; P.z += dz / d * sp;
        face = Math.atan2(dx, dz); moving = true;
      }
    } else if (task && task.hold != null) {
      task.t += dt; if (task.t > task.hold) finish();
    } else if (!task) {
      idleT -= dt;
      if (idleT < 0) {
        const opts = ['bean', 'window', 'mid', 'shelf', 'desk', 'bean'];
        const n = opts[Math.random() * opts.length | 0];
        go(n, n === 'desk' ? 6 : n === 'bean' ? 7 : 3.5);
      }
    }
    if (moving) pose = 'walk';
    else if (pose === 'walk') pose = 'stand';

    // poses
    const k = Math.min(1, dt * 10);
    walkPh += moving ? dt * 9 * slow : 0;
    const sw = moving ? Math.sin(walkPh) : 0;
    let lL = sw * .6, lR = -sw * .6, aL = -sw * .5, aR = sw * .5, by = 0, hx = 0, rx = 0;
    if (pose === 'type') { lL = lR = -1.5; by = -.33; aL = aR = -1.15 + Math.sin(t * 22) * .06; aR -= Math.sin(t * 19) * .06; hx = .12; }
    const playing = pose === 'bean' && drink <= 0;
    if (pose === 'bean') { lL = lR = -1.25; by = -.27; aL = aR = -.25; }
    if (playing) { aL = -1 + Math.sin(t * 17) * .04; aR = -1 + Math.sin(t * 13 + 1) * .04; hx = .1 + Math.sin(t * 1.7) * .05; }
    if (pose === 'lie') { rx = -Math.PI / 2; aL = aR = .1; }
    if (eat > 0) { eat -= dt; aL = -2.1; aR = -.4; hx = -.1; fern.env.scale.setScalar(Math.max(.01, Math.min(1, eat / 1.6))); if (Math.random() < .03) showIcon('heart', .8); }
    if (drink > 0) { drink -= dt; const sip = (t % 2.2) < .9; aR = sip ? -2.5 : -1.2; hx = sip ? -.3 : 0; }
    if (st.mood === 'sad' && pose !== 'lie') hx = .35;
    fern.legL.rotation.x = lerp(fern.legL.rotation.x, lL, k); fern.legR.rotation.x = lerp(fern.legR.rotation.x, lR, k);
    fern.armL.rotation.x = lerp(fern.armL.rotation.x, aL, k); fern.armR.rotation.x = lerp(fern.armR.rotation.x, aR, k);
    fern.head.rotation.x = lerp(fern.head.rotation.x, hx, k);
    fern.armL.rotation.z = lerp(fern.armL.rotation.z, playing ? .3 : 0, k); fern.armR.rotation.z = lerp(fern.armR.rotation.z, playing ? -.3 : 0, k);
    fern.pad.visible = playing;
    room.tvLight.intensity = playing ? 1.4 + Math.sin(t * 23) * .3 : 0;
    drawGame(room, t, playing);
    fern.body.position.y = lerp(fern.body.position.y, by, k);
    fern.root.rotation.x = rx;
    fern.root.rotation.y = angLerp(fern.root.rotation.y, face, Math.min(1, dt * 8));
    fern.torso.scale.y = 1 + Math.sin(t * 2.4) * .015;
    fern.root.rotation.z = st.tipsy ? Math.sin(t * 3.1) * .14 : 0;
    if (hop > 0) { hop -= dt * 2; fern.body.position.y += Math.abs(Math.sin(hop * 9)) * .25; }
    else if (st.mood === 'happy' && pose === 'stand' && !moving) fern.body.position.y += Math.abs(Math.sin(t * 5)) * .08;

    // ícones: o que está faltando, ou o Z do sono
    if (st.sleeping) { if (iconK !== 'z' || iconT < .3) showIcon('z', 1.2); }
    else if (iconT <= 0 && st.mood === 'sad') showIcon({ job: 'job', sono: 'z', breja: 'beer', trampo: 'work' }[st.lowest], 1.6);
    if (iconT > 0) { iconT -= dt; fern.icon.position.set(P.x, (pose === 'lie' ? 1.75 : P.y + fern.body.position.y + 2.75) + Math.sin(t * 4) * .06, pose === 'lie' ? P.z - 1.9 : P.z); }
    else fern.icon.visible = false;

    room.fridgeDoor.rotation.y = lerp(room.fridgeDoor.rotation.y, room.fridgeLight.intensity > 0 ? 1.3 : 0, k * .5);
    room.deskCan.visible = !fern.can.visible;
    drawScreen(room, t, pose === 'type', st.sleeping);
  }
  return { update, onAct, go };
}

// TV: jogo de corrida em pixel quando ele joga, chiado quando não
let lastGame = 0;
function drawGame(room, t, on) {
  if (t - lastGame < .08) return; lastGame = t;
  const { c, g } = room.game.userData, w = c.width, h = c.height;
  if (!on) {
    for (let i = 0; i < 300; i++) { const v = Math.random() * 40 | 0; g.fillStyle = `rgb(${v},${v},${v + 6})`; g.fillRect(Math.random() * w | 0, Math.random() * h | 0, 4, 3); }
    room.game.needsUpdate = true; return;
  }
  g.fillStyle = '#ff8fb1'; g.fillRect(0, 0, w, h * .45);
  g.fillStyle = '#ffd21f'; g.beginPath(); g.arc(w / 2, h * .42, 16, Math.PI, 0); g.fill();
  g.fillStyle = '#2b3b8f'; g.fillRect(0, h * .45, w, h * .55);
  const curve = Math.sin(t * .7) * 30;
  for (let y = 0; y < h * .55; y += 3) {
    const k = y / (h * .55), cx = w / 2 + curve * (1 - k) * (1 - k), rw = 8 + k * 120;
    g.fillStyle = ((y + t * 60) % 18 < 9) ? '#e9dcc2' : '#d14b6e'; g.fillRect(cx - rw / 2 - 6, h * .45 + y, rw + 12, 3);
    g.fillStyle = '#3a3633'; g.fillRect(cx - rw / 2, h * .45 + y, rw, 3);
    if (((y + t * 90) % 24) < 3) { g.fillStyle = '#fff'; g.fillRect(cx - 1, h * .45 + y, 2, 3); }
  }
  const px = w / 2 + Math.sin(t * 1.3) * 18;
  g.fillStyle = '#c0392b'; g.fillRect(px - 10, h - 22, 20, 12); g.fillStyle = '#111'; g.fillRect(px - 12, h - 14, 5, 6); g.fillRect(px + 7, h - 14, 5, 6);
  g.fillStyle = '#fff'; g.font = 'bold 10px monospace'; g.fillText('LAP ' + (1 + (t / 9 | 0) % 3) + '/3', 6, 12);
  room.game.needsUpdate = true;
}

// tela do computador: timeline quando ele trabalha, protetor de tela quando não
let lastScreen = 0;
function drawScreen(room, t, working, sleeping) {
  if (t - lastScreen < .1) return; lastScreen = t;
  const { c, g } = room.tl.userData, w = c.width, h = c.height;
  g.fillStyle = '#10141c'; g.fillRect(0, 0, w, h);
  if (working) {
    g.fillStyle = '#1c2230'; g.fillRect(8, 8, w * .55, h * .5);
    g.fillStyle = `hsl(${(t * 40) % 360},45%,45%)`; g.fillRect(14, 14, w * .55 - 12, h * .5 - 12);
    const cols = ['#4f7bd9', '#c4569b', '#3fae7c', '#d9a13b'];
    for (let r = 0; r < 4; r++) for (let x = 8 - (t * 30 % 60); x < w; x += 60) { g.fillStyle = cols[(r + (x / 60 | 0)) % 4]; g.fillRect(x, h * .6 + r * 22, 50 - r * 6, 16); }
    g.fillStyle = '#ff4040'; g.fillRect(w * .45, h * .56, 2, h * .44);
  } else if (!sleeping) {
    g.fillStyle = '#ffd21f'; g.font = 'italic 800 34px Archivo, sans-serif';
    const x = (Math.sin(t * .7) * .5 + .5) * (w - 170), y = 40 + (Math.sin(t * 1.1) * .5 + .5) * (h - 60);
    g.fillText('MAG FLAV', x, y);
  }
  room.monitorGlow.intensity = sleeping ? .4 : working ? 4 : 2;
  room.tl.needsUpdate = true;
}

/* ---------- o ovo vintage por fora ---------- */
async function buildEgg(renderer, screenTex) {
  try { await document.fonts.ready; } catch (e) { /* segue com a fonte padrão */ }
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const egg = new THREE.Group(); scene.add(egg);

  const HS = 1.15, FLAT = .39;
  const R = yn => 1.07 * Math.sqrt(Math.max(0, 1 - yn * yn)) * (1 - .1 * yn);
  const surfZ = (x, y) => FLAT * Math.sqrt(Math.max(0, R(y / HS) ** 2 - x * x));
  function onSurface(o, x, y, off = 0) {
    const z = surfZ(x, y), dzdy = (surfZ(x, y + .01) - surfZ(x, y - .01)) / .02, dzdx = (surfZ(x + .01, y) - surfZ(x - .01, y)) / .02;
    o.position.set(x, y, z + off); o.rotation.set(Math.atan(dzdy), -Math.atan(dzdx), 0, 'YXZ');
    egg.add(o); return o;
  }

  // casca de plástico perolado com estampa anos 90
  const pattern = ctex(1024, 512, (g, w, h) => {
    g.fillStyle = '#f2a8b6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${rnd(.02, .08)})`; g.fillRect(rnd(0, w), rnd(0, h), 2, 2); }
    const cols = ['#fff3cf', '#7fc8c0', '#2b3b8f', '#ffd21f', '#ffffff'];
    for (let i = 0; i < 160; i++) {
      g.fillStyle = cols[i % cols.length]; const x = rnd(0, w), y = rnd(0, h), s = rnd(4, 11);
      if (i % 3 === 0) { g.beginPath(); for (let a = 0; a < 10; a++) { const r = a % 2 ? s * .45 : s; g.lineTo(x + Math.cos(a * Math.PI / 5) * r, y + Math.sin(a * Math.PI / 5) * r); } g.fill(); }
      else { g.beginPath(); g.arc(x, y, s * .4, 0, 7); g.fill(); }
    }
  });
  const pts = []; for (let i = 0; i <= 80; i++) { const yn = -1 + 2 * i / 80; pts.push(new THREE.Vector2(Math.max(R(yn), .0005), yn * HS)); }
  const shellGeo = new THREE.LatheGeometry(pts, 128); shellGeo.scale(1, 1, FLAT); shellGeo.computeVertexNormals();
  const shell = new THREE.Mesh(shellGeo, new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: pattern, roughness: .42, clearcoat: 1, clearcoatRoughness: .1, sheen: .5, sheenColor: new THREE.Color('#fff4f6'), sheenRoughness: .4 }));
  egg.add(shell);

  // moldura da tela, tela e vidro
  const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const SY = .16;
  const bezelGeo = new THREE.ExtrudeGeometry(rr(1.42, 1.2, .18), { depth: .22, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 4, curveSegments: 12 });
  const bezel = new THREE.Mesh(bezelGeo, new THREE.MeshPhysicalMaterial({ color: '#ede3cf', roughness: .5, clearcoat: .6 })); bezel.position.set(0, SY, .22); egg.add(bezel);
  const innerGeo = new THREE.ShapeGeometry(rr(1.28, 1.06, .1), 12);
  const inner = new THREE.Mesh(innerGeo, new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: .7 })); inner.position.set(0, SY, .466); egg.add(inner);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); scr.position.set(0, SY, .468); egg.add(scr);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(rr(1.28, 1.06, .1), 12), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: .14, roughness: .04, metalness: .9, depthWrite: false }));
  glass.position.set(0, SY, .472); egg.add(glass);

  // marca e etiquetas impressas
  const label = (txt, w, h, size, color = '#2b3b8f') => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ transparent: true, depthTest: false, roughness: .5, map: ctex(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = color; g.font = `italic 800 ${size}px Archivo, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cw / 2, ch / 2); }) }));
  onSurface(label('FERN.PET', .62, .14, 96), 0, .93, .006);
  onSurface(label('MAG FLAV · EDITOR SIMULATOR', 1, .075, 28, '#9a2257'), 0, -.54, .01);

  // botões
  const KEYS = ['job', 'sono', 'breja', 'trampo'], BTN = [];
  const btnMat = new THREE.MeshPhysicalMaterial({ color: '#ffd21f', roughness: .3, clearcoat: 1, clearcoatRoughness: .08 });
  // botões em pílula, 2 x 2, com o nome impresso em cima (cabe o texto e dá pra ler)
  const capGeo = new THREE.ExtrudeGeometry(rr(.44, .15, .075), { depth: .04, bevelEnabled: true, bevelThickness: .02, bevelSize: .015, bevelSegments: 4, curveSegments: 10 });
  KEYS.forEach((k, i) => {
    const x = (i % 2 ? 1 : -1) * .25, y = i < 2 ? -.73 : -.93;
    const g = new THREE.Group(); onSurface(g, x, y, 0);
    const b = new THREE.Mesh(capGeo, btnMat); b.position.z = .02; g.add(b);
    const ring = new THREE.Mesh(new THREE.ShapeGeometry(rr(.5, .2, .1), 10), new THREE.MeshStandardMaterial({ color: '#c97f8c', roughness: .6 })); ring.position.z = -.005; g.add(ring);
    const t = label(k.toUpperCase(), .4, .12, 104); t.position.z = .065; t.renderOrder = 2; b.add(t);
    b.userData.k = k; BTN.push(b);
  });

  // argola e correntinha
  const metal = new THREE.MeshStandardMaterial({ color: '#d9d3c4', metalness: 1, roughness: .22 });
  const loop = new THREE.Mesh(new THREE.TorusGeometry(.1, .03, 12, 32), metal); loop.position.set(0, 1.18, 0); egg.add(loop);
  for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(.07, .016, 8, 20), metal); l.position.set(Math.sin(i * .6) * .04, 1.33 + i * .12, 0); l.rotation.y = i % 2 ? Math.PI / 2 : 0; egg.add(l); }

  const key = new THREE.DirectionalLight('#fff4e6', 1.8); key.position.set(-2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#9fc6ff', 1.2); rim.position.set(3, 1, -2); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 50); camera.position.set(0, .15, 5.7); camera.lookAt(0, .12, 0);
  return { scene, camera, egg, BTN, scr };
}

/* ---------- liga tudo ---------- */
async function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const rt = new THREE.WebGLRenderTarget(700, 600, { samples: 4 });
  const room = buildRoom(), fern = buildFern(); room.scene.add(fern.root);
  const H = 4.45; room.camera.left = -H * 700 / 600; room.camera.right = H * 700 / 600; room.camera.top = H; room.camera.bottom = -H; room.camera.updateProjectionMatrix();
  const life = makeLife(room, fern);
  const egg = await buildEgg(renderer, rt.texture);
  FernPet.onAct(life.onAct);

  function size() {
    const r = host.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false); egg.camera.aspect = r.width / r.height; egg.camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(host); size();

  // mouse inclina o ovo; botões 3D apertam os botões de verdade
  let tx = 0, ty = 0, rx = 0, ry = 0, pressed = null, pressT = 0, zoomed = false, zk = 0;
  addEventListener('pointermove', e => {
    if (location.hash !== '#poke') return;
    const r = host.getBoundingClientRect();
    ty = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width)) * .5;
    tx = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height)) * .3;
  }, { passive: true });
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  host.addEventListener('pointerdown', e => {
    const r = host.getBoundingClientRect();
    v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, egg.camera);
    const hit = ray.intersectObjects(egg.BTN)[0];
    if (!hit && ray.intersectObject(egg.scr).length) { zoomed = !zoomed; return; }
    if (hit) { pressed = hit.object; pressT = .18; document.querySelector(`[data-pet="${hit.object.userData.k}"]`)?.click(); }
  });
  host.addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, egg.camera);
    host.style.cursor = ray.intersectObjects(egg.BTN).length ? 'pointer' : ray.intersectObject(egg.scr).length ? (zoomed ? 'zoom-out' : 'zoom-in') : '';
  });

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now();
  function frame(now) { requestAnimationFrame(frame); step(now); }
  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (location.hash !== '#poke') return;
    const t = now / 1000;
    life.update(dt, t);
    zk += ((zoomed ? 1 : 0) - zk) * .08;
    egg.camera.position.set(0, lerp(.15, .16, zk), lerp(5.7, 2.7, zk)); egg.camera.lookAt(0, lerp(.12, .16, zk), 0);
    rx += (tx * (1 - zk * .85) - rx) * .06; ry += (ty * (1 - zk * .85) - ry) * .06;
    egg.egg.rotation.set(rx + (still ? 0 : Math.sin(t * .8) * .03), ry + (still ? 0 : Math.sin(t * .5) * .06), 0);
    egg.egg.position.y = still ? 0 : Math.sin(t * 1.2) * .03;
    for (const b of egg.BTN) b.position.z = lerp(b.position.z, b === pressed && pressT > 0 ? -.015 : .02, .4);
    pressT -= dt;
    renderer.setRenderTarget(rt); renderer.render(room.scene, room.camera);
    renderer.setRenderTarget(null); renderer.render(egg.scene, egg.camera);
  }
  requestAnimationFrame(frame);
  // gancho de teste: avança n quadros mesmo com a aba em segundo plano
  window.FernPet3D = { _test(n = 60) { for (let i = 0; i < n; i++) step(last + 1000 / 60); }, _go: n => life.go(n, 30) };
  poke.classList.add('has3d');
}

// chamado no fim: as constantes acima já existem
if (host && window.FernPet) init().catch(e => { console.warn('pet3d:', e); host.innerHTML = ''; });
