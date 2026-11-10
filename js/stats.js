/* Dağılım fonksiyonları: normal, t, ki-kare, F (CDF ve ters CDF). */
(function (root) {
  'use strict';

  // Normal CDF — W. J. Cody tipi yüksek hassasiyetli erf yaklaşımı (Hart 1968, ~1e-14)
  function normCdf(z) {
    if (!isFinite(z)) return z > 0 ? 1 : 0;
    const a = Math.abs(z);
    let p;
    if (a > 37) p = 0;
    else {
      const e = Math.exp(-a * a / 2);
      if (a < 7.07106781186547) {
        let n = 0.0352624965998911 * a + 0.700383064443688;
        n = n * a + 6.37396220353165; n = n * a + 33.912866078383;
        n = n * a + 112.079291497871; n = n * a + 221.213596169931;
        n = n * a + 220.206867912376;
        let d = 0.0883883476483184 * a + 1.75566716318264;
        d = d * a + 16.064177579207; d = d * a + 86.7807322029461;
        d = d * a + 296.564248779674; d = d * a + 637.333633378831;
        d = d * a + 793.826512519948; d = d * a + 440.413735824752;
        p = e * n / d;
      } else {
        const b = a + 1 / (a + 2 / (a + 3 / (a + 4 / (a + 0.65))));
        p = e / b / 2.506628274631;
      }
    }
    return z > 0 ? 1 - p : p;
  }

  // Ters normal — Acklam
  function normInv(p) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    // bir Newton adımı
    const e = normCdf(x) - p; const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }

  function gammaln(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
    let s = 1.000000000190015; for (let j = 0; j < 6; j++) s += c[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }

  // Düzenlenmiş alt eksik gama P(a,x)
  function gammaP(a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 500; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
      return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
  }

  function betacf(a, b, x) {
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; let h = d;
    for (let m = 1; m <= 500; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  // Düzenlenmiş eksik beta I_x(a,b)
  function ibeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }

  function chi2Cdf(x, k) { return x <= 0 ? 0 : gammaP(k / 2, x / 2); }
  function tCdf(t, df) {
    if (!isFinite(df)) return normCdf(t);
    const x = df / (df + t * t); const tail = 0.5 * ibeta(x, df / 2, 0.5);
    return t > 0 ? 1 - tail : tail;
  }
  function fCdf(x, d1, d2) {
    if (x <= 0) return 0;
    if (!isFinite(d2)) return chi2Cdf(d1 * x, d1);
    return ibeta(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2);
  }
  function invert(cdf, p, lo, hi) {
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; if (hi - lo < 1e-10) break; }
    return (lo + hi) / 2;
  }
  const chi2Inv = (p, k) => invert(x => chi2Cdf(x, k), p, 0, 1000);
  const tInv = (p, df) => isFinite(df) ? invert(x => tCdf(x, df), p, -1000, 1000) : normInv(p);
  const fInv = (p, d1, d2) => invert(x => fCdf(x, d1, d2), p, 0, 1000);

  root.Stats = { normCdf, normInv, chi2Cdf, tCdf, fCdf, chi2Inv, tInv, fInv, ibeta, gammaP };
})(typeof window !== 'undefined' ? window : globalThis);
