/* FERN vs DEADLINE — jogo de plataforma original do MAG FLAV.
   Personagem, fases, inimigos e arte são próprios: o Fern pega JOBS pra crescer, junta estrelas,
   pisa nos DEADLINES (relógios) e cada fase termina num troféu = um prêmio real da carreira.
   Tela 160x144, 4 tons de verde. Sem dependências. */
window.MF_SPR = {
  small: ['..1111..', '.144441.', '.133331.', '.131131.', '.133331.', '.111111.', '..1111..', '.144441.', '14444441', '34444443', '.22..22.', '.11..11.'],
  smallB: ['..1111..', '.144441.', '.133331.', '.131131.', '.133331.', '.111111.', '..1111..', '.144441.', '14444441', '34444443', '..2222..', '..1..1..'],
  big: ['..1111..', '.144441.', '.133331.', '.131131.', '.133331.', '.111111.', '..1111..', '.144441.', '14444441', '14444441', '34444443', '.144441.', '.222222.', '.22..22.', '.22..22.', '.11..11.'],
  bigB: ['..1111..', '.144441.', '.133331.', '.131131.', '.133331.', '.111111.', '..1111..', '.144441.', '14444441', '14444441', '34444443', '.144441.', '.222222.', '..2222..', '..2222..', '..1111..'],
  job: ['..1111..', '..1..1..', '11111111', '14444441', '14411441', '14444441', '11111111'],
  star: ['...1...', '..141..', '1114111', '1444441', '.14441.', '.14141.', '11...11'],
  clock: ['..1111..', '.144441.', '14414441', '14411441', '14444441', '.144441.', '..1111..', '.1....1.'],
  clockB: ['..1111..', '.144441.', '14414441', '14411441', '14444441', '.144441.', '..1111..', '1......1'],
  squish: ['........', '........', '........', '........', '..1111..', '.144441.', '14444441', '11111111'],
  trophy: ['11111111', '14444441', '14444441', '.144441.', '..1441..', '...11...', '...11...', '..1441..', '.111111.', '.133331.', '.111111.'],
  ground: ['11111111', '13333331', '13232321', '12323231', '13232321', '12323231', '13232321', '11111111'],
  brick: ['11111111', '14141414', '11111111', '13333331', '13333331', '11111111', '14141414', '11111111'],
  jblock: ['11111111', '14444441', '14441141', '14444141', '14444141', '14144141', '14411441', '11111111'],
  used: ['11111111', '12222221', '12222221', '12222221', '12222221', '12222221', '12222221', '11111111'],
  drive: ['11111111', '12222221', '12111121', '12222221', '12222241', '12222221', '12222221', '11111111']
};

window.FernGame = (() => {
  const W = 160, H = 144, T = 8, PAL = [null, '#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
  const TILE = [null, 'ground', 'brick', 'jblock', 'used', 'drive'];
  const S = window.MF_SPR, IMG = {};
  const AW = (window.MF && window.MF.awards) || [];

  function mk(rows, flip) {
    const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
    const g = c.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = PAL[ch]; g.fillRect(flip ? c.width - 1 - x : x, y, 1, 1); } }));
    return c;
  }
  for (const k in S) { IMG[k] = mk(S[k]); IMG[k + 'F'] = mk(S[k], true); }

  /* som 8-bit */
  let ac = null, mute = false;
  function beep(f, d = .08, type = 'square', f2) {
    if (mute) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), v = ac.createGain(), t = ac.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      v.gain.setValueAtTime(.05, t); v.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(v).connect(ac.destination); o.start(t); o.stop(t + d);
    } catch (e) { /* sem áudio */ }
  }
  const seq = (fs, d, gap, type) => fs.forEach((f, i) => setTimeout(() => beep(f, d, type), i * gap));
  const SFX = {
    jump: () => beep(280, .14, 'square', 640),
    star: () => seq([988, 1319], .07, 60),
    grow: () => seq([523, 659, 784, 1047], .08, 65),
    stomp: () => beep(220, .1, 'square', 70),
    bump: () => beep(140, .06, 'triangle'),
    hurt: () => beep(420, .3, 'sawtooth', 90),
    life: () => seq([784, 988, 1175, 1568], .08, 70),
    win: () => seq([523, 659, 784, 1047, 784, 1047, 1319], .13, 115),
    die: () => seq([494, 440, 392, 330, 262], .15, 120, 'triangle')
  };

  /* estado */
  let cv, g, hud, ov, raf = 0, acc = 0, last = 0, running = false;
  let keys = {}, prev = {}, state = 'title', t = 0, frame = 0, paused = false, banner = 0;
  let level = 1, score = 0, lives = 3, jobs = 0, nextLife = 25;
  let LW = 0, tiles = [], ents = [], P = null, cam = 0, hudTxt = '';

  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  const SIZE = { enemy: [8, 8], star: [7, 7], job: [8, 7], trophy: [8, 11], pop: [7, 7] };
  function E(type, x, y, o = {}) { const [w, h] = SIZE[type]; return Object.assign({ type, x, y, w, h, vx: 0, vy: 0, dead: false, on: false }, o); }

  function build(n) {
    const r = rng(n * 7919 + 13);
    LW = 110 + n * 22;
    tiles = [...Array(18)].map(() => new Uint8Array(LW));
    for (let x = 0; x < LW; x++) { tiles[16][x] = 1; tiles[17][x] = 1; }
    ents = [];
    tiles[12][9] = 3; // o primeiro job é garantido, com espaço livre antes do primeiro inimigo
    ents.push(E('star', 12 * T, 13 * T), E('star', 14 * T, 12 * T), E('star', 16 * T, 13 * T));
    let x = 26;
    while (x < LW - 20) {
      const k = r();
      if (k < .16) { // buraco
        const w = 2 + (r() < .3 + n * .05 ? 1 : 0);
        for (let i = 0; i < w; i++) { tiles[16][x + i] = 0; tiles[17][x + i] = 0; }
        x += w + 3;
      } else if (k < .36) { // plataforma de película com blocos de job
        const row = 11 + (r() * 2 | 0), len = 3 + (r() * 4 | 0);
        for (let i = 0; i < len; i++) tiles[row][x + i] = r() < .28 ? 3 : 2;
        for (let i = 1; i < len - 1; i += 2) ents.push(E('star', (x + i) * T, (row - 2) * T));
        if (r() < .3 + n * .05) ents.push(E('enemy', (x + len - 1) * T, (row - 1) * T, { dir: -1, spd: .4 }));
        x += len + 3;
      } else if (k < .5) { // pilha de HDs
        const h = 2 + (r() * (n > 2 ? 3 : 2) | 0), wide = r() < .5;
        for (let i = 0; i < h; i++) { tiles[15 - i][x] = 5; if (wide) tiles[15 - i][x + 1] = 5; }
        x += 5;
      } else if (k < .72) { // deadlines
        const c = 1 + (r() * Math.min(3, n) | 0);
        for (let i = 0; i < c; i++) ents.push(E('enemy', (x + i * 2) * T, 15 * T, { dir: -1, spd: .4 + n * .03 }));
        x += c * 2 + 3;
      } else if (k < .88) { // arco de estrelas
        for (let i = 0; i < 4; i++) ents.push(E('star', (x + i) * T, (13 - (i === 1 || i === 2 ? 1 : 0)) * T));
        x += 6;
      } else {
        tiles[12][x] = 3; ents.push(E('star', (x + 2) * T, 14 * T)); x += 4;
      }
    }
    for (let i = LW - 20; i < LW; i++) { tiles[16][i] = 1; tiles[17][i] = 1; }
    for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) tiles[15 - j][LW - 17 + i] = 5; // escada até o troféu
    ents.push(E('trophy', (LW - 8) * T, 16 * T - 11));
    P = { x: 16, y: 16 * T - 12, vx: 0, vy: 0, w: 6, h: 12, big: false, inv: 0, face: 1, ground: false, walk: 0 };
    cam = 0;
  }

  const solid = (px, py) => { const tx = Math.floor(px / T), ty = Math.floor(py / T); if (tx < 0) return true; if (ty < 0 || ty >= 18 || tx >= LW) return false; return tiles[ty][tx] > 0; };

  function move(b, head) {
    b.wall = 0;
    b.x += b.vx;
    const mid = b.h > 9 ? b.y + b.h / 2 : null;
    if (b.vx > 0) {
      const ex = b.x + b.w;
      if (solid(ex, b.y + 1) || solid(ex, b.y + b.h - 1) || (mid !== null && solid(ex, mid))) { b.x = Math.floor(ex / T) * T - b.w - .01; b.wall = 1; b.vx = 0; }
    } else if (b.vx < 0) {
      if (solid(b.x, b.y + 1) || solid(b.x, b.y + b.h - 1) || (mid !== null && solid(b.x, mid))) { b.x = (Math.floor(b.x / T) + 1) * T; b.wall = -1; b.vx = 0; }
    }
    b.y += b.vy; b.ground = false;
    if (b.vy > 0) {
      const fy = b.y + b.h;
      if (solid(b.x + 1, fy) || solid(b.x + b.w - 1, fy)) { b.y = Math.floor(fy / T) * T - b.h; b.vy = 0; b.ground = true; }
    } else if (b.vy < 0) {
      const ty = Math.floor(b.y / T), tl = Math.floor((b.x + 1) / T), tr = Math.floor((b.x + b.w - 1) / T), tc = Math.floor((b.x + b.w / 2) / T);
      if (solid(b.x + 1, b.y) || solid(b.x + b.w - 1, b.y)) {
        b.y = (ty + 1) * T; b.vy = 0;
        if (head) head(solid(tc * T, ty * T) ? tc : solid(tl * T, ty * T) ? tl : tr, ty);
      }
    }
  }

  function bump(tx, ty) {
    if (ty < 0 || ty >= 18 || tiles[ty][tx] !== 3) { SFX.bump(); return; }
    tiles[ty][tx] = 4;
    if (!P.big) { ents.push(E('job', tx * T, ty * T, { rise: 16, dir: 1 })); SFX.bump(); }
    else { addStar(); ents.push(E('pop', tx * T, ty * T - 8, { life: 24 })); }
  }

  function addStar() {
    score++; SFX.star();
    if (score >= nextLife) { nextLife += 25; lives++; setTimeout(SFX.life, 150); }
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function hurt() {
    if (P.inv > 0) return;
    if (P.big) { P.big = false; P.y += 4; P.h = 12; P.inv = 90; SFX.hurt(); }
    else die();
  }
  function die() { state = 'dead'; t = 0; P.vy = -3.5; SFX.die(); }

  function newLevel(n, retry) {
    build(n); state = 'play'; paused = false;
    banner = retry ? 0 : 100;
    show(retry ? '' : `<div class="thin"><small>FASE ${n}</small><h3>${AW[(n - 1) % AW.length] ? 'RUMO AO<br>' + AW[(n - 1) % AW.length].a : 'BIS!'}</h3></div>`);
  }

  function show(html) { ov.innerHTML = html; }
  function trophySVG(sc) {
    const rows = S.trophy; let r = '';
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${PAL[ch]}"/>`; }));
    return `<svg viewBox="0 0 8 11" width="${8 * sc}" height="${11 * sc}" shape-rendering="crispEdges">${r}</svg>`;
  }
  function screen(kind) {
    if (kind === 'title') show(`<small>MAG POCKET APRESENTA</small><h3>FERN<br>vs<br>DEADLINE</h3><small>PEGUE JOB PRA CRESCER<br>JUNTE ESTRELAS · PISE NO PRAZO</small><b class="blink">PRESS START</b>`);
    if (kind === 'award') {
      const a = AW[(level - 1) % AW.length] || { a: 'STILL CUTTING', c: '', p: '' };
      show(`<small>FASE ${level} CONCLUÍDA</small>${trophySVG(5)}<h3 class="sm">${a.a}</h3><small>${a.c}<br>${a.p}</small><b class="blink">START ▸ PRÓXIMO JOB</b>`);
    }
    if (kind === 'over') show(`<h3>GAME<br>OVER</h3><small>O CLIENTE PEDIU<br>A V27_FINAL_FINAL</small><small>★ ${score} · ${jobs} JOBS</small><b class="blink">START ▸ DE NOVO</b>`);
  }

  const pressed = k => keys[k] && !prev[k];

  function step() {
    frame++;
    if (pressed('select')) { mute = !mute; hudTxt = ''; }
    if (state === 'title' || state === 'over') {
      if (pressed('start') || pressed('a')) { if (state === 'over') { score = 0; lives = 3; level = 1; jobs = 0; nextLife = 25; } newLevel(level); }
    } else if (state === 'award') {
      t++; if (t > 50 && (pressed('start') || pressed('a'))) { level++; newLevel(level); }
    } else if (state === 'dead') {
      t++; P.vy += .2; P.y += P.vy;
      if (t > 110) { lives--; if (lives < 0) { state = 'over'; screen('over'); } else newLevel(level, true); }
    } else if (state === 'play') {
      if (pressed('start')) { paused = !paused; show(paused ? '<h3>PAUSA</h3><small>RENDERIZANDO…</small>' : ''); }
      if (!paused) play();
    }
    prev = { ...keys };
  }

  function play() {
    if (banner > 0 && --banner === 0) show('');
    const run = keys.b, ax = run ? .13 : .09, mx = run ? 2.1 : 1.3;
    if (keys.left) { P.vx -= ax; P.face = -1; } else if (keys.right) { P.vx += ax; P.face = 1; } else P.vx *= .78;
    if (Math.abs(P.vx) < .05) P.vx = 0;
    P.vx = Math.max(-mx, Math.min(mx, P.vx));
    if (pressed('a') && P.ground) { P.vy = -4.6; SFX.jump(); }
    if (!keys.a && P.vy < -2) P.vy = -2;
    P.vy = Math.min(4, P.vy + .22);
    move(P, bump);
    if (P.x < cam) { P.x = cam; P.vx = Math.max(0, P.vx); }
    P.walk += Math.abs(P.vx) * .12;
    if (P.inv > 0) P.inv--;
    if (P.y > H + 8) { die(); return; }

    for (const e of ents) {
      if (e.dead) continue;
      if (e.type === 'enemy') {
        if (!e.on && e.x < cam + W + 16) e.on = true;
        if (!e.on) continue;
        if (e.squish) { if (--e.squish <= 0) e.dead = true; continue; }
        e.vx = e.dir * e.spd; e.vy = Math.min(4, e.vy + .2); move(e);
        if (e.wall) e.dir *= -1;
        if (e.y > H) e.dead = true;
        if (hit(P, e)) {
          if (P.vy > 0 && P.y + P.h - e.y < 6) { e.squish = 18; P.vy = -3; addStar(); SFX.stomp(); }
          else hurt();
          if (state !== 'play') return;
        }
      } else if (e.type === 'job') {
        if (e.rise > 0) { e.y -= .5; e.rise -= .5; }
        else { e.vx = e.dir * .7; e.vy = Math.min(4, e.vy + .2); move(e); if (e.wall) e.dir *= -1; if (e.y > H) e.dead = true; }
        if (hit(P, e)) {
          e.dead = true; jobs++;
          if (!P.big) { P.big = true; P.y -= 4; P.h = 16; SFX.grow(); } else { score += 5; SFX.grow(); }
        }
      } else if (e.type === 'star') {
        if (hit(P, e)) { e.dead = true; addStar(); }
      } else if (e.type === 'pop') {
        e.y -= .8; if (--e.life <= 0) e.dead = true;
      } else if (e.type === 'trophy') {
        if (hit(P, e)) { state = 'award'; t = 0; SFX.win(); screen('award'); return; }
      }
    }
    ents = ents.filter(e => !e.dead);
    cam = Math.round(Math.max(0, Math.min(LW * T - W, P.x - 64)));
  }

  function draw() {
    g.fillStyle = PAL[4]; g.fillRect(0, 0, W, H);
    if (!P) { drawHud(); return; }
    // nuvens e morros ao fundo
    g.fillStyle = PAL[3];
    for (let i = 0; i < LW / 10; i++) {
      const cx = Math.round(i * 70 - cam * .4) % (LW * T), cy = 14 + (i * 37 % 30);
      if (cx < -30 || cx > W) continue;
      g.fillRect(cx + 4, cy, 14, 2); g.fillRect(cx, cy + 2, 22, 4); g.fillRect(cx + 6, cy + 6, 10, 1);
    }
    for (let i = 0; i < LW / 8; i++) {
      const hx = Math.round(i * 90 - cam * .6), hy = 112;
      if (hx < -50 || hx > W) continue;
      for (let s = 0; s < 16; s++) g.fillRect(hx + s, hy + 16 - s, 34 - s * 2, 1);
    }
    const tx0 = Math.max(0, Math.floor(cam / T)), tx1 = Math.min(LW, tx0 + 22);
    for (let ty = 0; ty < 18; ty++) for (let tx = tx0; tx < tx1; tx++) {
      const v = tiles[ty][tx]; if (v) g.drawImage(IMG[TILE[v]], tx * T - cam, ty * T);
    }
    for (const e of ents) {
      const x = Math.round(e.x - cam), y = Math.round(e.y);
      if (x < -16 || x > W + 8) continue;
      if (e.type === 'enemy') g.drawImage(e.squish ? IMG.squish : (frame >> 3) & 1 ? IMG.clockB : IMG.clock, x, y);
      else if (e.type === 'job') g.drawImage(IMG.job, x, y);
      else if (e.type === 'star' || e.type === 'pop') g.drawImage(IMG.star, x, y + (e.type === 'star' ? Math.round(Math.sin((frame + e.x) / 9)) : 0));
      else if (e.type === 'trophy') { g.drawImage(IMG.trophy, x, y); if ((frame >> 4) & 1) { g.fillStyle = PAL[1]; g.fillRect(x - 2, y + 1, 1, 1); g.fillRect(x + 9, y + 3, 1, 1); } }
    }
    if (!(P.inv && (frame & 2))) {
      const moving = !P.ground || (Math.abs(P.vx) > .2 && (P.walk | 0) & 1);
      const key = (P.big ? 'big' : 'small') + (moving ? 'B' : '') + (P.face < 0 ? 'F' : '');
      g.drawImage(IMG[key], Math.round(P.x - cam - 1), Math.round(P.y));
    }
    drawHud();
  }

  function drawHud() {
    const s = `<span>★${String(score).padStart(3, '0')}</span><span>JOB ${jobs}</span><span>♥${Math.max(0, lives)}</span><span>${mute ? 'MUDO' : 'F' + level}</span>`;
    if (s !== hudTxt) { hud.innerHTML = s; hudTxt = s; }
  }

  function loop(ts) {
    if (!running) return;
    acc += Math.min(100, ts - (last || ts)); last = ts;
    while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
    draw();
    raf = requestAnimationFrame(loop);
  }

  return {
    mount(c, h, o) { cv = c; g = cv.getContext('2d'); hud = h; ov = o; build(1); screen('title'); },
    start() { if (running) return; running = true; last = 0; acc = 0; keys = {}; prev = {}; raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); keys = {}; if (state === 'play' && !paused) { paused = true; show('<h3>PAUSA</h3><small>START PRA VOLTAR</small>'); } },
    key(k, down) { keys[k] = down; },
    _test(n, map) {
      for (let i = 0; i < n; i++) step(); draw();
      const o = { state, level, score, jobs, lives, big: P && P.big, x: P && Math.round(P.x), y: P && Math.round(P.y), LW };
      if (map) { const a = Math.max(0, map[0]); o.map = tiles.slice(8).map(r => [...r.slice(a, a + map[1])].join('').replace(/0/g, '.')); o.ents = ents.filter(e => e.x >= a * T && e.x < (a + map[1]) * T).map(e => e.type[0] + Math.floor(e.x / T) + ',' + Math.floor(e.y / T)); }
      return o;
    }
  };
})();
