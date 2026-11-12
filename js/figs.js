/* Konu kartlarındaki şekiller. Kitaptaki şekiller bu uygulama için yeniden çizildi (SVG, tema renkleriyle).
   Veri grafikleri yaklaşık değerlerle çizilmiştir; başlıklarında "yaklaşık" yazar.
   Kartta kullanım: tek başına bir satırda "@fig kimlik". */
(function (root) {
  'use strict';
  const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const n1 = (v) => Math.round(v * 10) / 10;
  const T = (x, y, s, o) => { o = o || {}; return `<text x="${n1(x)}" y="${n1(y)}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.c ? ` class="${o.c}"` : ''}${o.r ? ` transform="rotate(${o.r} ${n1(x)} ${n1(y)})"` : ''}>${e(s)}</text>`; };
  const L = (x1, y1, x2, y2, c) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${c || 'ax'}"/>`;
  const PL = (pts, c) => `<polyline points="${pts.map(p => n1(p[0]) + ',' + n1(p[1])).join(' ')}" class="${c}"/>`;
  const PG = (pts, c) => `<polygon points="${pts.map(p => n1(p[0]) + ',' + n1(p[1])).join(' ')}" class="${c}"/>`;
  const RC = (x, y, w, h, c, rx) => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${rx == null ? 8 : rx}" class="${c}"/>`;
  const CI = (x, y, r, c) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" class="${c}"/>`;
  function AR(x1, y1, x2, y2, c, hs) {
    c = c || 'ar'; hs = hs || 10;
    const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - hs * Math.cos(a), by = y2 - hs * Math.sin(a), px = Math.sin(a) * hs * 0.55, py = -Math.cos(a) * hs * 0.55;
    return L(x1, y1, bx, by, c) + `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + px)},${n1(by + py)} ${n1(bx - px)},${n1(by - py)}" class="${c}h"/>`;
  }
  const TM = (x, y, lines, o) => lines.map((s, k) => T(x, y + k * ((o && o.lh) || 17), s, Object.assign({ a: 'middle' }, o || {}))).join('');
  const BOX = (x, y, w, h, lines, c, tc) => RC(x, y, w, h, c || 'bx') + TM(x + w / 2, y + h / 2 - (lines.length - 1) * 8.5 + 5, lines, { c: tc || '' });
  const SVG = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" focusable="false">${body}</svg>`;
  const LEG = (x, y, items, dx) => items.map((it, k) => { const xx = x + (dx ? k * dx : 0), yy = y + (dx ? 0 : k * 19); return L(xx, yy - 5, xx + 22, yy - 5, it[0]) + T(xx + 28, yy, it[1], { c: 'lg' }); }).join('');
  const smp = (fn, a, b, n) => Array.from({ length: (n || 60) + 1 }, (_, k) => { const t = a + (b - a) * k / (n || 60); return fn(t); });

  // Zaman/veri grafikleri için koordinat sistemi
  function frame(o) {
    const W = o.w || 520, H = o.h || 300, m = Object.assign({ l: 46, r: 14, t: 14, b: 44 }, o.m || {});
    const X = (v) => m.l + (v - o.x[0]) / (o.x[1] - o.x[0]) * (W - m.l - m.r);
    const Y = (v) => H - m.b - (v - o.y[0]) / (o.y[1] - o.y[0]) * (H - m.t - m.b);
    let s = '';
    (o.shade || []).forEach(b => { s += RC(X(b[0]), m.t, X(b[1]) - X(b[0]), H - m.b - m.t, 'sh', 0); });
    (o.yt || []).forEach(v => { s += L(m.l, Y(v), W - m.r, Y(v), 'gr') + T(m.l - 6, Y(v) + 4.5, (o.yf || String)(v), { a: 'end', c: 'tk' }); });
    (o.xt || []).forEach(v => { s += L(X(v), H - m.b, X(v), H - m.b + 5, 'ax') + T(X(v), H - m.b + 19, (o.xf || String)(v), { a: 'middle', c: 'tk' }); });
    s += L(m.l, m.t - 4, m.l, H - m.b, 'ax') + L(m.l, H - m.b, W - m.r + 4, H - m.b, 'ax');
    if (o.xl) s += T((m.l + W - m.r) / 2, H - 5, o.xl, { a: 'middle', c: 'lb' });
    if (o.yl) s += T(13, (m.t + H - m.b) / 2, o.yl, { a: 'middle', c: 'lb', r: -90 });
    return { X, Y, W, H, m, s, line: (pts, c) => PL(pts.map(p => [X(p[0]), Y(p[1])]), c) };
  }
  // İktisat diyagramı ekseni: oklu eksenler, uç etiketleri, isteğe bağlı işaretler
  function E(o) {
    const W = o.w || 520, H = o.h || 336, m = Object.assign({ l: 54, r: 26, t: 30, b: 50 }, o.m || {});
    const X = (v) => m.l + v / o.xm * (W - m.l - m.r), Y = (v) => H - m.b - v / o.ym * (H - m.t - m.b);
    let s = AR(m.l, H - m.b, m.l, m.t - 16, 'ax', 8) + AR(m.l, H - m.b, W - m.r + 14, H - m.b, 'ax', 8);
    s += T(m.l + 8, m.t - 10, o.yl || '', { c: 'lb' }) + T(W - m.r + 12, H - m.b + 38, o.xl || '', { a: 'end', c: 'lb' }) + T(m.l - 8, H - m.b + 16, '0', { a: 'end', c: 'tk' });
    (o.xt || []).forEach(t => { s += L(X(t[0]), H - m.b, X(t[0]), H - m.b + 5, 'ax') + T(X(t[0]), H - m.b + 18, t[1], { a: 'middle', c: 'tk' }); });
    (o.yt || []).forEach(t => { s += L(m.l - 5, Y(t[0]), m.l, Y(t[0]), 'ax') + T(m.l - 8, Y(t[0]) + 4.5, t[1], { a: 'end', c: 'tk' }); });
    const P = (pts, c) => PL(pts.map(p => [X(p[0]), Y(p[1])]), c);
    const D = (x, y, lab, dx, dy, c) => CI(X(x), Y(y), 5, c || 'pt') + (lab ? T(X(x) + (dx == null ? 9 : dx), Y(y) + (dy == null ? -8 : dy), lab, { c: 'hd' }) : '');
    const G = (x, y) => L(X(x), Y(y), X(x), Y(0), 'gd') + L(X(x), Y(y), X(0), Y(y), 'gd');
    return { X, Y, W, H, m, s, P, D, G };
  }
  // tanjant noktasında verilen eğimde kayıtsızlık eğrisi: y = A x^(-a)
  function ic(x0, y0, slope, x1, x2) { const a = slope * x0 / y0, A = y0 * Math.pow(x0, a); return smp(x => [x, A * Math.pow(x, -a)], x1, x2, 50); }
  // içbükey PPF (çeyrek elips): yatay uç a, dikey uç b
  const ppfE = (a, b) => smp(t => [a * Math.cos(t), b * Math.sin(t)], 0, Math.PI / 2, 60);
  const ppfAt = (a, b, slope) => { const t = Math.atan(b / (a * slope)); return [a * Math.cos(t), b * Math.sin(t)]; };   // |eğim| = slope olan nokta
  const clipY = (pts, lo, hi) => pts.filter(p => p[1] >= lo && p[1] <= hi);
  // sayı doğrusu: değerleri sıralı gösterir
  function numline(items, o) {
    o = o || {}; const W = 520, H = o.h || 110, lo = o.lo, hi = o.hi, x = (v) => 30 + (v - lo) / (hi - lo) * (W - 60), y = 52;
    let s = AR(16, y, W - 10, y, 'ax', 8) + L(x(0), y - 8, x(0), y + 8, 'ax') + T(x(0), y + 26, '0', { a: 'middle', c: 'tk' });
    items.forEach((it, k) => { s += CI(x(it[0]), y, 6, it[2] || 'pt') + T(x(it[0]), y - 16 - (k % 2) * 0, it[1], { a: 'middle', c: 'hd' }) + T(x(it[0]), y + 26, (it[0] > 0 ? '+' : '') + it[0] + '%', { a: 'middle', c: 'tk' }) + (it[3] ? T(x(it[0]), y + 44, it[3], { a: 'middle', c: 'lg' }) : ''); });
    if (o.cap) s += T(W / 2, H - 6, o.cap, { a: 'middle', c: 'lb' });
    return SVG(W, H, s);
  }
  // yatay çubuk grafik
  function hbars(rows, o) {
    o = o || {}; const W = 520, rh = o.rh || 24, H = 20 + rows.length * rh + 20, lw = o.lw || 170, mx = o.max || Math.max(...rows.map(r => r[1]));
    let s = '';
    rows.forEach((r, k) => { const y = 14 + k * rh, w = (W - lw - 60) * r[1] / mx; s += T(lw - 8, y + rh / 2 + 4, r[0], { a: 'end', c: 'lg' }) + RC(lw, y + 3, w, rh - 8, r[2] || 'b1', 3) + T(lw + w + 6, y + rh / 2 + 4, r[1] + (o.unit || ''), { c: 'tk' }); });
    if (o.cap) s += T(W / 2, H - 4, o.cap, { a: 'middle', c: 'lb' });
    return SVG(W, H, s);
  }

  const F = {};

  /* ======================= Bölüm 1 ======================= */
  F.comp1925 = (() => {
    const W = 520, H = 250, bw = 70, base = 200, sc = 1.7;
    const bars = [['İthalat 1925', 90, 'gıda + sanayi girdisi', 'b0'], ['İthalat 2018', 30, '', 'b0'], ['İhracat 1925', 20, 'sermaye + tüketim + otomobil', 'b1'], ['İhracat 2018', 60, '', 'b1']];
    let s = '';
    bars.forEach((b, k) => {
      const x = 40 + k * 120, h1 = b[1] * sc, h2 = (100 - b[1]) * sc;
      s += RC(x, base - h1, bw, h1, b[3], 0) + RC(x, base - h1 - h2, bw, h2, 'bx', 0) + T(x + bw / 2, base - h1 / 2 + 5, '%' + b[1], { a: 'middle', c: b[3] === 'b1' ? 'tw' : 'hd' }) + T(x + bw / 2, base + 18, b[0], { a: 'middle', c: 'lg' });
    });
    s += RC(40, 230, 14, 12, 'b0', 2) + T(60, 240, 'ithalatta: gıda, yem, içecek + sanayi girdileri', { c: 'lg' });
    s += RC(40, 248, 14, 12, 'b1', 2) + T(60, 258, 'ihracatta: sermaye malı + tüketim malı + otomobil', { c: 'lg' });
    return { t: 'Şekil 1-1 · ABD ticaretinin bileşimi, 1925 ve 2018 (yaklaşık)', n: 'Yüz yıl önce ticaret ham madde ve basit işlenmiş mallardı; bugün çoğu yüksek işlenmiş tüketim ve sermaye malı, üretim sırasında sınırları birkaç kez geçiyor.', svg: SVG(W, H + 18, s) };
  })();
  F.regions = { t: 'Tablo 1-1 · Dünya ticaretindeki paylar, 2018 (%)', n: 'En büyük akım Avrupa içi ticaret (4.5 trilyon dolar). Avrupa içi + ABD ile ticaret dörtte bir. Afrika, dünya topraklarının %20\'sine ve nüfusun %17\'sine rağmen ticaretin %2\'si.',
    svg: hbars([['Avrupa ve Amerika (ihracat)', 49, 'b0'], ['Asya (ihracat)', 29], ['Avrupa içi + ABD', 26], ['Avrupa içi', 21], ['Orta Doğu ve Rusya', 9], ['Amerika kıtası içi', 8], ['Afrika (ihracat)', 2, 'b2'], ['Avustralya, Y. Zelanda', 2]], { unit: '%', lw: 190 }) };
  F.tradegdp = { t: 'Tablo 1-2 · Ticaret/GSYH oranı, 2018 (seçilmiş ülkeler, %)', n: 'Oranı en yüksek ülkeler küçük ekonomiler; büyük ülkeler ticaretin çoğunu kendi içinde yapar. Türkiye %30, ABD %16.',
    svg: hbars([['Hong Kong', 188], ['Singapur', 163], ['Macaristan', 84], ['Almanya', 44], ['Meksika', 40], ['Türkiye', 30, 'b4'], ['Hindistan', 22], ['Çin', 19], ['Japonya', 18], ['ABD', 16], ['Brezilya', 15]], { unit: '%', lw: 120, rh: 22 }) };
  F.goldenages = (() => {
    const fr = frame({ x: [1870, 2020], y: [0, 40], xt: [1870, 1890, 1913, 1930, 1950, 1970, 1990, 2010], yt: [0, 10, 20, 30, 40], yf: v => v + '%', yl: 'ticaret / GSYH', shade: [[1890, 1913], [1950, 2018]], h: 290 });
    const pts = [[1870, 10], [1880, 12], [1890, 13], [1900, 16], [1913, 19], [1918, 13], [1925, 15], [1932, 9], [1938, 10], [1945, 8], [1950, 10], [1960, 11], [1970, 13], [1980, 18], [1990, 19], [2000, 25], [2008, 30], [2009, 25], [2014, 29], [2018, 28]];
    return { t: 'Şekil 1-3 · İki "altın çağ" (şematik)', n: 'Birinci altın çağ 1890–1913: buharlı gemi ve demiryolu. Savaşlar ve Büyük Buhran bunu bitirdi; çoğu sanayi ülkesi 1913 düzeyine ancak 1970\'lerde döndü. İkinci altın çağ 1950 sonrası: GATT ile tarife indirimleri ve 1956\'da icat edilen konteyner.',
      svg: SVG(fr.W, fr.H, fr.s + fr.line(pts, 'l1') + T(fr.X(1901), fr.Y(36), '1. altın çağ', { a: 'middle', c: 'tp' }) + T(fr.X(1985), fr.Y(36), '2. altın çağ', { a: 'middle', c: 'tp' }) + T(fr.X(1932), fr.Y(4), 'savaşlar, buhran', { a: 'middle', c: 'lg' })) };
  })();
  F.tariffs = (() => {
    const fr = frame({ x: [1860, 2020], y: [0, 30], xt: [1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020], yt: [0, 5, 10, 15, 20, 25, 30], yf: v => v + '%', yl: 'ortalama tarife', shade: [[1914, 1918], [1929, 1939], [1939, 1945]], h: 290 });
    const pts = [[1860, 14], [1870, 15], [1880, 15], [1890, 16], [1900, 15], [1913, 14], [1920, 11], [1925, 15], [1930, 19], [1933, 25], [1937, 22], [1945, 18], [1950, 15], [1960, 12], [1970, 10], [1980, 9], [1990, 8], [2000, 6], [2010, 4], [2019, 4]];
    return { t: 'Şekil 1-4 · 35 ülkenin ortalama tarifesi, 1860–2019 (yaklaşık)', n: '1860–1913 arası yaklaşık %15. Smoot–Hawley (1930) ve misillemeler 1933\'te %25\'e çıkardı (ticaret savaşı). İkinci Dünya Savaşı\'ndan sonra GATT turlarıyla düştü.',
      svg: SVG(fr.W, fr.H, fr.s + fr.line(pts, 'l2') + T(fr.X(1933), fr.Y(26.5), 'Smoot–Hawley', { a: 'middle', c: 'tb' }) + T(fr.X(1975), fr.Y(13), 'GATT turları', { a: 'middle', c: 'lg' })) };
  })();
  F.uschina = (() => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const us = [3.1, 3.2, 3.8, 3.8, 3.8, 3.8, 6.7, 8.2, 12.0, 12.0, 12.0, 12.0, 17.6, 17.6, 21.0, 21.0];
    const cn = [8.0, 8.0, 8.4, 8.3, 7.2, 10.1, 14.4, 18.3, 18.2, 16.5, 16.5, 20.7, 20.7, 21.8, 21.8, 21.1];
    const st = (a) => { const p = []; a.forEach((v, k) => { if (k) p.push([k, a[k - 1]]); p.push([k, v]); }); return p; };
    const fr = frame({ x: [0, 15], y: [0, 25], xt: [0, 8, 12, 15], xf: v => ({ 0: 'Oca 2018', 8: 'Eyl 2018', 12: 'Haz 2019', 15: 'Ara 2019' })[v], yt: [0, 5, 10, 15, 20, 25], yf: v => v + '%', yl: 'ortalama tarife', h: 280 });
    return { t: 'Şekil 1-5 · ABD–Çin ticaret savaşı (yaklaşık)', n: 'ABD\'nin Çin mallarına ortalama tarifesi %3.1\'den %21\'e, Çin\'in ABD mallarına tarifesi %8\'den %21.8\'e çıktı. Tarifeler yalnızca Çin\'e ve yüksek düzeyde uygulandı; bu, önceki ABD başkanlarından farklıydı.',
      svg: SVG(fr.W, fr.H, fr.s + fr.line(st(us), 'l1') + fr.line(st(cn), 'l2') + LEG(70, 26, [['l1', 'ABD\'nin Çin mallarına tarifesi'], ['l2', 'Çin\'in ABD mallarına tarifesi']])) };
  })();
  F.iphone = (() => {
    const W = 520, H = 190, x0 = 20, sc = 0.72;
    let s = T(x0, 22, 'Çin\'den ABD\'ye ihracat değeri: 227 dolar', { c: 'hd' }) + RC(x0, 32, 8 * sc, 30, 'b2', 0) + RC(x0 + 8 * sc, 32, 219 * sc, 30, 'b0', 0);
    s += T(x0 + 227 * sc + 10, 45, 'kırmızı ince şerit: Çin katma değeri 8', { c: 'tb' }) + T(x0 + 227 * sc + 10, 62, 'açık mavi: ithal parçalar 219', { c: 'lg' });
    s += T(x0, 104, 'ABD\'de satış fiyatı: 650 dolar', { c: 'hd' }) + RC(x0, 114, 650 * sc, 30, 'bx', 0) + RC(x0, 114, 227 * sc, 30, 'b0', 0);
    s += T(x0, 176, 'İstatistikte 227 doların tamamı Çin ihracatı sayılır.', { c: 'lg' });
    return { t: 'iPhone 5 (2013): brüt ihracat ve katma değer', n: 'ABD–Çin ikili açığı brüt değerlerle ölçülür; Çin\'de yaratılan değer çok daha küçüktür. Küresel değer zincirlerinde ara mallar sınırları birkaç kez geçer.', svg: SVG(W, H, s) };
  })();
  F.fdi = (() => {
    const W = 520, H = 200;
    let s = T(130, 22, 'Yatay FDI', { a: 'middle', c: 'tp' }) + T(390, 22, 'Dikey FDI', { a: 'middle', c: 'tp' });
    s += BOX(40, 40, 180, 46, ['sanayi ülkesindeki firma', '(örneğin Almanya)'], 'bxp') + AR(130, 88, 130, 120, 'ar1') + BOX(40, 122, 180, 46, ['sanayi ülkesindeki şirket', '(örneğin ABD)']);
    s += BOX(300, 40, 180, 46, ['sanayi ülkesindeki firma', '(örneğin ABD)'], 'bxp') + AR(390, 88, 390, 120, 'ar1') + BOX(300, 122, 180, 46, ['gelişmekte olan ülkedeki', 'fabrika (düşük ücret)']);
    s += T(260, 192, 'Dünya FDI\'sinin çoğu yatay: sanayi ülkeleri arasında.', { a: 'middle', c: 'lg' });
    return { t: 'Yatay ve dikey doğrudan yabancı yatırım', n: 'FDI: bir ülkedeki firmanın başka ülkedeki bir firmanın bir kısmına ya da tamamına sahip olması (ABD istatistiğinde %10 ve üstü). Dikey FDI\'nin ana nedeni düşük ücretler.', svg: SVG(W, H, s) };
  })();

  /* ======================= Bölüm 2: Ricardo ======================= */
  F.ppfh = (() => {
    const A = E({ xm: 120, ym: 75, xl: 'Buğday, Q_W (buşel)', yl: 'Kumaş, Q_C (yarda)', xt: [[50, '50'], [100, '100']], yt: [[25, '25'], [50, '50']] });
    let s = A.s + A.P([[0, 50], [100, 0]], 'l1') + T(A.X(62), A.Y(28), 'Home PPF', { c: 'tp' });
    s += L(A.X(20), A.Y(40), A.X(30), A.Y(40), 'gd') + L(A.X(30), A.Y(40), A.X(30), A.Y(35), 'gd') + T(A.X(25), A.Y(40) - 8, '+10 buğday', { a: 'middle', c: 'lg' }) + T(A.X(30) + 6, A.Y(37.5) + 4, '−5 kumaş', { c: 'lg' });
    s += T(A.X(40), A.Y(66), 'eğim = −MPL_C / MPL_W = −2/4 = −1/2', { c: 'hd' });
    return { t: 'Şekil 2-1 · Home\'un üretim imkânları eğrisi', n: '25 işçi, MPL_W = 4, MPL_C = 2: hepsi buğdayda 100 buşel, hepsi kumaşta 50 yarda. Doğru çizgi: verimlilik sabit, fırsat maliyeti sabit (1 buğday = 1/2 kumaş).', svg: SVG(A.W, A.H, s) };
  })();
  F.ppff = (() => {
    const A = E({ xm: 120, ym: 120, xl: 'Buğday, Q*_W', yl: 'Kumaş, Q*_C', xt: [[50, '50'], [100, '100']], yt: [[50, '50'], [100, '100']] });
    const s = A.s + A.P([[0, 100], [100, 0]], 'l2') + T(A.X(66), A.Y(42), 'Foreign PPF', { c: 'tb' }) + A.P(ic(50, 50, 1, 22, 110), 'l5 thin') + A.D(50, 50, 'A*') + T(A.X(54), A.Y(104), 'eğim = −MPL*_C / MPL*_W = −1', { c: 'hd' });
    return { t: 'Şekil 2-3 ve 2-4 · Foreign\'ın PPF\'si ve otarşi dengesi', n: '100 işçi, işçi başına 1 buğday ya da 1 kumaş: 100 buğday ya da 100 kumaş. Otarşi noktası A* = (50, 50). Home iki malda da mutlak üstün, ama Foreign\'ın kumaştaki fırsat maliyeti daha düşük (1 < 2).', svg: SVG(A.W, A.H, s) };
  })();
  F.autarky = (() => {
    const A = E({ xm: 120, ym: 75, xl: 'Buğday, Q_W', yl: 'Kumaş, Q_C', xt: [[50, '50'], [100, '100']], yt: [[25, '25'], [50, '50']] });
    let s = A.s + A.P([[0, 50], [100, 0]], 'l1') + A.P(clipY(ic(50, 25, 0.5, 12, 118), 0, 72), 'l5 thin') + A.P(clipY(ic(55, 40, 0.5, 26, 118), 0, 72), 'l3 thin');
    s += A.D(50, 25, 'A', 8, -10) + A.D(25, 50, 'B') + A.D(55, 40, 'C') + A.D(85, 7.5, 'D', 6, -10);
    s += T(A.X(112), A.Y(4), 'U₁', { c: 'lg' }) + T(A.X(110), A.Y(19), 'U₂', { c: 'tg' });
    return { t: 'Şekil 2-2 · Ticaret yokken Home dengesi', n: 'A ve B aynı kayıtsızlık eğrisi U₁ üzerinde. PPF üzerinde en yüksek fayda A\'da (25 kumaş, 50 buğday): otarşi dengesi. D de PPF üzerinde ama daha düşük fayda. C daha yüksek fayda verir ama PPF\'nin dışında: ticaretsiz ulaşılamaz.', svg: SVG(A.W, A.H, s) };
  })();
  F.tradeh = (() => {
    const A = E({ xm: 120, ym: 75, xl: 'Buğday, Q_W', yl: 'Kumaş, Q_C', xt: [[40, '40'], [50, '50'], [100, '100']], yt: [[25, '25'], [40, '40'], [50, '50'], [66.67, '66.7']] });
    let s = A.s + A.P([[0, 50], [100, 0]], 'l1') + A.P([[0, 200 / 3], [100, 0]], 'l2');
    s += A.P(clipY(ic(50, 25, 0.5, 14, 118), 0, 72), 'l5 thin') + A.P(clipY(ic(40, 40, 2 / 3, 18, 118), 0, 72), 'l3 thin');
    s += L(A.X(100), A.Y(0), A.X(40), A.Y(0) - 0, 'gd') + L(A.X(40), A.Y(0), A.X(40), A.Y(40), 'gd');
    s += T(A.X(70), A.Y(0) - 8, 'ihracat 60 buğday', { a: 'middle', c: 'lg' }) + T(A.X(40) - 6, A.Y(18), 'ithalat 40 kumaş', { a: 'end', c: 'lg' });
    s += A.D(50, 25, 'A', 8, 16) + A.D(100, 0, 'B', -4, -12) + A.D(40, 40, 'C', 9, -10);
    s += LEG(290, 20, [['l2', 'dünya fiyatı, eğim −2/3'], ['l1', 'Home PPF, eğim −1/2']]) + T(A.X(112), A.Y(5), 'U₁', { c: 'lg' }) + T(A.X(104), A.Y(22), 'U₂', { c: 'tg' });
    return { t: 'Şekil 2-5 · Home\'da ticaret dengesi', n: 'Dünya fiyatı P_W/P_C = 2/3 (otarşideki 1/2\'den yüksek): Home buğdayda tam uzmanlaşır (B: 100 buğday). Her buğday 2/3 kumaş eder: 60 buğday ihraç, 40 kumaş ithal, tüketim C = (40, 40). C daha yüksek kayıtsızlık eğrisinde (U₂ > U₁): ticaretten kazanç. Kesikli çizgiler ticaret üçgeni.', svg: SVG(A.W, A.H, s) };
  })();
  F.tradef = (() => {
    const A = E({ xm: 160, ym: 120, xl: 'Buğday, Q*_W', yl: 'Kumaş, Q*_C', xt: [[60, '60'], [100, '100'], [150, '150']], yt: [[60, '60'], [100, '100']] });
    let s = A.s + A.P([[0, 100], [100, 0]], 'l2 thin') + A.P([[0, 100], [150, 0]], 'l1');
    s += A.P(clipY(ic(50, 50, 1, 22, 150), 0, 115), 'l5 thin') + A.P(clipY(ic(60, 60, 2 / 3, 28, 155), 0, 115), 'l3 thin');
    s += L(A.X(0), A.Y(100), A.X(0), A.Y(60), 'gd') + L(A.X(0), A.Y(60), A.X(60), A.Y(60), 'gd');
    s += A.D(50, 50, 'A*', -30, 18) + A.D(0, 100, 'B*', 9, -6) + A.D(60, 60, 'C*', 9, -10);
    s += LEG(300, 20, [['l1', 'dünya fiyatı, eğim −2/3'], ['l2 thin', 'Foreign PPF, eğim −1']]);
    return { t: 'Şekil 2-6 · Foreign\'da ticaret dengesi', n: 'Foreign kumaşta uzmanlaşır (B*: 100 kumaş). 40 kumaş ihraç edip 60 buğday ithal eder; tüketim C* = (60, 60): otarşiye (50, 50) göre iki maldan da 10 fazla. Fiyat doğrusu buğday eksenini 150\'de keser (100 kumaş × 3/2).', svg: SVG(A.W, A.H, s) };
  })();
  F.wheatmkt = (() => {
    const A = E({ xm: 110, ym: 1.35, xl: 'Buğday ihracatı / ithalatı', yl: 'P_W / P_C', xt: [[50, '50'], [60, '60'], [100, '100']], yt: [[0.5, '1/2'], [2 / 3, '2/3'], [1, '1']] });
    const sup = [[0, 0.5], [50, 0.5]].concat(smp(q => [q, 0.5 + (1 / 6) * Math.pow((q - 50) / 10, 1.3)], 50, 95, 30));
    const dem = [[0, 1], [50, 1]].concat(smp(q => [q, 1 - (1 / 3) * Math.pow((q - 50) / 10, 0.9)], 50, 95, 30)).filter(p => p[1] > 0.3);
    let s = A.s + A.P(sup.filter(p => p[1] <= 1.3), 'l1') + A.P(dem, 'l2') + A.G(60, 2 / 3) + A.D(60, 2 / 3, 'C′', 9, -8);
    s += T(A.X(75), A.Y(1.22), 'Home ihracat arzı', { c: 'tp' }) + T(A.X(62), A.Y(1.05), 'Foreign ithalat talebi', { c: 'tb' });
    return { t: 'Şekil 2-10, 2-11, 2-12 · Dünya buğday piyasası', n: 'Home 1/2 fiyatında 0–50 arası her miktarı ihraç etmeye razı (düz kısım: iki sektör arasında kayıtsız); fiyat 1/2\'nin üstünde 50\'den fazla ihraç eder. Foreign 1 fiyatında 0–50 ithal eder, 1\'in altında daha fazla. Denge C′: fiyat 2/3, ticaret 60 buşel.', svg: SVG(A.W, A.H, s) };
  })();
  F.prodwage = (() => {
    const rows = [['ABD', 72, 35], ['Japonya', 57, 35], ['İsveç', 54, 49], ['Fransa', 50, 42], ['İtalya', 34, 36], ['G. Kore', 34, 20], ['Tayvan', 30, 10]];
    const W = 520, H = 250, base = 200, sc = 2.2; let s = L(40, base, 510, base, 'ax');
    rows.forEach((r, k) => { const x = 50 + k * 66; s += RC(x, base - r[1] * sc, 24, r[1] * sc, 'b1', 0) + RC(x + 26, base - r[2] * sc, 24, r[2] * sc, 'b3', 0) + T(x + 25, base + 17, r[0], { a: 'middle', c: 'lg' }); });
    s += RC(300, 14, 14, 12, 'b1', 2) + T(320, 24, 'verimlilik (saat başı katma değer)', { c: 'lg' }) + RC(300, 32, 14, 12, 'b3', 2) + T(320, 42, 'imalatta saatlik ücret', { c: 'lg' });
    return { t: 'Şekil 2-7 · Emek verimliliği ve ücretler, 2012 (yaklaşık, dolar/saat)', n: 'Verimliliği yüksek ülkeler daha yüksek ücret öder: Ricardo modelindeki "ücret düzeyini mutlak üstünlük belirler" sonucu. Düşük verimli ülkeler düşük ücret sayesinde ihracat yapabilir.', svg: SVG(W, H, s) };
  })();

  /* ======================= Bölüm 3: özgül faktörler ======================= */
  F.prodfn = (() => {
    const W = 520, H = 250;
    const a = { l: 40, r: 250, t: 30, b: 210 }, b = { l: 300, r: 505, t: 30, b: 210 };
    let s = AR(a.l, a.b, a.l, a.t - 12, 'ax', 8) + AR(a.l, a.b, a.r, a.b, 'ax', 8) + AR(b.l, b.b, b.l, b.t - 12, 'ax', 8) + AR(b.l, b.b, b.r, b.b, 'ax', 8);
    s += PL(smp(t => [a.l + t * 190, a.b - 160 * Math.sqrt(t)], 0, 1, 40), 'l1') + PL(smp(t => [b.l + 8 + t * 185, b.t + 12 + 150 * (1 - Math.exp(-2.4 * t)) / (1 - Math.exp(-2.4))], 0, 1, 40), 'l2');
    s += T(a.l + 6, a.t - 14, 'Q_M', { c: 'lb' }) + T(a.r, a.b + 22, 'L_M', { a: 'end', c: 'lb' }) + T(b.l + 6, b.t - 14, 'MPL_M', { c: 'lb' }) + T(b.r, b.b + 22, 'L_M', { a: 'end', c: 'lb' });
    s += T(145, 238, '(a) imalat çıktısı', { a: 'middle', c: 'lg' }) + T(402, 238, '(b) emeğin marjinal ürünü', { a: 'middle', c: 'lg' });
    return { t: 'Şekil 3-1 · Azalan verim', n: 'Sermaye sabitken işçi ekledikçe çıktı artar ama giderek daha az artar (a). Bu yüzden emeğin marjinal ürünü düşer (b). Tarımda toprak sabit: aynı mantık.', svg: SVG(W, H, s) };
  })();
  F.sfppf = (() => {
    const A = E({ xm: 120, ym: 120, xl: 'İmalat, Q_M', yl: 'Tarım, Q_A' });
    const pa = ppfAt(100, 100, 1), pb = ppfAt(100, 100, 1.9);
    const tl = (p, sl, d1, d2) => [[p[0] - d1, p[1] + sl * d1], [p[0] + d2, p[1] - sl * d2]];
    const C = [pb[0] - 30, pb[1] + 1.9 * 30];
    let s = A.s + A.P(ppfE(100, 100), 'l1') + A.P(tl(pa, 1, 45, 45), 'l5 thin') + A.P(tl(pb, 1.9, 34, 14), 'l2');
    s += A.P(clipY(ic(pa[0], pa[1], 1, 30, 118), 0, 118), 'l5 thin dsh') + A.P(clipY(ic(C[0], C[1], 1.9, 36, 118), 0, 118), 'l3 thin');
    s += A.D(pa[0], pa[1], 'A', -22, -8) + A.D(pb[0], pb[1], 'B', 9, 4) + A.D(C[0], C[1], 'C', -24, -6);
    s += L(A.X(C[0]), A.Y(C[1]), A.X(C[0]), A.Y(pb[1]), 'gd') + L(A.X(C[0]), A.Y(pb[1]), A.X(pb[0]), A.Y(pb[1]), 'gd');
    s += LEG(70, 262, [['l2', 'dünya fiyatı (P_M/P_A)^W'], ['l5 thin', 'otarşi fiyatı'], ['l3 thin', 'U₂']]);
    return { t: 'Şekil 3-2 ve 3-3 · Özgül faktörler modelinde PPF ve ticaret', n: 'Azalan verim PPF\'yi eğri yapar: imalat büyüdükçe dikleşir (fırsat maliyeti artar). Otarşi A\'da. Dünyada imalatın nispi fiyatı daha yüksek: üretim B\'ye kayar (daha çok imalat), tüketim C\'de, daha yüksek U₂. İmalat ihraç, tarım ithal edilir.', svg: SVG(A.W, A.H, s) };
  })();
  // emek piyasası (imalat soldan, tarım sağdan)
  function labor(o) {
    o = o || {}; const W = 520, H = 320, l = 56, r = 470, t = 30, b = 270, len = r - l;
    const Lb = o.Lb || 100, xs = (v) => l + v / (o.Lmax || 100) * len, ys = (v) => b - v / 100 * (b - t);
    const R = xs(Lb);
    let s = AR(l, b, l, t - 12, 'ax', 8) + L(l, b, R, b, 'ax') + L(R, b, R, t - 4, 'ax') + T(l - 6, b + 18, '0_M', { a: 'end', c: 'tk' }) + T(R + 6, b + 18, o.newO ? '0′_A' : '0_A', { c: 'tk' }) + T(l + 8, t - 14, 'Ücret', { c: 'lb' });
    if (o.newO) s += L(xs(100), b, xs(100), b + 6, 'ax') + T(xs(100), b + 18, '0_A', { a: 'middle', c: 'tk' }) + AR(xs(100), b + 26, R, b + 26, 'ar1', 7) + T((xs(100) + R) / 2, b + 40, 'ΔL', { a: 'middle', c: 'tp' });
    const mpm = (k) => (v) => [xs(v), ys(k - 0.75 * v)], mpa = (k, off) => (v) => [xs(v), ys(k - 0.75 * ((off || Lb) - v))];
    const cross = (k1, k2, off) => (k1 - k2 + 0.75 * off) / 1.5;   // k1 - .75 v = k2 - .75(off - v)
    return { s, xs, ys, mpm, mpa, cross, l, b, R, W, H, Lb };
  }
  F.labmkt = (() => {
    const g = labor(); const v = g.cross(85, 85, 100), w = 85 - 0.75 * v;
    let s = g.s + PL(smp(g.mpm(85), 0, 100, 2), 'l1') + PL(smp(g.mpa(85), 0, 100, 2), 'l2');
    s += L(g.xs(v), g.ys(w), g.xs(v), g.b, 'gd') + L(g.l, g.ys(w), g.xs(v), g.ys(w), 'gd') + CI(g.xs(v), g.ys(w), 5, 'pt') + T(g.xs(v) + 8, g.ys(w) - 8, 'A', { c: 'hd' }) + T(g.l - 6, g.ys(w) + 4, 'W', { a: 'end', c: 'hd' });
    s += AR(g.xs(v), g.b - 18, g.l + 4, g.b - 18, 'ar1', 7) + T((g.l + g.xs(v)) / 2, g.b - 24, 'imalat emeği', { a: 'middle', c: 'tp' }) + AR(g.xs(v), g.b - 18, g.R - 4, g.b - 18, 'ar2', 7) + T((g.R + g.xs(v)) / 2, g.b - 24, 'tarım emeği', { a: 'middle', c: 'tb' });
    s += T(g.xs(5), g.ys(86), 'P_M · MPL_M', { c: 'tp' }) + T(g.xs(95), g.ys(86), 'P_A · MPL_A', { a: 'end', c: 'tb' });
    return { t: 'Şekil 3-4 · Ücretin belirlenmesi', n: 'Yatay eksen toplam emek: imalat emeği soldan (0_M), tarım emeği sağdan (0_A) ölçülür. Her sektör W = P × MPL olana kadar işçi alır. Emek serbest dolaştığı için iki ücret eşitlenir: A noktası ücreti ve emeğin dağılımını belirler.', svg: SVG(g.W, g.H, s) };
  })();
  function shiftM(up) {
    const g = labor(), k0 = 85, k1 = up ? 105 : 65;
    const v0 = g.cross(k0, 85, 100), w0 = k0 - 0.75 * v0, v1 = g.cross(k1, 85, 100), w1 = k1 - 0.75 * v1;
    let s = g.s + PL(smp(g.mpm(k0), 0, 100, 2), 'l1 thin dsh') + PL(smp(g.mpm(k1), 0, 100, 50).filter(p => p[1] >= 26 && p[1] <= g.b), 'l1') + PL(smp(g.mpa(85), 0, 100, 2), 'l2');
    s += L(g.xs(v0), g.ys(w0), g.xs(v0), g.b, 'gd') + L(g.xs(v1), g.ys(w1), g.xs(v1), g.b, 'gd') + L(g.l, g.ys(w0), g.xs(v0), g.ys(w0), 'gd') + L(g.l, g.ys(w1), g.xs(v1), g.ys(w1), 'gd');
    s += CI(g.xs(v0), g.ys(w0), 5, 'pt') + CI(g.xs(v1), g.ys(w1), 5, 'pt') + T(g.xs(v0) + 8, g.ys(w0) + (up ? 16 : -8), 'A', { c: 'hd' }) + T(g.xs(v1) + 8, g.ys(w1) - 8, 'B', { c: 'hd' });
    s += T(g.l - 6, g.ys(w0) + 4, 'W', { a: 'end', c: 'hd' }) + T(g.l - 6, g.ys(w1) + 4, 'W′', { a: 'end', c: 'hd' });
    s += AR(g.xs(12), g.ys(k0 - 9) , g.xs(12), g.ys(k1 - 9) + (up ? 4 : -4), up ? 'ar1' : 'ar2', 8) + T(g.xs(14), g.ys((k0 + k1) / 2 - 9), up ? 'ΔP_M · MPL_M' : 'P_M düştü', { c: up ? 'tp' : 'tb' });
    s += T(g.xs(95), g.ys(86), 'P_A · MPL_A', { a: 'end', c: 'tb' });
    return s;
  }
  F.pmrise = { t: 'Şekil 3-5 · İmalat fiyatı artar', n: 'P_M · MPL_M eğrisi yukarı kayar; denge A\'dan B\'ye. İşçiler tarımdan imalata geçer, ücret W\'den W′\'ye yükselir ama eğrinin kaydığı miktardan az: ΔW/W < ΔP_M/P_M. Ücret imalat malı cinsinden düşer, tarım malı cinsinden artar: işçinin durumu belirsiz.', svg: SVG(520, 320, shiftM(true)) };
  F.pmfall = { t: 'Şekil 3-9 · İmalat fiyatı düşer ("Çin şoku")', n: 'P_M · MPL_M aşağı kayar: imalat emeği azalır, tarım emeği artar, ücret W′\'ye düşer. Modelde işçiler hemen tarımda iş bulur; gerçekte Çin şokunda ihracat sektörlerinde yeterli iş açılması on yıldan uzun sürdü.', svg: SVG(520, 320, shiftM(false)) };
  F.sfrank = { t: 'İmalat fiyatı %10 artınca (kitaptaki sayılarla)', n: 'Toprak rantı −%5 < 0 < ücret +%5 < imalat fiyatı +%10 < sermaye rantı +%17.5. Sermaye iki mal cinsinden de kazanır, toprak iki mal cinsinden de kaybeder, işçinin durumu belirsiz.',
    svg: numline([[-5, 'R_T', 'pt', 'toprak rantı'], [5, 'W', 'pt', 'ücret'], [10, 'P_M', 'pt', 'imalat fiyatı'], [17.5, 'R_K', 'pt', 'sermaye rantı']], { lo: -8, hi: 20, h: 130 }) };

  /* ======================= Bölüm 4: Heckscher–Ohlin ======================= */
  F.intensity = (() => {
    const A = E({ xm: 10, ym: 10, xl: 'Sermaye başına emek, L/K', yl: 'Ücret / rant, W/R' });
    const c1 = smp(x => [x, 6 / x], 0.7, 7, 40).filter(p => p[1] <= 9.5), c2 = smp(x => [x, 14 / x], 1.5, 9.6, 40).filter(p => p[1] <= 9.5);
    let s = A.s + A.P(c1, 'l1') + A.P(c2, 'l2') + LEG(300, 26, [['l1', 'L_C / K_C: bilgisayar'], ['l2', 'L_S / K_S: ayakkabı']]);
    s += L(A.X(0), A.Y(3), A.X(9.6), A.Y(3), 'gd') + A.D(2, 3, '', 0, 0) + A.D(14 / 3, 3, '', 0, 0) + T(A.X(0) + 4, A.Y(3) - 6, 'aynı W/R', { c: 'lg' });
    return { t: 'Şekil 4-1 · Faktör yoğunluğu', n: 'Aynı ücret/rant oranında ayakkabı, sermaye başına daha çok emek kullanır: L_S/K_S > L_C/K_C. Ayakkabı emek yoğun, bilgisayar sermaye yoğun. Eğriler aşağı eğimli: emek pahalandıkça firmalar sermaye başına daha az emek kullanır.', svg: SVG(A.W, A.H, s) };
  })();
  F.hoautarky = (() => {
    const W = 520, H = 280, P1 = { ox: 40, oy: 235, sx: 2.0, sy: 1.6 }, P2 = { ox: 300, oy: 235, sx: 1.1, sy: 2.0 };
    const pan = (o, a, b, slope, lab, cls, d) => {
      const X = (v) => o.ox + v * o.sx, Y = (v) => o.oy - v * o.sy, pt = ppfAt(a, b, slope);
      let s = AR(o.ox, o.oy, o.ox, o.oy - 205, 'ax', 7) + AR(o.ox, o.oy, o.ox + 200, o.oy, 'ax', 7);
      s += PL(ppfE(a, b).map(p => [X(p[0]), Y(p[1])]), cls) + PL([[pt[0] - d, pt[1] + slope * d], [pt[0] + d, pt[1] - slope * d]].map(p => [X(p[0]), Y(p[1])]), 'l5 thin');
      s += PL(clipY(ic(pt[0], pt[1], slope, pt[0] * 0.45, pt[0] * 1.8), 0, 190 / o.sy).map(p => [X(p[0]), Y(p[1])]), 'l3 thin') + CI(X(pt[0]), Y(pt[1]), 5, 'pt') + T(X(pt[0]) + 8, Y(pt[1]) - 8, lab, { c: 'hd' });
      return s;
    };
    let s = pan(P1, 85, 60, 0.45, 'A', 'l1', 40) + pan(P2, 55, 95, 2.0, 'A*', 'l2', 12);
    s += T(40, 260, 'bilgisayar →', { c: 'lb' }) + T(300, 260, 'bilgisayar →', { c: 'lb' }) + T(46, 20, 'ayakkabı', { c: 'lb' }) + T(306, 20, 'ayakkabı', { c: 'lb' });
    s += T(150, 278, '(a) Home: sermaye bol', { a: 'middle', c: 'tp' }) + T(400, 278, '(b) Foreign: emek bol', { a: 'middle', c: 'tb' });
    return { t: 'Şekil 4-2 · HO modelinde otarşi dengeleri', n: 'Home sermaye bol ve bilgisayar sermaye yoğun: Home PPF\'si bilgisayara doğru yayvan, teğet doğrusu yatık → bilgisayarın otarşideki nispi fiyatı (P_C/P_S)^A düşük. Foreign emek bol: PPF ayakkabıya doğru, teğet dik → bilgisayar orada pahalı. Geçen yılın 5. sorusu bu şekildi.', svg: SVG(W, H + 6, s) };
  })();
  F.hotrade = (() => {
    const A = E({ xm: 120, ym: 90, xl: 'Bilgisayar, Q_C', yl: 'Ayakkabı, Q_S' });
    const a = 100, b = 70, pa = ppfAt(a, b, 0.45), pb = ppfAt(a, b, 1.0), C = [pb[0] - 40, pb[1] + 40];
    let s = A.s + A.P(ppfE(a, b), 'l1') + A.P([[pa[0] - 50, pa[1] + 0.45 * 50], [pa[0] + 40, pa[1] - 0.45 * 40]], 'l5 thin') + A.P([[pb[0] - 50, pb[1] + 50], [pb[0] + 20, pb[1] - 20]], 'l2');
    s += A.P(clipY(ic(C[0], C[1], 1, 22, 118), 0, 88), 'l3 thin');
    s += L(A.X(C[0]), A.Y(C[1]), A.X(C[0]), A.Y(pb[1]), 'gd') + L(A.X(C[0]), A.Y(pb[1]), A.X(pb[0]), A.Y(pb[1]), 'gd');
    s += T(A.X((C[0] + pb[0]) / 2), A.Y(pb[1]) + 18, 'bilgisayar ihracatı', { a: 'middle', c: 'lg' }) + T(A.X(C[0]) - 6, A.Y((C[1] + pb[1]) / 2), 'ayakkabı ithalatı', { a: 'end', c: 'lg' });
    s += A.D(pa[0], pa[1], 'A', -22, -6) + A.D(pb[0], pb[1], 'B', 9, 4) + A.D(C[0], C[1], 'C', -20, -6) + T(A.X(pb[0] + 18), A.Y(pb[1] - 26), '(P_C/P_S)^W', { c: 'tb' });
    return { t: 'Şekil 4-3 · Home\'da serbest ticaret dengesi', n: 'Dünya fiyatında bilgisayarın nispi fiyatı Home\'daki otarşi fiyatından yüksek: üretim A\'dan B\'ye kayar (daha çok bilgisayar). Tüketim C\'de. Ticaret üçgeninin tabanı bilgisayar ihracatı, yüksekliği ayakkabı ithalatı. Heckscher–Ohlin teoremi: sermaye bol Home, sermaye yoğun malı ihraç eder.', svg: SVG(A.W, A.H, s) };
  })();
  F.endow = (() => {
    const W = 520, H = 250, base = 200, sc = 7;
    const grp = [['ABD', [['sermaye', 11.8], ['ekilebilir toprak', 13.6]], 16.0], ['Çin', [['sermaye', 20.5], ['Ar-Ge bilim insanı', 19.7]], 16.2]];
    let s = L(30, base, 510, base, 'ax');
    grp.forEach((g, k) => {
      const x0 = 40 + k * 225;
      g[1].forEach((b, j) => { const x = x0 + j * 90, h = b[1] * sc, ab = b[1] > g[2]; s += RC(x, base - h, 60, h, ab ? 'b3' : 'b2', 0) + T(x + 30, base - h - 6, '%' + b[1], { a: 'middle', c: 'hd' }) + T(x + 30, base + 16, b[0], { a: 'middle', c: 'lg' }); });
      s += L(x0 - 8, base - g[2] * sc, x0 + 160, base - g[2] * sc, 'l4 dsh') + T(x0 + 75, base + 38, g[0] + ' · GSYH payı %' + g[2].toFixed(1) + ' (kesikli)', { a: 'middle', c: 'hd' });
    });
    return { t: 'Şekil 4-6 · Faktör payı ve GSYH payı, 2017', n: 'Faktör payı GSYH payından büyükse ülke o faktörde bol (yeşil), küçükse kıt (kırmızı). ABD ekilebilir toprakta kıt (%13.6 < %16.0) ama tarım ihraç ediyor: şaşırtıcı. Çin Ar-Ge bilim insanında bol (%19.7 > %16.2) ama basit mallar ihraç ediyor. Verimlilikle düzeltilmiş (etkin) paylar bu çelişkileri azaltır.', svg: SVG(W, H + 18, s) };
  })();
  F.efflabor = { t: 'Şekil 4-9 · ABD\'nin payları, 1947', n: 'Nüfusa bakınca ABD emekte çok kıt (%8 < %37). Ücretlerle ölçülen etkin emekte ise bol (%43 > %37). ABD verimli (nitelikli) emekte bol olduğu için emek yoğun mal ihraç etmesi şaşırtıcı değil: Leontief paradoksunun açıklaması.',
    svg: hbars([['nüfus (emek)', 8, 'b2'], ['etkin emek', 43, 'b3'], ['GSYH', 37, 'b4']], { unit: '%', lw: 130, rh: 34, max: 50 }) };
  function wr(shift) {
    const A = E({ xm: 10, ym: 6, xl: 'Sermaye başına emek, L/K', yl: 'W/R', m: { l: 62 } }), top = 5.8;
    const c1 = smp(x => [x, 6 / x], 1.04, 7, 40).filter(p => p[1] <= top), c2 = smp(x => [x, 16 / x], 2.8, 9.6, 40).filter(p => p[1] <= top);
    const rd1 = smp(x => [x, 10 / x], 1.73, 9.6, 40).filter(p => p[1] <= top), rd2 = smp(x => [x, 7.5 / x], 1.3, 9.6, 40).filter(p => p[1] <= top), Lk = 4;
    let s = A.s + A.P(c1, 'l1 thin') + A.P(c2, 'l2 thin') + A.P(rd1, shift ? 'l5 dsh' : 'l5') + L(A.X(Lk), A.Y(0), A.X(Lk), A.Y(5.9), 'l4');
    s += LEG(330, 22, [['l1 thin', 'L_C/K_C: bilgisayar'], ['l2 thin', 'L_S/K_S: ayakkabı'], [shift ? 'l5 dsh' : 'l5', shift ? 'RD₁ (eski talep)' : 'RD: ekonomi geneli'], ['l4', 'L/K: sabit arz']].concat(shift ? [['l5', 'RD₂ (yeni talep)']] : []));
    s += A.D(Lk, 10 / Lk, 'A', 9, -8) + L(A.X(0), A.Y(10 / Lk), A.X(Lk), A.Y(10 / Lk), 'gd') + T(A.X(0) - 6, A.Y(10 / Lk) + 4, '(W/R)₁', { a: 'end', c: 'tk' });
    if (shift) {
      const w2 = 7.5 / Lk;
      s += A.P(rd2, 'l5') + A.D(Lk, w2, 'B', 9, 16) + L(A.X(0), A.Y(w2), A.X(16 / w2), A.Y(w2), 'gd') + T(A.X(0) - 6, A.Y(w2) + 4, '(W/R)₂', { a: 'end', c: 'tk' });
      s += CI(A.X(6 / w2), A.Y(w2), 4, 'pt') + CI(A.X(16 / w2), A.Y(w2), 4, 'pt') + CI(A.X(6 / (10 / Lk)), A.Y(10 / Lk), 4, 'pt') + CI(A.X(16 / (10 / Lk)), A.Y(10 / Lk), 4, 'pt');
    }
    return { W: A.W, H: A.H, s };
  }
  F.wrdet = (() => { const A = wr(false); return { t: 'Şekil 4-11 · Ücret/rant oranının belirlenmesi', n: 'Ekonomi geneli göreli emek talebi RD, iki sektör eğrisinin ortalamasıdır ve aralarında kalır. Göreli arz L/K dikey: toplam emek ve sermaye sabit. Kesişim A, W/R oranını belirler.', svg: SVG(A.W, A.H, A.s) }; })();
  F.wrshift = (() => { const A = wr(true); return { t: 'Şekil 4-13 · Bilgisayarın nispi fiyatı artınca', n: 'Üretim bilgisayara (sermaye yoğun) kayar; ekonomi geneli emek talebi RD₁\'den RD₂\'ye, bilgisayar eğrisine doğru kayar. W/R düşer. Emek görece ucuzladığı için İKİ sektör de sermaye başına daha çok emek kullanır (noktalar sağa kayar). Toplam L/K değişmez çünkü üretim bileşimi değişti.', svg: SVG(A.W, A.H, A.s) }; })();
  F.magnify = { t: 'Büyütme etkisi: bilgisayar fiyatı %10 artınca', n: 'Kitaptaki örnek (emek payı bilgisayarda %50, ayakkabıda %60): ücret −%40 < 0 < bilgisayar fiyatı +%10 < rant +%60. Mal fiyatı değişimi faktör getirilerinde büyüyerek görülür. İşçi iki mal cinsinden de kaybeder, sermaye iki mal cinsinden de kazanır.',
    svg: numline([[-40, 'W', 'pt', 'ücret'], [10, 'P_C', 'pt', 'bilgisayar fiyatı'], [60, 'R', 'pt', 'sermaye rantı']], { lo: -50, hi: 70, h: 130 }) };

  /* ======================= Bölüm 5: göç ve FDI ======================= */
  F.migsr = (() => {
    const g = labor({ Lmax: 118, Lb: 118, newO: true });
    const k = 85, v0 = (k - k + 0.75 * 100) / 1.5, w0 = k - 0.75 * v0, v1 = (0.75 * 118) / 1.5, w1 = k - 0.75 * v1;
    const mm = (v) => [g.xs(v), g.ys(k - 0.75 * v)], ma0 = (v) => [g.xs(v), g.ys(k - 0.75 * (100 - v))], ma1 = (v) => [g.xs(v), g.ys(k - 0.75 * (118 - v))];
    let s = g.s + PL(smp(mm, 0, 112, 2), 'l1') + PL(smp(ma0, 0, 100, 2), 'l2 thin dsh') + PL(smp(ma1, 18, 118, 2), 'l2');
    s += CI(g.xs(v0), g.ys(w0), 5, 'pt') + T(g.xs(v0) - 4, g.ys(w0) - 10, 'A', { a: 'end', c: 'hd' }) + CI(g.xs(v1), g.ys(w1), 5, 'pt') + T(g.xs(v1) + 8, g.ys(w1) + 16, 'B', { c: 'hd' });
    s += L(g.l, g.ys(w0), g.xs(v0), g.ys(w0), 'gd') + L(g.l, g.ys(w1), g.xs(v1), g.ys(w1), 'gd') + T(g.l - 6, g.ys(w0) + 4, 'W', { a: 'end', c: 'hd' }) + T(g.l - 6, g.ys(w1) + 4, 'W′', { a: 'end', c: 'hd' });
    s += T(g.xs(4), g.ys(86), 'P_M · MPL_M', { c: 'tp' }) + T(g.xs(116), g.ys(86), 'P_A · MPL_A', { a: 'end', c: 'tb' });
    return { t: 'Şekil 5-2 · Kısa dönemde göç', n: 'Emek ΔL kadar artar: tarımın orijini 0_A\'dan 0′_A\'ya, tarım eğrisi de ΔL kadar sağa kayar. Denge A\'dan B\'ye: ücret W′\'ye düşer, iki sektörde de istihdam artar. Sermaye ve toprak başına daha çok işçi: iki rant da artar.', svg: SVG(g.W, g.H + 20, s) };
  })();
  F.migppf = (() => {
    const A = E({ xm: 130, ym: 130, xl: 'İmalat, Q_M', yl: 'Tarım, Q_A' });
    const p0 = ppfAt(90, 90, 1), p1 = ppfAt(110, 110, 1);
    let s = A.s + A.P(ppfE(90, 90), 'l5') + A.P(ppfE(110, 110), 'l1') + A.P([[p1[0] - 30, p1[1] + 30], [p1[0] + 30, p1[1] - 30]], 'l2 thin') + A.P([[p0[0] - 30, p0[1] + 30], [p0[0] + 30, p0[1] - 30]], 'l2 thin dsh');
    s += A.D(p0[0], p0[1], 'A', -22, 4) + A.D(p1[0], p1[1], 'B', 9, -6) + AR(A.X(p0[0] + 3), A.Y(p0[1] + 3), A.X(p1[0] - 3), A.Y(p1[1] - 3), 'ar1', 8);
    s += T(A.X(70), A.Y(122), 'göçle PPF dışa kayar', { c: 'tp' }) + T(A.X(64), A.Y(20), 'eski PPF', { c: 'lg' });
    return { t: 'Şekil 5-4 · Kısa dönemde göç ve çıktılar', n: 'Fiyatlar sabit (aynı eğimde teğet). Sermaye ve toprak sektörlerine bağlı olduğu için ek emek iki sektöre bölünür: A\'dan B\'ye İKİ sektörün çıktısı da artar.', svg: SVG(A.W, A.H, s) };
  })();
  function boxd(o) {
    const W = 520, H = 330, x0 = 90, y0 = 290, w = 300, h = 240, dL = o.dL || 0, dK = o.dK || 0;
    const X0 = x0 - dL * 3, Ytop = y0 - h - dK * 3;   // yeni sol (ayakkabı) orijini ve üst
    let s = RC(x0, y0 - h, w, h, 'bx', 0);
    const kS = 0.3, kC = 1.5;   // ışın eğimleri (K/L): ayakkabı düşük, bilgisayar yüksek
    const S0 = [x0, y0], Cn = [x0 + w, y0 - h];
    const solve = (S, C) => { // S'den (dx, -kS dx), C'den (−dx, +kC dx)
      // S + a*(1, -kS) = C + b*(-1, kC)  → S.x + a = C.x - b; S.y - kS a = C.y + kC b
      const b = (S[1] - C[1] - kS * (C[0] - S[0])) / (kC - kS); const a = C[0] - b - S[0]; return [S[0] + a, S[1] - kS * a];
    };
    const Apt = solve(S0, Cn);
    s += L(S0[0], S0[1], Apt[0], Apt[1], 'l2') + L(Cn[0], Cn[1], Apt[0], Apt[1], 'l1') + CI(Apt[0], Apt[1], 5, 'pt') + T(Apt[0] + 8, Apt[1] + 4, 'A', { c: 'hd' });
    s += T(x0 - 6, y0 + 18, '0_S', { a: 'end', c: 'tk' }) + T(x0 + w + 6, y0 - h - 6, '0_C', { c: 'tk' });
    s += T(x0 + w / 2, y0 + 34, 'emek (L̄)', { a: 'middle', c: 'lb' }) + T(x0 - 26, y0 - h / 2, 'sermaye (K̄)', { a: 'middle', c: 'lb', r: -90 });
    if (dL || dK) {
      const S1 = [X0, y0], C1 = [x0 + w, Ytop];
      s += RC(Math.min(X0, x0), Ytop, w + (x0 - X0), y0 - Ytop, 'gd', 0);
      const Bp = solve(dL ? S1 : S0, dK ? C1 : Cn);
      s += L((dL ? S1 : S0)[0], y0, Bp[0], Bp[1], 'l2') + L(Cn[0], (dK ? C1 : Cn)[1], Bp[0], Bp[1], 'l1') + CI(Bp[0], Bp[1], 5, 'pt') + T(Bp[0] - 10, Bp[1] - 8, 'B', { a: 'end', c: 'hd' });
      if (dL) s += T(X0 - 6, y0 + 18, '0′_S', { a: 'end', c: 'tk' }) + AR(x0, y0 + 26, X0 + 2, y0 + 26, 'ar1', 7) + T((x0 + X0) / 2, y0 + 44, 'ΔL göç', { a: 'middle', c: 'tp' });
      if (dK) s += T(x0 + w + 6, Ytop - 6, '0′_C', { c: 'tk' }) + AR(x0 + w + 14, y0 - h, x0 + w + 14, Ytop + 2, 'ar1', 7) + T(x0 + w + 20, (y0 - h + Ytop) / 2 + 4, 'ΔK', { c: 'tp' });
    }
    s += T(x0 + 10, y0 - h + 20, 'kırmızı ışın: ayakkabı (emek yoğun)', { c: 'tb' }) + T(x0 + 10, y0 - h + 38, 'mavi ışın: bilgisayar (sermaye yoğun)', { c: 'tp' });
    return SVG(W, H + 30, s);
  }
  F.box = { t: 'Şekil 5-9 · Kutu diyagramı', n: 'Kutunun genişliği toplam emek, yüksekliği toplam sermaye. Ayakkabı sol alttan (0_S), bilgisayar sağ üstten (0_C) ölçülür. A noktası emeğin ve sermayenin iki sektöre dağılımı; ışınların eğimi her sektörün K/L oranı (bilgisayar daha dik: sermaye yoğun).', svg: boxd({}) };
  F.boxmig = { t: 'Şekil 5-10 · Uzun dönemde göç: Rybczynski', n: 'Göçle kutu ΔL kadar genişler (0_S → 0′_S). Mal fiyatları sabitse W/R ve iki sektörün K/L oranları değişmez: ışınlar aynı eğimde kalır, denge B\'ye gider. Yeni emeğin hepsi ayakkabıya gider, ayrıca bilgisayardan ayakkabıya emek ve sermaye geçer: ayakkabı büyür, bilgisayar küçülür. Faktör fiyatları değişmez.', svg: boxd({ dL: 18 }) };
  F.boxfdi = { t: 'Şekil 5-15 · Uzun dönemde FDI', n: 'Sermaye artınca kutu yukarı uzar (0_C → 0′_C). K/L oranları sabit kalır: yeni sermaye ve ayakkabıdan çekilen emek ve sermaye bilgisayara gider. Bilgisayar (sermaye yoğun) büyür, ayakkabı küçülür; ücret ve rant değişmez.', svg: boxd({ dK: 10 }) };
  F.rybppf = (() => {
    const A = E({ xm: 120, ym: 140, xl: 'Bilgisayar, Q_C', yl: 'Ayakkabı, Q_S' });
    const p0 = ppfAt(90, 90, 1), p1 = ppfAt(92, 125, 1);
    let s = A.s + A.P(ppfE(90, 90), 'l5') + A.P(ppfE(92, 125), 'l1') + A.P([[p0[0] - 30, p0[1] + 30], [p0[0] + 30, p0[1] - 30]], 'l2 thin dsh') + A.P([[p1[0] - 30, p1[1] + 30], [p1[0] + 30, p1[1] - 30]], 'l2 thin');
    s += A.D(p0[0], p0[1], 'A', 9, 10) + A.D(p1[0], p1[1], 'B', 9, -6) + A.G(p0[0], p0[1]) + A.G(p1[0], p1[1]);
    s += T(A.X(30), A.Y(134), 'göç: PPF ayakkabıya doğru kayar', { c: 'tp' });
    return { t: 'Şekil 5-11 · Rybczynski teoremi', n: 'Emek artınca PPF dışa kayar ama emek yoğun ayakkabıya doğru. Fiyatlar sabit (A ve B\'de teğetler aynı eğimde): ayakkabı üretimi artar, bilgisayar üretimi AZALIR. Kısa dönemden farkı: orada iki çıktı da artıyordu.', svg: SVG(A.W, A.H, s) };
  })();
  F.fdisr = { t: 'Şekil 5-13 · Kısa dönemde FDI', n: 'İmalata sermaye girer: işçi başına makine artar, P_M · MPL_M yukarı kayar. Ücret W′\'ye yükselir, işçiler tarımdan imalata geçer: imalat büyür, tarım küçülür. Toprak başına işçi azalır, toprak rantı düşer; sermaye rantı da düşer (Şekil 5-14).', svg: SVG(520, 320, shiftM(true).replace('ΔP_M · MPL_M', 'sermaye girişi')) };
  F.worldlab = (() => {
    const W = 520, H = 320, l = 50, r = 470, t = 30, b = 270, xs = (v) => l + v / 100 * (r - l), ys = (v) => b - v / 100 * (b - t);
    const LH = 40, M = 12, wp = 50, aH = wp + LH + M, aF = wp + (100 - LH - M);
    const wH = aH - LH, wF = aF - (100 - LH);
    let s = AR(l, b, l, t - 12, 'ax', 8) + L(l, b, r, b, 'ax') + AR(r, b, r, t - 12, 'ax', 8) + T(l + 8, t - 14, 'Home ücreti', { c: 'lb' }) + T(r - 8, t - 14, 'Foreign ücreti', { a: 'end', c: 'lb' }) + T(l - 6, b + 18, '0', { a: 'end', c: 'tk' }) + T(r + 6, b + 18, '0*', { c: 'tk' });
    s += PG([[xs(LH), ys(wH)], [xs(LH + M), ys(wp)], [xs(LH), ys(wp)]], 'shg') + PG([[xs(LH), ys(wF)], [xs(LH + M), ys(wp)], [xs(LH), ys(wp)]], 'b0');
    s += PL(smp(v => [xs(v), ys(aH - v)], 0, 95, 2), 'l1') + PL(smp(v => [xs(v), ys(aF - (100 - v))], 8, 100, 2), 'l2');
    s += L(xs(LH), ys(0), xs(LH), ys(wH + 6), 'gd') + L(xs(LH + M), ys(0), xs(LH + M), ys(wp), 'gd');
    s += CI(xs(LH), ys(wH), 5, 'pt') + T(xs(LH) - 8, ys(wH) - 6, 'A', { a: 'end', c: 'hd' }) + CI(xs(LH), ys(wF), 5, 'pt') + T(xs(LH) - 8, ys(wF) + 14, 'A*', { a: 'end', c: 'hd' }) + CI(xs(LH + M), ys(wp), 5, 'pt') + T(xs(LH + M) + 8, ys(wp) - 6, 'B', { c: 'hd' }) + T(xs(LH) - 6, ys(wp) + 4, 'C', { a: 'end', c: 'hd' });
    s += T(xs(LH), b + 18, 'L', { a: 'middle', c: 'tk' }) + T(xs(LH + M), b + 18, 'L′', { a: 'middle', c: 'tk' }) + T(xs(14), ys(aH - 14) - 8, 'Home MPL', { c: 'tp' }) + T(xs(96), ys(aF - 4) - 8, 'Foreign MPL', { a: 'end', c: 'tb' });
    return { t: 'Şekil 5-16 · Dünya emek piyasası ve göçün kazancı', n: 'Home\'da 0L, Foreign\'da 0*L işçi. Home ücreti (A) Foreign\'dan (A*) yüksek: işçiler Home\'a geçer, ücretler B\'de eşitlenir. ABC üçgeni (yeşil) Home\'un kazancı, A*BC üçgeni Foreign\'ın kazancı (göçmen gelirleri dahil). Emek düşük marjinal üründen yüksek marjinal ürüne gider: dünya kazanır.', svg: SVG(W, H, s) };
  })();
  F.newworld = (() => {
    const fr = frame({ x: [1870, 1910], y: [1, 3.2], xt: [1870, 1880, 1890, 1900, 1910], yt: [1, 1.5, 2, 2.5, 3], yf: v => v + '×', yl: 'ücret oranı', h: 250, m: { l: 66, r: 18 } });
    return { t: 'Şekil 5-3 · Yeni Dünya ve Avrupa ücretleri (şematik)', n: 'Avrupa\'dan Amerika ve Avustralya\'ya kitlesel göç ücret farkını kapattı: 1870\'te Yeni Dünya ücretleri neredeyse 3 kat, 1910\'da yaklaşık 2 kat. Kısa dönem modelinin öngördüğü gibi göç, varış ülkesinde ücret artışını yavaşlattı.',
      svg: SVG(fr.W, fr.H, fr.s + fr.line([[1870, 2.9], [1880, 2.6], [1890, 2.4], [1900, 2.2], [1910, 2.0]], 'l1')) };
  })();

  /* ======================= WTO ve bölgeselcilik ======================= */
  F.gatt = (() => {
    const ev = [['1947', 'GATT: 23 hükümet imzaladı (1948\'den geçici uygulama)'], ['1964–67', 'Kennedy Turu: tarife indirimi, anti-damping kodu'], ['1973–79', 'Tokyo Turu: tarife dışı engeller'], ['1986–94', 'Uruguay Turu: kapsam genişledi, WTO\'yu kurdu'], ['1995', 'WTO çalışmaya başladı (1 Ocak)'], ['2001', 'Doha Turu başladı, kapsamlı sonuç yok'], ['2017', 'Ticaretin kolaylaştırılması anlaşması yürürlükte'], ['2019', 'Temyiz Organı üyesiz kaldı (Aralık)']];
    const W = 520, H = 20 + ev.length * 28; let s = L(84, 12, 84, H - 10, 'ax');
    ev.forEach((v, k) => { const y = 24 + k * 28; s += CI(84, y - 5, 5, k === 4 ? 'ptp' : 'pt') + T(72, y, v[0], { a: 'end', c: 'hd' }) + T(98, y, v[1], { c: 'lg' }); });
    return { t: 'GATT\'tan WTO\'ya', n: 'Uluslararası Ticaret Örgütü yürürlüğe giremedi; GATT 1948\'den itibaren geçici olarak uygulandı. Sekiz GATT turu kapsamı genişletti; Uruguay Turu WTO\'yu kurdu (Marakeş 1994, 1 Ocak 1995). 2026\'da 166 üye, dünya ticaretinin %98\'i.', svg: SVG(W, H, s) };
  })();
  F.wtostruct = (() => {
    const W = 520, H = 250;
    let s = BOX(160, 14, 200, 46, ['Bakanlar Konferansı', 'en üst organ, 2 yılda bir'], 'bxp') + AR(260, 62, 260, 84, 'ar');
    s += BOX(110, 86, 300, 56, ['Genel Konsey', 'aynı zamanda Uyuşmazlık Çözüm Organı', 've Ticaret Politikası İnceleme Organı'], 'bxp');
    s += AR(180, 144, 90, 176, 'ar') + AR(260, 144, 260, 176, 'ar') + AR(340, 144, 430, 176, 'ar');
    s += BOX(20, 178, 140, 40, ['Mal Konseyi']) + BOX(190, 178, 140, 40, ['Hizmet Konseyi']) + BOX(360, 178, 140, 40, ['TRIPS Konseyi']);
    s += BOX(400, 14, 110, 46, ['Sekretarya', 'teknik destek'], 'bx') + T(260, 242, 'Kararları üyeler alır, genellikle uzlaşmayla (consensus).', { a: 'middle', c: 'lg' });
    return { t: 'WTO\'nun yapısı', n: 'Üye odaklı bir örgüt: üyeler kural müzakere eder, uygulamayı izler, uyuşmazlıkları çözer. Sekretarya karar almaz; araştırma ve teknik destek verir.', svg: SVG(W, H, s) };
  })();
  F.dsu = (() => {
    const W = 520, H = 210, st = [['İstişare', '60 gün'], ['Panel', 'inceleme'], ['Temyiz', 'hukuk'], ['Kabul', 'otomatik'], ['Uyum', 'makul süre']];
    let s = '';
    st.forEach((v, k) => { const x = 8 + k * 103; s += BOX(x, 30, 94, 50, v, k === 3 ? 'bxp' : 'bx'); if (k < 4) s += AR(x + 95, 55, x + 102, 55, 'ar', 7); });
    s += AR(463, 82, 463, 116, 'ar2') + BOX(330, 118, 182, 50, ['uymazsa: tazminat ya da', 'izinli misilleme'], 'bxr');
    s += T(10, 142, 'GATT\'ta kaybeden taraf raporu engelleyebiliyordu.', { c: 'lg' }) + T(10, 162, 'WTO\'da rapor, herkes reddetmedikçe kabul edilir.', { c: 'lg' }) + T(10, 196, 'Misilleme geriye dönük tazminat değil, uyuma zorlama aracıdır.', { c: 'lg' });
    return { t: 'WTO uyuşmazlık çözümü (DSU)', n: '2019 Aralık\'tan beri Temyiz Organı üye eksikliğinden çalışmıyor (ABD atamaları engelliyor); boşluğa temyiz edilen panel raporu kabul edilemiyor. Bazı üyeler MPIA (DSU Madde 25) düzenlemesini kullanıyor.', svg: SVG(W, H, s) };
  })();
  F.ladder = (() => {
    const W = 520, H = 316, st = [['Kısmi tercih', 'seçilmiş mallarda indirim'], ['Serbest ticaret alanı', 'iç ticaret serbest, dış tarife ayrı'], ['Gümrük birliği', '+ ortak dış tarife'], ['Ortak pazar', '+ emek ve sermaye serbest'], ['Ekonomik birlik', '+ politika uyumu'], ['Parasal birlik', '+ ortak para politikası'], ['Siyasi birlik', '+ ortak yasama ve yürütme']];
    let s = '';
    st.forEach((v, k) => { const x = 8 + k * 32, y = 270 - k * 44; s += RC(x, y, 268, 40, k === 1 || k === 2 ? 'bxp' : 'bx', 6) + T(x + 10, y + 17, v[0], { c: 'hd' }) + T(x + 10, y + 34, v[1], { c: 'lg' }); });
    return { t: 'Ekonomik entegrasyon basamakları', n: 'Her basamak bir öncekine bir yükümlülük ekler. Bunlar analitik kategoriler: gerçek anlaşmalar özellikleri karıştırır; parasal birlik her ara basamaktan geçmek zorunda değildir.', svg: SVG(W, H, s) };
  })();
  F.ftacu = (() => {
    const W = 520, H = 250;
    let s = T(130, 20, 'Serbest ticaret alanı', { a: 'middle', c: 'tp' }) + T(390, 20, 'Gümrük birliği', { a: 'middle', c: 'tp' });
    s += BOX(20, 40, 100, 44, ['Üye A', 'dış tarife %5']) + BOX(140, 40, 100, 44, ['Üye B', 'dış tarife %20']) + AR2x(120, 62, 140, 62);
    s += BOX(70, 170, 120, 44, ['dışarıdaki ülke'], 'bxr') + AR(110, 168, 70, 86, 'ar2') + T(10, 240, 'ucuz kapıdan gir, B\'ye vergisiz geç?', { c: 'tb' });
    s += T(150, 124, 'menşe kuralı', { c: 'hd' }) + T(150, 140, 'bunu engeller', { c: 'lg' });
    s += RC(285, 34, 220, 80, 'bxp', 10) + BOX(295, 40, 95, 44, ['Üye A']) + BOX(400, 40, 95, 44, ['Üye B']) + T(395, 104, 'ortak dış tarife %12', { a: 'middle', c: 'hd' });
    s += BOX(335, 170, 120, 44, ['dışarıdaki ülke'], 'bxr') + AR(395, 168, 395, 116, 'ar2') + T(395, 240, 'her kapıda aynı vergi', { a: 'middle', c: 'lg' });
    return { t: 'Serbest ticaret alanı ve gümrük birliği', n: 'STA\'da her üye dış tarifesini kendi belirler; mal en düşük tarifeli üyeden girip diğerine vergisiz geçebilir (trade deflection). Menşe kuralları bunu sınırlar. Gümrük birliğinde ortak dış tarife bu sorunu azaltır. Örnekler: STA – EFTA, USMCA; gümrük birliği – AB, SACU, AB–Türkiye.', svg: SVG(W, H, s) };
  })();
  function AR2x(x1, y1, x2, y2) { return AR((x1 + x2) / 2, y1, x1 + 2, y1, 'ar', 6) + AR((x1 + x2) / 2, y2, x2 - 2, y2, 'ar', 6); }
  F.creadiv = (() => {
    const W = 520, H = 250, base = 200, sc = 1.15;
    const rows = [['Yurt içi', 140, 140, 0, 0], ['Ortak', 132, 110, 1, 0], ['Dışarıdaki', 120, 120, 0, 1]];
    let s = L(30, base, 510, base, 'ax') + T(150, 20, 'Anlaşmadan önce', { a: 'middle', c: 'hd' }) + T(390, 20, 'Anlaşmadan sonra', { a: 'middle', c: 'hd' });
    rows.forEach((r, k) => {
      const x1 = 50 + k * 70, x2 = 290 + k * 70, chosen0 = k === 2, chosen1 = k === 1;
      s += RC(x1, base - r[1] * sc, 50, r[1] * sc, chosen0 ? 'b1' : 'b0', 0) + T(x1 + 25, base - r[1] * sc - 6, String(r[1]), { a: 'middle', c: 'hd' }) + T(x1 + 25, base + 16, r[0], { a: 'middle', c: 'lg' });
      s += RC(x2, base - r[2] * sc, 50, r[2] * sc, chosen1 ? 'b1' : 'b0', 0) + T(x2 + 25, base - r[2] * sc - 6, String(r[2]), { a: 'middle', c: 'hd' }) + T(x2 + 25, base + 16, r[0], { a: 'middle', c: 'lg' });
    });
    s += T(260, 238, 'Koyu çubuk: alımın yapıldığı yer. Tüketici +10, tarife geliri −20, refah −10.', { a: 'middle', c: 'lg' });
    return { t: 'Ticaret saptırma: ders notundaki örnek', n: 'Maliyetler yurt içi 140, ortak 110, dışarıdaki ülke 100; iki dış tedarikçiye %20 MFN tarifesi. Önce en ucuz dışarıdaki ülke (120, devlete 20 tarife). Anlaşma ortağın tarifesini kaldırınca alım ortağa (110) kayar: tüketici 10 kazanır, devlet 20 kaybeder. Ülke refahı 10 düşer: daha pahalı üreticiye geçildi.', svg: SVG(W, H, s) };
  })();

  root.FIGS = F;
})(typeof window !== 'undefined' ? window : globalThis);
