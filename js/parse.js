/* İçerik ayrıştırıcı ve küçük biçimlendirici (markdown benzeri). */
(function (root) {
  'use strict';

  function parseContent(text) {
    const units = [];
    let U = null, L = null, cur = null;
    const lines = text.replace(/\r/g, '').split('\n');
    for (const line of lines) {
      if (line.startsWith('=== UNIT ')) {
        const p = line.slice(9).split(' | ');
        U = { id: p[0].trim(), week: p[1], title: p[2], sub: p[3] || '', lessons: [] };
        units.push(U); L = null; cur = null; continue;
      }
      if (line.startsWith('--- LESSON ')) {
        const p = line.slice(11).split(' | ');
        L = { id: p[0].trim(), glyph: p[1], title: p[2], unit: U.id, cards: [], qs: [], gens: [], fx: [] };
        U.lessons.push(L); cur = null; continue;
      }
      if (line.startsWith('## CARD ')) { cur = { kind: 'card', title: line.slice(8), body: [] }; L.cards.push(cur); continue; }
      if (line.trim() === '## Q') {
        cur = { kind: 'q', en: [], tr: [], opts: [], ex: [], src: '', hint: '', field: 'en', fence: false };
        L.qs.push(cur); continue;
      }
      if (line.startsWith('## GEN ')) { L.gens.push(line.slice(7).trim()); cur = null; continue; }
      // ders formülü: "FX: formül :: açıklama" (ilk karttan önce)
      if (line.startsWith('FX: ') && L && !cur) { const p = line.slice(4).split(' :: '); L.fx.push({ f: p[0].trim(), c: (p[1] || '').trim() }); continue; }
      if (!cur) continue;
      if (cur.kind === 'card') { cur.body.push(line); continue; }
      // soru alanları
      if (cur.field === 'ex') { cur.ex.push(line); continue; }
      if (!cur.fence) {
        let m;
        if ((m = /^EN:\s?(.*)$/.exec(line))) { cur.field = 'en'; cur.en.push(m[1]); continue; }
        if ((m = /^TR:\s?(.*)$/.exec(line))) { cur.field = 'tr'; cur.tr.push(m[1]); continue; }
        if ((m = /^SRC:\s?(.*)$/.exec(line))) { cur.src = m[1].trim(); continue; }
        if ((m = /^HINT:\s?(.*)$/.exec(line))) { cur.hint = m[1].trim(); continue; }
        if ((m = /^EX:\s?(.*)$/.exec(line))) { cur.field = 'ex'; cur.ex.push(m[1]); continue; }
        if (/^[+-] /.test(line)) { cur.opts.push({ t: line.slice(2), ok: line[0] === '+' }); cur.field = 'opts'; continue; }
      }
      if (line.startsWith('~~~')) cur.fence = !cur.fence;
      if (cur.field === 'en') cur.en.push(line);
      else if (cur.field === 'tr') cur.tr.push(line);
    }
    for (const u of units) for (const l of u.lessons) {
      l.cards.forEach(c => { c.body = c.body.join('\n').trim(); });
      l.qs = l.qs.map((q, i) => ({
        id: l.id + '.' + (i + 1), lesson: l.id, unit: l.unit, src: q.src,
        en: q.en.join('\n').trim(), tr: q.tr.join('\n').trim(), ex: q.ex.join('\n').trim(), opts: q.opts, hint: q.hint
      }));
    }
    return units;
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Satır içi biçim: $..$ ve $$..$$ korunur; ~kod~, **kalın**, ==fosforlu==
  function inline(s) {
    const keep = [];
    let t = esc(s).replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, (m) => { keep.push(m); return '\u0000' + (keep.length - 1) + '\u0000'; });
    t = t.replace(/~([^~\n]+)~/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
    return t.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
  }

  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return (' ' + s + ' ').split(/\s\|\s/).map(c => c.trim());
  }

  const CALLOUT = { ornek: 'Örnek', ipucu: 'İpucu', dikkat: 'Dikkat', formul: '' };

  function md(src) {
    const lines = (src || '').replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    const special = (l) => l.startsWith('@fig ') || l.startsWith('~~~') || l.startsWith(':::') || l.startsWith('|') || l.startsWith('• ') || /^\d+\.\s/.test(l) || /^\s*\$\$.*\$\$\s*$/.test(l);
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '') { i++; continue; }
      if (l.startsWith('@fig ')) {   // şekil: js/figs.js
        const F = (typeof window !== 'undefined' ? window : globalThis).FIGS || {}, f = F[l.slice(5).trim()];
        if (f) out.push(`<figure class="fig"><div class="fig-art" role="img" aria-label="${esc(f.t)}">${f.svg}</div><figcaption><b>${inline(f.t)}</b>${f.n ? '<br>' + inline(f.n) : ''}</figcaption></figure>`);
        i++; continue;
      }
      if (l.startsWith('~~~')) {
        const buf = []; i++;
        while (i < lines.length && !lines[i].startsWith('~~~')) buf.push(lines[i++]);
        i++;
        out.push('<div class="code"><pre>' + esc(buf.join('\n')) + '</pre></div>');
        continue;
      }
      if (l.startsWith(':::')) {
        const m = /^:::(\w+)\s*(.*)$/.exec(l) || [];
        const type = m[1] || 'ipucu'; const title = m[2] || CALLOUT[type] || '';
        const buf = []; i++;
        while (i < lines.length && lines[i].trim() !== ':::') buf.push(lines[i++]);
        i++;
        out.push(`<div class="callout c-${type}">` + (title ? `<div class="callout-t">${inline(title)}</div>` : '') + md(buf.join('\n')) + '</div>');
        continue;
      }
      if (l.startsWith('|')) {
        const rows = [];
        while (i < lines.length && lines[i].startsWith('|')) rows.push(splitRow(lines[i++]));
        const head = rows.shift();
        out.push('<div class="tbl"><table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
        continue;
      }
      if (l.startsWith('• ')) {
        const items = [];
        while (i < lines.length && lines[i].startsWith('• ')) items.push(lines[i++].slice(2));
        out.push('<ul>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
        continue;
      }
      if (/^\d+\.\s/.test(l)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, ''));
        out.push('<ol>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ol>');
        continue;
      }
      if (/^\s*\$\$.*\$\$\s*$/.test(l)) { out.push('<div class="mathblock">' + esc(l.trim()) + '</div>'); i++; continue; }
      const buf = [];
      while (i < lines.length && lines[i].trim() !== '' && !special(lines[i])) buf.push(lines[i++]);
      out.push((/^\*\*Adım \d+:/.test(buf[0]) ? '<p class="step">' : '<p>') + buf.map(inline).join('<br>') + '</p>');
    }
    return out.join('');
  }

  root.EP = { parseContent, md, inline, esc };
})(typeof window !== 'undefined' ? window : globalThis);
