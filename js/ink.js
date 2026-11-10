/* Ticaret Patikası — kalem notları
   Apple Pencil yazar; parmak sayfayı kaydırır ve şıklara dokunur (kalem algılanana kadar parmak da yazar).
   İki parmak: yakınlaştır / uzaklaştır ve kaydır. Uzaklaştırınca sayfanın kenarlarında yazacak yer açılır.
   Çizgiler içerik koordinatında saklanır; tuval içeriğin içinde durur, kaydırınca ve zoom yapınca yazıyla birlikte hareket eder.
   Konu kartları, formül kağıdı ve tablolar kalıcı (IndexedDB); soru karalamaları geçici. */
(function () {
  'use strict';
  const TOUCH = 'ontouchstart' in window;
  const PKEY = 'ticaret-patikasi-ink';
  const COLORS = ['ink', 'pen', 'red', 'green', 'hl'];
  const prefs = { tool: 'draw', color: 'pen', size: 1, esize: 1, finger: 1, pen: 0, help: 0 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PKEY) || '{}')); } catch (e) { }
  if (!COLORS.includes(prefs.color)) prefs.color = 'pen';
  if (prefs.tool !== 'er') prefs.tool = 'draw';
  if (![0, 1, 2].includes(prefs.size)) prefs.size = 1;
  if (![0, 1, 2].includes(prefs.esize)) prefs.esize = 1;
  const savePrefs = () => { try { localStorage.setItem(PKEY, JSON.stringify(prefs)); } catch (e) { } };
  const PEN_W = [1.6, 2.8, 4.6], HL_W = [12, 20, 30], ER_W = [14, 30, 56], ZMIN = 0.5, ZMAX = 2.5;
  const CVAR = { ink: '--ink', pen: '--pen', red: '--bad', green: '--ok', hl: '--hl' };
  let toast = () => { };

  /* ---------- depo ---------- */
  const cache = new Map(); // anahtar -> { s: canlı çizgi dizisi, e: kartın uzatıldığı boy }
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res) => {
      try {
        const r = indexedDB.open('ticaret-patikasi-ink', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('notes');
        r.onsuccess = () => res(r.result);
        r.onerror = r.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return dbp;
  }
  async function idb(mode, fn) {
    const d = await db(); if (!d) return undefined;
    return new Promise((res) => {
      try {
        const t = d.transaction('notes', mode), req = fn(t.objectStore('notes'));
        t.oncomplete = () => res(req ? req.result : undefined);
        t.onerror = t.onabort = () => res(undefined);
      } catch (e) { res(undefined); }
    });
  }
  const strip = (arr) => arr.map(s => ({ t: s.t, w: s.w, p: s.p }));
  const store = {
    get: (k) => idb('readonly', s => s.get(k)),
    put: (k, arr, ext) => idb('readwrite', s => (arr.length || ext) ? s.put({ s: strip(arr), e: ext || 0 }, k) : s.delete(k)),
    del: (k) => idb('readwrite', s => s.delete(k)),
    keys: async () => { const k = await idb('readonly', s => s.getAllKeys()); return Array.isArray(k) ? k : null; }
  };

  /* ---------- simgeler ---------- */
  const sv = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    pen: sv('<path d="M4 20l1.3-4.7L15.8 4.8a2.2 2.2 0 0 1 3.1 3.1L8.4 18.4z"/><path d="M13.9 6.7l3.1 3.1"/>'),
    hl: sv('<path d="M14.5 4.5l5 5-8.5 8.5H6v-5z"/><path d="M6 18l-2 2.5h5"/><path d="M12 21h8" stroke="var(--hl)" stroke-width="3.4"/>'),
    er: sv('<path d="M8.6 19.5 4.3 15.2a1.8 1.8 0 0 1 0-2.6l8.3-8.3a1.8 1.8 0 0 1 2.6 0l4.5 4.5a1.8 1.8 0 0 1 0 2.6l-8 8.1z"/><path d="M9.3 9.6l5.1 5.1"/><path d="M8.6 19.5H20"/>'),
    undo: sv('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H10"/>'),
    minus: sv('<circle cx="11" cy="11" r="7"/><path d="M8 11h6M16.5 16.5 21 21"/>'),
    plus: sv('<circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6M16.5 16.5 21 21"/>'),
    ext: sv('<path d="M5 4h14"/><path d="M5 8h14"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/>'),
    hand: sv('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V4.2a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.8V5.7a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.4a6 6 0 0 1-4.9-2.6L3.3 15a1.6 1.6 0 0 1 2.5-2l2.2 2.2"/>')
  };

  /* ---------- araç çubuğu ve düğme ---------- */
  const bar = document.createElement('div');
  bar.className = 'ink-bar'; bar.hidden = true;
  bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Kalem araçları');
  bar.innerHTML = `
    <div class="ink-grp" role="group" aria-label="Renk">
      <button type="button" data-color="ink" aria-label="Siyah kalem" title="Siyah"><i class="sw" style="--c:var(--ink)"></i></button>
      <button type="button" data-color="pen" aria-label="Mavi kalem" title="Mavi"><i class="sw" style="--c:var(--pen)"></i></button>
      <button type="button" data-color="red" aria-label="Kırmızı kalem" title="Kırmızı"><i class="sw" style="--c:var(--bad)"></i></button>
      <button type="button" data-color="green" aria-label="Yeşil kalem" title="Yeşil"><i class="sw" style="--c:var(--ok)"></i></button>
      <button type="button" data-color="hl" aria-label="Fosforlu kalem" title="Fosforlu kalem">${IC.hl}</button>
    </div>
    <span class="ink-sep" aria-hidden="true"></span>
    <div class="ink-grp" role="group" aria-label="Kalınlık">
      <button type="button" data-size="0" aria-label="İnce" title="İnce"><i class="dot" style="--s:4px"></i></button>
      <button type="button" data-size="1" aria-label="Orta" title="Orta"><i class="dot" style="--s:8px"></i></button>
      <button type="button" data-size="2" aria-label="Kalın" title="Kalın"><i class="dot" style="--s:13px"></i></button>
    </div>
    <span class="ink-sep" aria-hidden="true"></span>
    <div class="ink-grp">
      <button type="button" data-act="er" aria-label="Silgi" title="Silgi: üstünden geçtiğin yeri siler">${IC.er}</button>
      <button type="button" data-act="undo" aria-label="Geri al" title="Geri al">${IC.undo}</button>
      <button type="button" class="ink-txt" data-act="ext" title="Kartı uzat: altına boş yazı yeri ekler">${IC.ext}<span>Uzat</span></button>
    </div>
    <span class="ink-sep" aria-hidden="true"></span>
    <div class="ink-grp" role="group" aria-label="Yakınlaştırma">
      <button type="button" data-act="zout" aria-label="Uzaklaştır, yazacak yer aç" title="Uzaklaştır">${IC.minus}</button>
      <button type="button" data-act="z1" class="ink-z" aria-label="Normal boyuta dön" title="Normal boyut">%100</button>
      <button type="button" data-act="zin" aria-label="Yakınlaştır" title="Yakınlaştır">${IC.plus}</button>
    </div>
    <span class="ink-sep" aria-hidden="true"></span>
    <div class="ink-grp">
      <button type="button" class="ink-txt" data-act="finger" title="Açıkken parmakla da yazarsın">${IC.hand}<span>Parmak</span></button>
      <button type="button" class="ink-done" data-act="done">Bitti</button>
    </div>`;
  const fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'ink-fab'; fab.hidden = true;
  fab.innerHTML = IC.pen + '<span>Not al</span>';
  document.body.append(bar, fab);

  /* ---------- durum ---------- */
  let B = null;          // aktif sayfa bağı
  let on = false;        // yazma modu
  let zoom = 1;          // sayfa ölçeği
  let mode = null;       // 'player' | 'main'
  let cur = null;        // çizilen çizgi ya da silgi
  let gest = null;       // iki parmak hareketi
  let lastPen = 0, lastStroke = 0, raf = 0, saveT = 0, pending = null, GEN = 0;
  let col = {};
  const TOPX = -400;     // içeriğin üstünde çizilebilecek pay

  function readColors() {
    const cs = getComputedStyle(document.documentElement), g = (n, d) => cs.getPropertyValue(n).trim() || d;
    col = { ink: g('--ink', '#142033'), pen: g('--pen', '#2948C6'), red: g('--bad', '#CC3737'), green: g('--ok', '#17905A'), hl: g('--hl', '#FFD43B') };
  }
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); schedule(); }); } catch (e) { }

  function prep(s) {
    const p = s.p; let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (let i = 0; i < p.length; i += 2) { if (p[i] < a) a = p[i]; if (p[i] > c) c = p[i]; if (p[i + 1] < b) b = p[i + 1]; if (p[i + 1] > d) d = p[i + 1]; }
    const r = s.w / 2 + 1; s.b = [a - r, b - r, c + r, d + r]; return s;
  }

  /* ---------- bağlama ---------- */
  function release() {
    if (!B) return;
    (B.sc === window ? window : B.sc).removeEventListener('scroll', B.onScroll);
    if (B.ro) B.ro.disconnect();
    B.cv.remove(); B.pad.remove();
    if (B.sz.parentElement) B.sz.parentElement.style.paddingTop = '';
    const an = B.an;
    an.classList.remove('ink-anchor');
    an.style.transform = an.style.transformOrigin = an.style.width = an.style.margin = '';
    if (B.sz.parentNode) { B.sz.before(an); B.sz.remove(); }
    B = null;
  }
  function bind(o) {
    flush(); release();
    cur = null; gest = null;
    if (!o || !o.anchor || !o.anchor.parentNode) { on = false; zoom = 1; mode = null; updateUI(); return; }
    if (o.mode !== mode || o.mode === 'main') { on = false; zoom = 1; }
    mode = o.mode;
    const an = o.anchor;
    const sz = document.createElement('div'); sz.className = 'ink-zoom';
    an.before(sz); sz.append(an);
    const cv = document.createElement('canvas'); cv.className = 'ink-cv'; cv.setAttribute('aria-hidden', 'true');
    const pad = document.createElement('div'); pad.className = 'ink-pad empty'; pad.setAttribute('aria-hidden', 'true');
    pad.innerHTML = '<span>Karalama alanı</span>';
    an.classList.add('ink-anchor'); an.append(pad, cv);
    B = { key: o.key || null, sc: o.scroller, an, sz, cv, ctx: cv.getContext('2d'), pad, strokes: [], ext: 0, undo: [], tile: null, gen: ++GEN };
    const g = B.gen;
    if (B.key) {
      if (cache.has(B.key)) { const c = cache.get(B.key); B.strokes = c.s; B.ext = c.e || 0; }
      else store.get(B.key).then(v => {
        if (!B || B.gen !== g) return;
        const arr = Array.isArray(v) ? v : (v && Array.isArray(v.s) ? v.s : []);
        const loaded = arr.filter(s => s && Array.isArray(s.p) && s.p.length >= 2).map(prep);
        B.strokes = loaded.concat(B.strokes); B.ext = Math.max(B.ext, (v && +v.e) || 0);
        cache.set(B.key, { s: B.strokes, e: B.ext });
        fitStrokes(); layout();
      });
    }
    B.onScroll = () => tileCheck(false);
    (B.sc === window ? window : B.sc).addEventListener('scroll', B.onScroll, { passive: true });
    if (window.ResizeObserver) { B.ro = new ResizeObserver(() => layout()); B.ro.observe(an); if (B.sc !== window) B.ro.observe(B.sc); }
    readColors(); applyZoom(); fitStrokes(); layout(); updateUI();
  }
  window.addEventListener('resize', () => layout());

  /* görünen alan (ekran koordinatı) ve içeriğin sol üst köşesi */
  function vis() {
    if (B.sc === window) {
      const m = B.an.closest('.main') || document.body, r = m.getBoundingClientRect(), l = r.left + m.clientLeft;
      return { l, r: l + m.clientWidth - 1, t: 0, b: window.innerHeight };
    }
    const r = B.sc.getBoundingClientRect(), l = r.left + B.sc.clientLeft, t = r.top + B.sc.clientTop;
    return { l, r: l + B.sc.clientWidth - 1, t, b: t + B.sc.clientHeight };
  }
  function origin() { const r = B.an.getBoundingClientRect(); return { x: r.left, y: r.top }; }
  function scrollBy2(dx, dy) {
    if (!B) return;
    if (B.sc === window) window.scrollBy(dx, dy); else { B.sc.scrollLeft += dx; B.sc.scrollTop += dy; }
  }

  function layout() {
    if (!B || !B.an.isConnected) return;
    sizePad(); applyZoom(); tileCheck(true); placeBar();
  }
  function padTop() { const prev = B.pad.previousElementSibling; return prev ? prev.offsetTop + prev.offsetHeight : 0; }
  function sizePad() {
    if (!B || !B.an.isConnected) return;
    const top = padTop();
    let maxY = -Infinity; for (const s of B.strokes) if (s.t !== 'er' && s.b[3] > maxY) maxY = s.b[3];
    const v = vis(), fill = Math.round((v.b - v.t) / zoom - top - 12);
    const need = Math.max(on ? Math.max(Math.round(window.innerHeight * 0.55 / zoom), fill) : 0, maxY > top ? Math.ceil(maxY - top + 56) : 0, Math.round(B.ext));
    B.pad.style.height = need + 'px';
    B.pad.classList.toggle('empty', need === 0);
  }

  /* ---------- zoom ---------- */
  function baseWidth() {
    const par = B.sz.parentElement; if (!par) return B.an.offsetWidth;
    const cs = getComputedStyle(par), avail = par.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const mw = parseFloat(getComputedStyle(B.an).maxWidth);
    return Math.max(200, Math.floor(isNaN(mw) ? avail : Math.min(mw, avail)));
  }
  function applyZoom() {
    if (!B) return;
    const an = B.an, sz = B.sz;
    if (zoom === 1) {
      an.style.transform = an.style.transformOrigin = an.style.width = an.style.margin = '';
      sz.style.width = sz.style.height = '';
    } else {
      const w = baseWidth();
      an.style.width = w + 'px'; an.style.margin = '0'; an.style.transformOrigin = '0 0'; an.style.transform = 'scale(' + zoom + ')';
      sz.style.width = Math.round(w * zoom) + 'px'; sz.style.height = Math.ceil(an.offsetHeight * zoom) + 'px';
    }
    const zb = bar.querySelector('.ink-z'); if (zb) zb.textContent = '%' + Math.round(zoom * 100);
  }
  // cx, cy: zoom sırasında ekranda yerinde kalacak nokta
  function setZoom(z, cx, cy) {
    if (!B || !B.an.isConnected) return;
    z = Math.round(Math.min(ZMAX, Math.max(ZMIN, z)) * 100) / 100;
    if (Math.abs(z - 1) < 0.04) z = 1;
    if (z === zoom) return;
    let lx = 0, ly = 0;
    if (cx != null) { const o = origin(); lx = (cx - o.x) / zoom; ly = (cy - o.y) / zoom; }
    zoom = z; sizePad(); applyZoom();
    if (cx != null) { const o = origin(); scrollBy2(o.x + lx * zoom - cx, o.y + ly * zoom - cy); }
    tileCheck(!gest); placeBar();
  }
  function zoomStep(f) { const v = vis(); setZoom(zoom * f, (v.l + v.r) / 2, (v.t + v.b) / 2); }
  // kenara yazılmış notlar ekrana sığmıyorsa uzaklaştır
  function fitStrokes() {
    if (!B || !B.strokes.length || !B.an.isConnected) return;
    let a = Infinity, c = -Infinity; for (const s of B.strokes) { if (s.t === 'er') continue; if (s.b[0] < a) a = s.b[0]; if (s.b[2] > c) c = s.b[2]; }
    if (a === Infinity) return;
    const v = vis(), o = origin(), L = (v.l - o.x) / zoom, R = (v.r - o.x) / zoom;
    if (a >= L - 2 && c <= R + 2) return;
    const w = baseWidth(), half = Math.max(0, -a, c - w);
    const need = Math.floor((v.r - v.l - 8) / (w + 2 * half) * 100) / 100;
    if (need < zoom) { zoom = Math.max(ZMIN, need); if (Math.abs(zoom - 1) < 0.04) zoom = 1; applyZoom(); }
  }

  /* Tuval, görünen alanın biraz fazlasını kaplayan bir karodur; içerikle birlikte kayar, kenara yaklaşınca yeniden yerleşir. */
  function tileCheck(force) {
    if (!B || !B.an.isConnected) return;
    const z = zoom, v = vis(), o = origin(), AH = B.an.clientHeight;
    const vt = Math.max((v.t - o.y) / z, TOPX), vb = Math.min((v.b - o.y) / z, AH), h = (v.b - v.t) / z;
    const vl = (v.l - o.x) / z, vr = (v.r - o.x) / z;
    const T = B.tile;
    if (!force && T && vt >= T.y - 1 && vb <= T.y + T.h + 1 && vl >= T.x - 1 && vr <= T.x + T.w + 1) return;
    const M = Math.round(h * 0.6), Mx = z > 1 ? Math.round((vr - vl) * 0.5) : 0;
    const y = Math.floor(Math.max(TOPX, vt - M)), y2 = Math.ceil(Math.min(AH, vb + M));
    const x = Math.floor(vl - Mx), x2 = Math.floor(Math.min(vr + Mx, Math.max(vr, B.an.clientWidth)));
    const w = Math.max(0, x2 - x), hh = Math.max(0, y2 - y);
    const cv = B.cv;
    if (!w || !hh) { cv.style.display = 'none'; B.tile = null; return; }
    let d = (gest && T) ? T.d : Math.min(2, window.devicePixelRatio || 1) * z;
    if (w * hh * d * d > 12e6) d = Math.max(0.5, Math.sqrt(12e6 / (w * hh)));
    cv.style.display = ''; cv.style.left = x + 'px'; cv.style.top = y + 'px'; cv.style.width = w + 'px'; cv.style.height = hh + 'px';
    const W = Math.round(w * d), H = Math.round(hh * d);
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    B.tile = { x, y, w, h: hh, d };
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    draw();
  }

  /* ---------- çizim ---------- */
  function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
  function draw() {
    raf = 0; if (!B || !B.tile) return;
    const ctx = B.ctx, t = B.tile;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, B.cv.width, B.cv.height);
    ctx.setTransform(t.d, 0, 0, t.d, -t.x * t.d, -t.y * t.d);
    const y0 = t.y - 30, y1 = t.y + t.h + 30;
    for (const s of B.strokes) if (s.b[3] >= y0 && s.b[1] <= y1) path(ctx, s);
    if (cur && cur.s) path(ctx, cur.s);
    // silgi halkası: silginin nereye değdiğini göster
    if (cur && cur.s && cur.s.t === 'er') {
      const p = cur.s.p, n = p.length;
      ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5 / zoom; ctx.strokeStyle = col.ink;
      ctx.beginPath(); ctx.arc(p[n - 2], p[n - 1], cur.s.w / 2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // silgi de bir çizgidir: altındaki mürekkebi yalnızca kendi genişliği kadar siler (destination-out)
  function path(ctx, s) {
    const p = s.p, n = p.length >> 1, er = s.t === 'er';
    ctx.globalCompositeOperation = er ? 'destination-out' : 'source-over';
    ctx.globalAlpha = s.t === 'hl' ? 0.38 : 1;
    ctx.strokeStyle = er ? '#000' : (col[s.t] || col.pen); ctx.lineWidth = s.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    if (n === 1) ctx.lineTo(p[0] + 0.01, p[1]);
    else if (n === 2) ctx.lineTo(p[2], p[3]);
    else {
      for (let i = 1; i < n - 1; i++) { const x = p[2 * i], y = p[2 * i + 1]; ctx.quadraticCurveTo(x, y, (x + p[2 * i + 2]) / 2, (y + p[2 * i + 3]) / 2); }
      ctx.lineTo(p[2 * n - 2], p[2 * n - 1]);
    }
    ctx.stroke(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- düzenleme ---------- */
  function pt(x, y) { const o = origin(); return [Math.round((x - o.x) / zoom * 2) / 2, Math.round((y - o.y) / zoom * 2) / 2]; }
  function pushUndo() { B.undo.push({ s: B.strokes.slice(), e: B.ext }); if (B.undo.length > 60) B.undo.shift(); }
  function begin(id, x, y, st) {
    const [px, py] = pt(x, y), er = prefs.tool === 'er', hl = prefs.color === 'hl';
    const w = er ? ER_W[prefs.esize] : (hl ? HL_W : PEN_W)[prefs.size];
    cur = { id, st, s: { t: er ? 'er' : prefs.color, w: Math.round(w / zoom * 100) / 100, p: [px, py] } };
    schedule();
  }
  function move(x, y) {
    const [px, py] = pt(x, y);
    const p = cur.s.p, m = p.length, dx = px - p[m - 2], dy = py - p[m - 1];
    if ((dx * dx + dy * dy) * zoom * zoom < 0.8) return;
    p.push(px, py); schedule();
  }
  function end() {
    const c = cur; cur = null;
    if (c && c.id === 'm') lastStroke = Date.now();
    if (!B || !c) return;
    const s = prep(c.s);
    // silgi hiçbir yazıya değmediyse kaydetme
    if (s.t === 'er' && !B.strokes.some(o => o.t !== 'er' && o.b[0] <= s.b[2] && o.b[2] >= s.b[0] && o.b[1] <= s.b[3] && o.b[3] >= s.b[1])) { schedule(); return; }
    pushUndo(); B.strokes.push(s); changed(); schedule();
  }
  function cancelStroke() { cur = null; schedule(); }
  function changed() {
    if (!B) return;
    if (B.key) {
      cache.set(B.key, { s: B.strokes, e: B.ext });
      const k = B.key, v = B.strokes, x = B.ext;
      pending = () => store.put(k, v, x);
      clearTimeout(saveT); saveT = setTimeout(flush, 600);
    }
    sizePad();
  }
  function flush() { clearTimeout(saveT); saveT = 0; if (pending) { const f = pending; pending = null; return f(); } }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  function undo() {
    if (!B || !B.undo.length) { toast('Geri alınacak bir şey yok'); return; }
    const u = B.undo.pop(); B.strokes = u.s; B.ext = u.e; changed(); applyZoom(); tileCheck(true);
  }
  // kartı uzat: altına bir ekran boyu boş yazı yeri ekle ve oraya kaydır
  function extend() {
    if (!B || !B.an.isConnected) return;
    pushUndo();
    const v = vis(), curH = B.pad.classList.contains('empty') ? 0 : B.pad.offsetHeight, oldBottom = padTop() + curH;
    B.ext = curH + Math.round((v.b - v.t) / zoom * 0.9);
    changed(); applyZoom(); tileCheck(true);
    const o = origin(); scrollBy2(0, o.y + oldBottom * zoom - (v.t + (v.b - v.t) * 0.3));
    toast('Altına boş yazı yeri eklendi. Geri al ile kaldırabilirsin.');
  }

  /* ---------- dokunma, kalem, fare ---------- */
  function inArea(x, y) { if (!B || !B.an.isConnected) return false; const v = vis(); return x >= v.l && x <= v.r && y >= v.t && y <= v.b; }
  function blocked(target) {
    if (document.querySelector('.modal-bg')) return true;
    return !!(target && target.closest && target.closest('.ink-bar, .ink-fab, .calc-panel, .sheet-bg, .tabbar, .rail, .p-top, .p-foot'));
  }
  function findT(list, id) { for (let i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i]; return null; }
  function direct(list) { const out = []; for (let i = 0; i < list.length; i++) if (list[i].touchType !== 'stylus') out.push(list[i]); return out; }
  function startGesture(a, b) {
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2, o = origin();
    gest = { a: a.identifier, b: b.identifier, d0: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, z0: zoom, lx: (mx - o.x) / zoom, ly: (my - o.y) / zoom };
  }
  function moveGesture(a, b) {
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
    setZoom(gest.z0 * (Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1) / gest.d0);
    const o = origin(); scrollBy2(o.x + gest.lx * zoom - mx, o.y + gest.ly * zoom - my);
    tileCheck(false);
  }

  function onTS(e) {
    if (!on || !B) return;
    if (gest) { if (e.cancelable) e.preventDefault(); return; }
    if (!(cur && cur.st)) {
      const d = direct(e.touches);
      if (d.length >= 2 && inArea(d[0].clientX, d[0].clientY) && inArea(d[1].clientX, d[1].clientY) && !blocked(e.target)) {
        if (e.cancelable) e.preventDefault();
        if (cur) cancelStroke();
        startGesture(d[0], d[1]);
        return;
      }
    }
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i], st = t.touchType === 'stylus';
      if (cur) { if (e.cancelable) e.preventDefault(); continue; }   // yazarken gelen ikinci dokunuş: avuç
      if (!inArea(t.clientX, t.clientY) || blocked(e.target)) continue;
      if (st) {
        if (!prefs.pen) {
          prefs.pen = 1;
          if (prefs.finger) { prefs.finger = 0; toast('Kalem algılandı. Kalem yazar; parmak kaydırır, şıklara dokunur, iki parmak zoom yapar.'); }
          savePrefs(); updateUI();
        }
        lastPen = Date.now();
        if (e.cancelable) e.preventDefault();
        begin(t.identifier, t.clientX, t.clientY, true);
        continue;
      }
      if (Date.now() - lastPen < 400) { if (e.cancelable) e.preventDefault(); continue; } // kalemden hemen sonra gelen avuç
      if (!prefs.finger) continue;                                                     // parmak normal davranır
      if (e.cancelable) e.preventDefault();
      begin(t.identifier, t.clientX, t.clientY, false);
    }
  }
  function onTM(e) {
    if (gest) {
      if (e.cancelable) e.preventDefault();
      const a = findT(e.touches, gest.a), b = findT(e.touches, gest.b);
      if (a && b) moveGesture(a, b);
      return;
    }
    if (!cur || cur.id === 'm') return;
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (cur && t.identifier === cur.id) { if (cur.st) lastPen = Date.now(); move(t.clientX, t.clientY); }
    }
  }
  function onTE(e) {
    if (gest) {
      if (e.cancelable) e.preventDefault();
      if (!findT(e.touches, gest.a) || !findT(e.touches, gest.b)) { gest = null; tileCheck(true); }
      return;
    }
    if (!cur || cur.id === 'm') return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (cur && t.identifier === cur.id) { if (cur.st) lastPen = Date.now(); if (e.cancelable) e.preventDefault(); end(); }
    }
  }
  document.addEventListener('touchstart', onTS, { passive: false, capture: true });
  document.addEventListener('touchmove', onTM, { passive: false, capture: true });
  document.addEventListener('touchend', onTE, { passive: false, capture: true });
  document.addEventListener('touchcancel', onTE, { passive: false, capture: true });
  // Safari'nin kendi sayfa zoom'u yazma modunda devreye girmesin
  ['gesturestart', 'gesturechange'].forEach(n => document.addEventListener(n, (e) => { if (on && B) e.preventDefault(); }, { passive: false }));
  // masaüstü: ctrl + tekerlek / dokunmatik yüzeyde sıkıştırma
  window.addEventListener('wheel', (e) => {
    if (!on || !B || !e.ctrlKey || !inArea(e.clientX, e.clientY)) return;
    e.preventDefault(); setZoom(zoom * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY);
  }, { passive: false });

  document.addEventListener('pointerdown', (e) => {
    if (!on || !B || cur || gest || e.pointerType === 'touch' || (e.pointerType === 'pen' && TOUCH)) return;
    if (e.button !== 0 || !inArea(e.clientX, e.clientY) || blocked(e.target)) return;
    e.preventDefault();
    begin('m', e.clientX, e.clientY, e.pointerType === 'pen');
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (!cur || cur.id !== 'm') return;
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of (list.length ? list : [e])) move(ev.clientX, ev.clientY);
  });
  window.addEventListener('pointerup', () => { if (cur && cur.id === 'm') end(); });
  window.addEventListener('pointercancel', () => { if (cur && cur.id === 'm') end(); });
  // fareyle çizgi bitince altta kalan düğmeye tıklanmış sayılmasın
  document.addEventListener('click', (e) => {
    if (Date.now() - lastStroke < 350 && !(e.target.closest && e.target.closest('.ink-bar, .ink-fab, [data-ink-toggle]'))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && on) setOn(false); });

  /* ---------- arayüz ---------- */
  function setOn(v) {
    on = !!v && !!B; cur = null; gest = null;
    if (on && !prefs.help) {
      prefs.help = 1; savePrefs();
      toast(prefs.pen ? 'Kalemle yaz. Parmakla kaydır, iki parmakla zoom yap.' : 'Kalemle ya da parmakla yaz. İki parmakla kaydır ve zoom yap.');
    }
    sizePad(); applyZoom(); tileCheck(true); updateUI();
  }
  function updateUI() {
    bar.hidden = !(on && B);
    fab.hidden = !(B && mode === 'main' && !on);
    document.documentElement.classList.toggle('inking', on && !!B);
    document.querySelectorAll('[data-ink-toggle]').forEach(b => b.setAttribute('aria-pressed', String(on && !!B)));
    bar.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(prefs.tool === 'draw' && b.dataset.color === prefs.color)));
    bar.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.size === (prefs.tool === 'er' ? prefs.esize : prefs.size))));
    bar.classList.toggle('er-mode', prefs.tool === 'er');
    bar.querySelector('[data-act="er"]').setAttribute('aria-pressed', String(prefs.tool === 'er'));
    bar.querySelector('[data-act="finger"]').setAttribute('aria-pressed', String(!!prefs.finger));
    bar.style.setProperty('--cur', 'var(' + CVAR[prefs.color] + ')');
    placeBar();
    // araç çubuğu kartın ilk satırını kapatmasın
    const host = B && B.sz.parentElement;
    if (host) host.style.paddingTop = (on && !bar.hidden) ? Math.round(bar.offsetHeight + 20) + 'px' : '';
  }
  function placeBar() {
    if (!B || bar.hidden || !B.an.isConnected) return;
    const v = vis();
    bar.style.top = B.sc === window ? 'calc(env(safe-area-inset-top, 0px) + 10px)' : (v.t + 10) + 'px';
    bar.style.left = Math.round((v.l + v.r) / 2) + 'px';
    bar.style.maxWidth = Math.max(220, Math.floor(v.r - v.l - 16)) + 'px';
  }
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.color) { prefs.color = b.dataset.color; prefs.tool = 'draw'; savePrefs(); updateUI(); return; }
    if (b.dataset.size) { if (prefs.tool === 'er') prefs.esize = +b.dataset.size; else prefs.size = +b.dataset.size; savePrefs(); updateUI(); return; }
    const a = b.dataset.act;
    if (a === 'er') { prefs.tool = prefs.tool === 'er' ? 'draw' : 'er'; savePrefs(); updateUI(); }
    else if (a === 'undo') undo();
    else if (a === 'ext') extend();
    else if (a === 'zout') zoomStep(1 / 1.25);
    else if (a === 'zin') zoomStep(1.25);
    else if (a === 'z1') { const v = vis(); setZoom(1, (v.l + v.r) / 2, (v.t + v.b) / 2); }
    else if (a === 'finger') {
      prefs.finger = prefs.finger ? 0 : 1; savePrefs(); updateUI();
      toast(prefs.finger ? 'Parmakla yazma açık. İki parmakla kaydır ve zoom yap.' : 'Parmak artık sayfayı kaydırır ve şıklara dokunur.');
    }
    else if (a === 'done') setOn(false);
  });
  fab.addEventListener('click', () => setOn(true));
  document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-ink-toggle]'); if (t) setOn(!on); });

  /* ---------- dışa açılan ---------- */
  async function clearPrefix(pre) {
    for (const k of [...cache.keys()]) if (k.startsWith(pre)) cache.delete(k);
    const ks = await store.keys();
    if (ks) await Promise.all(ks.filter(k => String(k).startsWith(pre)).map(k => store.del(k)));
  }
  async function count() {
    const ks = await store.keys();
    const all = new Set(ks || []);
    cache.forEach((v, k) => { if (v.s.length || v.e) all.add(k); else if (!ks) all.delete(k); });
    return [...all].filter(k => !String(k).startsWith('x:')).length;
  }
  async function clearAll() {
    pending = null; clearTimeout(saveT); cache.clear();
    if (B) { B.strokes = []; B.ext = 0; B.undo = []; sizePad(); applyZoom(); tileCheck(true); }
    const ks = await store.keys();
    if (ks) await Promise.all(ks.map(k => store.del(k)));
  }
  window.Ink = {
    init: (o) => { if (o && o.toast) toast = o.toast; },
    bind, unbind: () => bind(null), off: () => setOn(false), isOn: () => on && !!B,
    clearPrefix, clearAll, count, flush,
    _state: () => ({ on, zoom, mode, key: B && B.key, n: B ? B.strokes.length : 0, ext: B ? B.ext : 0, pad: B ? B.pad.offsetHeight : 0, prefs: Object.assign({}, prefs) })
  };
})();
