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
