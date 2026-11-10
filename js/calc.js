/* Ticaret Patikası — bilimsel hesap makinesi
   Casio fx-82ES PLUS / fx-991ES PLUS mantığı (Math gösterim): √ ve xʸ şablon açar, ▶ şablondan çıkar,
   ×10ˣ sayının parçasıdır, (−) negatif sayı yazar.
   Çözümlerdeki sayısal işlemlerden "hesap makinesinde hangi tuşlara basılır" adımlarını üretir ve doğrular. */
(function (root) {
  'use strict';
  const FUN = { sqrt: Math.sqrt, ln: Math.log, log: (x) => Math.log10(x) };

  /* ---------- ifade çözücü ---------- */
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        let txt = s.slice(i, j);
        if (!/^(\d+\.?\d*|\.\d+)$/.test(txt)) throw new Error('sayı');
        if (s[j] === 'E') {
          let k = j + 1; if (s[k] === '-') k++;
          const st = k; while (k < s.length && /\d/.test(s[k])) k++;
          if (k === st) throw new Error('üs');
          txt = s.slice(i, k); j = k;
        }
        out.push({ t: 'num', v: txt }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) { let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++; out.push({ t: 'id', v: s.slice(i, j) }); i = j; continue; }
      if ('+-*/^()'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('karakter');
    }
    return out;
  }
  function parse(s) {
    const T = tokenize(s); let k = 0;
    const isOp = (v) => T[k] && T[k].t === 'op' && T[k].v === v;
    const starts = () => { const t = T[k]; return t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '(')); };
    function expr() { let a = term(); while (isOp('+') || isOp('-')) { const o = T[k++].v; a = { k: 'bin', o, a, b: term() }; } return a; }
    function term() {
      let a = unary();
      for (; ;) {
        if (isOp('*') || isOp('/')) { const o = T[k++].v; a = { k: 'bin', o, a, b: unary() }; }
        else if (starts()) a = { k: 'bin', o: '*', a, b: unary(), imp: true };
        else return a;
      }
    }
    function unary() { if (isOp('-')) { k++; return { k: 'neg', a: unary() }; } if (isOp('+')) { k++; return unary(); } return power(); }
    function power() { const a = primary(); if (isOp('^')) { k++; return { k: 'pow', a, b: unary() }; } return a; }
    function primary() {
      const t = T[k++]; if (!t) throw new Error('eksik');
      if (t.t === 'num') return { k: 'num', v: parseFloat(t.v), s: t.v };
      if (t.t === 'op' && t.v === '(') { const e = expr(); if (isOp(')')) k++; return { k: 'par', a: e }; }
      if (t.t === 'id') {
        if (t.v === 'Ans') return { k: 'ans' };
        if (FUN[t.v]) { if (!isOp('(')) throw new Error('fonksiyon'); k++; const e = expr(); if (isOp(')')) k++; return { k: 'fn', f: t.v, a: e }; }
      }
      throw new Error('beklenmeyen');
    }
    const ast = expr();
    if (k < T.length) throw new Error('fazla');
    return ast;
  }
  function ev(n, ans) {
    switch (n.k) {
      case 'num': return n.v;
      case 'ans': return ans || 0;
      case 'par': return ev(n.a, ans);
      case 'neg': return -ev(n.a, ans);
      case 'bin': { const a = ev(n.a, ans), b = ev(n.b, ans); return n.o === '+' ? a + b : n.o === '-' ? a - b : n.o === '*' ? a * b : a / b; }
      case 'pow': return Math.pow(ev(n.a, ans), ev(n.b, ans));
      case 'fn': return FUN[n.f](ev(n.a, ans));
    }
    return NaN;
  }
  function evaluate(s, ans) { try { return ev(parse(s), ans); } catch (e) { return NaN; } }

  /* ---------- sayı biçimi (Casio gibi 10 hane) ---------- */
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function fmtNum(v) {
    if (!isFinite(v)) return 'Math ERROR';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e10 || a < 1e-9) {
      const [m, e] = v.toExponential(9).split('e');
      return String(Number(m)) + '×10' + String(Number(e)).replace(/./g, c => SUP[c] || c);
    }
    let s = String(Number(v.toPrecision(10)));
    if (/e/.test(s)) { const [m, e] = Number(v.toPrecision(10)).toExponential().split('e'); s = m + '×10' + String(Number(e)).replace(/./g, c => SUP[c] || c); }
    return s;
  }
  function toFrac(v) {
    if (!isFinite(v) || Number.isInteger(v)) return null;
    let h1 = 1, h0 = 0, k1 = 0, k0 = 1, x = v;
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(x), h2 = a * h1 + h0, k2 = a * k1 + k0;
      if (k2 > 9999) break;
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (Math.abs(v - h1 / k1) < 1e-10 * Math.max(1, Math.abs(v))) return k1 > 1 ? [h1, k1] : null;
      x = 1 / (x - a); if (!isFinite(x)) break;
    }
    return null;
  }

  /* ---------- ifadeden tuş sırası ---------- */
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const strip = (n) => { while (n.k === 'par') n = n.a; return n; };
  function prec(n) { n = strip(n); if (n.k === 'bin') return PREC[n.o]; if (n.k === 'neg') return 2.5; if (n.k === 'pow') return 4; return 5; }
  function wrap(n, need, out) { if (need) { out.push({ k: '(' }); keysOf(n, out); out.push({ k: ')' }); } else keysOf(n, out); }
  function keysOf(n, out) {
    n = strip(n);
    switch (n.k) {
      case 'num': {
        const m = /^(.*)E(-?)(\d+)$/.exec(n.s);
        if (m) { out.push({ n: m[1] }); out.push({ k: '×10ˣ' }); if (m[2]) out.push({ k: '(−)' }); out.push({ n: m[3] }); }
        else out.push({ n: n.s });
        break;
      }
      case 'ans': out.push({ k: 'Ans' }); break;
      case 'neg': out.push({ k: '(−)' }); wrap(n.a, prec(n.a) < 2.5, out); break;
      case 'bin': {
        const p = PREC[n.o];
        wrap(n.a, prec(n.a) < p, out);
        out.push({ k: n.o === '*' ? '×' : n.o === '/' ? '÷' : n.o === '+' ? '+' : '−' });
        wrap(n.b, prec(n.b) < p || (prec(n.b) === p && (n.o === '-' || n.o === '/')), out);
        break;
      }
      case 'pow': {
        const b = strip(n.b);
        wrap(n.a, prec(n.a) < 5, out);
        if (b.k === 'num' && b.v === 2) out.push({ k: 'x²' });
        else if (b.k === 'neg' && strip(b.a).k === 'num' && strip(b.a).v === 1) out.push({ k: 'x⁻¹' });
        else { out.push({ k: 'xʸ' }); keysOf(b, out); out.push({ k: '▶' }); }
        break;
      }
      case 'fn':
        if (n.f === 'sqrt') { out.push({ k: '√' }); keysOf(n.a, out); out.push({ k: '▶' }); }
        else { out.push({ k: n.f }); keysOf(n.a, out); out.push({ k: ')' }); }
        break;
    }
    return out;
  }
  function keysFromExpr(expr) {
    const out = keysOf(parse(expr), []);
    while (out.length && out[out.length - 1].k === '▶') out.pop();
    out.push({ k: '=' });
    return out;
  }

  /* ---------- çözüm metninden adımlar ---------- */
  function readGroup(s, i) { // s[i] === '{' ise eşleşen } sonrasına kadar
    if (s[i] !== '{') return s[i] == null ? null : [s[i], i + 1];
    let d = 0;
    for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) return [s.slice(i + 1, j), j + 1]; } }
    return null;
  }
  function replaceCmd(s, re, nargs, fn) {
    for (let guard = 0; guard < 50; guard++) {
      const m = re.exec(s); if (!m) return s;
      let i = m.index + m[0].length; const args = [];
      for (let a = 0; a < nargs; a++) { while (s[i] === ' ') i++; const g = readGroup(s, i); if (!g) return null; args.push(g[0]); i = g[1]; }
      s = s.slice(0, m.index) + fn.apply(null, args) + s.slice(i);
    }
    return null;
  }
  function texToExpr(tex) {
    let s = tex;
    if (/%/.test(s)) return null;
    s = s.replace(/\\left|\\right|\\quad|\\qquad/g, ' ').replace(/\\[,;!: ]/g, ' ').replace(/~/g, ' ');
    s = s.replace(/\{,\}/g, '');
    s = s.replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/−/g, '-');
    s = replaceCmd(s, /\\[dt]?frac/, 2, (a, b) => '((' + a + ')/(' + b + '))'); if (s == null) return null;
    s = replaceCmd(s, /\\sqrt/, 1, (a) => 'sqrt(' + a + ')'); if (s == null) return null;
    s = s.replace(/[{}]/g, (m) => (m === '{' ? '(' : ')')).replace(/\s+/g, '');
    if (!s || /[^0-9.+\-*/^()sqrt]/.test(s) || /[a-z]/.test(s.replace(/sqrt/g, ''))) return null;
    if (!/\d/.test(s)) return null;
    try { parse(s); } catch (e) { return null; }
    return s;
  }
  const PLAIN = /^-?\d+(\.\d+)?$/;
  function splitTop(seg) {
    const out = []; let d = 0, st = 0;
    const t = seg.replace(/\\approx|≈/g, '=');
    for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === '{') d++; else if (c === '}') d--; else if (c === '=' && d === 0) { out.push(t.slice(st, i)); st = i + 1; } }
    out.push(t.slice(st));
    return out;
  }
  const hasOp = (e) => /[+\-*/^]|sqrt|\)\(|\d\(|\)\d/.test(e.replace(/^-/, ''));
  function stepsFromText(text) {
    if (!text) return [];
    const segs = []; const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g; let m;
    while ((m = re.exec(text))) segs.push(m[1] || m[2]);
    const out = [], seen = new Set();
    for (const seg of segs) {
      const parts = splitTop(seg).map(p => p.trim());
      if (parts.length < 2) continue;
      // güven aralığı: a ± b → alt uç ve üst uç
      const pmi = parts.findIndex(p => (p.match(/\\pm/g) || []).length === 1);
      if (pmi >= 0) {
        const lo = texToExpr(parts[pmi].replace('\\pm', '-')), hi = texToExpr(parts[pmi].replace('\\pm', '+'));
        if (lo && hi) {
          const vl = evaluate(lo), vh = evaluate(hi);
          if (isFinite(vl) && isFinite(vh) && !seen.has(lo)) { seen.add(lo); seen.add(hi); out.push({ expr: lo, value: vl, label: 'Alt uç' }, { expr: hi, value: vh, label: 'Üst uç' }); }
        }
        continue;
      }
      const conv = parts.map(texToExpr);
      let done = false;
      for (let i = 0; i < conv.length && !done; i++) {
        const e = conv[i]; if (!e || !hasOp(e) || PLAIN.test(e)) continue;
        const v = evaluate(e); if (!isFinite(v)) continue;
        let j = -1; for (let t = conv.length - 1; t > i; t--) if (conv[t] && PLAIN.test(conv[t])) { j = t; break; }
        if (j < 0) { if ((e.match(/\d+(\.\d+)?/g) || []).length >= 2) { out.push({ expr: e, value: v }); done = true; } continue; }
        const stated = conv[j], d = (stated.split('.')[1] || '').length, sv = parseFloat(stated);
        const tol = Math.max(0.5 * Math.pow(10, -d) * 1.0001, Math.abs(sv) * 0.005);
        if (Math.abs(v - sv) <= tol) { out.push({ expr: e, value: v, stated }); done = true; }
      }
      if (done) { const last = out[out.length - 1]; if (seen.has(last.expr)) out.pop(); else seen.add(last.expr); }
      if (out.length >= 4) break;
    }
    return out;
  }

  /* ---------- hesap makinesi durumu ---------- */
  const OPEN = { '√': ['√(', 'sqrt(', true], 'xʸ': ['^(', '^(', true], 'ln': ['ln(', 'ln(', false], 'log': ['log(', 'log(', false], '(': ['(', '(', false] };
  const SIMPLE = { '+': ['+', '+'], '−': ['−', '-'], '×': ['×', '*'], '÷': ['÷', '/'], 'x²': ['²', '^2'], 'x⁻¹': ['⁻¹', '^(-1)'], '(−)': ['−', '-'], '×10ˣ': ['×10^', 'E'], 'Ans': ['Ans', 'Ans'], '.': ['.', '.'] };
  const AFTER_ANS = ['+', '−', '×', '÷', 'x²', 'xʸ', 'x⁻¹'];
  function Machine() {
    let toks = [], ans = 0, res = null, err = '', fresh = false, frac = false;
    const opens = () => { const st = []; for (const t of toks) { if (t.open) st.push(t); else if (t.close && st.length) st.pop(); } return st; };
    function calc() {
      if (!toks.length) return;
      const e = toks.map(t => t.e).join('') + ')'.repeat(opens().length);
      let ast; try { ast = parse(e); } catch (x) { err = 'Syntax ERROR'; res = null; fresh = true; return; }
      const v = ev(ast, ans);
      if (!isFinite(v)) { err = 'Math ERROR'; res = null; fresh = true; return; }
      res = v; ans = v; err = ''; frac = false; fresh = true;
    }
    function press(k) {
      if (k === 'AC') { toks = []; res = null; err = ''; fresh = false; return; }
      if (k === '=') { calc(); return; }
      if (k === 'S⇔D') { if (res != null && toFrac(res)) frac = !frac; return; }
      if (fresh) {
        fresh = false;
        if (k === 'DEL') { res = null; err = ''; return; } // düzenlemeye dön
        toks = (AFTER_ANS.includes(k) && res != null) ? [{ d: 'Ans', e: 'Ans' }] : [];
        res = null; err = '';
      }
      if (k === 'DEL') { toks.pop(); return; }
      if (k === '▶') { const st = opens(), top = st[st.length - 1]; if (top && top.tpl) toks.push({ d: ')', e: ')', close: true }); return; }
      if (k === ')') { if (opens().length) toks.push({ d: ')', e: ')', close: true }); return; }
      if (OPEN[k]) { const o = OPEN[k]; toks.push({ d: o[0], e: o[1], open: true, tpl: o[2] }); return; }
      if (SIMPLE[k]) { toks.push({ d: SIMPLE[k][0], e: SIMPLE[k][1] }); return; }
      if (/^[0-9]$/.test(k)) toks.push({ d: k, e: k });
    }
    function view() {
      const f = res != null && frac ? toFrac(res) : null;
      return { expr: toks.map(t => t.d).join(''), ghost: ')'.repeat(opens().length), out: err || (res == null ? '' : f ? f[0] + '/' + f[1] : fmtNum(res)), err: !!err, value: res, canFrac: res != null && !!toFrac(res), frac };
    }
    return { press, view, get value() { return res; } };
  }
  // tuş listesini makineye bas (test ve "Dene" için)
  function pressAll(mc, keys) { mc.press('AC'); for (const x of keys) { if (x.n) for (const ch of x.n) mc.press(ch); else mc.press(x.k); } return mc.view(); }

  root.Calc = { parse, evaluate, fmtNum, toFrac, keysFromExpr, texToExpr, stepsFromText, Machine, pressAll };
  if (typeof document === 'undefined') return;

  /* =================== arayüz =================== */
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const K = (l) => `<kbd class="key">${l}</kbd>`;
  function renderKeys(keys) { return keys.map(x => x.n ? `<span class="knum">${esc(x.n)}</span>` : K(esc(x.k))).join(''); }
  function seqHTML(expr) {
    let keys; try { keys = keysFromExpr(expr); } catch (e) { return ''; }
    const v = evaluate(expr);
    return `<div class="cstep"><div class="ckeys">${renderKeys(keys)}</div><div class="cres">→ <b>${esc(fmtNum(v))}</b></div><button class="btn sm ghost" type="button" data-calc-play="${esc(expr)}">Dene</button></div>`;
  }
  function stepsHTML(text, open) {
    const steps = stepsFromText(text); if (!steps.length) return '';
    const rows = steps.map(s => {
      let keys; try { keys = keysFromExpr(s.expr); } catch (e) { return ''; }
      const shown = fmtNum(s.value), approx = s.stated && s.stated !== shown ? ` <small>(çözümde ≈ ${esc(s.stated)})</small>` : '';
      return `<div class="cstep">${s.label ? `<div class="clabel">${esc(s.label)}</div>` : ''}<div class="ckeys">${renderKeys(keys)}</div><div class="cres">→ <b>${esc(shown)}</b>${approx}</div><button class="btn sm ghost" type="button" data-calc-play="${esc(s.expr)}">Dene</button></div>`;
    }).join('');
    if (!rows) return '';
    return `<details class="csteps" ${open ? 'open' : ''}><summary>${ICON}<span>Hesap makinesinde nasıl yapılır</span></summary><div class="csteps-in">${rows}
      <p class="ctip">${K('√')} ve ${K('xʸ')} yazdıktan sonra ${K('▶')} ile çık. Sonuç kesir görünürse ${K('S⇔D')}. <b>Dene</b>'ye basınca tuşlara sırayla basılışını izlersin.</p></div></details>`;
  }
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/></svg>';

  const LAYOUT = [
    ['x²', 'fn'], ['xʸ', 'fn'], ['√', 'fn'], ['x⁻¹', 'fn'], ['▶', 'fn'],
    ['(−)', 'fn'], ['ln', 'fn'], ['log', 'fn'], ['(', 'fn'], [')', 'fn'],
    ['7'], ['8'], ['9'], ['DEL', 'del'], ['AC', 'del'],
    ['4'], ['5'], ['6'], ['×', 'op'], ['÷', 'op'],
    ['1'], ['2'], ['3'], ['+', 'op'], ['−', 'op'],
    ['0'], ['.'], ['×10ˣ', 'fn'], ['Ans', 'fn'], ['=', 'eq']
  ];
  const LABEL = { 'xʸ': 'x<sup>■</sup>', '√': '√■', '▶': '▶', '×10ˣ': '×10<sup>x</sup>' };
  const ARIA = { 'x²': 'Kare', 'xʸ': 'Üs', '√': 'Karekök', 'x⁻¹': 'Bir bölü', '▶': 'Sağ ok, şablondan çık', '(−)': 'Negatif', 'DEL': 'Son karakteri sil', 'AC': 'Hepsini sil', '×10ˣ': 'Çarpı on üzeri', 'Ans': 'Önceki sonuç', '−': 'Eksi', '×': 'Çarpı', '÷': 'Bölü' };

  function mount(el) {
    const mc = Machine();
    el.classList.add('cmach');
    el.innerHTML = `<div class="calc-lcd" aria-live="polite"><div class="calc-expr"></div><div class="calc-out"><button type="button" class="calc-sd" aria-label="Kesir ile ondalık arasında geçiş">S⇔D</button><div class="calc-res"></div></div></div>
      <div class="calc-keys">${LAYOUT.map(([k, c]) => `<button type="button" class="ck ${c || ''}" data-k="${esc(k)}" aria-label="${esc(ARIA[k] || k)}">${LABEL[k] || esc(k)}</button>`).join('')}</div>`;
    const exprEl = el.querySelector('.calc-expr'), resEl = el.querySelector('.calc-res'), sd = el.querySelector('.calc-sd');
    function draw() {
      const v = mc.view();
      exprEl.innerHTML = esc(v.expr) + (v.ghost ? `<span class="ghost">${v.ghost}</span>` : '') + '<span class="caret"></span>';
      resEl.textContent = v.out; resEl.classList.toggle('err', v.err);
      sd.disabled = !v.canFrac;
    }
    let playT = 0;
    const stop = () => { clearTimeout(playT); playT = 0; el.querySelectorAll('.ck.hit').forEach(b => b.classList.remove('hit')); };
    function hit(k) { const b = el.querySelector(`.ck[data-k="${CSS.escape(k)}"]`); if (b) { b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 170); } }
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.ck, .calc-sd'); if (!b) return;
      stop(); mc.press(b.classList.contains('calc-sd') ? 'S⇔D' : b.dataset.k); draw();
    });
    function play(expr) {
      stop();
      let keys; try { keys = keysFromExpr(expr); } catch (e) { return; }
      const seq = ['AC']; keys.forEach(x => { if (x.n) seq.push(...x.n.split('')); else seq.push(x.k); });
      let i = 0;
      const step = () => {
        if (i >= seq.length) { playT = 0; return; }
        const k = seq[i++]; mc.press(k); hit(k); draw();
        playT = setTimeout(step, /^[0-9.]$/.test(k) ? 150 : 330);
      };
      step();
    }
    draw();
    return { play, stop, machine: mc };
  }

  /* ---------- yüzen panel ---------- */
  let panel = null, pcalc = null;
  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'calc-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Hesap makinesi');
    panel.innerHTML = `<div class="calc-head"><span class="grip" aria-hidden="true"></span><b>Hesap makinesi</b><small>Casio düzeni</small><button type="button" class="iconbtn calc-x" aria-label="Hesap makinesini kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="calc-body"></div>`;
    document.body.appendChild(panel);
    pcalc = mount(panel.querySelector('.calc-body'));
    panel.querySelector('.calc-x').onclick = close;
    // sürükle
    const head = panel.querySelector('.calc-head');
    let drag = null;
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || window.innerWidth <= 600) return;
      const r = panel.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      head.setPointerCapture(e.pointerId); e.preventDefault();
    });
    head.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = panel.offsetWidth, h = panel.offsetHeight;
      const x = Math.max(6, Math.min(window.innerWidth - w - 6, e.clientX - drag.dx)), y = Math.max(6, Math.min(window.innerHeight - h - 6, e.clientY - drag.dy));
      panel.style.left = x + 'px'; panel.style.top = y + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
    });
    const endDrag = () => { if (!drag) return; drag = null; try { sessionStorage.setItem('ttp-calc-pos', JSON.stringify({ l: panel.style.left, t: panel.style.top })); } catch (e) { } };
    head.addEventListener('pointerup', endDrag); head.addEventListener('pointercancel', endDrag);
    try { const p = JSON.parse(sessionStorage.getItem('ttp-calc-pos') || 'null'); if (p && p.l) { panel.style.left = p.l; panel.style.top = p.t; panel.style.right = 'auto'; panel.style.bottom = 'auto'; } } catch (e) { }
    return panel;
  }
  function keepInside() {
    if (!panel || panel.hidden || window.innerWidth <= 600 || panel.style.left === '') return;
    const r = panel.getBoundingClientRect();
    if (r.right > window.innerWidth - 4 || r.bottom > window.innerHeight - 4 || r.left < 0 || r.top < 0) { panel.style.left = panel.style.top = ''; panel.style.right = panel.style.bottom = ''; }
  }
  window.addEventListener('resize', keepInside);
  function sync() { document.querySelectorAll('[data-calc-toggle]').forEach(b => b.setAttribute('aria-pressed', String(!!panel && !panel.hidden))); }
  function open() { ensurePanel(); panel.hidden = false; keepInside(); sync(); }
  function close() { if (panel) { panel.hidden = true; pcalc.stop(); } sync(); }
  function toggle() { if (panel && !panel.hidden) close(); else open(); }
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-calc-toggle], [data-calc-play]'); if (!t) return;
    if (t.hasAttribute('data-calc-toggle')) { toggle(); return; }
    const inline = t.closest('[data-calc-page]');
    if (inline && pageCalc) { pageCalc.play(t.dataset.calcPlay); const c = inline.querySelector('.cmach'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    open(); pcalc.play(t.dataset.calcPlay);
  });

  /* ---------- Hesap sayfası ---------- */
  let pageCalc = null;
  const S2 = (n) => (isFinite(n) ? String(Number(n.toPrecision(8))) : '–');
  function statTool(el) {
    const EX = [[2, 3], [4, 7], [6, 5], [8, 10], [10, 12]];
    el.innerHTML = `<div class="stat-in"><table class="stat-tbl"><thead><tr><th>#</th><th>X</th><th>Y (isteğe bağlı)</th></tr></thead><tbody></tbody></table>
      <div class="btnrow"><button type="button" class="btn sm ghost" data-st="add">Satır ekle</button><button type="button" class="btn sm ghost" data-st="clear">Temizle</button></div></div>
      <div class="tbl wrap"><table><thead><tr><th>Ne</th><th>Sonuç</th><th>Casio'da (ES PLUS)</th></tr></thead><tbody class="stat-out"></tbody></table></div>`;
    const body = el.querySelector('tbody'), outEl = el.querySelector('.stat-out');
    const row = (i, x, y) => `<tr><td class="num">${i}</td><td><input size="6" inputmode="decimal" aria-label="X ${i}" id="st-x${i}" value="${x == null ? '' : x}"></td><td><input size="6" inputmode="decimal" aria-label="Y ${i}" id="st-y${i}" value="${y == null ? '' : y}"></td></tr>`;
    const fill = (rows) => { body.innerHTML = rows.map((r, i) => row(i + 1, r[0], r[1])).join(''); calc(); };
    const num = (s) => { s = String(s).trim().replace(',', '.'); return s === '' ? null : Number(s); };
    function calc() {
      const xs = [], pairs = [];
      body.querySelectorAll('tr').forEach(tr => { const [a, b] = tr.querySelectorAll('input'); const x = num(a.value), y = num(b.value); if (x != null && isFinite(x)) { xs.push(x); if (y != null && isFinite(y)) pairs.push([x, y]); } });
      const n = xs.length, sum = (a) => a.reduce((p, q) => p + q, 0);
      const R = [];
      if (n) {
        const sx = sum(xs), sxx = sum(xs.map(v => v * v)), m = sx / n;
        const ssx = sum(xs.map(v => (v - m) * (v - m)));
        R.push(['n (gözlem sayısı)', n, 'SHIFT 1 → Var → n'], ['x̄ (ortalama)', m, 'SHIFT 1 → Var → x̄'],
          ['sₓ (örneklem std. sapması, n−1)', n > 1 ? Math.sqrt(ssx / (n - 1)) : NaN, 'SHIFT 1 → Var → sx'],
          ['sₓ² (örneklem varyansı)', n > 1 ? ssx / (n - 1) : NaN, 'sx bulup x²'],
          ['σₓ (n\'e bölen, genelde kullanma)', Math.sqrt(ssx / n), 'SHIFT 1 → Var → σx'],
          ['Σx', sx, 'SHIFT 1 → Sum → Σx'], ['Σx²', sxx, 'SHIFT 1 → Sum → Σx²']);
      }
      if (pairs.length >= 2) {
        const k = pairs.length, X = pairs.map(p => p[0]), Y = pairs.map(p => p[1]);
        const mx = sum(X) / k, my = sum(Y) / k;
        const sxy = sum(pairs.map(p => (p[0] - mx) * (p[1] - my))), sxx = sum(X.map(v => (v - mx) ** 2)), syy = sum(Y.map(v => (v - my) ** 2));
        const B = sxy / sxx, A = my - B * mx, r = sxy / Math.sqrt(sxx * syy);
        R.push(['ȳ (Y ortalaması)', my, 'SHIFT 1 → Var → ȳ'], ['s_y', Math.sqrt(syy / (k - 1)), 'SHIFT 1 → Var → sy'],
          ['Σxy', sum(pairs.map(p => p[0] * p[1])), 'SHIFT 1 → Sum → Σxy'],
          ['B = eğim = β̂₁', B, 'SHIFT 1 → Reg → B'], ['A = sabit = β̂₀', A, 'SHIFT 1 → Reg → A'],
          ['r (korelasyon)', r, 'SHIFT 1 → Reg → r'], ['R² = r²', r * r, 'r bulup x²']);
      }
      const path = (p) => p.startsWith('SHIFT 1') ? K('SHIFT') + ' ' + K('1') + p.slice(7).split(' → ').filter(Boolean).map(x => ' → <b>' + esc(x) + '</b>').join('') : esc(p);
      outEl.innerHTML = R.length ? R.map(([a, v, p]) => `<tr><td>${esc(a)}</td><td class="num"><b>${esc(S2(v))}</b></td><td><small>${path(p)}</small></td></tr>`).join('') : '<tr><td colspan="3">X sütununa en az bir sayı yaz.</td></tr>';
    }
    el.addEventListener('input', calc);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-st]'); if (!b) return;
      if (b.dataset.st === 'add') { const n = body.querySelectorAll('tr').length + 1; body.insertAdjacentHTML('beforeend', row(n, null, null)); el.querySelector('#st-x' + n).focus(); }
      else fill([[null, null], [null, null], [null, null], [null, null], [null, null]]);
    });
    fill(EX);
  }

  function pageHTML() {
    const ex = (expr) => seqHTML(expr);
    return `<div class="view wide" data-calc-page>
      <section class="hero"><div class="eyebrow">Sınavda hesap makinesi serbest</div><h1>Hesap makinesi</h1><p>Casio fx-82ES PLUS ve fx-991ES PLUS ile aynı tuş mantığı. Önce burada dene, sonra kendi makinende aynı tuşlara bas. Her sorunun çözümünün altında da hangi tuşlara basacağın yazıyor.</p></section>
      <section class="panel calc-page"><div class="calc-mount" id="calc-mount"></div></section>

      <section class="panel"><h3>1. Önce bunu bil</h3>
        <p>En yaygın bilimsel hesap makineleri <b>Casio fx-82ES PLUS</b>, <b>fx-350ES PLUS</b> ve <b>fx-991ES PLUS</b>. Üçünde de tuşlar aynı yerde. Bu sayfa bunlara göre yazıldı. Makinende <b>fx-82EX</b> ya da <b>fx-991EX</b> (ClassWiz) yazıyorsa farklı olan yerleri ayrıca belirttim.</p></section>

      <section class="panel"><h3>2. Sınavdan önce bir kez: makineyi sıfırla</h3>
        <p>${K('SHIFT')} ${K('9')} → ${K('3')} (All) → ${K('=')} (Yes) → ${K('AC')}</p>
        <p>Ekranın üstünde küçük <b>Math</b> yazısı görünür. Bu ayarda kesirler ve kökler kağıttaki gibi görünür. Bu sayfadaki tuş sıraları bu ayara göre. ClassWiz'de de aynı tuşlar.</p></section>

      <section class="panel"><h3>3. Tuşlar ne işe yarar</h3><div class="tbl wrap"><table><thead><tr><th>Tuş</th><th>Ne yapar</th></tr></thead><tbody>
        <tr><td>${K('AC')}</td><td>Ekrandakini tamamen siler.</td></tr>
        <tr><td>${K('DEL')}</td><td>Son yazdığını siler.</td></tr>
        <tr><td>${K('=')}</td><td>Sonucu verir.</td></tr>
        <tr><td>${K('Ans')}</td><td>Bir önceki sonucu kullanır. Uzun işlemi parçalara bölmek için.</td></tr>
        <tr><td>${K('(−)')}</td><td>Negatif sayı yazar (−2 gibi). Çıkarma için ${K('−')} tuşu kullanılır.</td></tr>
        <tr><td>${K('x²')}</td><td>Kare alır. Sayıdan sonra basılır.</td></tr>
        <tr><td>${K('√■')}</td><td>Karekök. Basınca kök açılır, içine yaz, sonra ${K('▶')} ile kökten çık.</td></tr>
        <tr><td>${K('x<sup>■</sup>')}</td><td>Üs alır. Üssü yaz, sonra ${K('▶')} ile çık.</td></tr>
        <tr><td>${K('x⁻¹')}</td><td>1 bölü sayı.</td></tr>
        <tr><td>${K('×10<sup>x</sup>')}</td><td>Bilimsel gösterim: 1.2×10⁻³ yazmak için 1.2 ${K('×10<sup>x</sup>')} ${K('(−)')} 3.</td></tr>
        <tr><td>${K('S⇔D')}</td><td>Kesir sonucu ondalığa çevirir (3/4 → 0.75).</td></tr>
        <tr><td>${K('▶')}</td><td>Sağ ok. Kökten, üsten ve kesirden çıkar.</td></tr></tbody></table></div></section>

      <section class="panel"><h3>4. En önemli kural: bölmede parantez</h3>
        <p>Hesap makinesi önce çarpma ve bölmeyi, sonra toplama ve çıkarmayı yapar. Pay ya da paydada toplama/çıkarma varsa <b>parantez şart</b>.</p>
        <p><b>t istatistiği:</b> $t = \\dfrac{\\bar Y-\\mu_0}{s/\\sqrt n}$, $\\bar Y=52.1$, $\\mu_0=50$, $s=4.2$, $n=36$.</p>
        <p class="ok-t">Doğru:</p>${ex('(52.1-50)/(4.2/sqrt(36))')}
        <p class="bad-t">Yanlış (parantez yok):</p>${ex('52.1-50/4.2/sqrt(36)')}
        <p>İkincisinde makine önce $50 \\div 4.2 \\div 6$ yapıp 52.1'den çıkarıyor. Bu hatayla yanlış şıkkı seçersin.</p></section>

      <section class="panel"><h3>5. Kök, kare ve negatif sayı</h3>
        <p><b>Oran için standart hata</b> $\\sqrt{\\hat p(1-\\hat p)/n}$, $\\hat p=0.25$, $n=100$. Kökün içine girecek her şeyi yaz, en sonda ${K('▶')}:</p>${ex('sqrt(0.25*(1-0.25)/100)')}
        <p><b>Güven aralığının üst ucu</b> $\\bar Y + 1.96\\cdot SE$:</p>${ex('52.1+1.96*0.7')}
        <p><b>Negatifin karesi:</b> makine önce kareyi alır. ${K('(−)')} 2 ${K('x²')} sonucu −4 çıkar. −2'nin karesi için parantez kullan:</p>${ex('(-2)^2')}</section>

      <section class="panel"><h3>6. Ans ile adım adım</h3>
        <p>Her ${K('=')} sonrası sonuç <b>Ans</b>'a kaydedilir. Uzun işlemi böl, ara sonucu yuvarlama.</p>
        <p>Önce varyans: $p(1-p)$, sonra standart sapma $\\sqrt{\\text{varyans}}$:</p>${ex('0.53*(1-0.53)')}
        <p>Sonra ${K('√■')} ${K('Ans')} ${K('=')} → 0.4991. Ara sonucu yeniden yazmana gerek yok.</p></section>

      <section class="panel"><h3>7. Sonuç kesir çıkarsa</h3>
        <p>Math ayarında 3 ${K('÷')} 4 ${K('=')} yazınca ekranda ¾ görebilirsin. ${K('S⇔D')}'ye basınca 0.75 olur. Şıklar ondalık olduğu için çoğu zaman bunu yapacaksın. Yukarıdaki makinede de var: sonucun solundaki S⇔D.</p></section>

      <section class="panel"><h3>8. Çok küçük ve çok büyük sayılar</h3>
        <p>Ekranda <b>1.23×10⁻⁰⁴</b> görürsen bu 0.000123 demek. Yazmak için ${K('×10<sup>x</sup>')} kullan:</p>${ex('1.2E-3*5')}</section>

      <section class="panel"><h3>9. İstatistik modu: ortalama, standart sapma, regresyon</h3>
        <p>Veri verilen sorularda (birkaç X, Y değeri) her şeyi elle hesaplamak yerine makineye gir.</p>
        <ol class="steps">
          <li>${K('MODE')} → <b>STAT</b> (fx-82ES PLUS'ta 2, fx-991ES PLUS'ta 3; ekranda STAT yazan numara).</li>
          <li>Tek değişken için ${K('1')} (1-VAR), X ve Y için ${K('2')} (A+BX).</li>
          <li>Sayıları gir: her sayıdan sonra ${K('=')}. A+BX'te X sütunu bitince ${K('▶')} ile Y sütununa geç, ${K('▲')} ile en üste çık, Y'leri gir.</li>
          <li>${K('AC')}'ye bas. Veriler silinmez, hesap ekranına dönersin.</li>
          <li>${K('SHIFT')} ${K('1')} (STAT) menüsünden istediğini seç, ${K('=')}'e bas. Tablo aşağıda.</li>
          <li>Normal hesaba dönmek için ${K('MODE')} ${K('1')} (COMP).</li></ol>
        <p>Menü numaraları modele göre değişebilir. Numaraya değil ekranda yazan ada bak: <b>Var</b> (ortalama ve sapma), <b>Sum</b> (toplamlar), <b>Reg</b> (regresyon).</p>
        <p class="dikkat"><b>Dikkat:</b> Derste örneklem standart sapması $s$ ($n-1$'e bölen) kullanılır, makinede bu <b>sx</b>. σx $n$'e böler, onu seçme. Regresyonda Casio'nun <b>A</b>'sı sabit terim $\\hat\\beta_0$, <b>B</b>'si eğim $\\hat\\beta_1$. Karıştırma.</p>
        <p><b>ClassWiz (fx-82EX / fx-991EX):</b> ${K('MENU')} → 6 Statistics → 1 (1-Variable) ya da 2 (y=a+bx). Veriyi gir, ${K('AC')}, sonra ${K('OPTN')} → <b>1-Variable Calc</b> ya da <b>Regression Calc</b>: hepsi tek ekranda. Burada <b>a</b> sabit, <b>b</b> eğim.</p></section>

      <section class="panel"><h3>İstatistik aracı</h3>
        <p>Kendi makinende STAT modunda bulman gereken sonuçlar. Örnek veriyle açılır, soruların verisini yazıp makinendeki sonuçla karşılaştır.</p>
        <div id="stat-mount"></div></section>

      <section class="panel"><h3>10. Normal dağılım olasılığı (makinende varsa)</h3>
        <p><b>fx-991ES PLUS:</b> ${K('MODE')} → STAT → ${K('1')} (1-VAR) → ${K('AC')} → ${K('SHIFT')} ${K('1')} → <b>Distr</b> → <b>P(</b> → z değerini yaz → ${K(')')} ${K('=')}. Sonuç $\\Phi(z)=P(Z\\le z)$. Sağ kuyruk $P(Z>z)$ için <b>R(</b>.</p>
        <p><b>fx-991EX:</b> ${K('MENU')} → 7 Distribution → Normal CD → Lower: −100, Upper: z, σ: 1, μ: 0 → ${K('=')}.</p>
        <p><b>fx-82ES PLUS</b>'ta bu yok. Tablolar sekmesindeki Z tablosunu kullan; sınavda da tablo verilir.</p></section>

      <section class="panel"><h3>11. Sık yapılan hatalar</h3><ul class="steps">
        <li>Bölmede parantezi unutmak (en sık hata).</li>
        <li>sx yerine σx kullanmak.</li>
        <li>Ara sonuçları erken yuvarlamak. ${K('Ans')} kullan, en sonda yuvarla.</li>
        <li>STAT modunda kalıp normal işlem yapmak: ${K('MODE')} ${K('1')}.</li>
        <li>Sonuç kesir çıkınca şıklarda bulamamak: ${K('S⇔D')}.</li>
        <li>−2² ile (−2)²'yi karıştırmak.</li></ul></section>
    </div>`;
  }
  function mountPage(main) {
    const m = main.querySelector('#calc-mount'); if (!m) return;
    pageCalc = mount(m);
    const st = main.querySelector('#stat-mount'); if (st) statTool(st);
  }

  Object.assign(root.Calc, { stepsHTML, seqHTML, renderKeys, open, close, toggle, mountPage, pageHTML, ICON });
})(typeof window !== 'undefined' ? window : globalThis);
