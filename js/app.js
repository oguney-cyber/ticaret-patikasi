/* Ticaret Patikası — uygulama */
(function () {
  'use strict';
  const { parseContent, md, inline, esc } = window.EP;
  const UNITS = parseContent(window.CONTENT.join('\n'));
  const UNIT = {}, LESSON = {}, QBY = {}, GENMETA = {};
  UNITS.forEach(u => { UNIT[u.id] = u; u.lessons.forEach(l => { LESSON[l.id] = l; l.qs.forEach(q => { QBY[q.id] = q; }); l.gens.forEach(g => { if (!GENMETA[g]) GENMETA[g] = { unit: u.id, lesson: l.id }; }); }); });
  const ORDER = UNITS.flatMap(u => u.lessons.map(l => l.id));
  // öğrenme yardımları (js/aids.js): ders formülleri ve soru ipuçları
  const AID = { fx: {}, hint: {} };
  { let cur = null; (window.AIDS || '').split('\n').forEach(line => { let m;
    if ((m = /^# (\S+)/.exec(line))) cur = m[1];
    else if ((m = /^F (.+)$/.exec(line)) && cur) { const p = m[1].split(' :: '); (AID.fx[cur] = AID.fx[cur] || []).push({ f: p[0].trim(), c: (p[1] || '').trim() }); }
    else if ((m = /^H (\S+) (.+)$/.exec(line))) AID.hint[m[1]] = m[2].trim(); }); }
  // içerik dosyalarındaki FX (ders formülü) ve HINT (soru ipucu) satırları
  UNITS.forEach(u => u.lessons.forEach(l => { if (l.fx.length) AID.fx[l.id] = (AID.fx[l.id] || []).concat(l.fx); l.qs.forEach(q => { if (q.hint && !AID.hint[q.id]) AID.hint[q.id] = q.hint; }); }));
  const EXAM_W = { u1: 5, u2: 10, u3: 7, u4: 8, u5: 5, u6: 5 };
  const SHORT = { u1: 'Böl. 1', u2: 'Böl. 2', u3: 'Böl. 3', u4: 'Böl. 4', u5: 'Böl. 5', u6: 'WTO', u7: 'Vize' };

  /* ---------- durum ---------- */
  const KEY = 'ticaret-patikasi-v1';
  const blank = () => ({ v: 1, xp: 0, days: {}, les: {}, q: {}, mist: {}, hist: {}, exams: [], run: null, set: { sound: true, tr: true, goal: 100, size: 'l', aidfx: true, theme: 'dark' } });
  let S = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); S.set = Object.assign(blank().set, S.set); } catch (e) { /* depolama yok */ }
  // yazı boyutu ve tema: varsayılan koyu tema; "sistem" seçilirse cihazın ayarı geçerli
  const applySize = () => {
    const de = document.documentElement, th = S.set.theme || 'dark';
    de.dataset.size = S.set.size || 'l';
    if (th === 'system') delete de.dataset.theme; else de.dataset.theme = th;
    const dark = th === 'dark' || (th === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute('content', dark ? '#0E141C' : '#0B6B8A');
  };
  applySize();
  let saveT = 0;
  function save() { S.t = Date.now(); clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }, 150); }
  window.addEventListener('pagehide', () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } });

  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function addXP(n) { S.xp += n; const k = today(); S.days[k] = (S.days[k] || 0) + n; }
  function streak() {
    let n = 0; const d = new Date();
    const key = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    if (!S.days[key(d)]) d.setDate(d.getDate() - 1);
    while (S.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function rec(q, ok, first, mode) {
    const id = q.qid;
    const s = S.q[id] || (S.q[id] = { c: 0, w: 0 });
    ok ? s.c++ : s.w++;
    if (first) { const h = (S.hist[q.unit] || '') + (ok ? '1' : '0'); S.hist[q.unit] = h.slice(-40); }
    if (!ok) S.mist[id] = { n: ((S.mist[id] && S.mist[id].n) || 0) + 1, t: Date.now() };
    else if (S.mist[id] && (first || mode === 'mist')) delete S.mist[id];
  }
  function unitAcc(u) { const h = S.hist[u] || ''; const c = [...h].filter(x => x === '1').length; const k = 6; return { n: h.length, acc: (c + 0.25 * k) / (h.length + k), raw: h.length ? c / h.length : null }; }
  function predicted() {
    let tot = 0, n = 0;
    for (const [u, w] of Object.entries(EXAM_W)) { const a = unitAcc(u); tot += w * a.acc; n += a.n; }
    return { score: Math.round(tot / 40 * 100), n };
  }
  const lessonDone = (id) => (S.les[id] && S.les[id].n) || 0;
  const unitDone = (u) => UNIT[u].lessons.filter(l => lessonDone(l.id)).length;
  const nextLesson = () => ORDER.find(id => !lessonDone(id)) || null;

  /* ---------- yardımcılar ---------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function typeset(el) {
    if (!el || !window.renderMathInElement) return;
    try { window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'] }); } catch (e) { }
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast slide-up'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); }
  function confirmBox(title, text, yes, no, danger) {
    return new Promise(res => {
      const bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt">${esc(title)}</h3><p>${esc(text)}</p><div class="btnrow"><button class="btn ${danger ? 'bad' : ''}" data-y>${esc(yes)}</button><button class="btn ghost" data-n>${esc(no)}</button></div></div>`;
      document.body.appendChild(bg);
      const done = (v) => { bg.remove(); res(v); };
      bg.querySelector('[data-y]').onclick = () => done(true);
      bg.querySelector('[data-n]').onclick = () => done(false);
      bg.onclick = (e) => { if (e.target === bg) done(false); };
      bg.querySelector('[data-y]').focus();
    });
  }
  let AC = null;
  function beep(ok) {
    if (!S.set.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t = AC.currentTime;
      const notes = ok ? [[660, 0], [990, 0.085]] : [[233, 0], [175, 0.11]];
      notes.forEach(([fr, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = ok ? 'sine' : 'triangle'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.16, t + d + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2); o.connect(g); g.connect(AC.destination); o.start(t + d); o.stop(t + d + 0.22); });
    } catch (e) { }
  }
  const Ink = window.Ink || { init() { }, bind() { }, unbind() { }, off() { }, isOn: () => false, clearPrefix: () => Promise.resolve(), clearAll: () => Promise.resolve(), count: () => Promise.resolve(0) };
  Ink.init({ toast });
  const Calc = window.Calc || { stepsHTML: () => '', close() { }, mountPage() { }, pageHTML: () => '<div class="view"><p>Hesap makinesi yüklenemedi.</p></div>' };
  const fmtTime = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  const I = {
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-4.7L15.8 4.8a2.2 2.2 0 0 1 3.1 3.1L8.4 18.4z"/><path d="M13.9 6.7l3.1 3.1"/></svg>',
    path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.8"/></svg>',
    exam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.5V3h6v1.5"/><path d="m9 13 2 2 4-4.5"/></svg>',
    mist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6.5l6.5 7-6.5 7H18"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 15h17M9 4v16"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>',
    flame: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2s1 3.2-1.4 6C8.6 10.4 7 12 7 14.6A5 5 0 0 0 12 20a5 5 0 0 0 5-5.2c0-2.3-1.2-3.8-2.2-4.9.2 1.6-.4 2.8-1.4 3.4.4-3.3-.8-6.8-1.4-9.3z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>',
    empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>'
  };

  /* ---------- soru örnekleri ---------- */
  function inst(qid) {
    if (qid.startsWith('g:')) {
      const name = qid.slice(2), g = window.genQ(name), m = GENMETA[name];
      return { qid, gen: true, unit: m.unit, lesson: m.lesson, en: g.en, tr: g.tr, ex: g.ex, hint: g.hint || '', src: '', opts: shuffle(g.opts.map((t, i) => ({ t, ok: i === 0 }))) };
    }
    const q = QBY[qid];
    return { qid, gen: false, unit: q.unit, lesson: q.lesson, en: q.en, tr: q.tr, ex: q.ex, hint: AID.hint[qid] || '', src: q.src, opts: shuffle(q.opts.map(o => ({ t: o.t, ok: o.ok }))) };
  }
  function weightOf(id) { const s = S.q[id]; if (!s) return 2.5; return 1 + (s.w > s.c ? 3 : 0) + (S.mist[id] ? 2 : 0); }
  function wpick(ids, n) {
    const pool = ids.map(id => ({ id, w: weightOf(id) })); const out = [];
    while (out.length < n && pool.length) {
      const tot = pool.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, k = 0;
      while (r > pool[k].w && k < pool.length - 1) { r -= pool[k].w; k++; }
      out.push(pool[k].id); pool.splice(k, 1);
    }
    return out;
  }
  function lessonQueue(L) {
    const st = wpick(L.qs.map(q => q.id), L.qs.length), gens = L.gens.map(g => 'g:' + g);
    const target = 9, nSt = Math.min(st.length, gens.length ? 6 : 10);
    const picks = st.slice(0, nSt);
    for (let k = 0; picks.length < target && gens.length && k < gens.length * 2; k++) picks.push(gens[k % gens.length]);
    return shuffle(picks);
  }
  function unitQueue(u, n) {
    const unit = UNIT[u];
    const st = unit.lessons.flatMap(l => l.qs.map(q => q.id));
    const gens = unit.lessons.flatMap(l => l.gens.map(g => 'g:' + g));
    const nG = Math.min(gens.length, Math.round(n * 0.4));
    return shuffle([...wpick(gens, nG), ...wpick(st, n - nG)]);
  }

  const TB_IDS = Object.keys(QBY).filter(id => /^TB /.test(QBY[id].src));
  const tbSeen = () => TB_IDS.filter(id => S.q[id]).length;

  /* ---------- kabuk ---------- */
  const TABS = [['yol', 'Patika', I.path], ['sinav', 'Deneme', I.exam], ['hatalar', 'Hatalarım', I.mist], ['formuller', 'Formüller', I.sigma], ['tablolar', 'Tablolar', I.table], ['hesap', 'Hesap', I.calc]];
  const app = $('#app');
  app.innerHTML = `
    <nav class="rail" aria-label="Ana menü">
      <div class="brand"><div class="brand-mark" aria-hidden="true">⇄</div><div class="brand-t">Ticaret Teorisi<small>Feenstra · vize</small></div></div>
      ${TABS.map(t => `<button class="tab" data-go="${t[0]}">${t[2]}<span>${t[1]}</span></button>`).join('')}
      <div class="rail-spacer"></div>
      <button class="tab" data-go="ayarlar">${I.gear}<span>Ayarlar</span></button>
    </nav>
    <main class="main" id="main" tabindex="-1"></main>
    <aside class="aside" id="aside" aria-label="Hazırlık durumu"></aside>
    <nav class="tabbar" aria-label="Ana menü">${TABS.map(t => `<button class="tab" data-go="${t[0]}">${t[2]}<span>${t[1]}</span></button>`).join('')}</nav>`;
  app.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) location.hash = '#/' + b.dataset.go; });

  function route() {
    const r = (location.hash.replace(/^#\/?/, '') || 'yol').split('/')[0];
    document.querySelectorAll('[data-go]').forEach(b => b.setAttribute('aria-current', b.dataset.go === r ? 'page' : 'false'));
    const main = $('#main');
    const V = { yol: viewPath, sinav: viewExam, hatalar: viewMist, formuller: viewFormulas, tablolar: viewTables, hesap: () => Calc.pageHTML(), ayarlar: viewSettings }[r] || viewPath;
    main.innerHTML = V();
    typeset(main);
    bindView(main, r);
    renderAside();
    window.scrollTo(0, 0);
    if (!$('#player')) { if (r === 'formuller' || r === 'tablolar') Ink.bind({ key: 'v:' + r, mode: 'main', scroller: window, anchor: $('.view', main) }); else Ink.unbind(); }
  }
  window.addEventListener('hashchange', route);
  function refresh() { const y = window.scrollY; route(); window.scrollTo(0, y); }

  /* ---------- yan panel ---------- */
  function readinessHTML() {
    const p = predicted();
    const bars = Object.keys(EXAM_W).map(u => { const a = unitAcc(u); const v = a.raw == null ? 0 : a.raw; return `<div class="ubar"><span>${SHORT[u]}</span><div class="tr"><i style="width:${Math.round(v * 100)}%"></i></div><span class="v">${a.raw == null ? '·' : '%' + Math.round(v * 100)}</span></div>`; }).join('');
    return `<div class="panel"><div class="eyebrow">Tahmini sınav puanı</div>
      <div class="score"><b>${p.n ? p.score : '–'}</b><span>/ 100</span></div>
      <p>${p.n < 20 ? 'Birkaç ders çöz, tahmin netleşsin. Hedef 60–70.' : p.score >= 60 ? 'Hedef aralığındasın. Deneme sınavıyla doğrula.' : 'Hedef 60. En zayıf bölümden devam et.'}</p>
      <div class="ubars">${bars}</div></div>`;
  }
  function goalHTML() {
    const x = S.days[today()] || 0, g = S.set.goal || 100;
    return `<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center"><div class="eyebrow">Günlük hedef</div><span class="pill mark">${I.flame}<span class="num">${streak()} gün</span></span></div>
      <div class="goal"><i style="width:${Math.min(100, Math.round(x / g * 100))}%"></i></div><p class="num">${x} / ${g} XP · toplam ${S.xp} XP</p></div>`;
  }
  function renderAside() {
    const mc = Object.keys(S.mist).length;
    $('#aside').innerHTML = readinessHTML() + goalHTML() +
      `<div class="panel"><h3>Deneme sınavı</h3><p>Gerçek sınav gibi 40 soru. Puanın 100 üzerinden hesaplanır.</p><button class="btn block" data-act="exam">${S.run ? 'Yarım kalan sınava dön' : 'Sınavı başlat'}</button></div>` +
      `<div class="panel"><h3>Hatalarım</h3><p>${mc ? mc + ' soru tekrar bekliyor.' : 'Yanlış yaptığın sorular burada birikir.'}</p><button class="btn ghost block" data-act="mist" ${mc ? '' : 'disabled'}>Hataları çalış</button></div>` +
      (TB_IDS.length ? `<div class="panel"><h3>Test bankası</h3><p>Test bankasından ${TB_IDS.length} soru. Görmediklerin ve yanlış yaptıkların önce gelir.</p><p class="num"><small>${tbSeen()} / ${TB_IDS.length} soru görüldü</small></p><button class="btn ghost block" data-act="tb">Test bankası çöz</button></div>` : '');
    bindActs($('#aside'));
  }
  function bindActs(el) {
    el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'exam') startExam();
      else if (a === 'mist') startMist();
      else if (a === 'tb') startTB();
      else if (a === 'next') { const n = nextLesson(); n ? openLessonIntro(n) : startPractice(weakestUnit()); }
    }));
  }
  const weakestUnit = () => Object.keys(EXAM_W).sort((a, b) => unitAcc(a).acc - unitAcc(b).acc)[0];

  /* ---------- görünümler ---------- */
  const OFF = [0, 30, 54, 30];
  function viewPath() {
    const n = nextLesson(), nl = n && LESSON[n];
    const hero = `<section class="hero"><svg class="reg" viewBox="0 0 150 90" aria-hidden="true">
        <path d="M8 80 H144 M8 80 V8" stroke="var(--line)" stroke-width="2" fill="none"/>
        <path d="M8 18 C 70 18, 112 44, 120 80" stroke="var(--ink-3)" stroke-width="3" fill="none"/>
        <path d="M30 6 L 140 74" stroke="var(--pen)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="86" cy="41" r="5" fill="var(--pen)"/><circle cx="56" cy="22" r="4.5" fill="var(--ink-3)"/></svg>
      <button class="iconbtn gear phone-only" data-go="ayarlar" aria-label="Ayarlar">${I.gear}</button><div class="eyebrow">ECN311E · Feenstra–Taylor Bölüm 1–5 · WTO ve bölgeselcilik</div><h1>Ticaret Patikası</h1>
      <p>Konuyu oku, soruları çöz, yanlışlarını tekrar et. Sorular sınavdaki gibi İngilizce ve çoktan seçmeli, açıklamalar Türkçe.</p>
      <div class="btnrow" style="margin-top:16px"><button class="btn" data-act="next">${nl ? (lessonDone(ORDER[0]) ? 'Devam et: ' : 'Başla: ') + esc(nl.title) : 'Zayıf ünitene çalış'}</button></div></section>`;
    const strip = `<div class="stats only-narrow"><div class="stat"><b>${predicted().n ? predicted().score : '–'}</b><span>tahmini puan</span></div><div class="stat hot"><b>${streak()}</b><span>gün seri</span></div><div class="stat"><b>${S.days[today()] || 0}</b><span>bugün XP</span></div></div>`;
    const units = UNITS.map(u => {
      const done = unitDone(u.id);
      const nodes = u.lessons.map((l, i) => {
        const d = lessonDone(l.id), best = S.les[l.id] && S.les[l.id].best;
        const cls = d ? 'done' : (l.id === n ? 'next' : '');
        return `<div class="node-row" style="--k:${OFF[i % 4]}"><button class="node ${cls}" data-lesson="${l.id}" aria-label="${esc(l.title)}">${esc(l.glyph)}</button>
          <div class="node-label"><b>${esc(l.title)}</b><span>${d ? `<span class="st">Tamamlandı</span> · en iyi %${Math.round((best || 0) * 100)}${d > 1 ? ' · ' + d + ' kez' : ''}` : l.qs.length + l.gens.length + ' soru tipi · ' + l.cards.length + ' konu kartı'}</span></div></div>`;
      }).join('');
      const ua = unitAcc(u.id);
      return `<section class="unit" id="${u.id}"><header class="unit-head"><div class="eyebrow">${esc(u.week)}</div><h2>${esc(u.title)}</h2><p>${esc(u.sub)}</p><div class="uprog"><b class="num">${done}/${u.lessons.length}</b>ders</div></header>
        <div class="path">${nodes}
        <div class="node-row" style="--k:${OFF[u.lessons.length % 4]}"><button class="node practice" data-practice="${u.id}" aria-label="${esc(u.title)} ünite tekrarı">${I.repeat}</button>
        <div class="node-label"><b>Ünite tekrarı</b><span>10 karışık soru${ua.raw != null ? ' · son başarı %' + Math.round(ua.raw * 100) : ''}</span></div></div></div></section>`;
    }).join('');
    return `<div class="view">${hero}${strip}${units}</div>`;
  }

  function viewExam() {
    const ex = S.exams.slice().reverse();
    const wt = Object.entries(EXAM_W).map(([u, k]) => `<tr><td>${esc(UNIT[u].week)} · ${esc(UNIT[u].title)}</td><td class="num">${k}</td></tr>`).join('');
    return `<div class="view"><section class="hero"><div class="eyebrow">40 soru · test</div><h1>Deneme sınavı</h1>
      <p>Bütün bölümlerden 40 çoktan seçmeli soru; dağılım geçen yılın vizesindeki puanlara göre, en çok Ricardo (Bölüm 2) ve Heckscher–Ohlin (Bölüm 4). Cevaplar sona kadar gösterilmez. Bitirince her sorunun çözümünü görürsün.</p>
      <div class="btnrow" style="margin-top:16px"><button class="btn" data-act="exam">${S.run ? 'Yarım kalan sınava dön' : 'Sınavı başlat'}</button></div></section>
      <div class="panel"><h3>Soru dağılımı</h3><div class="tbl"><table><thead><tr><th>Konu</th><th>Soru</th></tr></thead><tbody>${wt}</tbody></table></div>
      <p>Her denemede sorular değişir. Sayısal soruların yarısı her seferinde yeni sayılarla üretilir.</p></div>
      ${TB_IDS.length ? `<div class="panel"><h3>Test bankası</h3><p>Test bankasından ${TB_IDS.length} soru. Görmediklerin ve yanlış yaptıkların önce gelir.</p><p class="num"><small>${tbSeen()} / ${TB_IDS.length} soru görüldü</small></p><button class="btn ghost block" data-act="tb">Test bankası çöz</button></div>` : ''}
      <div class="panel"><h3>Geçmiş denemeler</h3>${ex.length ? '<div class="rows">' + ex.map(e => `<div class="row"><div><b class="num">${e.score} puan</b> <small>· ${e.c}/40 doğru · ${fmtTime(e.dur)}</small><br><small>${new Date(e.at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</small></div><span class="pill ${e.score >= 60 ? 'ok' : 'bad'}">${e.score >= 60 ? 'hedefte' : 'hedef altı'}</span></div>`).join('') + '</div>' : '<p>Henüz deneme çözmedin. Ünitelerin yarısını bitirince bir deneme çözmek iyi fikir.</p>'}</div></div>`;
  }

  function viewMist() {
    const ids = Object.keys(S.mist).sort((a, b) => S.mist[b].t - S.mist[a].t);
    if (!ids.length) return `<div class="view"><section class="hero"><div class="eyebrow">Tekrar</div><h1>Hatalarım</h1><p>Yanlış cevapladığın her soru buraya düşer. Doğru cevaplayınca listeden çıkar.</p></section><div class="panel empty">${I.empty}<b>Liste boş</b><span>Bir ders çöz, yanlışların burada birikecek.</span></div></div>`;
    const byU = {}; ids.forEach(id => { const u = id.startsWith('g:') ? GENMETA[id.slice(2)].unit : QBY[id] && QBY[id].unit; if (u) byU[u] = (byU[u] || 0) + 1; });
    const list = ids.slice(0, 40).map(id => {
      if (id.startsWith('g:')) { const m = GENMETA[id.slice(2)]; return `<div class="row"><div><b>${esc(LESSON[m.lesson].title)}</b><br><small>Sayısal soru tipi · her seferinde yeni sayılarla gelir</small></div><span class="pill bad">${S.mist[id].n}×</span></div>`; }
      const q = QBY[id]; if (!q) return '';
      const stem = q.en.split('\n')[0];
      return `<div class="row"><div><small>${esc(LESSON[q.lesson].title)}</small><div>${inline(stem.length > 160 ? stem.slice(0, 160) + '…' : stem)}</div></div><span class="pill bad">${S.mist[id].n}×</span></div>`;
    }).join('');
    return `<div class="view"><section class="hero"><div class="eyebrow">Tekrar</div><h1>Hatalarım</h1><p><b class="num">${ids.length}</b> soru tekrar bekliyor. Her turda en fazla 10 tanesi gelir.</p>
      <div class="btnrow" style="margin-top:16px"><button class="btn" data-act="mist">Hataları çalış</button></div></section>
      <div class="panel"><h3>Konulara göre</h3><div class="btnrow">${Object.entries(byU).map(([u, k]) => `<span class="pill">${SHORT[u]}: ${k}</span>`).join('')}</div></div>
      <div class="panel"><h3>Liste</h3><div class="rows">${list}</div></div></div>`;
  }

  function viewFormulas() {
    const secs = window.FORMULAS.split(/^## /m).filter(s => s.trim()).map(s => { const nl = s.indexOf('\n'); return `<section class="panel"><h3>${esc(s.slice(0, nl))}</h3><div class="prose">${md(s.slice(nl + 1))}</div></section>`; }).join('');
    return `<div class="view wide"><section class="hero"><div class="eyebrow">Tek sayfa</div><h1>Formül kağıdı</h1><p>Sınavdan önceki akşam buna bak. Hepsi ders slaytlarından, hocanın Bölüm 2–4 özetinden ve WTO notundan.</p></section>${secs}</div>`;
  }

  function viewTables() {
    const fld = (id, lab, v) => `<label class="field" for="${id}">${lab}<input id="${id}" inputmode="decimal" value="${v}"></label>`;
    const MODELS = [['Ricardo (Böl. 2)', 'yalnız emek', 'emek sektörler arası serbest', 'teknoloji (verimlilik) farkı', 'herkes kazanır; reel ücret iki mala göre de artar'],
      ['Özgül faktörler (Böl. 3)', 'emek, sermaye, toprak', 'yalnız emek serbest; sermaye imalata, toprak tarıma bağlı (kısa dönem)', 'nispi fiyat farkı', 'ihracat sektörünün özgül faktörü kazanır, ithalat sektörününki kaybeder; emeğin durumu belirsiz'],
      ['Heckscher–Ohlin (Böl. 4)', 'emek ve sermaye', 'ikisi de sektörler arası serbest (uzun dönem)', 'faktör donatımı (bolluk) farkı', 'bol faktör kazanır, kıt faktör kaybeder (Stolper–Samuelson)']];
    const mt = '<thead><tr><th>Model</th><th>Faktörler</th><th>Hareketlilik</th><th>Ticaretin nedeni</th><th>Kim kazanır?</th></tr></thead><tbody>' + MODELS.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('') + '</tbody>';
    const SHOCK = [['Göç (emek artar)', 'ücret düşer; sermaye ve toprak rantı artar; iki sektörün çıktısı da artar', 'ücret ve rant değişmez; emek yoğun sektör büyür, öteki küçülür (Rybczynski)'],
      ['FDI (sermaye girer)', 'ücret artar; sermaye rantı ve toprak rantı düşer; imalat büyür, tarım küçülür', 'ücret ve rant değişmez; sermaye yoğun sektör büyür, öteki küçülür (Rybczynski)'],
      ['İhraç malının fiyatı artar', 'o sektörün özgül faktörü kazanır, ötekinin kaybeder; reel ücret belirsiz', 'o malda yoğun kullanılan faktör kazanır, öteki kaybeder (iki mala göre de)']];
    const st = '<thead><tr><th>Şok</th><th>Kısa dönem (özgül faktörler)</th><th>Uzun dönem (Heckscher–Ohlin)</th></tr></thead><tbody>' + SHOCK.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</tbody>';
    const LAD = [['Kısmi tercih anlaşması', 'seçilmiş mallarda indirimli tarife'], ['Serbest ticaret alanı (FTA)', 'üyeler arası serbest ticaret; her üye dış tarifesini kendi belirler (menşe kuralı gerekir)'], ['Gümrük birliği', 'FTA + ortak dış tarife'], ['Ortak pazar', 'gümrük birliği + emek ve sermayenin serbest dolaşımı'], ['Ekonomik birlik', 'ortak pazar + ekonomik politikaların uyumu'], ['Parasal birlik', 'ortak para politikası, genellikle tek para'], ['Siyasi birlik', 'ortak yasama ve yürütme kurumları']];
    const lt = '<thead><tr><th>Basamak</th><th>Ek yükümlülük</th></tr></thead><tbody>' + LAD.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('') + '</tbody>';
    return `<div class="view wide"><section class="hero"><div class="eyebrow">Hesap araçları</div><h1>Tablolar</h1><p>Ricardo, özgül faktörler, Stolper–Samuelson ve ticaret saptırma hesaplayıcıları; modelleri ve şokları karşılaştıran tablolar. İnternet gerekmez.</p></section>
      <section class="panel"><h3>Ricardo hesaplayıcı</h3><p>Bir işçinin bir günde (saatte) ürettiği miktarları gir: 1. mal yatay eksende (örneğin buğday), 2. mal dikey eksende (örneğin kumaş). Emek sayısı PPF uç noktaları için.</p>
        <div class="calc">${fld('r-a1', 'Home: 1. mal / işçi', 4)}${fld('r-a2', 'Home: 2. mal / işçi', 2)}${fld('r-l', 'Home işçi sayısı', 25)}${fld('r-b1', 'Foreign: 1. mal / işçi', 1)}${fld('r-b2', 'Foreign: 2. mal / işçi', 1)}${fld('r-lf', 'Foreign işçi sayısı', 100)}</div>
        <div class="result" id="r-out" aria-live="polite"></div></section>
      <section class="panel"><h3>Özgül faktörler: rantlar ve reel ücret</h3><p>İmalat fiyatı değişir, tarım fiyatı sabit; ücret değişimi verilir (kitaptaki örnek: %10, %5, 100/60, 100/50). Formüller: $\\frac{\\Delta R_K}{R_K} = \\frac{\\hat P_M \\cdot P_MQ_M - \\hat W \\cdot WL_M}{R_KK}$, $\\frac{\\Delta R_T}{R_T} = \\frac{-\\hat W \\cdot WL_A}{R_TT}$.</p>
        <div class="calc">${fld('s-pm', 'İmalat fiyatı değişimi %', 10)}${fld('s-w', 'Ücret değişimi %', 5)}${fld('s-rm', 'İmalat hasılatı', 100)}${fld('s-lm', 'İmalatta emeğe ödeme', 60)}${fld('s-ra', 'Tarım hasılatı', 100)}${fld('s-la', 'Tarımda emeğe ödeme', 50)}</div>
        <div class="result" id="s-out" aria-live="polite"></div></section>
      <section class="panel"><h3>Stolper–Samuelson ve büyütme etkisi</h3><p>Hasılatta emeğin payı iki sektörde farklı (kitapta bilgisayar %50, ayakkabı %60). Bilgisayar fiyatı değişir, ayakkabı fiyatı sabit. Uygulama $\\hat P_C = a_C\\hat W + (1-a_C)\\hat R$ ve $0 = a_S\\hat W + (1-a_S)\\hat R$ denklemlerini birlikte çözer.</p>
        <div class="calc">${fld('h-ac', 'Bilgisayarda emek payı %', 50)}${fld('h-as', 'Ayakkabıda emek payı %', 60)}${fld('h-pc', 'Bilgisayar fiyatı değişimi %', 10)}</div>
        <div class="result" id="h-out" aria-live="polite"></div></section>
      <section class="panel"><h3>Ticaret yaratma ve saptırma</h3><p>Küçük ithalatçı ülke, tek birim alım, taşıma maliyeti yok. Tarife yalnız dışarıdaki ülkeye (ve anlaşmadan önce ortağa) uygulanır. Ders notundaki örnek: 140, 110, 100 ve %20.</p>
        <div class="calc">${fld('t-h', 'Yurt içi maliyet', 140)}${fld('t-p', 'Ortak ülke maliyeti', 110)}${fld('t-o', 'Dışarıdaki ülke maliyeti', 100)}${fld('t-t', 'MFN tarifesi %', 20)}</div>
        <div class="result" id="t-out" aria-live="polite"></div></section>
      <section class="panel"><h3>Üç model yan yana</h3><div class="tbl"><table>${mt}</table></div></section>
      <section class="panel"><h3>Kısa dönem mi, uzun dönem mi?</h3><p>Sınavda en çok karıştırılan tablo. Önce hangi modelde olduğunu belirle.</p><div class="tbl"><table>${st}</table></div></section>
      <section class="panel"><h3>Ekonomik entegrasyon basamakları</h3><div class="tbl"><table>${lt}</table></div></section></div>`;
  }

  function viewSettings() {
    return `<div class="view"><section class="hero"><div class="eyebrow">Ayarlar</div><h1>Ayarlar ve yedek</h1><p>İlerlemen bu cihazın tarayıcısında saklanır.</p></section>
      <section class="panel"><h3>Tercihler</h3>
        <label class="switch" for="s-theme"><span>Tema</span><select id="s-theme" style="min-height:44px;border-radius:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);padding:0 10px">${[['dark', 'Koyu'], ['light', 'Açık'], ['system', 'Cihaza göre']].map(o => `<option value="${o[0]}" ${(S.set.theme || 'dark') === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>
        <label class="switch" for="s-size"><span>Yazı boyutu</span><select id="s-size" style="min-height:44px;border-radius:10px;border:2px solid var(--line);background:var(--surface);padding:0 10px">${[['m', 'Normal'], ['l', 'Büyük'], ['xl', 'Çok büyük']].map(o => `<option value="${o[0]}" ${S.set.size === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>
        <label class="switch" for="s-sound"><span>Doğru/yanlış sesi</span><input type="checkbox" id="s-sound" ${S.set.sound ? 'checked' : ''}></label>
        <label class="switch" for="s-tr"><span>Türkçe çeviriyi otomatik göster</span><input type="checkbox" id="s-tr" ${S.set.tr ? 'checked' : ''}></label>
        <label class="switch" for="s-goal"><span>Günlük XP hedefi</span><select id="s-goal" style="min-height:40px;border-radius:10px;border:2px solid var(--line);background:var(--surface);padding:0 8px">${[50, 100, 150, 250].map(v => `<option ${S.set.goal === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label></section>
      <section class="panel"><h3>iPad'e uygulama gibi ekle</h3><p>Safari'de bu sayfayı aç, <b>Paylaş</b> düğmesine dokun, <b>Ana Ekrana Ekle</b>'yi seç. Tam ekran açılır, internetsiz de çalışır ve ilerlemen daha güvende kalır.</p></section>
      <section class="panel"><h3>Yedekle ve taşı</h3><p>Başka bir cihaza geçmek için yedek kodunu kopyala, diğer cihazda buraya yapıştırıp yükle.</p>
        <div class="btnrow"><button class="btn sm" id="b-exp">Yedek kodunu kopyala</button></div>
        <label class="field" for="t-imp">Yedek kodu yapıştır<textarea id="t-imp" placeholder='{"v":1, ...}'></textarea></label>
        <div class="btnrow"><button class="btn sm ghost" id="b-imp">Yedeği yükle</button></div></section>
      <section class="panel"><h3>Kalem notları</h3><p>Konu kartlarına, formül kağıdına ve tablolar sayfasına yazdıkların bu cihazda saklanır, yedek koduna girmez. Soru karalamaları sonraki soruya geçince, deneme sınavındakiler sınav bitince silinir.</p><p class="num" id="ink-n">Notlar sayılıyor…</p><div class="btnrow"><button class="btn sm bad" id="b-ink">Tüm notları sil</button></div></section>
      <section class="panel"><h3>Sıfırla</h3><p>Tüm ilerleme, XP ve hata listesi silinir. Geri alınamaz.</p><div class="btnrow"><button class="btn sm bad" id="b-reset">İlerlemeyi sıfırla</button></div></section></div>`;
  }

  function bindView(main, r) {
    bindActs(main);
    main.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => openLessonIntro(b.dataset.lesson)));
    main.querySelectorAll('[data-practice]').forEach(b => b.addEventListener('click', () => startPractice(b.dataset.practice)));
    if (r === 'hesap') Calc.mountPage(main);
    if (r === 'tablolar') {
      const g = (id) => { const v = $('#' + id).value.trim().replace(',', '.'); return v === '' ? NaN : Number(v); };
      const f = (x, d = 3) => { const s = (+x).toFixed(d).replace(/\.?0+$/, ''); return s === '-0' ? '0' : s; };
      const pc = (x) => (x > 0 ? '+' : '') + f(x, 2) + '%';
      const ric = () => {
        const a1 = g('r-a1'), a2 = g('r-a2'), L = g('r-l'), b1 = g('r-b1'), b2 = g('r-b2'), Lf = g('r-lf'), out = $('#r-out');
        if (![a1, a2, L, b1, b2, Lf].every(v => v > 0)) { out.textContent = 'Altı kutuya da pozitif sayı gir.'; return; }
        const oH = a2 / a1, oF = b2 / b1; // 1 birim 1. malın fırsat maliyeti (2. mal cinsinden) = otarşide P1/P2
        const abs1 = a1 > b1 ? 'Home' : a1 < b1 ? 'Foreign' : 'ikisi eşit', abs2 = a2 > b2 ? 'Home' : a2 < b2 ? 'Foreign' : 'ikisi eşit';
        const ca = oH < oF ? ['Home', 'Foreign'] : oH > oF ? ['Foreign', 'Home'] : null;
        out.innerHTML = `<b>Mutlak üstünlük:</b> 1. malda ${abs1}, 2. malda ${abs2} (işçi başına daha çok üreten).<br>` +
          `<b>1 birim 1. malın fırsat maliyeti:</b> Home ${f(oH)} · Foreign ${f(oF)} birim 2. mal.<br>` +
          `<b>1 birim 2. malın fırsat maliyeti:</b> Home ${f(1 / oH)} · Foreign ${f(1 / oF)} birim 1. mal.<br>` +
          (ca ? `<b>Karşılaştırmalı üstünlük:</b> 1. malda ${ca[0]}, 2. malda ${ca[1]}. ${ca[0]} 1. malı, ${ca[1]} 2. malı ihraç eder.<br>` : '<b>Karşılaştırmalı üstünlük yok:</b> fırsat maliyetleri eşit, ticaretten kazanç yok.<br>') +
          `<b>Otarşi fiyatı</b> $P_1/P_2 = MPL_2/MPL_1$: Home ${f(oH)} · Foreign ${f(oF)}.<br>` +
          (ca ? `<b>Dünya fiyatı aralığı:</b> ${f(Math.min(oH, oF))} &lt; $P_1/P_2$ &lt; ${f(Math.max(oH, oF))} olursa iki ülke de tam uzmanlaşır ve kazanır.<br>` : '') +
          `<b>PPF uç noktaları:</b> Home ${f(a1 * L)} birim 1. mal ya da ${f(a2 * L)} birim 2. mal (eğim −${f(oH)}); Foreign ${f(b1 * Lf)} ya da ${f(b2 * Lf)} (eğim −${f(oF)}).`;
        if (window.renderMathInElement) renderMathInElement(out, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
      };
      const sf = () => {
        const pm = g('s-pm') / 100, w = g('s-w') / 100, rm = g('s-rm'), lm = g('s-lm'), ra = g('s-ra'), la = g('s-la'), out = $('#s-out');
        if (![pm, w, rm, lm, ra, la].every(isFinite) || !(rm > lm) || !(ra > la) || !(lm > 0) || !(la > 0)) { out.textContent = 'Hasılat emeğe ödemeden büyük, ödemeler pozitif olmalı.'; return; }
        const rk = (pm * rm - w * lm) / (rm - lm), rt = (-w * la) / (ra - la);
        out.innerHTML = `<b>Sermaye rantı:</b> ${pc(rk * 100)} &nbsp; <b>Toprak rantı:</b> ${pc(rt * 100)}<br>` +
          `<b>Reel ücret:</b> imalat malı cinsinden ${pc(((1 + w) / (1 + pm) - 1) * 100)}, tarım malı cinsinden ${pc(w * 100)}.<br>` +
          `<small>Kitaptaki sıralama ($P_M$ artarken): $\\hat R_T < 0 < \\hat W < \\hat P_M < \\hat R_K$. ${rt < 0 && w > 0 && w < pm && rk > pm ? 'Bu sayılar sıralamaya uyuyor.' : 'Bu sayılar kitaptaki sıralamaya uymuyor; ücret değişimi 0 ile fiyat değişimi arasında olmalı.'}</small>`;
        if (window.renderMathInElement) renderMathInElement(out, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
      };
      const ss = () => {
        const ac = g('h-ac') / 100, as = g('h-as') / 100, p = g('h-pc'), out = $('#h-out');
        if (!(ac > 0 && ac < 1 && as > 0 && as < 1) || !isFinite(p) || Math.abs(ac - as) < 1e-9) { out.textContent = 'Paylar 0 ile 100 arasında ve birbirinden farklı olmalı.'; return; }
        const W = p / (ac - (1 - ac) * as / (1 - as)), R = -as / (1 - as) * W;
        const lab = ac < as ? 'Bilgisayar sermaye yoğun (emek payı daha düşük).' : 'Bilgisayar emek yoğun (emek payı daha yüksek).';
        out.innerHTML = `<b>Ücret:</b> ${pc(W)} &nbsp; <b>Sermaye rantı:</b> ${pc(R)}<br>${lab} Fiyatı artan malda yoğun kullanılan faktörün getirisi, fiyattan da hızlı artar; öteki faktörünki düşer (büyütme etkisi).<br><small>Kontrol: bilgisayar ${f(ac * W + (1 - ac) * R, 2)}%, ayakkabı ${f(as * W + (1 - as) * R, 2)}%.</small>`;
      };
      const td = () => {
        const h = g('t-h'), p = g('t-p'), o = g('t-o'), t = g('t-t') / 100, out = $('#t-out');
        if (![h, p, o].every(v => v > 0) || !(t >= 0)) { out.textContent = 'Maliyetler pozitif, tarife sıfır ya da pozitif olmalı.'; return; }
        const before = [['Yurt içi', h, 0], ['Ortak', p * (1 + t), p * t], ['Dışarıdaki', o * (1 + t), o * t]].sort((x, y) => x[1] - y[1])[0];
        const after = [['Yurt içi', h, 0], ['Ortak', p, 0], ['Dışarıdaki', o * (1 + t), o * t]].sort((x, y) => x[1] - y[1])[0];
        const cons = before[1] - after[1], rev = after[2] - before[2], wel = cons + rev;
        const kind = before[0] === after[0] ? 'Tedarikçi değişmedi: anlaşmanın etkisi yok.' : before[0] === 'Yurt içi' && after[0] === 'Ortak' ? 'Ticaret yaratma: pahalı yurt içi üretimin yerini daha ucuz ithalat aldı.' : after[0] === 'Ortak' ? 'Ticaret saptırma: alım, en ucuz üreticiden (dışarıdaki ülke) daha pahalı ortağa kaydı.' : 'Tedarikçi değişti.';
        out.innerHTML = `<b>Önce:</b> ${before[0]} ülke, fiyat ${f(before[1], 2)} (tarife geliri ${f(before[2], 2)}). <b>Sonra:</b> ${after[0]} ülke, fiyat ${f(after[1], 2)}.<br>${kind}<br><b>Tüketici kazancı</b> ${f(cons, 2)} · <b>tarife geliri değişimi</b> ${f(rev, 2)} · <b>ülke refahı</b> ${wel > 0 ? '+' : ''}${f(wel, 2)}.`;
      };
      ['r-a1', 'r-a2', 'r-l', 'r-b1', 'r-b2', 'r-lf'].forEach(id => $('#' + id).addEventListener('input', ric)); ric();
      ['s-pm', 's-w', 's-rm', 's-lm', 's-ra', 's-la'].forEach(id => $('#' + id).addEventListener('input', sf)); sf();
      ['h-ac', 'h-as', 'h-pc'].forEach(id => $('#' + id).addEventListener('input', ss)); ss();
      ['t-h', 't-p', 't-o', 't-t'].forEach(id => $('#' + id).addEventListener('input', td)); td();
    }
    if (r === 'ayarlar') {
      $('#s-size').onchange = (e) => { S.set.size = e.target.value; applySize(); save(); };
      $('#s-theme').onchange = (e) => { S.set.theme = e.target.value; applySize(); save(); if (window.Ink && Ink.recolor) Ink.recolor(); };
      $('#s-sound').onchange = (e) => { S.set.sound = e.target.checked; save(); };
      $('#s-tr').onchange = (e) => { S.set.tr = e.target.checked; save(); };
      $('#s-goal').onchange = (e) => { S.set.goal = +e.target.value; save(); renderAside(); };
      $('#b-exp').onclick = async () => { const s = JSON.stringify(S); try { await navigator.clipboard.writeText(s); toast('Yedek kodu kopyalandı'); } catch (e) { $('#t-imp').value = s; $('#t-imp').select(); toast('Kod kutuya yazıldı, elle kopyala'); } };
      $('#b-imp').onclick = () => { try { const o = JSON.parse($('#t-imp').value); if (o.v !== 1 || typeof o.xp !== 'number') throw 0; S = Object.assign(blank(), o); S.set = Object.assign(blank().set, S.set); applySize(); save(); toast('Yedek yüklendi'); route(); } catch (e) { toast('Bu bir yedek kodu değil. Kodun tamamını yapıştır.'); } };
      Ink.count().then(n => { const x = $('#ink-n'); if (x) x.textContent = n ? n + ' sayfada not var.' : 'Henüz not yok.'; });
      $('#b-ink').onclick = async () => { if (await confirmBox('Tüm notlar silinsin mi?', 'Konu kartlarına, formül kağıdına ve tablolara yazdığın her şey silinecek. Geri alınamaz.', 'Evet, sil', 'Vazgeç', true)) { await Ink.clearAll(); const x = $('#ink-n'); if (x) x.textContent = 'Henüz not yok.'; toast('Notlar silindi'); } };
      $('#b-reset').onclick = async () => { if (await confirmBox('İlerleme silinsin mi?', 'XP, tamamlanan dersler, hata listesi ve deneme sonuçları silinecek.', 'Evet, sıfırla', 'Vazgeç', true)) { S = blank(); applySize(); save(); toast('İlerleme sıfırlandı'); route(); } };
    }
  }

  /* ---------- oynatıcı ---------- */
  let P = null; // aktif oturum
  function playerShell() {
    let el = $('#player');
    if (!el) { el = document.createElement('div'); el.id = 'player'; el.className = 'player'; document.body.appendChild(el); }
    document.body.style.overflow = 'hidden';
    return el;
  }
  function closePlayer() { Calc.close(); const el = $('#player'); if (el) el.remove(); document.body.style.overflow = ''; P = null; clearInterval(timerI); refresh(); }

  function openLessonIntro(id) {
    const L = LESSON[id];
    if (!lessonDone(id)) return startLesson(id, false);
    const el = playerShell();
    Ink.unbind();
    el.innerHTML = `<div class="p-top"><button class="iconbtn" id="p-x" aria-label="Kapat">${I.x}</button><div style="flex:1"></div></div>
      <div class="p-body"><div class="p-inner"><div class="cardhead"><div class="eyebrow">${esc(UNIT[L.unit].week)} · tekrar</div><h2>${esc(L.title)}</h2></div>
      <p>Bu dersi ${lessonDone(id)} kez bitirdin. Sorular her seferinde karışık gelir, sayısal olanlar yeni sayılarla üretilir.</p>
      <div class="btnrow"><button class="btn" id="i-q">Sadece sorular</button><button class="btn ghost" id="i-c">Konuyu baştan oku</button></div></div></div><div></div>`;
    $('#p-x').onclick = closePlayer;
    $('#i-q').onclick = () => startLesson(id, true);
    $('#i-c').onclick = () => startLesson(id, false);
  }

  function startLesson(id, skipCards) {
    const L = LESSON[id];
    const items = [];
    if (!skipCards) L.cards.forEach((c, i) => items.push({ type: 'card', card: c, n: i + 1, of: L.cards.length }));
    lessonQueue(L).forEach(q => items.push({ type: 'q', q: inst(q), first: true }));
    P = { mode: 'lesson', id, title: L.title, items, i: 0, nq: items.filter(x => x.type === 'q').length, right: 0, firstRight: 0, xp: 0, wrong: 0 };
    playerShell(); renderStep();
  }
  function startPractice(u) {
    const items = unitQueue(u, 10).map(q => ({ type: 'q', q: inst(q), first: true }));
    P = { mode: 'practice', id: u, title: UNIT[u].title + ' · tekrar', items, i: 0, nq: items.length, right: 0, firstRight: 0, xp: 0, wrong: 0 };
    playerShell(); renderStep();
  }
  function startTB() {
    const items = wpick(TB_IDS, 10).map(id => ({ type: 'q', q: inst(id), first: true }));
    P = { mode: 'tb', id: 'tb', title: 'Test bankası', items, i: 0, nq: items.length, right: 0, firstRight: 0, xp: 0, wrong: 0 };
    playerShell(); renderStep();
  }
  function startMist() {
    const ids = Object.keys(S.mist).sort((a, b) => S.mist[b].n - S.mist[a].n || S.mist[b].t - S.mist[a].t).slice(0, 10);
    if (!ids.length) { toast('Hata listen boş'); return; }
    const items = shuffle(ids).filter(id => id.startsWith('g:') ? GENMETA[id.slice(2)] : QBY[id]).map(id => ({ type: 'q', q: inst(id), first: true }));
    P = { mode: 'mist', id: 'mist', title: 'Hatalarım', items, i: 0, nq: items.length, right: 0, firstRight: 0, xp: 0, wrong: 0 };
    playerShell(); renderStep();
  }

  function topBar(progress, count) {
    return `<div class="p-top"><button class="iconbtn" id="p-x" aria-label="Dersten çık">${I.x}</button>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}"><i style="width:${Math.max(3, progress * 100)}%"></i></div><span class="p-count num">${count}</span><button class="iconbtn" data-calc-toggle aria-pressed="false" aria-label="Hesap makinesi" title="Hesap makinesi">${I.calc}</button><button class="iconbtn" data-ink-toggle aria-pressed="false" aria-label="Kalemle yaz" title="Kalemle yaz">${I.pen}</button></div>`;
  }
  async function askQuit() {
    if (P && P.mode !== 'exam' && P.i > 0 && P.i < P.items.length) {
      if (!(await confirmBox('Dersten çıkılsın mı?', 'Bu turdaki ilerleme kaydedilmez ama çözdüğün soruların sonuçları ve hataların kayıtlı kalır.', 'Çık', 'Devam et'))) return;
    }
    closePlayer();
  }

  function qHTML(q, opts) {
    opts = opts || {};
    const tr = S.set.tr;
    const body = `<div class="qmeta">${q.gen ? '<span class="pill">Yeni üretilmiş soru</span>' : ''}${q.src ? `<span class="pill mark">${esc(/^TB /.test(q.src) ? q.src.replace(/^TB (\d+)\.(\d+)/, 'Test bankası · Böl. $1 Soru $2') : q.src.replace(/^PS(\d)/, 'Problem Set $1').replace(/ Q(\d+)([a-z]?)/, ' · Soru $1$2') + ' benzeri')}</span>` : ''}
        <span class="eyebrow">${esc(SHORT[q.unit])}</span><span style="flex:1"></span><button class="trbtn" id="trb" aria-pressed="${tr}">Türkçe</button></div>
      <div class="qstem prose">${md(q.en)}</div>
      <div class="qtr" id="qtr" ${tr ? '' : 'hidden'}>${md(q.tr)}</div>
      <div class="opts" role="radiogroup" aria-label="Şıklar">${q.opts.map((o, k) => `<button class="opt" role="radio" aria-checked="false" data-k="${k}"><span class="lt">${'ABCDE'[k]}</span><span class="opt-c">${inline(o.t)}</span></button>`).join('')}</div>`;
      if (!opts.aids) return body;
    return `<div class="q-main">${opts.pre || ''}${body}</div>${aidsHTML(q)}`;
  }
  function bindTR(el) { const b = $('#trb', el); if (b) b.onclick = () => { S.set.tr = !S.set.tr; save(); b.setAttribute('aria-pressed', S.set.tr); $('#qtr', el).hidden = !S.set.tr; }; }

  /* ---------- öğrenme yardımları: formüller, ipucu, konu kartı, çözüm ---------- */
  function cardFor(q) {
    const L = LESSON[q.lesson]; if (!L || !L.cards.length) return -1;
    const words = (s) => (String(s).toLowerCase().match(/[a-zçğıöşü]{4,}/g) || []);
    const qw = new Set(words(q.en + ' ' + q.tr + ' ' + (q.hint || '')));
    let best = 0, bs = -1;
    L.cards.forEach((c, i) => { const seen = new Set(); let sc = 0; words(c.title + ' ' + c.body).forEach(w => { if (qw.has(w) && !seen.has(w)) { seen.add(w); sc++; } }); if (sc > bs) { bs = sc; best = i; } });
    return best;
  }
  function aidsHTML(q) {
    const fx = AID.fx[q.lesson] || [], open = S.set.aidfx !== false;
    return `<div class="aids" id="aids">
      <div class="aid-bar" role="group" aria-label="Öğrenme yardımları">
        <button type="button" class="aid" id="aid-fx" aria-pressed="${open}">${I.sigma}<span>Formüller</span></button>
        <button type="button" class="aid" id="aid-hint" aria-pressed="false">${I.bulb}<span>İpucu</span></button>
        <button type="button" class="aid" id="aid-card">${I.book}<span>Konuyu aç</span></button>
        <button type="button" class="aid" id="aid-sol" aria-pressed="false">${I.eye}<span>Çözümü göster</span></button>
      </div>
      <div class="aid-box fx-box" id="box-fx" ${open ? '' : 'hidden'}><div class="aid-t">Bu dersin formülleri</div>${fx.length ? fx.map(x => `<div class="fx"><div class="fx-f">${inline(x.f)}</div>${x.c ? `<div class="fx-c">${inline(x.c)}</div>` : ''}</div>`).join('') : '<p class="fx-c">Bu derste formül yok; kavram dersi. Konuyu aç ile kartı oku.</p>'}</div>
      <div class="aid-box hint-box" id="box-hint" hidden></div>
      <div class="aid-box sol-box" id="box-sol" hidden></div>
    </div>`;
  }
  function bindAids(el, it, q) {
    const fxb = $('#aid-fx', el); if (!fxb) return;
    fxb.onclick = () => { const box = $('#box-fx', el); box.hidden = !box.hidden; S.set.aidfx = !box.hidden; fxb.setAttribute('aria-pressed', String(!box.hidden)); save(); };
    $('#aid-hint', el).onclick = () => {
      const box = $('#box-hint', el), b = $('#aid-hint', el);
      if (!box.hidden) { box.hidden = true; b.setAttribute('aria-pressed', 'false'); return; }
      const L = LESSON[q.lesson], ci = cardFor(q);
      const text = q.hint || `Bu soru **${L && ci >= 0 ? L.cards[ci].title : 'bu ders'}** konusuyla ilgili. Konuyu aç'a bas, oradaki tanımı ya da formülü bul. Formüller kutusuna da bak.`;
      box.innerHTML = `<div class="aid-t">İpucu</div><div class="prose">${md(text)}</div>`;
      typeset(box); box.hidden = false; b.setAttribute('aria-pressed', 'true');
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      it.aid = Math.max(it.aid || 0, 1);
    };
    $('#aid-card', el).onclick = () => openCardSheet(q);
    $('#aid-sol', el).onclick = () => {
      const box = $('#box-sol', el), b = $('#aid-sol', el);
      if (!box.hidden) { box.hidden = true; b.setAttribute('aria-pressed', 'false'); return; }
      box.innerHTML = `<div class="aid-t">Çözüm</div><div class="prose">${md(q.ex)}</div>${Calc.stepsHTML(q.ex, false)}<p class="fx-c">Çözüme baktığın için bu soru tur sonunda yardımsız bir kez daha gelecek.</p>`;
      typeset(box); box.hidden = false; b.setAttribute('aria-pressed', 'true');
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      it.aid = 2;
    };
  }
  function openCardSheet(q) {
    const L = LESSON[q.lesson]; if (!L || !L.cards.length) { toast('Bu soru için kart bulunamadı'); return; }
    const old = $('.sheet-bg'); if (old) old.remove();
    const sh = document.createElement('div'); sh.className = 'sheet-bg';
    sh.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Konu kartları"><div class="sheet-head"><b>${esc(L.title)}</b><button class="iconbtn" data-x aria-label="Kapat">${I.x}</button></div>
      <div class="sheet-tabs">${L.cards.map((c, i) => `<button type="button" class="stab" data-i="${i}">${inline(c.title)}</button>`).join('')}</div><div class="sheet-body prose"></div></div>`;
    document.body.appendChild(sh);
    const body = sh.querySelector('.sheet-body');
    const show = (i) => {
      body.innerHTML = `<h3>${inline(L.cards[i].title)}</h3>` + md(L.cards[i].body);
      typeset(body); body.scrollTop = 0;
      sh.querySelectorAll('.stab').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
      const t = sh.querySelector(`.stab[data-i="${i}"]`); if (t) t.scrollIntoView({ block: 'nearest', inline: 'center' });
    };
    show(Math.max(0, cardFor(q)));
    sh.addEventListener('click', (e) => {
      if (e.target === sh || e.target.closest('[data-x]')) { sh.remove(); return; }
      const t = e.target.closest('.stab'); if (t) show(+t.dataset.i);
    });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const s = $('.sheet-bg'); if (s) s.remove(); } });

  function renderStep() {
    const el = $('#player'); if (!el || !P) return;
    if (P.i >= P.items.length) return renderFinish();
    const it = P.items[P.i];
    const prog = P.i / P.items.length;
    if (it.type === 'card') {
      el.innerHTML = topBar(prog, `${it.n}/${it.of}`) + `<div class="p-body"><div class="p-inner"><div class="cardhead"><div class="eyebrow">Konu ${it.n} / ${it.of} · ${esc(P.title)}</div><h2>${inline(it.card.title)}</h2></div><div class="prose">${md(it.card.body)}</div></div></div>
        <div class="p-foot"><div class="p-foot-in"><div class="btnrow" style="justify-content:space-between">${it.n > 1 ? '<button class="btn ghost" id="b-back">Geri</button>' : '<span></span>'}<button class="btn" id="b-next" style="min-width:200px">${it.n === it.of ? 'Sorulara geç' : 'Devam'}</button></div></div></div>`;
      typeset(el);
      $('#p-x').onclick = askQuit;
      $('#b-next').onclick = () => { P.i++; renderStep(); };
      const bb = $('#b-back'); if (bb) bb.onclick = () => { P.i--; renderStep(); };
      $('.p-body', el).scrollTop = 0;
      Ink.bind({ key: 'c:' + P.id + ':' + it.n, mode: 'player', scroller: $('.p-body', el), anchor: $('.p-inner', el) });
      return;
    }
    const q = it.q; let sel = null, checked = false;
    const qi = P.items.slice(0, P.i + 1).filter(x => x.type === 'q').length;
    el.innerHTML = topBar(prog, `${qi}/${P.items.filter(x => x.type === 'q').length}`) + `<div class="p-body"><div class="p-inner q-split">${qHTML(q, { aids: true, pre: it.first ? '' : '<span class="pill bad" style="justify-self:start">Tekrar soru</span>' })}</div></div>
      <div class="p-foot" id="foot"><div class="p-foot-in"><button class="btn block" id="b-check" disabled>Kontrol et</button></div></div>`;
    typeset(el); bindTR(el);
    $('#p-x').onclick = askQuit;
    $('.p-body', el).scrollTop = 0;
    Ink.bind({ key: null, mode: 'player', scroller: $('.p-body', el), anchor: $('.p-inner', el) });
    bindAids(el, it, q);
    const optEls = [...el.querySelectorAll('.opt')];
    const choose = (k) => { if (checked) return; sel = k; optEls.forEach((b, j) => { b.classList.toggle('sel', j === k); b.setAttribute('aria-checked', j === k); }); $('#b-check').disabled = false; };
    optEls.forEach(b => b.onclick = () => choose(+b.dataset.k));
    const check = () => {
      if (sel == null || checked) return; checked = true;
      const ok = q.opts[sel].ok, ci = q.opts.findIndex(o => o.ok);
      optEls.forEach((b, j) => { b.disabled = true; if (j === ci) b.classList.add('right'); if (j === sel && !ok) b.classList.add('wrong', 'shake'); b.classList.remove('sel'); });
      const aid = it.aid || 0; // 1: ipucu, 2: çözüme bakıldı
      rec(q, aid === 2 ? false : ok, it.first, P.mode);
      let gain = 0;
      if (ok) { P.right++; if (it.first && aid < 2) P.firstRight++; gain = aid === 2 ? 2 : !it.first ? 5 : aid ? 6 : 10; P.xp += gain; addXP(gain); }
      else P.wrong++;
      if (it.first && (!ok || aid === 2)) P.items.push({ type: 'q', q: q.gen ? inst(q.qid) : Object.assign({}, q, { opts: shuffle(q.opts) }), first: false });
      const sb = $('#aid-sol', el); if (sb) sb.disabled = true;
      save(); beep(ok);
      const foot = $('#foot');
      foot.className = 'p-foot slide-up ' + (ok ? 'ok' : 'bad');
      foot.innerHTML = `<div class="p-foot-in"><div class="fb-head">${ok ? I.ok : I.bad}<span>${ok ? pick(['Doğru!', 'Harika!', 'Aynen böyle.', 'Tam isabet.']) + (gain ? ` <span class="pill ok">+${gain} XP</span>` : '') : 'Doğru cevap: ' + 'ABCDE'[ci]}</span></div>
        <div class="fb-ex prose">${md(q.ex)}${Calc.stepsHTML(q.ex, true)}${it.first && (!ok || aid === 2) ? `<p><small>${aid === 2 ? 'Çözüme bakarak cevapladın. ' : ''}Bu soru turun sonunda yardımsız tekrar gelecek.</small></p>` : ''}</div>
        <button class="btn block ${ok ? 'ok' : 'bad'}" id="b-cont">Devam</button></div>`;
      typeset(foot);
      $('#b-cont').onclick = () => { P.i++; renderStep(); };
      $('#b-cont').focus({ preventScroll: true });
    };
    $('#b-check').onclick = check;
    P.key = (e) => {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      const k = e.key.toLowerCase(); const m = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      if (m[k] != null && m[k] < optEls.length) choose(m[k]);
      else if (k === 'enter') { e.preventDefault(); if (!checked) check(); else { const b = $('#b-cont'); b && b.click(); } }
    };
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  document.addEventListener('keydown', (e) => { if (P && P.key && $('#player') && !$('.modal-bg')) P.key(e); });

  function renderFinish() {
    const el = $('#player');
    Ink.unbind();
    const acc = P.nq ? P.firstRight / P.nq : 0;
    let bonus = 0;
    if (P.mode === 'lesson') { const s = S.les[P.id] || { n: 0, best: 0 }; s.n++; s.best = Math.max(s.best || 0, acc); S.les[P.id] = s; bonus = 20; }
    else if (P.mode === 'practice' || P.mode === 'tb') bonus = 15; else bonus = 10;
    addXP(bonus); P.xp += bonus; save();
    const pts = [[20, 112], [48, 96], [70, 102], [98, 78], [124, 84], [150, 60], [178, 64], [204, 42], [232, 36], [258, 22]];
    const msg = acc >= 0.85 ? 'Bu konu sende.' : acc >= 0.6 ? 'İyi gidiyor. Yanlışlar Hatalarım listesinde.' : 'Bu konuyu bir kez daha çöz, ikinci turda oturur.';
    const nl = nextLesson();
    el.innerHTML = `<div class="p-top"><button class="iconbtn" id="p-x" aria-label="Kapat">${I.x}</button><div class="bar"><i style="width:100%"></i></div><span class="p-count">bitti</span></div>
      <div class="p-body"><div class="p-inner finish">
        <svg class="fit" viewBox="0 0 280 130" aria-hidden="true"><line x1="10" y1="122" x2="270" y2="122" stroke="var(--line)" stroke-width="2"/><line x1="10" y1="8" x2="10" y2="122" stroke="var(--line)" stroke-width="2"/>
          ${pts.map((p, k) => `<circle class="fit-dot" style="animation-delay:${k * 60}ms" cx="${p[0]}" cy="${p[1]}" r="6" fill="var(--ink-3)"/>`).join('')}
          <path class="fit-line" d="M14 116 L268 22" stroke="var(--pen)" stroke-width="5" stroke-linecap="round" fill="none"/></svg>
        <div class="eyebrow">${esc(P.title)}</div><div class="big num">+${P.xp} XP</div><p>${msg}</p>
        <div class="kv"><div class="stat"><b class="num">%${Math.round(acc * 100)}</b><span>ilk denemede doğru</span></div><div class="stat"><b class="num">${P.firstRight}/${P.nq}</b><span>soru</span></div><div class="stat hot"><b class="num">${streak()}</b><span>gün seri</span></div></div>
      </div></div>
      <div class="p-foot"><div class="p-foot-in"><div class="btnrow" style="justify-content:center">${P.mode === 'lesson' && nl ? `<button class="btn" id="f-next">Sonraki ders: ${esc(LESSON[nl].title)}</button>` : ''}<button class="btn ghost" id="f-again">Tekrar çöz</button><button class="btn ghost" id="f-home">Patikaya dön</button></div></div></div>`;
    const mode = P.mode, id = P.id;
    $('#p-x').onclick = closePlayer; $('#f-home').onclick = closePlayer;
    $('#f-again').onclick = () => { mode === 'lesson' ? startLesson(id, true) : mode === 'practice' ? startPractice(id) : mode === 'tb' ? startTB() : startMist(); };
    const fn = $('#f-next'); if (fn) fn.onclick = () => startLesson(nl, false);
    P.key = null;
  }

  /* ---------- deneme sınavı ---------- */
  let timerI = 0;
  function buildExam() {
    const out = [];
    for (const [u, k] of Object.entries(EXAM_W)) {
      const unit = UNIT[u];
      const st = shuffle(unit.lessons.flatMap(l => l.qs.map(q => q.id)));
      const gens = shuffle([...new Set(unit.lessons.flatMap(l => l.gens))]);
      const nG = Math.min(gens.length, Math.round(k * 0.5));
      const ids = [...gens.slice(0, nG).map(g => 'g:' + g), ...st.slice(0, k - nG)];
      shuffle(ids).forEach(id => out.push(inst(id)));
    }
    return out;
  }
  function startExam() {
    if (!S.run) { Ink.clearPrefix('x:'); S.run = { qs: buildExam(), ans: Array(40).fill(null), flag: [], i: 0, prior: 0 }; save(); }
    S.run.start = Date.now();
    P = { mode: 'exam' }; playerShell(); renderExamQ();
    clearInterval(timerI); timerI = setInterval(() => { const t = $('#ex-t'); if (t && S.run) t.textContent = fmtTime(S.run.prior + Date.now() - S.run.start); }, 1000);
  }
  function pauseExam() { if (S.run && S.run.start) { S.run.prior += Date.now() - S.run.start; S.run.start = Date.now(); save(); } }
  function renderExamQ() {
    const el = $('#player'), R = S.run, q = R.qs[R.i];
    const answered = R.ans.filter(a => a != null).length;
    el.innerHTML = `<div class="p-top"><button class="iconbtn" id="p-x" aria-label="Sınavı duraklat ve çık">${I.x}</button>
        <div class="bar"><i style="width:${Math.max(3, answered / 40 * 100)}%"></i></div><span class="p-count num" id="ex-t">${fmtTime(R.prior + Date.now() - R.start)}</span><button class="iconbtn" data-calc-toggle aria-pressed="false" aria-label="Hesap makinesi" title="Hesap makinesi">${I.calc}</button><button class="iconbtn" data-ink-toggle aria-pressed="false" aria-label="Kalemle yaz" title="Kalemle yaz">${I.pen}</button></div>
      <div class="p-body"><div class="p-inner"><div class="qmeta"><span class="pill">Soru ${R.i + 1} / 40</span><span class="pill ${answered === 40 ? 'ok' : ''}">${answered} cevaplandı</span><button class="trbtn" id="fl" aria-pressed="${R.flag.includes(R.i)}">İşaretle</button></div>${qHTML(q)}
        <details id="map"><summary>Soru haritası</summary><div class="ex-grid" style="margin-top:12px">${R.qs.map((_, k) => `<button class="ex-cell ${R.ans[k] != null ? 'ans' : ''} ${k === R.i ? 'cur' : ''} ${R.flag.includes(k) ? 'flag' : ''}" data-j="${k}">${k + 1}</button>`).join('')}</div></details></div></div>
      <div class="p-foot"><div class="p-foot-in"><div class="btnrow" style="justify-content:space-between"><button class="btn ghost" id="e-prev" ${R.i ? '' : 'disabled'}>Önceki</button>
        ${R.i < 39 ? '<button class="btn" id="e-next" style="min-width:160px">Sonraki</button>' : '<button class="btn ok" id="e-fin" style="min-width:160px">Sınavı bitir</button>'}</div>
        ${R.i < 39 ? '<button class="btn ghost sm" id="e-fin2">Sınavı şimdi bitir</button>' : ''}</div></div>`;
    typeset(el); bindTR(el);
    const optEls = [...el.querySelectorAll('.opt')];
    const mark = () => optEls.forEach((b, j) => { b.classList.toggle('sel', R.ans[R.i] === j); b.setAttribute('aria-checked', R.ans[R.i] === j); });
    mark();
    optEls.forEach(b => b.onclick = () => { R.ans[R.i] = +b.dataset.k; mark(); save(); el.querySelector(`.ex-cell[data-j="${R.i}"]`).classList.add('ans'); });
    const go = (j) => { R.i = j; save(); renderExamQ(); };
    $('#e-prev').onclick = () => go(R.i - 1);
    const n = $('#e-next'); if (n) n.onclick = () => go(R.i + 1);
    [$('#e-fin'), $('#e-fin2')].forEach(b => b && (b.onclick = finishExam));
    $('#fl').onclick = () => { const k = R.flag.indexOf(R.i); k < 0 ? R.flag.push(R.i) : R.flag.splice(k, 1); save(); renderExamQ(); };
    el.querySelectorAll('.ex-cell').forEach(c => c.onclick = () => go(+c.dataset.j));
    $('#p-x').onclick = () => { pauseExam(); toast('Sınav duraklatıldı, kaldığın yerden devam edebilirsin'); closePlayer(); };
    P.key = (e) => { const k = e.key.toLowerCase(), m = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 }; if (m[k] != null && optEls[m[k]]) optEls[m[k]].click(); else if (k === 'arrowright' && R.i < 39) go(R.i + 1); else if (k === 'arrowleft' && R.i > 0) go(R.i - 1); };
    $('.p-body', el).scrollTop = 0;
    Ink.bind({ key: 'x:' + R.i, mode: 'player', scroller: $('.p-body', el), anchor: $('.p-inner', el) });
  }
  async function finishExam() {
    const R = S.run, empty = R.ans.filter(a => a == null).length;
    if (empty && !(await confirmBox('Sınav bitirilsin mi?', `${empty} soru boş. Boş sorular yanlış sayılır.`, 'Bitir', 'Geri dön'))) return;
    pauseExam(); clearInterval(timerI);
    let c = 0; const byU = {};
    R.qs.forEach((q, k) => { const ok = R.ans[k] != null && q.opts[R.ans[k]].ok; if (ok) c++; byU[q.unit] = byU[q.unit] || [0, 0]; byU[q.unit][1]++; if (ok) byU[q.unit][0]++; rec(q, ok, true, 'exam'); });
    const score = Math.round(c / 40 * 100), dur = R.prior;
    addXP(c * 3 + 20);
    S.exams.push({ at: Date.now(), score, c, dur, byU });
    const done = R; S.run = null; save();
    Ink.unbind(); Ink.clearPrefix('x:');
    renderExamResult(done, score, c, byU, dur);
  }
  function renderExamResult(R, score, c, byU, dur) {
    const el = $('#player');
    Ink.unbind();
    const rows = Object.keys(EXAM_W).map(u => { const v = byU[u] || [0, 0]; return `<tr><td>${esc(SHORT[u])} · ${esc(UNIT[u].title)}</td><td class="num">${v[0]}/${v[1]}</td><td class="num">%${v[1] ? Math.round(v[0] / v[1] * 100) : 0}</td></tr>`; }).join('');
    el.innerHTML = `<div class="p-top"><button class="iconbtn" id="p-x" aria-label="Kapat">${I.x}</button><div class="bar"><i style="width:100%"></i></div><span class="p-count num">${fmtTime(dur)}</span></div>
      <div class="p-body"><div class="p-inner">
        <div class="finish"><div class="eyebrow">Deneme sonucu</div><div class="big num">${score} / 100</div><p>${c} doğru, ${40 - c} yanlış. ${score >= 70 ? 'Hedefin üstündesin.' : score >= 60 ? 'Hedef aralığındasın. Yanlışları çalışıp bir deneme daha çöz.' : 'Hedefe ' + (60 - score) + ' puan var. Aşağıdaki en zayıf konudan başla.'}</p></div>
        <div class="tbl"><table><thead><tr><th>Konu</th><th>Doğru</th><th>Başarı</th></tr></thead><tbody>${rows}</tbody></table></div>
        <h2 style="font-size:22px">Soru soru çözümler</h2>
        <div class="review">${R.qs.map((q, k) => { const a = R.ans[k], ci = q.opts.findIndex(o => o.ok), ok = a === ci; return `<div class="rev ${ok ? 'r' : 'w'}"><div class="qmeta"><span class="pill ${ok ? 'ok' : 'bad'}">${k + 1}. ${ok ? 'doğru' : a == null ? 'boş' : 'yanlış'}</span><span class="eyebrow">${esc(SHORT[q.unit])}</span></div>
          <div class="prose">${md(q.en)}</div>
          <div class="prose"><p>${a != null && !ok ? `Senin cevabın: <b>${'ABCDE'[a]})</b> ${inline(q.opts[a].t)}<br>` : ''}Doğru cevap: <b>${'ABCDE'[ci]})</b> ${inline(q.opts[ci].t)}</p></div>
          <details ${ok ? '' : 'open'}><summary>Çözümü göster</summary><div class="prose" style="margin-top:8px">${md(q.ex)}</div>${Calc.stepsHTML(q.ex, false)}</details></div>`; }).join('')}</div>
      </div></div>
      <div class="p-foot"><div class="p-foot-in"><div class="btnrow" style="justify-content:center"><button class="btn" id="r-mist">Yanlışları çalış</button><button class="btn ghost" id="r-home">Patikaya dön</button></div></div></div>`;
    typeset(el);
    $('#p-x').onclick = closePlayer; $('#r-home').onclick = closePlayer;
    $('#r-mist').onclick = () => { startMist(); };
    P.key = null;
  }

  /* ---------- başlat ---------- */
  route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Yeni sürüm hazır. Uygulamayı kapatıp açınca yüklenecek.'); });
      });
    }).catch(() => { });
  }
})();
