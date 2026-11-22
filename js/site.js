/* MAG FLAV — código próprio, sem dependências.
   Rotas por hash: #about #stuff #poke #contact #play #watch-N */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.MF, still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* texto embaralhando */
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el, to) {
    to = to ?? el.dataset.t ?? el.textContent; el.dataset.t = to;
    if (still) { el.textContent = to; return; }
    let f = 0; clearInterval(el._s);
    el._s = setInterval(() => {
      el.textContent = [...to].map((c, i) => i < f || c === ' ' ? c : CH[Math.random() * 26 | 0]).join('');
      if (f++ > to.length) clearInterval(el._s);
    }, 28);
  }
  $$('[data-scr]').forEach(el => { el.dataset.t = el.textContent; el.closest('button,h1').addEventListener('mouseenter', () => scramble(el)); });

  /* "or whatever" e cargo que troca */
  let wi = 0, ti = -1;
  setInterval(() => { if (!location.hash) scramble($('#whatever'), D.whatever[++wi % D.whatever.length]); }, 3600);
  $('#fancy').addEventListener('click', () => {
    const [a, b] = D.titles[++ti % D.titles.length], s = $$('#fancy span');
    scramble(s[0], a); scramble(s[1], b);
  });

  /* a cabeça 3D (js/head3d.js) cuida sozinha do mouse */

  /* rotas */
  const views = ['about', 'stuff', 'poke', 'contact', 'play', 'watch'];
  $$('[data-go]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.go; }));
  function route() {
    const h = location.hash.slice(1), v = h.startsWith('watch-') ? 'watch' : h;
    views.forEach(x => { $('#' + x).hidden = x !== v; });
    stopAbout(); stopCut(); stopWatch(); FernPet.stop(); FernGame.stop();
    if (v === 'about') startAbout();
    if (v === 'stuff') startSphere();
    if (v === 'poke') FernPet.start();
    if (v === 'contact') pixelate();
    if (v === 'play') FernGame.start();
    if (v === 'watch') startWatch(+h.slice(6));
  }
  addEventListener('hashchange', route);
  addEventListener('keydown', e => { if (e.key === 'Escape') location.hash = /^#(play|watch)/.test(location.hash) ? 'stuff' : ''; });

  /* ABOUT: contagem de película + créditos subindo */
  const langs = ['EN', 'PT', 'ES'], speeds = [1, 2, 4];
  let li = 0, si = 0, raf = 0, y = 0, lead = 0;
  function fill() { $('#rollin').innerHTML = D.about[langs[li]].map(t => `<p>${t}</p>`).join(''); }
  function startAbout() {
    fill(); y = 0; $('#rollin').style.transform = '';
    const L = $('#leader'); let n = 3; L.hidden = false; L.textContent = n;
    lead = setInterval(() => { if (--n) L.textContent = n; else { clearInterval(lead); L.hidden = true; tick(); } }, still ? 1 : 600);
  }
  function tick() {
    const el = $('#rollin'), max = el.offsetHeight + innerHeight * 1.1;
    y += .55 * speeds[si]; if (y > max) y = 0;
    el.style.transform = `translateY(${-y}px)`;
    raf = requestAnimationFrame(tick);
  }
  function stopAbout() { cancelAnimationFrame(raf); clearInterval(lead); }
  $('#spd').addEventListener('click', e => { si = (si + 1) % 3; e.target.textContent = speeds[si] + 'x'; });
  $('#lang').addEventListener('click', e => { li = (li + 1) % 3; e.target.textContent = langs[li]; fill(); });

  /* aparelhos antigos (ícones da esfera), desenhados aqui em SVG */
  const GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
  function px(rows, ox, oy, s, pal) {
    let r = '';
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') r += `<rect x='${ox + x * s}' y='${oy + y * s}' width='${s}' height='${s}' fill='${pal[+c - 1] || pal[0]}'/>`; }));
    return r;
  }
  const svg = (vb, inner) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb}' shape-rendering='crispEdges'>${inner}</svg>`);
  const ICONS = {
    pocket: svg('0 0 60 96', `<rect x='1' y='1' width='58' height='94' rx='5' fill='#cfccc3' stroke='#111' stroke-width='1.4'/><rect x='6' y='6' width='48' height='40' rx='3' fill='#55575c'/><rect x='13' y='10' width='34' height='31' fill='${GB[3]}'/>${px(MF_SPR.small, 26, 13, 1.6, GB)}<rect x='13' y='37' width='34' height='4' fill='${GB[1]}'/><circle cx='9.5' cy='24' r='1.3' fill='#e5372a'/><text x='7' y='55' font-family='Helvetica,Arial' font-style='italic' font-weight='800' font-size='6' fill='#2c3a8c'>MAG POCKET</text><path d='M10 66h5v-5h5v5h5v5h-5v5h-5v-5h-5z' fill='#222'/><circle cx='47' cy='64' r='4' fill='#9a2257'/><circle cx='38' cy='69' r='4' fill='#9a2257'/><rect x='20' y='83' width='8' height='2.4' rx='1.2' fill='#888' transform='rotate(-25 24 84)'/><rect x='31' y='83' width='8' height='2.4' rx='1.2' fill='#888' transform='rotate(-25 35 84)'/>`),
    egg: svg('0 0 70 84', `<path d='M35 2C58 2 68 34 68 52C68 72 54 82 35 82C16 82 2 72 2 52C2 34 12 2 35 2Z' fill='#f4b6c2' stroke='#111' stroke-width='1.4'/><circle cx='20' cy='16' r='2' fill='#fff9'/><circle cx='52' cy='22' r='2.5' fill='#fff9'/><circle cx='12' cy='60' r='2' fill='#fff9'/><circle cx='58' cy='66' r='2' fill='#fff9'/><text x='35' y='22' text-anchor='middle' font-family='Helvetica,Arial' font-style='italic' font-weight='800' font-size='6.5'>FERN.PET</text><rect x='17' y='26' width='36' height='29' rx='4' fill='#fff' stroke='#111'/><rect x='21' y='30' width='28' height='21' fill='#c8d4a8'/>${px(['..1111..', '.1....1.', '1.1..1.1', '1......1', '1.1111.1', '.111111.', '..1111..'], 29, 34, 1.5, ['#1d2318'])}<circle cx='24' cy='66' r='3.5' fill='#ffd21f' stroke='#111'/><circle cx='35' cy='68' r='3.5' fill='#ffd21f' stroke='#111'/><circle cx='46' cy='66' r='3.5' fill='#ffd21f' stroke='#111'/>`),
    phone: svg('0 0 40 96', `<rect x='3' y='1' width='34' height='94' rx='14' fill='#2b3a55' stroke='#111' stroke-width='1.4'/><rect x='14' y='6' width='12' height='2' rx='1' fill='#0d1322'/><rect x='8' y='14' width='24' height='22' rx='2' fill='#0d1322'/><rect x='10' y='16' width='20' height='18' fill='${GB[2]}'/>${px(MF_SPR.small, 16, 17, 1, GB)}<text x='20' y='44' text-anchor='middle' font-family='Helvetica,Arial' font-weight='800' font-size='4' fill='#cfd6e6'>MAG·TEL</text>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x='${8 + c * 9}' y='${50 + r * 9}' width='7' height='5' rx='2.5' fill='#d9dde6'/>`).join('')).join('')}`),
    tv: svg('0 0 90 80', `<rect x='2' y='4' width='86' height='64' rx='8' fill='#3a342e' stroke='#111' stroke-width='1.4'/><rect x='8' y='10' width='58' height='52' rx='9' fill='#111'/><rect x='12' y='14' width='50' height='44' rx='7' fill='#6b8fa8'/><path d='M12 30h50M12 42h50' stroke='#fff4' stroke-width='3'/><circle cx='77' cy='20' r='5' fill='#6a625a'/><circle cx='77' cy='34' r='5' fill='#6a625a'/><rect x='71' y='44' width='12' height='14' fill='#25211d'/><path d='M30 4L18 -8M50 4L62 -8' stroke='#111' stroke-width='1.4'/><rect x='14' y='68' width='10' height='6' fill='#25211d'/><rect x='66' y='68' width='10' height='6' fill='#25211d'/>`)
  };
  const GADS = [
    { icon: 'pocket', go: 'play', t: 'MAG POCKET — PLAY FERN vs DEADLINE' },
    { icon: 'egg', go: 'poke', t: 'FERN.PET — FEED ME JOBS (AND BEER)' },
    { icon: 'phone', go: 'contact', t: 'MAG·TEL — CALL ME' },
    { icon: 'tv', go: 'rand', t: 'RANDOM CHANNEL — ZAP THROUGH MY WORK' }
  ];

  /* STUFF: esfera de capas e aparelhos; arrastar gira, clicar abre */
  let built = false, rx = -.25, ry = 0, vx = 0, vy = .004, drag = null, moved = 0, sraf = 0;
  function startSphere() {
    const box = $('#sphere'), cap = $('#cap');
    if (!built) {
      built = true;
      const copies = innerWidth < 720 ? 1 : 2, items = [];  // no celular, uma cópia só (esfera menos amontoada)
      for (let c = 0; c < copies; c++) items.push(
        ...D.stuff.map((it, i) => ({ src: 'assets/stuff/' + it.img, t: it.t, go: 'watch-' + i })),
        ...GADS.map(g => ({ src: ICONS[g.icon], t: g.t, go: g.go, gad: g.icon })));
      // mistura determinística pra os aparelhos não ficarem juntos
      items.sort((a, b) => ((a.t.length * 7 + a.go.length * 13) % 11) - ((b.t.length * 7 + b.go.length * 13) % 11));
      const N = items.length;
      items.forEach((it, i) => {
        const im = new Image(); im.src = it.src; im.alt = it.t; im.draggable = false; im.dataset.go = it.go;
        if (it.gad) im.className = 'gad ' + it.gad;
        const ph = Math.acos(1 - 2 * (i + .5) / N), th = Math.PI * (1 + Math.sqrt(5)) * i;
        im._p = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
        im.addEventListener('pointerenter', () => { cap.textContent = it.t; });
        box.append(im);
      });
      box.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; moved = 0; box.setPointerCapture(e.pointerId); });
      box.addEventListener('pointermove', e => {
        if (!drag) {
          const el = document.elementFromPoint(e.clientX, e.clientY);
          if (el && el.dataset && el.dataset.go && el.alt) cap.textContent = el.alt;
          return;
        }
        const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; moved += Math.abs(dx) + Math.abs(dy);
        vy = dx * .0006; vx = -dy * .0006; drag = [e.clientX, e.clientY]; ry += vy * 8; rx += vx * 8;
      });
      box.addEventListener('pointerup', e => {
        drag = null;
        if (moved > 6) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || !el.dataset || !el.dataset.go) return;
        const go = el.dataset.go;
        location.hash = go === 'rand' ? 'watch-' + (Math.random() * D.stuff.length | 0) : go;
      });
    }
    cancelAnimationFrame(sraf);
    (function spin() {
      if ($('#stuff').hidden) return;
      if (!drag) { ry += vy; rx += vx; vx *= .96; if (Math.abs(vy) > .004) vy *= .97; }
      const R = Math.min(innerWidth, innerHeight) * (innerWidth < 720 ? .4 : .36), cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      for (const im of box.children) {
        const [a, b, c] = im._p, x = a * cy + c * sy, z0 = -a * sy + c * cy, yy = b * cx - z0 * sx, z = b * sx + z0 * cx, s = .55 + (z + 1) * .32;
        im.style.transform = `translate(${x * R}px,${yy * R}px) scale(${s})`;
        im.style.opacity = .25 + (z + 1) * .375; im.style.zIndex = Math.round((z + 1) * 50);
      }
      sraf = requestAnimationFrame(spin);
    })();
  }

  /* WATCH: cada trabalho toca num aparelho diferente */
  const SKINS = ['crt', 'pocket', 'phone'];
  function startWatch(i) {
    const N = D.stuff.length, it = D.stuff[i];
    if (!it) { location.hash = 'stuff'; return; }
    const media = it.v ? `<video src="assets/prev/${it.v}" autoplay muted loop playsinline></video>` : `<img src="assets/stuff/${it.img}" alt="">`;
    const skin = SKINS[i % 3];
    let html = '';
    if (skin === 'crt') html = `<div class="g-tvset"><div class="g-crt"><div class="g-scr crt">${media}</div><div class="g-knobs"><b></b><b></b><i></i></div></div><div class="g-vcr"><span class="tape">${it.t}</span><i>▶ PLAY</i></div></div>`;
    if (skin === 'pocket') html = `<div class="hh sm"><div class="hh-bezel"><span class="hh-led"></span><span class="hh-top">NOW PLAYING</span><div class="hh-scr tint">${media}</div></div><div class="hh-brand"><span class="m">MAG</span><span class="c"><b>P</b><b>O</b><b>C</b><b>K</b><b>E</b><b>T</b></span></div><div class="hh-ctl"><div class="dpad"><i></i><i></i><i></i><i></i></div><div class="ab"><i>B</i><i>A</i></div></div></div>`;
    if (skin === 'phone') html = `<div class="g-phone"><div class="g-ear"></div><span class="g-pbrand">MAG·TEL</span><div class="g-scr tint">${media}</div><div class="g-keys">${'123456789*0#'.split('').map(k => `<i>${k}</i>`).join('')}</div></div>`;
    $('#gadget').innerHTML = html;
    $('#wcap').innerHTML = `<button class="nav" data-w="${(i - 1 + N) % N}" aria-label="anterior">←</button><div><b>${it.t}</b><span>${it.v ? 'CLICK THE SCREEN FOR SOUND · ' : ''}<a href="${it.href}" target="_blank" rel="noopener">${it.v ? 'WATCH THE FULL FILM ↗' : 'OPEN ↗'}</a></span></div><button class="nav" data-w="${(i + 1) % N}" aria-label="próximo">→</button>`;
    $$('#wcap [data-w]').forEach(b => b.addEventListener('click', () => { location.hash = 'watch-' + b.dataset.w; }));
    const v = $('#gadget video');
    if (v) $('.g-scr,.hh-scr', $('#gadget')).addEventListener('click', () => { v.muted = !v.muted; v.play().catch(() => {}); });
  }
  function stopWatch() { $('#gadget').innerHTML = ''; }

  /* PLAY: o jogo no portátil */
  FernGame.mount($('#gb'), $('#gbhud'), $('#gbov'));
  const KM = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'a', KeyW: 'a', Space: 'a', KeyZ: 'a', KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Enter: 'start', KeyM: 'select', ArrowDown: 'down', KeyS: 'down' };
  addEventListener('keydown', e => { if ($('#play').hidden) return; const k = KM[e.code]; if (k) { e.preventDefault(); FernGame.key(k, true); } });
  addEventListener('keyup', e => { const k = KM[e.code]; if (k) FernGame.key(k, false); });
  $$('[data-k]').forEach(b => {
    const k = b.dataset.k === 'up' ? 'a' : b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); FernGame.key(k, true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => FernGame.key(k, false)));
  });

  /* POKE: FERN.PET + timeline de corte (botão TRAMPO) */
  FernPet.mount($('#lcd'), $('#bars'), $('#pmsg'));
  $$('[data-pet]').forEach(b => b.addEventListener('click', () => {
    FernPet.act(b.dataset.pet);
    if (b.dataset.pet === 'trampo') { const c = $('#cutgame'); c.hidden = !c.hidden; c.hidden ? stopCut() : startCut(); }
  }));
  let graf = 0, px0 = 0, dir = 1, score = 0, zone = [40, 18], spd = .7;
  const OK = ['CLEAN CUT.', 'NICE. AGAIN.', 'THAT’S A WRAP.', 'EDITOR’S INSTINCT.'], MISS = ['YOU CUT THE GOOD PART.', 'CLIENT WON’T LIKE THAT.', 'CTRL+Z. TRY AGAIN.'];
  function newZone() { zone = [8 + Math.random() * 64, Math.max(7, 18 - score * 1.5)]; $('#bad').style.cssText = `left:${zone[0]}%;width:${zone[1]}%`; }
  function startCut() {
    newZone(); cancelAnimationFrame(graf);
    (function run() { px0 += dir * spd; if (px0 > 100 || px0 < 0) dir *= -1; $('#ph').style.left = px0 + '%'; graf = requestAnimationFrame(run); })();
  }
  function stopCut() { cancelAnimationFrame(graf); }
  $('#cut').addEventListener('click', () => {
    const hit = px0 >= zone[0] && px0 <= zone[0] + zone[1];
    if (hit) { score++; spd = Math.min(2.4, spd + .15); } else { score = 0; spd = .7; }
    newZone(); FernPet.work(hit);
    const pool = hit ? OK : MISS;
    $('#gmsg').textContent = pool[Math.random() * pool.length | 0];
    $('#score').textContent = score + (score === 1 ? ' clean cut' : ' clean cuts');
  });

  /* CONTACT: rosto em pixel verde, feito da foto real */
  function pixelate() {
    const c = $('#pix'), g = c.getContext('2d'), im = new Image();
    im.onload = () => {
      g.drawImage(im, im.width * .2, im.height * .1, im.width * .6, im.height * .6, 0, 0, 64, 64);
      try {
        const d = g.getImageData(0, 0, 64, 64), pal = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];
        for (let i = 0; i < d.data.length; i += 4) {
          const p = pal[Math.min(3, (d.data[i] * .3 + d.data[i + 1] * .59 + d.data[i + 2] * .11) / 52 | 0)];
          d.data[i] = p[0]; d.data[i + 1] = p[1]; d.data[i + 2] = p[2];
        }
        g.putImageData(d, 0, 0);
      } catch (e) { /* aberto por file://: fica a foto reduzida */ }
    };
    im.src = 'assets/rosto.jpg';
  }

  route();
})();
