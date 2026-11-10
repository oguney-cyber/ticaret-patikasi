/* Soru üreticileri (Ticaret Patikası). Her üretici {en, tr, opts:[doğru, ...yanlışlar], ex} döndürür. */
(function (root) {
  'use strict';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const f = (x, d) => { let s = (+x).toFixed(d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s; };
  const g0 = (x, d) => { const s = f(x, d == null ? 2 : d); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };   // gereksiz sıfırları at

  // Sayısal şıklar: doğru + yanlışlar; eksik kalırsa doğru değerin yakınından doldur.
  function nopts(correct, wrongs, d, opt) {
    opt = opt || {};
    const lo = opt.min != null ? opt.min : -Infinity, hi = opt.max != null ? opt.max : Infinity;
    const fmt = opt.fmt || ((x) => f(x, d));
    const c = fmt(correct); const out = [c];
    for (const w of wrongs) {
      if (w == null || !isFinite(w) || w < lo || w > hi) continue;
      if (Math.abs(w) < 1e-9 && Math.abs(correct) > 1e-9) continue;
      const s = fmt(w); if (/^[-+]?0(\.0+)?%?$/.test(s)) continue; if (!out.includes(s)) out.push(s); if (out.length === 4) break;
    }
    const st = [0.2, -0.2, 0.4, -0.4, 0.6, 0.12, -0.12, 0.8, -0.6, 1];
    for (let k = 0; out.length < 4 && k < 40; k++) {
      const s0 = st[k % st.length] * (1 + Math.floor(k / st.length));
      const base = Math.abs(correct) < 1e-9 ? 1 : Math.abs(correct);
      const v = correct + s0 * base * (opt.spread || 0.5);
      if (v < lo || v > hi || (Math.abs(v) < 1e-9 && Math.abs(correct) > 1e-9)) continue;
      const s = fmt(v); if (/^[-+]?0(\.0+)?%?$/.test(s)) continue; if (!out.includes(s)) out.push(s);
    }
    return out;
  }
  const steps = (...a) => a.filter(Boolean).map((s, i) => `**Adım ${i + 1}: ${s[0]}**\n${s[1]}`).join('\n\n');
  const pcs = (x, d) => (x > 0 ? '+' : '') + g0(x, d == null ? 2 : d) + '%';   // şık: "+17.5%"
  const popt = (c, ws, d) => nopts(c, ws, d == null ? 2 : d, { fmt: (v) => pcs(v, d == null ? 2 : d) });

  // kesirler: [pay, payda]
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const fs = (q) => q[1] === 1 ? String(q[0]) : `${q[0]}/${q[1]}`;                 // "2/3"
  const ft = (q) => q[1] === 1 ? String(q[0]) : `\\tfrac{${q[0]}}{${q[1]}}`;      // TeX
  const fv = (q) => q[0] / q[1];
  const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
  const finv = (a) => fr(a[1], a[0]);
  function fopts(c, ws) {   // kesir şıkları
    const out = [fs(c)];
    for (const w of ws) { if (!w || !isFinite(fv(w)) || fv(w) <= 0) continue; const s = fs(fr(w[0], w[1])); if (!out.includes(s)) out.push(s); if (out.length === 4) break; }
    const fill = [fr(c[0] + c[1], c[1]), fr(c[0] * 2, c[1]), fr(c[0], c[1] * 2), fr(c[0] * 3, c[1]), fr(c[0] + 2 * c[1], c[1])];
    for (const w of fill) { if (out.length === 4) break; const s = fs(w); if (!out.includes(s)) out.push(s); }
    return out;
  }
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const PAIRS = [['Home', 'Foreign'], ['Nova', 'Terra'], ['Country A', 'Country B'], ['Alba', 'Borea']];
  const GOODS = [
    { a: 'wheat', b: 'cloth', au: 'bushels of wheat', bu: 'yards of cloth', at: 'buğday', bt: 'kumaş' },
    { a: 'smartphones', b: 'textiles', au: 'smartphones', bu: 'units of textiles', at: 'akıllı telefon', bt: 'tekstil' },
    { a: 'wheat', b: 'steel', au: 'tons of wheat', bu: 'tons of steel', at: 'buğday', bt: 'çelik' },
    { a: 'wine', b: 'cloth', au: 'barrels of wine', bu: 'yards of cloth', at: 'şarap', bt: 'kumaş' },
    { a: 'computers', b: 'shoes', au: 'computers', bu: 'pairs of shoes', at: 'bilgisayar', bt: 'ayakkabı' },
    { a: 'rice', b: 'cars', au: 'tons of rice', bu: 'cars', at: 'pirinç', bt: 'otomobil' }];
  // iki ülke, iki mal: işçi başına üretim (oranlar farklı)
  function ricTable(noTieAbs) {
    for (;;) {
      const a1 = R(1, 12), b1 = R(1, 12), a2 = R(1, 12), b2 = R(1, 12);
      if (a1 * b2 === a2 * b1) continue;               // fırsat maliyetleri eşit olmasın
      if (noTieAbs && (a1 === a2 || b1 === b2)) continue;
      return { a1, b1, a2, b2 };                         // a1: 1. ülke a malı, b1: 1. ülke b malı
    }
  }
  const G = {};

  /* ---------- Bölüm 1 ---------- */
  G.tradeBal = () => {
    if (Math.random() < 0.45) {
      const ex = R(150, 900), im = R(150, 900); if (ex === im) return G.tradeBal();
      const tb = ex - im;
      return {
        en: `A country exports goods and services worth ${ex} billion dollars and imports goods and services worth ${im} billion dollars. What is its trade balance (in billions of dollars)?`,
        tr: `Bir ülke ${ex} milyar dolarlık mal ve hizmet ihraç, ${im} milyar dolarlık ithal ediyor. Dış ticaret dengesi kaç milyar dolardır?`,
        opts: nopts(tb, [-tb, ex + im, (ex + im) / 2, ex / im], 0),
        ex: steps(['Tanım', `Dış ticaret dengesi = ihracat − ithalat: $EX - IM = ${ex} - ${im} = ${tb}$`],
          ['Yorumla', tb > 0 ? `Pozitif: ==dış ticaret fazlası (trade surplus)==. Çin gibi.` : `Negatif: ==dış ticaret açığı (trade deficit)==. ABD gibi.`])
      };
    }
    const sp = R(8, 20) * 10, inv = R(8, 20) * 10, t = R(20, 40) * 10, gv = R(20, 40) * 10;
    const tb = (sp - inv) + (t - gv); if (tb === 0) return G.tradeBal();
    return {
      en: `In an economy, private saving is ${sp}, investment is ${inv}, taxes are ${t} and government spending is ${gv} (billions of dollars). Using $(S_p - I) + (T - G) = EX - IM$, what is the trade balance?`,
      tr: `Özel tasarruf ${sp}, yatırım ${inv}, vergiler ${t}, kamu harcaması ${gv} (milyar dolar). $(S_p - I) + (T - G) = EX - IM$ özdeşliğine göre dış ticaret dengesi kaçtır?`,
      opts: nopts(tb, [(sp - inv) - (t - gv), (inv - sp) + (t - gv), sp + t - inv, -tb], 0),
      ex: steps(['Özel kesim', `$S_p - I = ${sp} - ${inv} = ${sp - inv}$`], ['Devlet', `$T - G = ${t} - ${gv} = ${t - gv}$ ${t - gv < 0 ? '(bütçe açığı)' : '(bütçe fazlası)'}`],
        ['Topla', `$EX - IM = ${sp - inv} + (${t - gv}) = ${tb}$`]) + `\n\n${tb < 0 ? 'Dış ticaret açığı: ülke düşük tasarruf ediyor (hane halkı ya da devlet). Kitaptaki mesaj: dış ticaret dengesini makroekonomik tasarruf davranışı belirler.' : 'Dış ticaret fazlası: ülke yatırımından fazla tasarruf ediyor.'}`
    };
  };
  G.valueAdded = () => {
    const v = R(150, 400), d = R(5, 40), sale = R(5, 9) * 100;
    const askShare = Math.random() < 0.5;
    if (askShare) return {
      en: `A smartphone is assembled in China and shipped to the United States with an export value of ${v} dollars; it sells there for ${sale} dollars. Only ${d} dollars is value-added by Chinese labor; the other parts were imported into China. What share of the export value is Chinese value-added?`,
      tr: `Çin'de monte edilen telefon ABD'ye ${v} dolarlık ihracat değeriyle gidiyor, orada ${sale} dolara satılıyor. Çinli işçilerin kattığı değer yalnızca ${d} dolar, öteki parçalar Çin'e ithal edilmiş. İhracat değerinin yüzde kaçı Çin'in katma değeri?`,
      opts: popt(d / v * 100, [d / sale * 100, (v - d) / v * 100, v / sale * 100], 1).map(s => s.replace('+', '')),
      ex: steps(['Pay = katma değer ÷ ihracat değeri', `$${d}/${v} = ${f(d / v, 4)}$, yani %${f(d / v * 100, 1)}.`], ['Ders', `Ticaret istatistiği ${v} doları tamamen Çin'in ihracatı sayar; oysa Çin'de yaratılan değer ${d} dolar. Kitaptaki örnek: iPhone 5, ihracat değeri 227 dolar, Çin katma değeri 8 dolar (%3.5). İkili açık (bilateral deficit) bu yüzden yanıltıcı olabilir.`])
    };
    return {
      en: `A product is assembled in China using ${v - d} dollars of imported parts; Chinese assembly adds ${d} dollars of value. It is shipped to the United States. In standard trade statistics, how much is recorded as a Chinese export to the United States?`,
      tr: `Bir ürün Çin'de ${v - d} dolarlık ithal parçayla monte ediliyor, Çin ${d} dolar katma değer ekliyor ve ABD'ye gönderiliyor. Standart ticaret istatistiğinde ABD'ye Çin ihracatı olarak kaç dolar yazılır?`,
      opts: nopts(v, [d, v - d, v + d], 0),
      ex: steps(['Brüt kayıt', `Gümrük, sınırı geçen malın **tüm değerini** kaydeder: $${v - d} + ${d} = ${v}$ dolar.`], ['Katma değer bakışı', `Çin'de yaratılan değer yalnızca ${d} dolar. Küresel değer zincirlerinde ara mallar sınırları birçok kez geçtiği için brüt ticaret, katma değerden büyük görünür.`])
    };
  };
  G.tradeGdp = () => {
    const ex = R(20, 400), im = R(20, 400), gdp = pick([R(60, 300), R(300, 3000)]);
    const r = (ex + im) / 2 / gdp * 100;
    return {
      en: `A country's exports are ${ex} billion dollars, imports are ${im} billion dollars and GDP is ${gdp} billion dollars. Using the textbook measure (average of exports and imports divided by GDP), what is its trade/GDP ratio?`,
      tr: `İhracat ${ex}, ithalat ${im}, GSYH ${gdp} milyar dolar. Kitaptaki ölçüyle (ihracat ve ithalatın ortalaması ÷ GSYH) ticaret/GSYH oranı kaçtır?`,
      opts: popt(r, [(ex + im) / gdp * 100, ex / gdp * 100, (ex - im) / gdp * 100], 1).map(s => s.replace('+', '')),
      ex: steps(['Ortalama ticaret', `$(EX + IM)/2 = (${ex} + ${im})/2 = ${g0((ex + im) / 2, 1)}$`], ['GSYH\'ye böl', `$${g0((ex + im) / 2, 1)}/${gdp} = ${f(r / 100, 4)}$, yani %${f(r, 1)}.`])
        + `\n\nKitaptaki Tablo 1-2'de oranı en yüksek ülkeler küçük ekonomiler (Hong Kong %188, Singapur %163); ABD %16. Büyük ülkeler ticaretin çoğunu kendi içinde yapar. Oran %100'ü geçebilir çünkü ihracat ara mallar yüzünden brüt sayılır, GSYH ise katma değerdir.`
    };
  };

  /* ---------- Bölüm 2: Ricardo ---------- */
  G.absAdv = () => {
    const [A, B] = pick(PAIRS), gd = pick(GOODS); let t;
    do { t = { a1: R(4, 30), b1: R(4, 30), a2: R(4, 30), b2: R(4, 30) }; } while (t.a1 === t.a2 || t.b1 === t.b2 || t.a1 * t.b2 === t.a2 * t.b1);
    const wa = t.a1 > t.a2 ? A : B, wb = t.b1 > t.b2 ? A : B;
    const lab = (x, y) => `${x} in ${gd.a}, ${y} in ${gd.b}`;
    const combos = [[A, A], [A, B], [B, A], [B, B]].map(c => lab(c[0], c[1]));
    const correct = lab(wa, wb);
    return {
      en: `With the same resources (one day of labor), ${A} can produce ${t.a1} ${gd.au} or ${t.b1} ${gd.bu}, while ${B} can produce ${t.a2} ${gd.au} or ${t.b2} ${gd.bu}. Which country has an absolute advantage in each good?`,
      tr: `Aynı kaynakla (bir günlük emek) ${A} ${t.a1} birim ${gd.at} ya da ${t.b1} birim ${gd.bt}, ${B} ise ${t.a2} birim ${gd.at} ya da ${t.b2} birim ${gd.bt} üretebiliyor. Hangi ülke hangi malda mutlak üstünlüğe sahip?`,
      opts: [correct].concat(combos.filter(c => c !== correct)),
      ex: steps(['Mutlak üstünlük = aynı kaynakla daha çok üretmek', `${gd.a}: ${A} ${t.a1}, ${B} ${t.a2} → **${wa}**.\n${gd.b}: ${A} ${t.b1}, ${B} ${t.b2} → **${wb}**.`],
        ['Şıklarda göreceğin İngilizce ifade', `"${wa} has an absolute advantage in ${gd.a} because it produces more ${gd.a} (${Math.max(t.a1, t.a2)} vs ${Math.min(t.a1, t.a2)}) with the same amount of labor. ${wb} has an absolute advantage in ${gd.b} because ${Math.max(t.b1, t.b2)} > ${Math.min(t.b1, t.b2)}."`])
        + (wa === wb ? `\n\n${wa} iki malda da mutlak üstün; yine de ticaret karşılıklı yararlı olabilir. Ticaret yönünü mutlak değil **karşılaştırmalı** üstünlük belirler.` : '')
    };
  };
  G.oppCost = () => {
    const [A, B] = pick(PAIRS), gd = pick(GOODS), t = ricTable();
    const who = R(0, 1), good = R(0, 1);              // hangi ülke, hangi malın fırsat maliyeti
    const ca = who ? t.a2 : t.a1, cb = who ? t.b2 : t.b1, oa = who ? t.a1 : t.a2, ob = who ? t.b1 : t.b2;
    const C = who ? B : A, gName = good ? gd.b : gd.a, other = good ? gd.a : gd.b;
    const ans = good ? fr(ca, cb) : fr(cb, ca);
    const otherC = good ? fr(oa, ob) : fr(ob, oa);
    return {
      en: `One worker can produce the following per day:\n| Country | ${gd.a} per worker | ${gd.b} per worker |\n| ${A} | ${t.a1} | ${t.b1} |\n| ${B} | ${t.a2} | ${t.b2} |\nWhat is the opportunity cost of producing one unit of ${gName} in ${C}, measured in units of ${other}?`,
      tr: `Tablo bir işçinin günlük üretimi. ${C} için 1 birim ${good ? gd.bt : gd.at} üretmenin fırsat maliyeti kaç birim ${good ? gd.at : gd.bt}?`,
      opts: fopts(ans, [finv(ans), otherC, finv(otherC), fr(good ? cb : ca, 1)]),
      ex: steps(['Bir işçi ne üretir?', `${C}: bir işçi ${ca} birim ${gd.a} ya da ${cb} birim ${gd.b} üretir.`],
        ['Bir birim için vazgeçilen', `1 birim ${gName} üretmek için işçinin $1/${good ? cb : ca}$'i gerekir; bu emek öteki malda $${good ? ca : cb}\\times\\frac{1}{${good ? cb : ca}}$ birim üretirdi:\n$$\\text{FM}(${gName}) = \\frac{MPL_{${other}}}{MPL_{${gName}}} = ${ft(ans)}$$`],
        ['Kontrol', `İki malın fırsat maliyeti birbirinin tersidir: 1 ${other} = ${fs(finv(ans))} ${gName}.`])
        + `\n\nKısa kural: **fırsat maliyeti = öteki malın verimliliği ÷ bu malın verimliliği.** Hocanın uyarısı: miktarı verimlilikle çarpma, birim emek gereksinimiyle çarp.`
    };
  };
  G.compAdv = () => {
    const [A, B] = pick(PAIRS), gd = pick(GOODS), t = ricTable(true);
    const ocA = t.b1 / t.a1, ocB = t.b2 / t.a2;          // a malının fırsat maliyeti (b cinsinden)
    const ca = ocA < ocB ? A : B, cb = ca === A ? B : A;
    const lab = (x, y) => `${x} in ${gd.a}, ${y} in ${gd.b}`;
    const correct = lab(ca, cb);
    const abs = lab(t.a1 > t.a2 ? A : B, t.b1 > t.b2 ? A : B);
    const opts = [correct, lab(cb, ca)]; [abs, lab(A, A), lab(B, B)].forEach(o => { if (!opts.includes(o)) opts.push(o); });
    return {
      en: `Output per worker:\n| Country | ${gd.a} | ${gd.b} |\n| ${A} | ${t.a1} | ${t.b1} |\n| ${B} | ${t.a2} | ${t.b2} |\nWhich country has the comparative advantage in each product?`,
      tr: `Tablo işçi başına üretim. Hangi ülke hangi malda karşılaştırmalı üstünlüğe sahip?`,
      opts: opts.slice(0, 4),
      ex: steps(['1 birim ' + gd.a + ' kaç ' + gd.b + '?', `${A}: $${ft(fr(t.b1, t.a1))}$ · ${B}: $${ft(fr(t.b2, t.a2))}$ → daha düşük olan **${ca}**.`],
        ['1 birim ' + gd.b + ' kaç ' + gd.a + '?', `${A}: $${ft(fr(t.a1, t.b1))}$ · ${B}: $${ft(fr(t.a2, t.b2))}$ → daha düşük olan **${cb}**.`],
        ['Sonuç', `${ca} ${gd.a}, ${cb} ${gd.b} üretiminde uzmanlaşır ve ihraç eder.`])
        + (abs !== correct ? `\n\nTuzak: mutlak üstünlüğe bakan "${abs}" der. Karşılaştırmalı üstünlük fırsat maliyetiyle belirlenir, verimlilik düzeyiyle değil.` : '')
        + `\n\nŞıklarda göreceğin ifade: "${ca} has a comparative advantage in ${gd.a} because its opportunity cost of ${gd.a} is lower."`
    };
  };
  G.laborReq = () => {
    const mw = R(1, 6), mc = R(1, 6), qw = mw * R(2, 8), qc = mc * R(2, 8);
    const L = qw / mw + qc / mc;
    return {
      en: `At Home one unit of labor produces ${mw} bushels of wheat or ${mc} yards of cloth. How many units of labor are needed to produce ${qw} bushels of wheat and ${qc} yards of cloth?`,
      tr: `Home'da bir birim emek ${mw} buşel buğday ya da ${mc} yarda kumaş üretiyor. ${qw} buğday ve ${qc} kumaş için kaç birim emek gerekir?`,
      opts: nopts(L, [qw * mw + qc * mc, qw / mc + qc / mw, (qw + qc) / (mw + mc)], 2).map(s => g0(+s)),
      ex: steps(['Birim emek gereksinimi', `$a_W = 1/${mw}$, $a_C = 1/${mc}$ (bir birim mal için gereken emek).`], ['Çarp ve topla', `$${qw}\\times\\frac{1}{${mw}} + ${qc}\\times\\frac{1}{${mc}} = ${qw / mw} + ${qc / mc} = ${g0(L)}$`])
        + `\n\nHocanın özetindeki örnek: 20 buğday ve 10 kumaş, $20/4 + 10/2 = 10$ birim emek. Miktarı verimlilikle (MPL) çarpmak en sık hata.`
    };
  };
  G.ppf = () => {
    const [A] = pick(PAIRS), L = pick([20, 25, 40, 50, 60, 80, 100]), mw = R(1, 6), mc = R(1, 6);
    if (mw === mc && Math.random() < 0.6) return G.ppf();
    const v = R(0, 2);
    if (v < 2) {
      const good = v === 0, ans = L * (good ? mw : mc);
      return {
        en: `${A} has ${L} workers. One worker produces ${mw} bushels of wheat or ${mc} yards of cloth. What is the ${good ? 'wheat' : 'cloth'} intercept of ${A}'s PPF (maximum ${good ? 'wheat' : 'cloth'} output)?`,
        tr: `${A}'da ${L} işçi var; bir işçi ${mw} buğday ya da ${mc} kumaş üretiyor. PPF'nin ${good ? 'buğday' : 'kumaş'} ekseni kesişimi (en çok ${good ? 'buğday' : 'kumaş'}) kaçtır?`,
        opts: nopts(ans, [L * (good ? mc : mw), L / (good ? mw : mc), L * mw * mc, ans / 2], 0),
        ex: steps(['Herkes bu malı üretirse', `$MPL \\times \\bar L = ${good ? mw : mc}\\times ${L} = ${ans}$`]) + `\n\nKitaptaki Home: 25 işçi, $MPL_W = 4$, $MPL_C = 2$ → 100 buğday ya da 50 kumaş.`
      };
    }
    const s = fr(mc, mw);
    return {
      en: `${A} has ${L} workers; one worker produces ${mw} bushels of wheat or ${mc} yards of cloth. With wheat on the horizontal axis and cloth on the vertical axis, what is the absolute value of the slope of the PPF?`,
      tr: `${L} işçi, işçi başına ${mw} buğday ya da ${mc} kumaş. Buğday yatay, kumaş dikey eksendeyken PPF eğiminin mutlak değeri kaçtır?`,
      opts: fopts(s, [finv(s), fr(L * mc, 1), fr(mw * mc, 1)]),
      ex: steps(['Eğim = dikey uç ÷ yatay uç', `$\\frac{${L}\\times${mc}}{${L}\\times${mw}} = \\frac{MPL_C}{MPL_W} = ${ft(s)}$`], ['Anlamı', `1 buğday daha üretmek için ${fs(s)} kumaştan vazgeçilir: eğim = buğdayın fırsat maliyeti. Emek sayısı sadeleşir, eğimi etkilemez.`])
    };
  };
  G.autarkyP = () => {
    const [A, B] = pick(PAIRS), t = ricTable(), who = R(0, 1), wheat = R(0, 1);
    const mw = who ? t.a2 : t.a1, mc = who ? t.b2 : t.b1, C = who ? B : A;
    const ans = wheat ? fr(mc, mw) : fr(mw, mc), oth = wheat ? fr(who ? t.b1 : t.b2, who ? t.a1 : t.a2) : fr(who ? t.a1 : t.a2, who ? t.b1 : t.b2);
    return {
      en: `Labor is the only factor. One worker produces:\n| Country | Wheat (bushels) | Cloth (yards) |\n| ${A} | ${t.a1} | ${t.b1} |\n| ${B} | ${t.a2} | ${t.b2} |\nIf both goods are produced in ${C} without trade, what is the relative price ${wheat ? '$P_W/P_C$' : '$P_C/P_W$'} in ${C}?`,
      tr: `Ticaret yokken ${C}'da iki mal da üretiliyorsa nispi fiyat ${wheat ? '$P_W/P_C$' : '$P_C/P_W$'} kaçtır?`,
      opts: fopts(ans, [finv(ans), oth, finv(oth)]),
      ex: steps(['Ücretler eşit olmalı', `Emek sektörler arası serbest: $P_W\\cdot MPL_W = P_C\\cdot MPL_C$.`], ['Düzenle', `$$\\frac{P_W}{P_C} = \\frac{MPL_C}{MPL_W} = \\frac{${mc}}{${mw}}$$ ${wheat ? '' : 'Ters çevir: $P_C/P_W = ' + ft(ans) + '$.'}`])
        + `\n\nOtarşide nispi fiyat = fırsat maliyeti = PPF eğimi. Ücret iki tarafta da sadeleşir.`
    };
  };
  G.worldRange = () => {
    const [A, B] = pick(PAIRS), t = ricTable();
    const pA = fr(t.b1, t.a1), pB = fr(t.b2, t.a2);     // P_W/P_C otarşi
    const lo = Math.min(fv(pA), fv(pB)), hi = Math.max(fv(pA), fv(pB));
    let mid; for (const c of [fr(Math.round((lo + hi) * 6), 12), fr(Math.round((lo + hi) * 5), 10), fr(Math.round((lo + hi) * 4), 8), fr(Math.round((lo + hi) * 3), 6)]) { if (fv(c) > lo + 1e-9 && fv(c) < hi - 1e-9) { mid = c; break; } }
    if (!mid) return G.worldRange();
    const below = fr(Math.max(1, Math.floor(lo * 2)) , 4), above = fr(Math.ceil(hi * 2) + 1, 2);
    const wrongs = [lo === fv(pA) ? pA : pB, above]; if (fv(below) < lo - 1e-9) wrongs.push(below); wrongs.push(fr(Math.ceil(hi * 4) + 4, 4));
    return {
      en: `One worker produces:\n| Country | Wheat | Cloth |\n| ${A} | ${t.a1} | ${t.b1} |\n| ${B} | ${t.a2} | ${t.b2} |\nWhich world relative price of wheat $P_W/P_C$ would lead both countries to specialize completely and gain from trade?`,
      tr: `Hangi dünya nispi buğday fiyatında ($P_W/P_C$) iki ülke de tam uzmanlaşır ve ticaretten kazanır?`,
      opts: fopts(mid, wrongs),
      ex: steps(['Otarşi fiyatları', `${A}: $P_W/P_C = ${t.b1}/${t.a1} = ${ft(pA)}$ · ${B}: $${t.b2}/${t.a2} = ${ft(pB)}$`],
        ['Dünya fiyatı arada olmalı', `$${f(lo, 3)} < P_W/P_C < ${f(hi, 3)}$. ${fs(mid)} bu aralıkta.`])
        + `\n\nFiyat bir ülkenin otarşi fiyatına eşitse o ülke kazanmaz (iki sektör arasında kayıtsız kalır). Aralığın dışındaysa iki ülke de aynı malı ihraç etmek ister; denge olamaz. Kitapta: Home 1/2, Foreign 1, dünya fiyatı 2/3.`
    };
  };
  G.tradeC = () => {
    const mw = pick([2, 3, 4, 5]), mc = pick([1, 2, 3]), L = pick([20, 25, 30, 40]);
    const aut = fr(mc, mw); let p;                       // dünya fiyatı otarşiden yüksek (buğday ihraç)
    for (let k = 0; k < 40; k++) { const c = fr(R(1, 9), R(2, 9)); if (fv(c) > fv(aut) + 1e-9 && fv(c) < fv(aut) * 2.5) { p = c; break; } }
    if (!p) return G.tradeC();
    const W = mw * L, X = p[1] * R(2, Math.max(2, Math.floor(W * 0.8 / p[1])));
    if (X >= W) return G.tradeC();
    const M = X * p[0] / p[1], v = R(0, 2);
    const q = v === 0 ? 'how many yards of cloth does Home import' : v === 1 ? 'what is Home\'s consumption point (wheat, cloth)' : 'what is the cloth intercept of the world price line through the production point';
    const ans = v === 0 ? g0(M) : v === 1 ? `(${W - X}, ${g0(M)})` : g0(W * p[0] / p[1]);
    const opts = v === 0 ? [ans, g0(X * p[1] / p[0]), g0(X), g0(M * 2)] : v === 1 ? [ans, `(${X}, ${g0(M)})`, `(${W - X}, ${g0(X * p[1] / p[0])})`, `(${W}, ${g0(M)})`] : [ans, g0(W * p[1] / p[0]), g0(L * mc), g0(W)];
    return {
      en: `Home has ${L} workers; one worker produces ${mw} bushels of wheat or ${mc} yards of cloth. The world relative price of wheat is $P_W/P_C = ${ft(p)}$, so Home specializes in wheat. Home exports ${X} bushels of wheat. ${q.charAt(0).toUpperCase() + q.slice(1)}?`,
      tr: `Home'da ${L} işçi; işçi başına ${mw} buğday ya da ${mc} kumaş. Dünya fiyatı $P_W/P_C = ${ft(p)}$; Home buğdayda uzmanlaşıyor ve ${X} buğday ihraç ediyor. ${v === 0 ? 'Kaç yarda kumaş ithal eder?' : v === 1 ? 'Tüketim noktası (buğday, kumaş) nedir?' : 'Üretim noktasından geçen dünya fiyat doğrusu kumaş eksenini nerede keser?'}`,
      opts: opts.filter((x, i, a) => a.indexOf(x) === i),
      ex: steps(['Üretim noktası B', `Tam uzmanlaşma: $${L}\\times${mw} = ${W}$ buğday, 0 kumaş. (Otarşi fiyatı ${fs(aut)} < dünya fiyatı ${fs(p)}: buğday dışarıda daha değerli.)`],
        ['İthalat = ihracat × fiyat', `1 buğday ${fs(p)} kumaş eder: $${X}\\times${ft(p)} = ${g0(M)}$ kumaş.`],
        ['Tüketim noktası C', `B'den ${X} sola, ${g0(M)} yukarı: buğday $${W} - ${X} = ${W - X}$, kumaş ${g0(M)}. C, PPF'nin dışında: ticaretsiz ulaşılamaz.`],
        v === 2 && ['Fiyat doğrusunun kumaş kesişimi', `Bütün buğday satılsa: $${W}\\times${ft(p)} = ${g0(W * p[0] / p[1])}$ kumaş.`])
        + `\n\nKitapta: 100 buğday, fiyat 2/3, 60 ihracat → 40 kumaş ithalat, C = (40, 40); fiyat doğrusunun kumaş kesişimi 200/3.`
    };
  };
  G.wageRic = () => {
    const t = { a1: pick([2, 3, 4, 6]), b1: pick([1, 2, 3]), a2: 1, b2: 1 };
    if (t.b1 / t.a1 >= 1) return G.wageRic();
    let p; for (let k = 0; k < 40; k++) { const c = fr(R(1, 9), R(2, 9)); if (fv(c) > t.b1 / t.a1 + 1e-9 && fv(c) < 1 - 1e-9) { p = c; break; } }
    if (!p) return G.wageRic();
    const v = R(0, 1);
    const ans = v ? fmul(p, fr(t.a1, 1)) : finv(p);
    return {
      en: `Home: one worker produces ${t.a1} bushels of wheat or ${t.b1} yards of cloth. Foreign: one worker produces 1 bushel or 1 yard. With trade the world price is $P_W/P_C = ${ft(p)}$; Home specializes in wheat, Foreign in cloth. ${v ? 'What is the Home wage measured in yards of cloth?' : 'What is the Foreign wage measured in bushels of wheat?'}`,
      tr: `Ticaretle $P_W/P_C = ${ft(p)}$; Home buğdayda, Foreign kumaşta uzmanlaşıyor. ${v ? 'Home ücreti kumaş cinsinden kaçtır?' : 'Foreign ücreti buğday cinsinden kaçtır?'}`,
      opts: fopts(ans, v ? [fr(t.a1, 1), fr(t.b1, 1), fmul(finv(p), fr(t.a1, 1))] : [p, fr(1, 1), fr(t.a1, 1)]),
      ex: steps(['Ücret = fiyat × MPL (çalıştığı sektörde)', v ? `Home buğday üretir: buğday cinsinden ücret $MPL_W = ${t.a1}$.` : `Foreign kumaş üretir: kumaş cinsinden ücret $MPL^*_C = 1$.`],
        ['Öteki mala çevir', v ? `$\\frac{P_W}{P_C}\\cdot MPL_W = ${ft(p)}\\times ${t.a1} = ${ft(ans)}$ kumaş.` : `$\\frac{P_C}{P_W}\\cdot MPL^*_C = ${ft(finv(p))}\\times 1 = ${ft(ans)}$ buğday.`])
        + `\n\nDers: ticaret yönünü karşılaştırmalı üstünlük, **ücret düzeyini mutlak üstünlük** belirler. Kitapta (fiyat 2/3): Home ücreti 4 buğday = 8/3 kumaş, Foreign ücreti 1 kumaş = 3/2 buğday.`
    };
  };
  G.ulc = () => {
    const w = R(4, 30), wf = R(1, Math.max(1, w - 2)), a = R(2, 10), b = R(1, Math.max(1, a - 1));
    const u = w / a, uf = wf / b;
    if (Math.abs(u - uf) < 0.05) return G.ulc();
    return {
      en: `In the shoe industry, a Home worker earns ${w} dollars per hour and produces ${a} pairs per hour. A Foreign worker earns ${wf} dollars per hour and produces ${b} pairs per hour. What is Home's unit labor cost per pair?`,
      tr: `Ayakkabıda Home işçisi saatte ${w} dolar kazanıp ${a} çift, Foreign işçisi saatte ${wf} dolar kazanıp ${b} çift üretiyor. Home'un çift başına birim emek maliyeti kaçtır?`,
      opts: nopts(u, [w * a, w / b, uf, a / w], 2),
      ex: steps(['Birim emek maliyeti = ücret ÷ verimlilik', `Home: $${w}/${a} = ${f(u, 2)}$ dolar · Foreign: $${wf}/${b} = ${f(uf, 2)}$ dolar.`],
        ['Karşılaştır', `${u < uf ? 'Home ücreti daha yüksek olduğu hâlde çift başına daha ucuza üretiyor: verimliliği ücret farkını kapatıyor.' : 'Foreign düşük ücret sayesinde daha ucuza üretiyor; düşük verimlilik ücret avantajını yok etmiyor.'}`])
        + `\n\nHocanın uyarısı: düşük ücret otomatik olarak düşük maliyet demek değildir; işçi başına değil **birim başına** ücrete bak.`
    };
  };
  G.tot = () => {
    const e = R(-10, 25), m = R(-10, 25); if (e === m) return G.tot();
    const ch = ((1 + e / 100) / (1 + m / 100) - 1) * 100;
    return {
      en: `A country exports wheat and imports cloth. The price of wheat ${e >= 0 ? 'rises' : 'falls'} by ${Math.abs(e)}% and the price of cloth ${m >= 0 ? 'rises' : 'falls'} by ${Math.abs(m)}%. By approximately how much do its terms of trade change?`,
      tr: `Ülke buğday ihraç, kumaş ithal ediyor. Buğday fiyatı %${Math.abs(e)} ${e >= 0 ? 'artıyor' : 'düşüyor'}, kumaş fiyatı %${Math.abs(m)} ${m >= 0 ? 'artıyor' : 'düşüyor'}. Dış ticaret hadleri yaklaşık ne kadar değişir?`,
      opts: popt(ch, [((1 + m / 100) / (1 + e / 100) - 1) * 100, e + m, -ch], 1),
      ex: steps(['Tanım', `Dış ticaret hadleri = ihraç malı fiyatı ÷ ithal malı fiyatı = $P_W/P_C$.`], ['Oranın değişimi', `$\\frac{${f(1 + e / 100, 2)}}{${f(1 + m / 100, 2)}} - 1 = ${f(ch / 100, 4)}$, yani %${f(ch, 1)} (yaklaşık ${e} − (${m}) = ${e - m}).`])
        + `\n\n${ch > 0 ? 'Hadler iyileşti: aynı ihracatla daha çok ithal malı alınır; ülke daha iyi durumda.' : 'Hadler kötüleşti: aynı ithalat için daha çok ihraç etmek gerekir.'} Prebisch–Singer: ham madde ihracatçılarının hadleri zamanla kötüleşir mi? Kanıt karışık.`
    };
  };

  /* ---------- Bölüm 3: özgül faktörler ---------- */
  G.sfMoc = () => {
    const mm = R(2, 9), ma = R(1, 8); if (mm === ma) return G.sfMoc();
    const ans = fr(ma, mm);
    return {
      en: `In the specific-factors model, moving one more worker into manufacturing adds ${mm} units of manufactures and the worker leaves agriculture, where she produced ${ma} units of food. What is the marginal opportunity cost of one unit of manufactures (in units of food)?`,
      tr: `Bir işçi tarımdan imalata geçince imalat ${mm} birim artıyor, tarım ${ma} birim azalıyor. 1 birim imalatın marjinal fırsat maliyeti kaç birim gıdadır?`,
      opts: fopts(ans, [finv(ans), fr(ma * mm, 1), fr(mm - ma > 0 ? mm - ma : ma - mm, 1)]),
      ex: steps(['Formül', `$$\\text{FM}(M) = \\frac{MPL_A}{MPL_M} = \\frac{${ma}}{${mm}} = ${ft(ans)}$$ = ${f(fv(ans), 2)} birim gıda.`], ['Neden eğri PPF?', `İmalata işçi geldikçe $MPL_M$ düşer (sermaye sabit, azalan verim), tarımda kalan işçilerin $MPL_A$'sı yükselir; maliyet artar. Hocanın örneği: 2/5 = 0.4'ten 3/4 = 0.75'e. PPF imalat genişledikçe dikleşir.`])
    };
  };
  G.sfWage = () => {
    const PM = pick([1, 2, 3]), PA = pick([1, 2, 3]), b = pick([1, 2]), d = pick([1, 2]), L = 100, LM = R(30, 70);
    const W = PM * PA * R(10, 30), a = W / PM + b * LM, c = W / PA + d * (L - LM);
    const askL = Math.random() < 0.5;
    return {
      en: `Specific-factors model with ${L} workers. In manufacturing $MPL_M = ${a} - ${b === 1 ? '' : b}L_M$ and in agriculture $MPL_A = ${c} - ${d === 1 ? '' : d}L_A$, with $L_M + L_A = ${L}$. Prices are $P_M = ${PM}$ and $P_A = ${PA}$. In equilibrium, what is ${askL ? 'employment in manufacturing $L_M$' : 'the wage W'}?`,
      tr: `${L} işçi; $MPL_M = ${a} - ${b === 1 ? '' : b}L_M$, $MPL_A = ${c} - ${d === 1 ? '' : d}L_A$, $P_M = ${PM}$, $P_A = ${PA}$. Dengede ${askL ? 'imalattaki istihdam $L_M$' : 'ücret W'} kaçtır?`,
      opts: askL ? nopts(LM, [L - LM, (a + c) / (b + d) - 0, a / b], 0, { min: 1, max: L - 1 }) : nopts(W, [a - b * LM, c - d * (L - LM), PM * (a - b * (L - LM))], 0, { min: 1 }),
      ex: steps(['Denge koşulu', `Emek serbest: $W = P_M\\cdot MPL_M = P_A\\cdot MPL_A$.\n$${PM}(${a} - ${b}L_M) = ${PA}(${c} - ${d}(${L} - L_M))$`],
        ['Çöz', `$${PM * a} - ${PM * b}L_M = ${PA * c - PA * d * L} + ${PA * d}L_M \\Rightarrow L_M = \\frac{${PM * a - (PA * c - PA * d * L)}}{${PM * b + PA * d}} = ${LM}$, $L_A = ${L - LM}$`],
        ['Ücret', `$W = ${PM}\\times(${a} - ${b}\\times${LM}) = ${W}$. Kontrol: $${PA}\\times(${c} - ${d}\\times${L - LM}) = ${W}$.`])
        + `\n\nŞekil 3-4: imalat emeği soldan, tarım emeği sağdan ölçülür; iki $P\\cdot MPL$ eğrisinin kesiştiği yer ücreti ve dağılımı belirler.`
    };
  };
  G.sfRealWage = () => {
    const pm = pick([5, 8, 10, 12, 15, 20]), w = R(1, pm - 1), toM = Math.random() < 0.55;
    const ans = toM ? ((1 + w / 100) / (1 + pm / 100) - 1) * 100 : w;
    return {
      en: `In the specific-factors model the price of manufactures rises by ${pm}% while the price of food is unchanged, and the wage rises by ${w}%. By approximately how much does the real wage in terms of ${toM ? 'manufactures ($W/P_M$)' : 'food ($W/P_A$)'} change?`,
      tr: `İmalat fiyatı %${pm} artıyor, gıda fiyatı sabit, ücret %${w} artıyor. ${toM ? 'İmalat malı cinsinden ($W/P_M$)' : 'Gıda cinsinden ($W/P_A$)'} reel ücret yaklaşık ne kadar değişir?`,
      opts: popt(ans, toM ? [w, pm - w, -pm] : [((1 + w / 100) / (1 + pm / 100) - 1) * 100, pm, pm - w], 2),
      ex: steps(['Reel ücret = ücret ÷ ilgili malın fiyatı', toM ? `$\\frac{1.${String(w).padStart(2, '0')}}{${f(1 + pm / 100, 2)}} - 1 = ${f(ans / 100, 4)}$, yaklaşık ${w} − ${pm} = ${w - pm} puan.` : `Gıda fiyatı değişmedi: reel ücret ücretle aynı oranda, %${w} artar.`],
        ['Yorum', `İşçi daha çok gıda, daha az imalat malı alabilir. Hangi malı çok tükettiğine göre durumu iyileşir ya da kötüleşir: **reel ücretin değişimi belirsizdir (ambiguous)**.`])
        + `\n\nKitaptaki sıra ($P_M$ artarken): $\\hat W < \\hat P_M$ çünkü imalata gelen işçiler $MPL_M$'yi düşürür. Hocanın örneği: %10 ve %5 → imalat cinsinden $1.05/1.10 - 1 = -4.55\\%$.`
    };
  };
  G.sfRents = () => {
    const pm = pick([5, 8, 10, 12, 15, 20]), w = R(1, pm - 1), land = Math.random() < 0.45;
    if (!land) {
      const rm = 100, lm = pick([50, 55, 60, 65, 70]);
      const ans = (pm * rm - w * lm) / (rm - lm);
      return {
        en: `Manufacturing: sales revenue ${rm}, payments to labor ${lm}, payments to capital ${rm - lm}. The price of manufactures rises by ${pm}%, the price of food is unchanged, and the wage rises by ${w}%. By how much does the rental on capital change?`,
        tr: `İmalat hasılatı ${rm}, emeğe ödeme ${lm}, sermayeye ${rm - lm}. İmalat fiyatı %${pm}, ücret %${w} artıyor. Sermaye rantı yüzde kaç değişir?`,
        opts: popt(ans, [pm - w, (pm * rm - w * lm) / rm, pm * rm / (rm - lm), -(w * lm) / (rm - lm)], 2),
        ex: steps(['Formül', `$$\\frac{\\Delta R_K}{R_K} = \\frac{\\frac{\\Delta P_M}{P_M}\\cdot P_MQ_M - \\frac{\\Delta W}{W}\\cdot WL_M}{R_K K}$$`],
          ['Sayıları koy', `$\\frac{${pm}\\%\\times ${rm} - ${w}\\%\\times ${lm}}{${rm - lm}} = \\frac{${pm * rm / 100} - ${g0(w * lm / 100)}}{${rm - lm}} = ${f(ans / 100, 4)}$, yani %${f(ans, 2)}.`],
          ['Yorum', `${ans > pm ? `Rant fiyattan (%${pm}) daha hızlı arttı: sermaye sahibi iki mal cinsinden de kazanır.` : 'Rant artışı fiyat artışını geçmedi; bu sayılar kitaptaki sıralamayla uyumsuz (ücret değişimi çok büyük).'}`])
          + `\n\nKitaptaki örnek: $(10\\% \\cdot 100 - 5\\% \\cdot 60)/40 = 17.5\\%$.`
      };
    }
    const ra = 100, la = pick([40, 50, 60, 70]);
    const ans = -(w * la) / (ra - la);
    return {
      en: `Agriculture: sales revenue ${ra}, payments to labor ${la}, payments to land ${ra - la}. The price of food is unchanged, the price of manufactures rises by ${pm}% and the wage rises by ${w}%. By how much does the rental on land change?`,
      tr: `Tarım hasılatı ${ra}, emeğe ödeme ${la}, toprağa ${ra - la}. Gıda fiyatı sabit, ücret %${w} artıyor. Toprak rantı yüzde kaç değişir?`,
      opts: popt(ans, [-w, w * la / (ra - la), -(w * la) / ra, -(pm * la) / (ra - la)], 2),
      ex: steps(['Formül (gıda fiyatı sabit)', `$$\\frac{\\Delta R_T}{R_T} = -\\frac{\\Delta W}{W}\\cdot\\frac{WL_A}{R_T T}$$`],
        ['Sayıları koy', `$-${w}\\%\\times\\frac{${la}}{${ra - la}} = ${f(ans, 2)}\\%$`],
        ['Yorum', `Toprak rantı düştü, gıda fiyatı değişmedi, imalat pahalandı: toprak sahibi **iki mal cinsinden de** kaybeder.`])
        + `\n\nKitaptaki örnek: $-5\\% \\times 50/50 = -5\\%$. Sıra: $\\hat R_T < 0 < \\hat W < \\hat P_M < \\hat R_K$.`
    };
  };

  /* ---------- Bölüm 4: Heckscher–Ohlin ---------- */
  G.abundance = () => {
    const [A, B] = pick(PAIRS);
    let K1, L1, K2, L2; do { K1 = R(5, 30) * 10; L1 = R(5, 30) * 10; K2 = R(5, 30) * 10; L2 = R(5, 30) * 10; } while (Math.abs(K1 / L1 - K2 / L2) < 0.15 || !((K1 < K2) === (K1 / L1 > K2 / L2)) && Math.random() < 0.5);
    const capA = K1 / L1 > K2 / L2 ? A : B, labA = capA === A ? B : A, askExp = Math.random() < 0.5;
    const optsQ = askExp ? [`${capA} exports computers, ${labA} exports shoes`, `${labA} exports computers, ${capA} exports shoes`, `${K1 > K2 ? A : B} exports both goods`, `No trade, because technologies are identical`]
      : [`${capA} is capital-abundant`, `${labA} is capital-abundant`, `${K1 > K2 ? A : B} is capital-abundant because it has more capital`, `Neither; abundance requires equal labor forces`];
    const uniq = optsQ.filter((x, i, a) => a.indexOf(x) === i);
    return {
      en: `${A} has ${K1} units of capital and ${L1} workers; ${B} has ${K2} units of capital and ${L2} workers. Computers are capital-intensive and shoes are labor-intensive. ${askExp ? 'According to the Heckscher–Ohlin theorem, what is the pattern of trade?' : 'Which statement is correct?'}`,
      tr: `${A}: ${K1} sermaye, ${L1} işçi; ${B}: ${K2} sermaye, ${L2} işçi. Bilgisayar sermaye yoğun, ayakkabı emek yoğun. ${askExp ? 'HO teoremine göre ticaret yönü nedir?' : 'Hangisi doğru?'}`,
      opts: uniq.length >= 3 ? uniq : uniq.concat(['Both countries are labor-abundant']),
      ex: steps(['Bolluk bir ORAN', `${A}: $K/L = ${K1}/${L1} = ${f(K1 / L1, 2)}$ · ${B}: $K/L = ${K2}/${L2} = ${f(K2 / L2, 2)}$`],
        ['Karşılaştır', `${capA} göreli olarak sermaye bol, ${labA} emek bol. Mutlak sermaye miktarı değil, işgücüne oranı önemli.`],
        askExp && ['HO teoremi', `Ülke bol faktörünü yoğun kullanan malı ihraç eder: ${capA} bilgisayar, ${labA} ayakkabı.`])
        + `\n\nHocanın örneği: Home 100 K / 50 L (oran 2), Foreign 120 K / 120 L (oran 1). Home daha az sermayeye sahip ama sermaye bol.`
    };
  };
  G.laborShare = () => {
    const xc = R(30, 70), xs = R(30, 70); if (Math.abs(xc - xs) < 5) return G.laborShare();
    const li = xs > xc ? 'shoes' : 'computers', ki = li === 'shoes' ? 'computers' : 'shoes';
    return {
      en: `Both industries pay the same wage and rental. In computers, labor receives ${xc}% of revenue; in shoes, labor receives ${xs}% of revenue. Which statement is correct?`,
      tr: `İki sektör aynı ücret ve rantı ödüyor. Bilgisayarda hasılatın %${xc}'si, ayakkabıda %${xs}'si emeğe gidiyor. Hangisi doğru?`,
      opts: [`${li.charAt(0).toUpperCase() + li.slice(1)} are labor-intensive and ${ki} are capital-intensive`, `${ki.charAt(0).toUpperCase() + ki.slice(1)} are labor-intensive and ${li} are capital-intensive`, `Both are labor-intensive because labor shares exceed 30%`, `Intensity cannot be compared without knowing each country's endowments`],
      ex: steps(['Aynı faktör fiyatlarında karşılaştır', `Emek payı yüksek olan sektör, sermaye başına daha çok emek kullanır: ${li === 'shoes' ? 'ayakkabı' : 'bilgisayar'} (%${Math.max(xc, xs)}).`], ['Yoğunluk sektörün, bolluk ülkenin özelliği', 'Faktör yoğunluğu (intensity) sektörleri, faktör bolluğu (abundance) ülkeleri karşılaştırır. Bu ikisini karıştırma.'])
        + `\n\nKitaptaki sayısal örnek: bilgisayarda emek payı %50, ayakkabıda %60 → ayakkabı emek yoğun.`
    };
  };
  G.leontief = () => {
    const ke = R(200, 300) / 100, le = R(170, 200), km = R(280, 360) / 100, lm = R(150, 180);
    const re = ke * 1e6 / le, rm = km * 1e6 / lm, askEx = Math.random() < 0.5;
    const ans = askEx ? re : rm;
    return {
      en: `To produce 1 million dollars of U.S. exports requires ${f(ke, 2)} million dollars of capital and ${le} person-years of labor; to produce 1 million dollars of import replacements requires ${f(km, 2)} million dollars of capital and ${lm} person-years. What is the capital–labor ratio for ${askEx ? 'exports' : 'imports'} (dollars per person-year)?`,
      tr: `1 milyon dolarlık ihracat için ${f(ke, 2)} milyon dolar sermaye ve ${le} kişi-yıl emek, ithal ikamesi için ${f(km, 2)} milyon ve ${lm} kişi-yıl gerekiyor. ${askEx ? 'İhracatın' : 'İthalatın'} sermaye/emek oranı kaç dolar/kişidir?`,
      opts: nopts(ans, [askEx ? rm : re, (askEx ? le : lm) / (askEx ? ke : km) * 1000, ans * 10], 0),
      ex: steps(['Oran', `$\\frac{${f(askEx ? ke : km, 2)}\\times 10^6}{${askEx ? le : lm}} \\approx ${f(ans, 0)}$ dolar/kişi.`], ['Leontief paradoksu', `İhracat ${f(re, 0)}, ithalat ${f(rm, 0)}. ${re < rm ? 'İhracat ithalattan daha az sermaye yoğun: sermaye bol ABD için HO beklentisinin tersi.' : 'Bu sayılarla ihracat daha sermaye yoğun (paradoks yok).'}`])
        + `\n\nKitaptaki Tablo 4-1 (1947): ihracat 14,000, ithalat 18,200. Açıklamalar: teknoloji farkı, toprak ve nitelikli emek dışarıda kaldı, 1947 savaş sonrası, tarifeler.`
    };
  };
  G.factorShare = () => {
    const fac = pick([['physical capital', 'fiziksel sermaye'], ['arable land', 'ekilebilir toprak'], ['R&D scientists', 'Ar-Ge bilim insanı'], ['skilled labor', 'nitelikli emek']]);
    const C = pick(['China', 'the United States', 'Japan', 'India', 'Germany']);
    const sg = R(30, 200) / 10; let sf; do { sf = R(10, 250) / 10; } while (Math.abs(sf - sg) < 0.5);
    const ab = sf > sg;
    return {
      en: `${C} has ${f(sf, 1)}% of the world's ${fac[0]} and ${f(sg, 1)}% of world GDP. According to the textbook's measure, ${C} is:`,
      tr: `${C} dünyadaki ${fac[1]} stokunun %${f(sf, 1)}'ine, dünya GSYH'sinin %${f(sg, 1)}'ine sahip. Kitaptaki ölçüye göre:`,
      opts: [ab ? `abundant in ${fac[0]}` : `scarce in ${fac[0]}`, ab ? `scarce in ${fac[0]}` : `abundant in ${fac[0]}`, `abundant in ${fac[0]} only if its share exceeds 25%`, `neither, because the comparison must use population shares`],
      ex: steps(['Kural', 'Faktör payı > GSYH payı ise o faktörde bol, küçükse kıt.'], ['Uygula', `%${f(sf, 1)} ${ab ? '>' : '<'} %${f(sg, 1)} → ${ab ? 'bol (abundant)' : 'kıt (scarce)'}.`])
        + `\n\n2017 örnekleri: Çin sermaye %20.5 > GSYH %16.2 (bol); ABD ekilebilir toprak %13.6 < %16.0 (kıt); Çin Ar-Ge bilim insanı %19.7 > %16.2 (bol). Verimlilikle düzeltilmiş (etkin) payla sonuç değişebilir.`
    };
  };
  G.effEndow = () => {
    const LH = R(5, 30), LF = 100 - LH, aH = R(20, 60) / 10, aF = 1, gdp = R(15, 45);
    const eH = LH * aH, sh = eH / (eH + LF * aF) * 100;
    return {
      en: `The world has two regions. Home has ${LH}% of world workers and Foreign ${LF}%. Home workers are ${f(aH, 1)} times as productive as Foreign workers. Home has ${gdp}% of world GDP. What is Home's share of world effective labor?`,
      tr: `Home dünya işçilerinin %${LH}'sine, Foreign %${LF}'ine sahip. Home işçisi Foreign işçisinden ${f(aH, 1)} kat verimli. Home GSYH payı %${gdp}. Home'un dünya etkin emeğindeki payı kaçtır?`,
      opts: popt(sh, [LH, LH * aH, gdp, sh / 2], 1).map(s => s.replace('+', '')),
      ex: steps(['Etkin donatım = fiili donatım × verimlilik', `Home: $${LH}\\times${f(aH, 1)} = ${g0(eH, 1)}$ · Foreign: $${LF}\\times 1 = ${LF}$`], ['Pay', `$${g0(eH, 1)}/(${g0(eH, 1)} + ${LF}) = ${f(sh / 100, 4)}$, yani %${f(sh, 1)}.`],
        ['GSYH payıyla karşılaştır', `%${f(sh, 1)} ${sh > gdp ? '>' : '<'} %${gdp}: Home etkin emekte ${sh > gdp ? 'bol' : 'kıt'}. İşçi sayısına bakınca (%${LH}) ${LH > gdp ? 'bol' : 'kıt'} görünüyordu.`])
        + `\n\nLeontief paradoksunun çözümü (Şekil 4-9): 1947'de ABD nüfusun %8'ine ama GSYH'nin %37'sine sahipti (emek kıt); ücretlerle ölçülen etkin emekte payı %43'tü (emek bol).`
    };
  };
  G.ssDir = () => {
    const sc = pick([
      { en: 'Home is capital-abundant and opens to trade (computers are capital-intensive, shoes labor-intensive)', tr: 'Sermaye bol Home ticarete açılıyor', g: 'capital', why: 'Home bilgisayar ihraç eder; bilgisayarın nispi fiyatı artar; bilgisayarda yoğun kullanılan sermaye kazanır.' },
      { en: 'Foreign is labor-abundant and opens to trade (computers are capital-intensive, shoes labor-intensive)', tr: 'Emek bol Foreign ticarete açılıyor', g: 'labor', why: 'Foreign ayakkabı ihraç eder; ayakkabının nispi fiyatı artar; emek kazanır.' },
      { en: 'The relative price of shoes (labor-intensive) rises', tr: 'Ayakkabının nispi fiyatı artıyor', g: 'labor', why: 'Fiyatı artan malda yoğun kullanılan faktör emek.' },
      { en: 'The relative price of computers (capital-intensive) falls', tr: 'Bilgisayarın nispi fiyatı düşüyor', g: 'labor', why: 'Bilgisayar ucuzlarsa ayakkabının nispi fiyatı artmış demektir; emek kazanır, sermaye kaybeder.' },
      { en: 'A labor-abundant country such as China up to 2013 opens to trade', tr: 'Emek bol bir ülke (2013\'e kadar Çin) ticarete açılıyor', g: 'labor', why: 'Bol faktör (düşük nitelikli emek) kazanır; kitapta yoksulluğun azalmasıyla ilişkilendirilir.' }]);
    const opts = sc.g === 'capital'
      ? ['Owners of capital gain in real terms; labor loses in terms of both goods', 'Labor gains in real terms; owners of capital lose', 'Both factors gain in real terms', 'The effect on labor is ambiguous, as in the specific-factors model']
      : ['Labor gains in real terms; owners of capital lose in terms of both goods', 'Owners of capital gain in real terms; labor loses', 'Both factors gain in real terms', 'The effect on labor is ambiguous, as in the specific-factors model'];
    return {
      en: `In the long-run Heckscher–Ohlin model (two goods, two factors): ${sc.en}. According to the Stolper–Samuelson theorem:`,
      tr: `Uzun dönem HO modeli: ${sc.tr}. Stolper–Samuelson teoremine göre ne olur?`,
      opts,
      ex: steps(['Hangi malın nispi fiyatı artıyor?', sc.why], ['Stolper–Samuelson', 'Bir malın nispi fiyatı artınca o malda yoğun kullanılan faktörün reel getirisi **iki mal cinsinden de** artar, öteki faktörünki düşer. Belirsizlik yok: özgül faktörler modelinden farkı bu.'])
        + `\n\nHO + SS birlikte: ülkenin **bol faktörü ticaretten kazanır, kıt faktörü kaybeder.**`
    };
  };
  G.ssNum = () => {
    const ac = pick([30, 35, 40, 45, 50]), as = pick([55, 60, 65, 70]), p = pick([2, 5, 10, 15, 20]), askW = Math.random() < 0.5;
    const W = -p * (100 - as) / (as - ac), Rr = p * as / (as - ac);
    return {
      en: `Heckscher–Ohlin model. Labor receives ${ac}% of revenue in computers and ${as}% in shoes (the rest goes to capital). The price of computers rises by ${p}% and the price of shoes is unchanged. Using the textbook's first-order calculation, by how much does the ${askW ? 'wage' : 'rental on capital'} change?`,
      tr: `Bilgisayarda emek payı %${ac}, ayakkabıda %${as}. Bilgisayar fiyatı %${p} artıyor, ayakkabı fiyatı sabit. ${askW ? 'Ücret' : 'Sermaye rantı'} yüzde kaç değişir?`,
      opts: popt(askW ? W : Rr, askW ? [-W, Rr, -p, p * ac / 100] : [-Rr, -W, p, p * (100 - ac) / 100], 1),
      ex: steps(['İki maliyet denklemi', `Bilgisayar: $${p} = ${ac / 100}\\hat W + ${f(1 - ac / 100, 2)}\\hat R$\nAyakkabı: $0 = ${as / 100}\\hat W + ${f(1 - as / 100, 2)}\\hat R$`],
        ['Ayakkabıdan R\'yi çek', `$\\hat R = -\\frac{${as}}{${100 - as}}\\hat W$`],
        ['Yerine koy', `$${p} = \\hat W\\left(${ac / 100} - ${f(1 - ac / 100, 2)}\\cdot\\frac{${as}}{${100 - as}}\\right) = \\hat W\\cdot\\frac{${ac} - ${as}}{${100 - as}}$ ⇒ $\\hat W = ${f(W, 1)}\\%$`],
        ['Rant', `$\\hat R = -\\frac{${as}}{${100 - as}}\\times(${f(W, 1)}) = ${f(Rr, 1)}\\%$`])
        + `\n\nBüyütme etkisi: $\\hat W = ${f(W, 1)}\\% < 0 < \\hat P_C = ${p}\\% < \\hat R = ${f(Rr, 1)}\\%$. Kitaptaki örnek (%50, %60, %10): ücret −40%, rant +60%.`
    };
  };

  /* ---------- Bölüm 5: göç ve FDI ---------- */
  G.migSR = () => {
    const PM = 1, PA = 1, b = 1, d = 1, L = 100, LM = R(40, 60), W = R(20, 40);
    const a = W + LM, c = W + (L - LM), dL = pick([10, 20, 30]);
    const L2 = L + dL, LM2 = (a - c + L2) / 2, W2 = a - LM2;
    return {
      en: `Specific-factors model: $MPL_M = ${a} - L_M$, $MPL_A = ${c} - L_A$, $P_M = P_A = 1$. Initially there are ${L} workers. Then ${dL} immigrants arrive. What is the new wage?`,
      tr: `$MPL_M = ${a} - L_M$, $MPL_A = ${c} - L_A$, fiyatlar 1. Başta ${L} işçi var, ${dL} göçmen geliyor. Yeni ücret kaçtır?`,
      opts: nopts(W2, [W, W - dL, W + dL / 2], 1).map(s => g0(+s, 1)),
      ex: steps(['Önce', `$${a} - L_M = ${c} - (${L} - L_M) \\Rightarrow L_M = ${LM}$, $W = ${W}$.`], ['Sonra (emek ' + L2 + ')', `$${a} - L_M = ${c} - (${L2} - L_M) \\Rightarrow L_M = ${g0(LM2, 1)}$, $L_A = ${g0(L2 - LM2, 1)}$`],
        ['Yeni ücret', `$W' = ${a} - ${g0(LM2, 1)} = ${g0(W2, 1)}$. Ücret ${g0(W - W2, 1)} düştü; göçmenler iki sektöre bölündü.`])
        + `\n\nKısa dönem sonuçlar (Şekil 5-2, 5-4): ücret düşer, sermaye ve toprak rantı artar (her makineye daha çok işçi), **iki sektörün çıktısı da artar.**`
    };
  };
  G.factorFlow = () => {
    const sc = pick([
      { en: 'In the short run (specific-factors model), immigration increases the labor force. What happens to industry outputs?', tr: 'Kısa dönem, göç', c: 'Both manufacturing and agriculture expand', w: ['Only the labor-intensive industry expands; the other contracts', 'Manufacturing expands and agriculture contracts', 'Outputs are unchanged; only wages fall'], why: 'Sermaye ve toprak sektörlere bağlı; ek emek iki sektöre bölünür, ikisi de büyür (PPF dışa kayar).' },
      { en: 'In the long run (Heckscher–Ohlin model), immigration increases the labor force at constant goods prices. What happens?', tr: 'Uzun dönem, göç', c: 'The labor-intensive industry expands, the other contracts, and factor prices do not change', w: ['Both industries expand and the wage falls', 'The capital-intensive industry expands and the wage falls', 'Both industries expand and factor prices do not change'], why: 'Rybczynski: artan faktörü yoğun kullanan sektör büyür, öteki küçülür. K/L oranları sabit kaldığı için ücret ve rant değişmez (faktör fiyatı duyarsızlığı).' },
      { en: 'In the short run (specific-factors model), FDI increases the capital stock in manufacturing. What happens to the wage and the rentals?', tr: 'Kısa dönem, FDI', c: 'The wage rises; the rentals on capital and on land fall', w: ['The wage falls; the rentals on capital and land rise', 'The wage rises; the rental on capital rises and the rental on land falls', 'Nothing changes because factor prices are insensitive'], why: 'Sermaye artınca $MPL_M$ yukarı kayar: ücret artar, işçiler tarımdan imalata geçer. Toprak başına işçi azalır, toprak rantı düşer; sermaye bolalaştığı için sermaye rantı da düşer (Şekil 5-14).' },
      { en: 'In the long run (Heckscher–Ohlin model), FDI increases the capital stock at constant goods prices. What happens?', tr: 'Uzun dönem, FDI', c: 'The capital-intensive industry expands, the labor-intensive industry contracts, factor prices are unchanged', w: ['Both industries expand and the rental falls', 'The labor-intensive industry expands and the wage rises', 'Both industries contract'], why: 'Rybczynski sermaye için: sermaye yoğun sektör büyür, öteki küçülür; ücret ve rant sabit.' },
      { en: 'Country B experiences a capital outflow; all factors are mobile in the long run and B keeps producing both goods. What happens?', tr: 'Uzun dönem, sermaye çıkışı (geçen yılın vizesi)', c: 'Factor prices stay unchanged while output shifts toward the labor-intensive sector', w: ['The wage falls and both outputs fall', 'Output shifts toward the capital-intensive sector', 'The rental rises and outputs do not change'], why: 'Sermaye azaldı: Rybczynski tersine işler, sermaye yoğun sektör küçülür, emek yoğun büyür; faktör fiyatları değişmez.' }]);
    return {
      en: sc.en, tr: sc.tr + ': ne olur?', opts: [sc.c].concat(sc.w),
      ex: steps(['Önce modeli seç', 'Kısa dönem = özgül faktörler (yalnız emek hareketli). Uzun dönem = Heckscher–Ohlin (emek ve sermaye hareketli).'], ['Mekanizma', sc.why])
    };
  };
  G.rentalR = () => {
    const pk = R(8, 15) / 10, i = R(2, 9), d = R(5, 15);
    const ans = pk * (i + d);
    return {
      en: `The price of capital equipment relative to the overall price level is $P_K/P = ${f(pk, 1)}$, the interest rate is ${i}% and the depreciation rate is ${d}%. Using $R/P = (P_K/P)(i + d)$, what is the real rental on capital?`,
      tr: `$P_K/P = ${f(pk, 1)}$, faiz %${i}, amortisman %${d}. $R/P = (P_K/P)(i + d)$ ile reel sermaye rantı yüzde kaçtır?`,
      opts: popt(ans, [pk * i, pk * d, i + d, pk * (i - d)], 1).map(s => s.replace('+', '')),
      ex: steps(['Kira şirketi mantığı', 'Ekipmanı kiraya veren, parayı başka yere yatırsaydı kazanacağı faizi (i) ve ekipmanın aşınmasını (d) karşılamalı.'], ['Hesap', `$${f(pk, 1)}\\times(${i}\\% + ${d}\\%) = ${f(ans, 1)}\\%$`])
        + `\n\nSingapur uygulaması: bu yöntemle (Tablo 5-3 B) reel rant pek düşmedi, reel ücret arttı → verimlilik artışı var. Uzun dönem modeli ise sabit faktör fiyatı bekler.`
    };
  };
  G.worldLabor = () => {
    const LH = R(30, 50), LF = 100 - LH, M = R(5, 20), Wp = R(30, 60);
    const aH = Wp + (LH + M), aF = Wp + (LF - M);     // W_H = aH - L_H, W_F = aF - L_F
    const WH = aH - LH, WF = aF - LF, gH = M * (WH - Wp) / 2, gF = M * (Wp - WF) / 2;
    const v = R(0, 2);
    const ask = ['the equalized wage after full migration', 'the number of workers who migrate', 'the gain to Home (triangle ABC)'][v];
    const ans = [Wp, M, gH][v];
    return {
      en: `World labor market: Home wage $W = ${aH} - L$ (L = Home workers), Foreign wage $W^* = ${aF} - L^*$. Initially Home has ${LH} workers and Foreign ${LF}. Workers can move freely until wages are equal. What is ${ask}?`,
      tr: `Home ücreti $W = ${aH} - L$, Foreign ücreti $W^* = ${aF} - L^*$. Başta Home'da ${LH}, Foreign'da ${LF} işçi var. İşçiler ücretler eşitlenene kadar göç ediyor. ${['Eşitlenen ücret', 'Göç eden işçi sayısı', 'Home\'un kazancı (ABC üçgeni)'][v]} kaçtır?`,
      opts: nopts(ans, v === 0 ? [WH, WF, (WH + WF) / 2 + 1] : v === 1 ? [M * 2, LF - LH, WH - WF] : [gF, M * (WH - Wp), gH + gF], v === 2 ? 1 : 0, { min: 0.5 }),
      ex: steps(['Başlangıç ücretleri', `Home: $${aH} - ${LH} = ${WH}$, Foreign: $${aF} - ${LF} = ${WF}$. İşçiler Foreign'dan Home'a geçer.`],
        ['Eşitle', `$${aH} - (${LH} + m) = ${aF} - (${LF} - m) \\Rightarrow m = ${M}$, ücret $W' = ${Wp}$.`],
        ['Kazançlar (üçgenler)', `Home: $\\tfrac12\\times${M}\\times(${WH} - ${Wp}) = ${g0(gH, 1)}$ · Foreign (göçmen gelirleri dahil): $\\tfrac12\\times${M}\\times(${Wp} - ${WF}) = ${g0(gF, 1)}$`])
        + `\n\nŞekil 5-16: emek düşük marjinal üründen yüksek marjinal ürüne gider; dünya üretimi artar. Göçmen gelirleri kaynak ülkeye sayılırsa iki ülke de kazanır.`
    };
  };

  /* ---------- WTO ve bölgeselcilik ---------- */
  G.tradeDiv = () => {
    const t = pick([10, 15, 20, 25, 30]), o = pick([80, 90, 100, 120]);
    const div = Math.random() < 0.6;
    let p, h;
    if (div) { do { p = o + R(1, Math.floor(o * t / 100) - 1); } while (p >= o * (1 + t / 100)); h = Math.round(o * (1 + t / 100)) + R(10, 40); }
    else { p = o + R(1, Math.floor(o * t / 100) - 1); h = Math.round(o * (1 + t / 100)) - R(1, Math.max(1, Math.floor(o * t / 100 / 2))); if (h <= p) return G.tradeDiv(); }
    const ot = o * (1 + t / 100), before = Math.min(h, p * (1 + t / 100), ot), after = Math.min(h, p, ot);
    const rev0 = before === ot ? o * t / 100 : 0, cons = before - after, wel = cons - rev0;
    const ask = R(0, 1);
    return {
      en: `A small country imports one unit of a good. Production costs: domestic ${h}, partner ${p}, outsider ${o}. Before the agreement a ${t}% MFN tariff applies to both foreign suppliers; after a regional agreement the tariff on the partner is removed. No transport costs. What is ${ask ? 'the change in national welfare' : 'the consumer saving per unit'}?`,
      tr: `Küçük ülke 1 birim ithal ediyor. Maliyetler: yurt içi ${h}, ortak ${p}, dışarıdaki ülke ${o}. Önce iki dış tedarikçiye %${t} tarife, bölgesel anlaşmadan sonra ortağa tarife yok. ${ask ? 'Ülke refahındaki değişim' : 'Tüketicinin birim başına tasarrufu'} kaçtır?`,
      opts: nopts(ask ? wel : cons, ask ? [cons, -cons, rev0, wel + 2 * rev0] : [o * t / 100, p - o, h - p, wel], 1).map(s => g0(+s, 1)),
      ex: steps(['Önce', `Ortak $${p}\\times${f(1 + t / 100, 2)} = ${g0(p * (1 + t / 100), 1)}$, dışarıdaki $${o}\\times${f(1 + t / 100, 2)} = ${g0(ot, 1)}$, yurt içi ${h}. En ucuz: ${before === h ? 'yurt içi' : 'dışarıdaki ülke'} (${g0(before, 1)})${rev0 ? `, tarife geliri ${g0(rev0, 1)}` : ''}.`],
        ['Sonra', `Ortak tarifesiz ${p}: alım ortağa kayar. Tüketici ${g0(cons, 1)} kazanır${rev0 ? `, devlet ${g0(rev0, 1)} tarife gelirini kaybeder` : ''}.`],
        ['Refah', `$${g0(cons, 1)}${rev0 ? ' - ' + g0(rev0, 1) : ''} = ${g0(wel, 1)}$ → ${div ? '**ticaret saptırma (trade diversion)**: alım verimli dışarıdaki üreticiden daha pahalı ortağa kaydı.' : '**ticaret yaratma (trade creation)**: pahalı yurt içi üretimin yerini ucuz ithalat aldı.'}`])
        + `\n\nDers notundaki örnek: 140 / 110 / 100, %20 → tüketici +10, tarife geliri −20, refah −10. Tüketici fiyatının düşmesi tek başına refah artışı demek değildir.`
    };
  };
  G.wtoCase = () => {
    const sc = pick([
      { en: 'A WTO member charges a 5% tariff on cars from Japan but 10% on identical cars from Korea; there is no trade agreement with Japan.', c: 'It raises a most-favoured-nation (MFN) issue', why: 'Yabancı tedarikçiler birbirine göre ayrımcılığa uğruyor: MFN.' },
      { en: 'Imported shoes pay a higher internal sales tax than identical domestic shoes.', c: 'It raises a national-treatment issue', why: 'İthal mal, içeri girdikten sonra yerli mala göre ayrımcılığa uğruyor: ulusal muamele.' },
      { en: 'A member charges the same 6% customs duty at the border on a product from every WTO member and taxes it inside the country like domestic products.', c: 'It is generally consistent with both MFN and national treatment', why: 'Sınırda gümrük vergisi almak tek başına ulusal muameleyi ihlal etmez; herkese aynı oran MFN\'ye uygun.' },
      { en: 'A member\'s bound tariff on a product is 15% and its applied tariff is 8%. It raises the applied tariff to 12%.', c: 'It stays within the bound ceiling, subject to other obligations', why: 'Bağlı tarife bir tavandır; uygulanan tarife tavanın altında oynayabilir.' },
      { en: 'A member\'s bound tariff on a product is 10%. It raises the applied tariff to 14% without negotiation.', c: 'It breaks the tariff binding commitment', why: 'Bağlı tavanın üstüne çıkmak taahhüdü ihlal eder.' },
      { en: 'Two WTO members form a free trade area that removes duties on substantially all trade between them and does not raise barriers against outsiders.', c: 'It can be permitted under GATT Article XXIV as an exception to MFN', why: 'RTA\'lar MFN\'den sapar ama Madde XXIV koşullarıyla izinlidir.' }]);
    const all = ['It raises a most-favoured-nation (MFN) issue', 'It raises a national-treatment issue', 'It is generally consistent with both MFN and national treatment', 'It stays within the bound ceiling, subject to other obligations', 'It breaks the tariff binding commitment', 'It can be permitted under GATT Article XXIV as an exception to MFN'];
    return {
      en: sc.en + ' Which statement fits best?', tr: 'Senaryo hangi WTO ilkesiyle ilgili?',
      opts: [sc.c].concat(shuffle(all.filter(x => x !== sc.c)).slice(0, 3)),
      ex: steps(['İlkeyi seç', 'MFN: yabancılar birbirine göre eşit. Ulusal muamele: ithal mal içeride yerli malla eşit. Bağlı tarife: tavan. Madde XXIV: STA ve gümrük birliği istisnası.'], ['Bu senaryo', sc.why])
    };
  };
  G.integType = () => {
    const sc = pick([
      { en: 'Members remove tariffs on goods originating in member countries, but each member keeps its own tariffs against outsiders and checks rules of origin.', c: 'Free trade area' },
      { en: 'Members trade freely with each other and apply a common external tariff to outsiders.', c: 'Customs union' },
      { en: 'Members have a customs union and also allow labour and capital to move freely among them.', c: 'Common market' },
      { en: 'Members share a common monetary policy and usually a single currency.', c: 'Monetary union' },
      { en: 'Members give each other reduced tariffs only on a selected list of products.', c: 'Partial-scope preference agreement' }]);
    const all = ['Free trade area', 'Customs union', 'Common market', 'Monetary union', 'Partial-scope preference agreement'];
    return {
      en: sc.en + ' Which form of economic integration is this?', tr: 'Bu hangi ekonomik entegrasyon biçimi?',
      opts: [sc.c].concat(shuffle(all.filter(x => x !== sc.c)).slice(0, 3)),
      ex: steps(['Basamaklar', 'Kısmi tercih → serbest ticaret alanı (her üye kendi dış tarifesi) → gümrük birliği (+ ortak dış tarife) → ortak pazar (+ emek ve sermaye serbest) → ekonomik birlik (+ politika uyumu) → parasal birlik (+ ortak para politikası).'], ['Cevap', `${sc.c}.` + (sc.c === 'Free trade area' ? ' Ortak dış tarife olmadığı için menşe kuralı gerekir: yoksa mal en düşük tarifeli üyeden girip öteki üyelere geçer (trade deflection). Örnek: EFTA, USMCA.' : sc.c === 'Customs union' ? ' Örnek: AB, SACU; AB–Türkiye Gümrük Birliği (1996).' : '')])
    };
  };

  root.GENS = G;
})(typeof window !== 'undefined' ? window : globalThis);

/* Üretilen soruların açıklamalarını zenginleştir: doğru cevap + yöntem + sık hatalar. */
(function (root) {
  const T = String.raw;
  const G = {
    tradeBal: () => ({ how: T`Dış ticaret dengesi = ihracat − ithalat = $(S_p - I) + (T - G)$.`, traps: [T`İthalattan ihracatı çıkarmak.`, T`Bütçe açığının (T < G) işaretini karıştırmak.`] }),
    valueAdded: () => ({ how: T`Brüt ticaret sınırı geçen malın tüm değerini sayar; katma değer yalnızca o ülkede eklenen kısımdır.`, traps: [T`İhracat değerini katma değer sanmak.`, T`ABD'deki satış fiyatıyla karşılaştırmak.`] }),
    tradeGdp: () => ({ how: T`Ticaret/GSYH = ((ihracat + ithalat)/2) ÷ GSYH.`, traps: [T`İkiye bölmeyi unutmak.`, T`Yalnızca ihracatı kullanmak.`] }),
    absAdv: () => ({ how: T`Mutlak üstünlük: aynı kaynakla daha çok üreten ülke. Her malda ayrı ayrı karşılaştır.`, traps: [T`Fırsat maliyetine bakmak (o karşılaştırmalı üstünlük).`, T`Bir ülkenin her iki malda da üstün olamayacağını sanmak.`], tip: T`Testte tuzak şık genelde fırsat maliyetine bakarak verilen cevaptır; mutlak üstünlükte yalnızca aynı kaynakla kim daha çok üretiyor ona bak.` }),
    oppCost: () => ({ how: T`Fırsat maliyeti(X) = öteki malın işçi başı üretimi ÷ X'in işçi başı üretimi.`, traps: [T`Oranı ters kurmak.`, T`Öteki ülkenin sayılarını kullanmak.`], tip: T`Şıklarda hem doğru oran hem tersi bulunur. Kontrol: iki malın fırsat maliyeti birbirinin tersi olmalı.` }),
    compAdv: () => ({ how: T`İki ülkede de her malın fırsat maliyetini hesapla; düşük olan karşılaştırmalı üstündür. İki ülke aynı malda karşılaştırmalı üstün olamaz.`, traps: [T`Mutlak üstünlükle karar vermek.`, T`Bir ülkeye iki malı birden vermek.`] }),
    laborReq: () => ({ how: T`Gereken emek = miktar × (1/MPL), mallar için toplanır.`, traps: [T`Miktarı MPL ile çarpmak.`] }),
    ppf: () => ({ how: T`Uç noktalar = işçi sayısı × MPL. Eğim (yatay mal X) = MPL(dikey) ÷ MPL(X).`, traps: [T`Eğimi ters kurmak.`, T`Eğimde işçi sayısını hesaba katmak (sadeleşir).`] }),
    autarkyP: () => ({ how: T`Otarşide $P_W/P_C = MPL_C/MPL_W$ = buğdayın fırsat maliyeti.`, traps: [T`$MPL_W/MPL_C$ yazmak.`] }),
    worldRange: () => ({ how: T`Dünya fiyatı iki otarşi fiyatının arasında olmalı (uçlar dahil değil).`, traps: [T`Otarşi fiyatlarından birine eşit fiyatı seçmek.`] }),
    tradeC: () => ({ how: T`B = tam uzmanlaşma noktası; ithalat = ihracat × dünya fiyatı; C = (üretim − ihracat, ithalat).`, traps: [T`Fiyatı ters kullanmak (ihracat ÷ fiyat).`, T`C'yi PPF üzerinde aramak (C dışarıda).`], tip: T`Şekil sorusunda: PPF düz çizgi, B eksende, fiyat doğrusu B'den geçer, C daha yüksek kayıtsızlık eğrisi U₂ üzerinde, A ise U₁ üzerinde. C, PPF'nin dışındadır.` }),
    wageRic: () => ({ how: T`Ücret = çalışılan sektörün MPL'si (o mal cinsinden); öteki mala çevirmek için nispi fiyatla çarp.`, traps: [T`Fiyatı ters çevirmek.`] }),
    ulc: () => ({ how: T`Birim emek maliyeti = ücret ÷ saatlik üretim.`, traps: [T`Ücretle verimliliği çarpmak.`] }),
    tot: () => ({ how: T`Hadler = ihraç fiyatı ÷ ithal fiyatı; değişim ≈ ihraç fiyatı değişimi − ithal fiyatı değişimi.`, traps: [T`Oranı ters kurmak.`] }),
    sfMoc: () => ({ how: T`Marjinal fırsat maliyeti(M) = $MPL_A/MPL_M$; imalat büyüdükçe artar.`, traps: [T`Oranı ters kurmak.`] }),
    sfWage: () => ({ how: T`$P_M\cdot MPL_M = P_A\cdot MPL_A$ ve $L_M + L_A = L$; iki bilinmeyen, iki denklem.`, traps: [T`$L_A$ yerine $L_M$ koymak.`, T`Fiyatla çarpmayı unutmak.`] }),
    sfRealWage: () => ({ how: T`$W/P_M$ değişimi ≈ $\hat W - \hat P_M$; $W/P_A$ değişimi ≈ $\hat W - \hat P_A$.`, traps: [T`Nominal ücret artışını reel artış sanmak.`] }),
    sfRents: () => ({ how: T`Rant = hasılat − emek ödemesi; yüzde değişimi payları ağırlık alarak hesapla.`, traps: [T`Hasılatın tamamına bölmek (rant ödemesine böl).`] }),
    abundance: () => ({ how: T`Bolluk K/L oranıyla ölçülür; HO: bol faktörü yoğun kullanan malı ihraç et.`, traps: [T`Mutlak sermaye miktarına bakmak.`] }),
    laborShare: () => ({ how: T`Aynı ücret ve rantta, emek payı yüksek sektör emek yoğundur.`, traps: [T`Yoğunluğu (sektör) bollukla (ülke) karıştırmak.`] }),
    leontief: () => ({ how: T`K/L = sermaye ÷ kişi-yıl. Paradoks: ABD ihracatı ithalatından daha az sermaye yoğundu.`, traps: [T`Oranı ters kurmak.`] }),
    factorShare: () => ({ how: T`Faktör payı > GSYH payı → bol.`, traps: [T`Payı mutlak büyüklükle (örneğin %25) karşılaştırmak.`] }),
    effEndow: () => ({ how: T`Etkin donatım = fiili × verimlilik; pay = kendi etkin ÷ dünya etkin.`, traps: [T`Verimlilikle çarpmayı unutmak.`] }),
    ssDir: () => ({ how: T`Nispi fiyatı artan malda yoğun kullanılan faktör iki mal cinsinden de kazanır.`, traps: [T`Özgül faktörler modelindeki "belirsiz" sonucu buraya taşımak.`], tip: T`Şıklarda "intensively" (yoğun) ile "abundantly" (bol) yer değiştirir: Stolper–Samuelson'da kazanan, fiyatı artan malda YOĞUN kullanılan faktördür.` }),
    ssNum: () => ({ how: T`İki maliyet denklemi: fiyat değişimi = payla ağırlıklı faktör fiyatı değişimi. Fiyatı sabit maldan başla.`, traps: [T`Ücretin pozitif çıkacağını sanmak (fiyatı artan mal sermaye yoğunsa ücret düşer).`] }),
    migSR: () => ({ how: T`Göç toplam emeği artırır, tarım orijini sağa kayar; yeni dengeyi aynı denklemle çöz.`, traps: [T`Bütün göçmenleri tek sektöre koymak (kısa dönemde ikisine bölünür).`] }),
    factorFlow: () => ({ how: T`Kısa dönem: ücret/rantlar değişir, iki sektör birlikte büyüyebilir. Uzun dönem: Rybczynski + faktör fiyatı duyarsızlığı.`, traps: [T`Uzun dönemde ücretin düştüğünü söylemek.`], tip: T`Geçen yılın 6. sorusu: göç kısa dönemde reel ücreti düşürür, iki özgül faktör (sermaye ve toprak) kazanır, iki sektörün çıktısı artar.` }),
    rentalR: () => ({ how: T`$R/P = (P_K/P)(i + d)$.`, traps: [T`Amortismanı unutmak.`] }),
    worldLabor: () => ({ how: T`Ücretleri eşitleyen göç sayısını bul; kazanç üçgenleri ½ × göç × ücret farkı.`, traps: [T`Üçgen yerine dikdörtgen almak.`] }),
    tradeDiv: () => ({ how: T`Önce ve sonra en ucuz tedarikçiyi bul; refah = tüketici kazancı − kaybedilen tarife geliri.`, traps: [T`Yalnızca tüketici fiyatına bakıp refah arttı demek.`] }),
    wtoCase: () => ({ how: T`MFN: yabancılar arası eşitlik. Ulusal muamele: ithal ve yerli mal eşitliği. Bağlı tarife tavandır.`, traps: [T`Sınırdaki gümrük vergisini ulusal muamele ihlali sanmak.`] }),
    integType: () => ({ how: T`FTA → gümrük birliği (ortak dış tarife) → ortak pazar (faktör serbestliği) → ekonomik birlik → parasal birlik.`, traps: [T`FTA ile gümrük birliğini karıştırmak (fark: ortak dış tarife).`] })
  };
  function enrich(name, q) {
    const g = G[name], r = g ? g(q) : null;
    let ex = /^\*\*Doğru cevap/.test(q.ex) ? q.ex : '**Doğru cevap: ' + q.opts[0] + '.**\n\n' + q.ex;
    if (r) {
      if (r.how) ex += '\n\n**Özet:** ' + r.how;
      if (r.traps && r.traps.length) ex += '\n\n**Sık hatalar:**\n' + r.traps.map(t => '• ' + t).join('\n');
      if (r.tip) ex += '\n\n:::ipucu Sınavda\n' + r.tip + '\n:::';
    }
    q.ex = ex;
    q.hint = r && r.how ? r.how : '';
    return q;
  }
  root.GEN_GUIDE = G;

  /* Tekrar eden şıkları ayıkla; 3'ten az kalırsa yeniden üret. */
  root.genQ = function (name) {
    let q = null;
    for (let k = 0; k < 10; k++) {
      q = root.GENS[name]();
      const o = q.opts.filter((x, i, a) => a.indexOf(x) === i);
      if (o.length >= 3) { q.opts = o.slice(0, 4); return enrich(name, q); }
    }
    return enrich(name, q);
  };
})(typeof window !== 'undefined' ? window : globalThis);
