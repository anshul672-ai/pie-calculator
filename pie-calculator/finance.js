/* Pie — finance utilities */

// Indian number formatting: ₹1.20 Cr, ₹35.0 L, ₹12,345
function formatINR(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const neg = n < 0; n = Math.abs(n);
  if (n >= 1e7) return (neg ? "-" : "") + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return (neg ? "-" : "") + (n / 1e5).toFixed(1) + " L";
  return (neg ? "-" : "") + Math.round(n).toLocaleString("en-IN");
}

function fvLumpsum(pv, r, years) {
  return pv * Math.pow(1 + r, years);
}

function fvMonthlySIP(monthly, annualRate, years) {
  const m = annualRate / 12;
  const n = years * 12;
  if (m === 0) return monthly * n;
  return monthly * ((Math.pow(1 + m, n) - 1) / m) * (1 + m);
}

// FIRE corpus: 25x inflation-adjusted annual expenses (4% rule)
function fireCorpus(monthlyExpense, inflation, yearsToFire, withdrawalRate) {
  const annualExpenseAtFire = monthlyExpense * 12 * Math.pow(1 + inflation, yearsToFire);
  return annualExpenseAtFire / withdrawalRate;
}

// NPS projection: blended return from equity allocation
function npsProjection(monthly, years, equityPct, annuityRate) {
  const blendedRate = (equityPct / 100) * 0.12 + (1 - equityPct / 100) * 0.07;
  const corpus = fvMonthlySIP(monthly, blendedRate, years);
  const lumpsum = corpus * 0.6;
  const annuity = corpus * 0.4;
  const monthlyPension = (annuity * (annuityRate / 100)) / 12;
  return { corpus, lumpsum, annuity, monthlyPension };
}

window.PieFmt = { formatINR, fvLumpsum, fvMonthlySIP, fireCorpus, npsProjection };
