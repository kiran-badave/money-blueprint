// Pure finance helpers: formatting and the rule-based calculations.

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹1,00,000 style formatting (Indian digit grouping). */
export const formatINR = (n) => inr.format(Number.isFinite(n) ? n : 0);

export const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const BUDGET_RULE = { needs: 0.5, wants: 0.3, savings: 0.2 };

export const sumByCategory = (items) =>
  items.reduce(
    (acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + num(i.amount);
      return acc;
    },
    { needs: 0, wants: 0, savings: 0 },
  );

export const budgetLimits = (salary) => ({
  needs: salary * BUDGET_RULE.needs,
  wants: salary * BUDGET_RULE.wants,
  savings: salary * BUDGET_RULE.savings,
});

/** Step 4: six months of (Needs + Wants). */
export const emergencyTarget = (needs, wants) => (needs + wants) * 6;

/** Step 5: annual bills spread evenly over 12 months. */
export const sinkingMonthly = (items) => items.reduce((s, i) => s + num(i.amount), 0) / 12;

/**
 * Step 6: split the 20% savings.
 *  - Emergency fund incomplete: 75% -> emergency fund, 25% -> long-term SIPs   (₹15,000 / ₹5,000 on ₹20,000)
 *  - Emergency fund complete:   75% -> long-term SIPs, 25% -> short-term goals (₹15,000 / ₹5,000 on ₹20,000)
 */
export const investmentSplit = (savings, emergencyComplete) =>
  emergencyComplete
    ? { primary: { label: 'Long-term SIPs', amount: savings * 0.75 }, secondary: { label: 'Short-term goals', amount: savings * 0.25 } }
    : { primary: { label: 'Emergency fund', amount: savings * 0.75 }, secondary: { label: 'Long-term SIPs', amount: savings * 0.25 } };

/** Step 7: timeline -> horizon bucket + default instruments. */
export const goalHorizon = (years) => {
  if (years < 2) return { key: 'short', label: 'Short-term', where: 'FD, RD, Liquid Mutual Fund' };
  if (years <= 5) return { key: 'medium', label: 'Medium-term', where: 'FD, Debt Fund' };
  return { key: 'long', label: 'Long-term', where: 'Equity Mutual fund' };
};

export const yearsLabel = (y) => `${y} ${y === 1 ? 'year' : 'years'}`;

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Compact INR for chart axes / tight spaces: ₹1.2L, ₹3.4Cr, ₹45K. */
export const formatCompactINR = (n) => {
  const v = Number.isFinite(n) ? n : 0;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}₹${+(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${+(abs / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `${sign}₹${+(abs / 1e3).toFixed(1)}K`;
  return `${sign}₹${Math.round(abs)}`;
};

/** Future value of a monthly SIP compounded monthly at `annualRate` % for `years`. */
export const sipFutureValue = (monthly, annualRate, years) => {
  const r = annualRate / 100 / 12;
  const n = Math.round(years * 12);
  if (n <= 0 || monthly <= 0) return 0;
  return r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
};

/** Year-by-year invested vs. projected value, for charting. */
export const sipProjection = (monthly, annualRate, years) =>
  Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    invested: monthly * 12 * y,
    value: Math.round(sipFutureValue(monthly, annualRate, y)),
  }));

/**
 * Financial health score (0-100) with per-check breakdown.
 *  savings rate 30 · needs within 50% 20 · wants within 30% 15 · emergency fund 25 · spending within income 10
 */
export const healthScore = ({ salary, actual, limits, emergencySaved, emergencyTarget: target }) => {
  const total = actual.needs + actual.wants + actual.savings;
  const saveRate = salary > 0 ? actual.savings / salary : 0;
  const checks = [
    { key: 'savings', label: 'Savings rate (20% goal)', max: 30, score: Math.min(1, saveRate / 0.2) * 30 },
    { key: 'needs', label: 'Needs within 50%', max: 20, score: actual.needs <= limits.needs ? 20 : Math.max(0, 20 * (1 - (actual.needs - limits.needs) / (limits.needs || 1))) },
    { key: 'wants', label: 'Wants within 30%', max: 15, score: actual.wants <= limits.wants ? 15 : Math.max(0, 15 * (1 - (actual.wants - limits.wants) / (limits.wants || 1))) },
    { key: 'emergency', label: 'Emergency fund', max: 25, score: target > 0 ? Math.min(1, emergencySaved / target) * 25 : 0 },
    { key: 'income', label: 'Spending within income', max: 10, score: total <= salary ? 10 : 0 },
  ].map((c) => ({ ...c, score: Math.round(c.score) }));
  const score = Math.min(100, checks.reduce((s, c) => s + c.score, 0));
  const grade = score >= 80 ? { label: 'Excellent', color: '#16a34a' } : score >= 60 ? { label: 'Good', color: '#ca8a04' } : score >= 40 ? { label: 'Needs work', color: '#ea580c' } : { label: 'At risk', color: '#dc2626' };
  return { score, grade, checks };
};
