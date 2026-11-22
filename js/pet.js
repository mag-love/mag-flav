/* FERN.PET — bichinho virtual do Fern. Vive de JOB, precisa de pouco SONO, de BREJA e de TRAMPO.
   As necessidades caem com o tempo (também com a página fechada, até 2 h) e ficam salvas neste navegador. */
window.FernPet = (() => {
  const K = 'magflav-pet', RATE = { job: .22, sono: .09, breja: .16, trampo: .14 };
  const LABEL = { job: 'JOB', sono: 'SONO', breja: 'BREJA', trampo: 'TRAMPO' };
  const MSG = {
    job: ['JOB NOVO! BRIEFING "PRA ONTEM".', 'CLIENTE PAGOU EM DIA?!', 'NHAM. UM CASE PRA CANNES.', 'DOC DE 90 MIN. DELÍCIA.', 'FREELA DE FIM DE SEMANA. OBA?'],
    breja: ['SAÚDE! 🍺', 'GELADA, IGUAL AO ÁUDIO DO CLIENTE.', 'UMA SÓ. PRA DESTRAVAR O CORTE.'],
    low: {
      job: ['SEM JOB. COMENDO MIOJO.', 'ME MANDA UM BRIEFING…', 'CADÊ O ORÇAMENTO APROVADO?'],
      sono: ['RENDER ÀS 4H. PRECISO DE UM COCHILO.', 'TÔ VENDO FRAME DUPLICADO…'],
      breja: ['SEXTA-FEIRA SEM BREJA?', 'UMA GELADA AÍ, POR FAVOR.'],
      trampo: ['TÉDIO. ME DÁ UMA TIMELINE.', 'SAUDADE DE UM CORTE SECO.']
    },
    happy: ['VIDA DE EDITOR É BOA.', 'CORTE APROVADO DE PRIMEIRA!', 'TÁ TUDO NO SYNC.']
  };
  const FACE = ['...11111111...', '..1.1.1.1.1.1.', '.1..........1.', '.1.11....11.1.', '.1..........1.', '.1....11....1.', '.1..111111..1.', '.111111111111.', '..1111111111..', '....111111....', '.....1..1.....', '..1111111111..', '.1..........1.'];
  const ICON = {
    job: ['..111..', '..1.1..', '1111111', '1.....1', '1..1..1', '1111111'],
    beer: ['11111..', '1.1.111', '1...1.1', '1...1.1', '1...111', '11111..'],
    heart: ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'],
    z: ['111', '.1.', '111'],
    work: ['1111111', '1.....1', '1.111.1', '1.....1', '1111111', '..111..']
  };
  const pick = a => a[Math.random() * a.length | 0];

  let s, cv, g, bars, msg, iv = 0, frame = 0, fx = 0, dir = 1;
  let sleeping = 0, tipsy = 0, anim = null, hearts = 0, sayT = 0, hook = null;
  const emit = k => { try { hook && hook(k); } catch (e) { console.warn(e); } };

  function load() {
    try { s = JSON.parse(localStorage.getItem(K)); } catch (e) { s = null; }
    if (!s || typeof s.job !== 'number') s = { job: 70, sono: 60, breja: 50, trampo: 60, t: Date.now(), beers: [] };
    const dt = Math.min(7200, Math.max(0, (Date.now() - s.t) / 1000));
    for (const k in RATE) s[k] = Math.max(0, s[k] - RATE[k] * dt);
  }
  function save() { s.t = Date.now(); try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) { /* sem storage: vive só nesta visita */ } }
  const clamp = v => Math.max(0, Math.min(100, v));

  function say(t, d = 45) { msg.textContent = t; sayT = d; }
  function lowest() { let k = 'job'; for (const x in RATE) if (s[x] < s[k]) k = x; return k; }
  function mood() {
    if (sleeping) return 'sleep';
    if (tipsy) return 'tipsy';
    const lo = lowest();
    if (s[lo] < 25) return 'sad';
    if (Object.keys(RATE).every(k => s[k] > 65)) return 'happy';
    return 'ok';
  }

  function blit(rows, x, y) { rows.forEach((r, j) => [...r].forEach((c, i) => { if (c !== '.') g.fillRect(x + i, y + j, 1, 1); })); }

  function draw() {
    frame++;
    const m = mood();
    g.fillStyle = '#c8d4a8'; g.fillRect(0, 0, 48, 36);
    g.fillStyle = m === 'sleep' ? '#9aa682' : '#1d2318';
    if (m === 'sleep') { g.fillStyle = '#b3bf95'; g.fillRect(0, 0, 48, 36); g.fillStyle = '#1d2318'; }
    if (!sleeping && !anim && frame % 6 === 0) { fx += dir; if (Math.abs(fx) > 9 || Math.random() < .08) dir *= -1; }
    const wob = m === 'tipsy' ? (frame >> 2) % 2 : 0;
    const bounce = m === 'happy' && (frame >> 2) % 2 ? -1 : 0;
    const x = 17 + (sleeping ? 0 : fx) + wob, y = 12 + bounce;
    blit(FACE, x, y);
    // olhos
    const blink = frame % 40 < 3;
    if (m === 'sleep' || m === 'happy' || blink) { g.fillRect(x + 3, y + 4, 2, 1); g.fillRect(x + 9, y + 4, 2, 1); }
    else if (m === 'tipsy') { g.fillRect(x + 4, y + 4, 1, 1); g.fillRect(x + 10, y + 5, 1, 1); }
    else if (m === 'sad') { g.fillRect(x + 4, y + 5, 1, 1); g.fillRect(x + 9, y + 5, 1, 1); g.fillRect(x + 3, y + 3, 1, 1); g.fillRect(x + 10, y + 3, 1, 1); }
    else { g.fillRect(x + 4, y + 4, 1, 1); g.fillRect(x + 9, y + 4, 1, 1); }
    // efeitos
    if (m === 'sleep') { const zz = (frame >> 3) % 3; blit(ICON.z, x + 15, y - 3 - zz * 2); if (zz > 0) blit(ICON.z, x + 19, y - 8 - zz); }
    if (m === 'tipsy' && (frame >> 3) & 1) { g.fillRect(x - 3, y + 1, 1, 1); g.fillRect(x + 16, y + 2, 1, 1); g.fillRect(x + 17, y, 1, 1); }
    if (m === 'sad' && (frame >> 4) & 1) blit(lowest() === 'breja' ? ICON.beer : lowest() === 'trampo' ? ICON.work : lowest() === 'sono' ? ICON.z : ICON.job, 1, 1);
    if (anim) {
      anim.x += 1.2; blit(ICON[anim.icon], Math.round(anim.x), y + 6);
      if (anim.x > x - 6) { anim = null; hearts = 16; }
    }
    if (hearts > 0) { hearts--; blit(ICON.heart, x + 16, y - 4 - ((16 - hearts) >> 2)); }
    if (m === 'happy' && !hearts && frame % 50 < 10) blit(ICON.heart, 2, 2);
  }

  function renderBars() {
    bars.innerHTML = Object.keys(RATE).map(k => `<span>${LABEL[k]}</span><i class="${s[k] < 25 ? 'low' : ''}"><b style="width:${s[k] | 0}%"></b></i>`).join('');
  }

  function tick() { // a cada 100 ms
    if (sleeping) {
      sleeping--; s.sono = clamp(s.sono + .8);
      if (!sleeping) { s.sono = 100; say('ACORDOU. 4H TÁ ÓTIMO. BORA RENDERIZAR.'); }
    }
    if (tipsy) tipsy--;
    if (frame % 10 === 0) {
      for (const k in RATE) if (!(k === 'sono' && sleeping)) s[k] = clamp(s[k] - RATE[k]);
      renderBars(); save();
    }
    if (sayT > 0) sayT--;
    else if (frame % 10 === 0) {
      const m = mood();
      if (m === 'sad') say(pick(MSG.low[lowest()]), 60);
      else if (m === 'happy') say(pick(MSG.happy), 60);
      else if (m === 'ok') say('', 20);
    }
    draw();
  }

  function act(k) {
    if (sleeping) { say('ZZZ… DEIXA EU DORMIR. SÓ MAIS 1H.'); return; }
    if (k === 'job') {
      if (s.job > 95) { say('TÔ CHEIO DE JOB. AGENDA FECHADA ATÉ MARÇO.'); return; }
      s.job = clamp(s.job + 30); anim = { icon: 'job', x: -8 }; say(pick(MSG.job)); emit('job');
    }
    if (k === 'sono') {
      if (s.sono > 90) { say('JÁ DORMI. MAIS QUE 5H É LUXO.'); return; }
      sleeping = 120; say('COCHILO RÁPIDO. EDITOR NÃO HIBERNA.'); emit('sono');
    }
    if (k === 'breja') {
      s.breja = clamp(s.breja + 25); anim = { icon: 'beer', x: -8 };
      s.beers = (s.beers || []).filter(t => Date.now() - t < 30000); s.beers.push(Date.now());
      if (s.beers.length >= 3) { tipsy = 90; say('O CORTE TÁ FICANDO… GENIAL? JUMP CUT EM TUDO!'); }
      else say(pick(MSG.breja));
      emit('breja');
    }
    if (k === 'trampo') { say('ABRE A TIMELINE: CORTA O TAKE RUIM.'); emit('trampo'); }
    renderBars(); save();
  }

  function work(ok) {
    if (ok) { s.trampo = clamp(s.trampo + 14); s.job = clamp(s.job + 3); s.sono = clamp(s.sono - 2); hearts = 10; emit('work'); }
    else s.trampo = clamp(s.trampo - 3);
    renderBars(); save();
  }

  return {
    mount(canvas, barsEl, msgEl) { cv = canvas; g = cv.getContext('2d'); bars = barsEl; msg = msgEl; load(); renderBars(); draw(); },
    start() { if (iv) return; load(); renderBars(); iv = setInterval(tick, 100); },
    stop() { clearInterval(iv); iv = 0; if (s) save(); },
    act, work,
    onAct(fn) { hook = fn; },
    state() { if (!s) load(); return { ...s, sleeping, tipsy, mood: mood(), lowest: lowest() }; }
  };
})();
