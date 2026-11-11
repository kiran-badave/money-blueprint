import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  budgetLimits,
  formatCompactINR,
  formatINR,
  goalHorizon,
  healthScore,
  investmentSplit,
  num,
  ordinal,
  sinkingMonthly,
  sipProjection,
  sumByCategory,
} from '../utils/finance.js';

const COLORS = { needs: '#1f2937', wants: '#eab308', savings: '#16a34a' };
const HORIZON_COLOR = { short: '#16a34a', medium: '#eab308', long: '#3b82f6' };

function Kpi({ label, value, sub, tone = 'text-ink' }) {
  return (
    <div className="card p-4!">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ScoreRing({ score, color, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-36 w-36" role="img" aria-label={`Financial health score ${score} out of 100, ${label}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

const Money = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow">
      {label !== undefined && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{formatINR(p.value)}</strong>
        </p>
      ))}
    </div>
  ) : null;

export default function Dashboard({ data, expenses, target, complete }) {
  const { salary, lineItems, emergencyFundSaved, sinkingFund, goals } = data;
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);

  const limits = budgetLimits(salary);
  const actual = sumByCategory(lineItems);
  const allocated = actual.needs + actual.wants + actual.savings;
  const unallocated = salary - allocated;
  const savingsRate = salary > 0 ? (actual.savings / salary) * 100 : 0;
  const monthsCovered = expenses > 0 ? emergencyFundSaved / expenses : 0;
  const sinking = sinkingMonthly(sinkingFund);
  const health = healthScore({ salary, actual, limits, emergencySaved: emergencyFundSaved, emergencyTarget: target });

  const sipAmount = investmentSplit(limits.savings, complete);
  const monthlySip = (complete ? sipAmount.primary : sipAmount.secondary).amount;
  const projection = useMemo(() => sipProjection(monthlySip, rate, years), [monthlySip, rate, years]);
  const final = projection[projection.length - 1];

  const budgetBars = ['needs', 'wants', 'savings'].map((k) => ({
    name: k[0].toUpperCase() + k.slice(1),
    key: k,
    Limit: Math.round(limits[k]),
    Actual: Math.round(actual[k]),
  }));

  const topItems = [...lineItems]
    .filter((i) => i.category !== 'savings' && num(i.amount) > 0)
    .sort((a, b) => num(b.amount) - num(a.amount))
    .slice(0, 6)
    .map((i) => ({ name: i.name, amount: num(i.amount), category: i.category }));

  const goalBars = [...goals]
    .sort((a, b) => a.years - b.years)
    .map((g) => ({ name: g.name, years: g.years, key: goalHorizon(g.years).key }));

  const insights = [];
  if (unallocated > 0) insights.push({ tone: 'warn', text: `${formatINR(unallocated)} of your salary has no job yet. Add it as savings or a planned expense.` });
  if (unallocated < 0) insights.push({ tone: 'bad', text: `You have planned ${formatINR(-unallocated)} more than your income. Trim wants first.` });
  if (actual.needs > limits.needs) insights.push({ tone: 'bad', text: `Needs are ${formatINR(actual.needs - limits.needs)} above the 50% limit.` });
  if (actual.wants > limits.wants) insights.push({ tone: 'bad', text: `Wants are ${formatINR(actual.wants - limits.wants)} above the 30% limit.` });
  if (savingsRate < 20) insights.push({ tone: 'warn', text: `Savings rate is ${savingsRate.toFixed(0)}%. Aim for at least 20%.` });
  else insights.push({ tone: 'good', text: `Savings rate is ${savingsRate.toFixed(0)}%. You are on or above the 20% target.` });
  insights.push(
    complete
      ? { tone: 'good', text: 'Emergency fund is complete. New savings can flow into long-term SIPs.' }
      : { tone: 'warn', text: `Emergency fund covers ${monthsCovered.toFixed(1)} of 6 months. ${formatINR(Math.max(0, target - emergencyFundSaved))} to go.` },
  );
  if (sinking > 0) insights.push({ tone: 'info', text: `Set aside ${formatINR(sinking)} every month for annual bills.` });

  const toneCls = {
    good: 'border-green-500 bg-green-50 text-green-900',
    warn: 'border-yellow-400 bg-yellow-50 text-yellow-900',
    bad: 'border-red-500 bg-red-50 text-red-900',
    info: 'border-blue-400 bg-blue-50 text-blue-900',
  };

  return (
    <section id="dashboard" className="scroll-mt-24 py-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Monthly income" value={formatINR(salary)} sub={`Salary on the ${ordinal(data.salaryDay)}`} />
        <Kpi label="Monthly spending" value={formatINR(expenses)} sub={`${salary > 0 ? ((expenses / salary) * 100).toFixed(0) : 0}% of income (Needs + Wants)`} tone={expenses > salary * 0.8 ? 'text-red-700' : 'text-ink'} />
        <Kpi label="Saving & investing" value={formatINR(actual.savings)} sub={`${savingsRate.toFixed(0)}% savings rate`} tone={savingsRate >= 20 ? 'text-green-700' : 'text-yellow-700'} />
        <Kpi
          label={unallocated < 0 ? 'Over-planned' : 'Unallocated'}
          value={formatINR(Math.abs(unallocated))}
          sub={unallocated === 0 ? 'Every rupee has a job' : unallocated > 0 ? 'Give it a job' : 'Planned above income'}
          tone={unallocated < 0 ? 'text-red-700' : unallocated > 0 ? 'text-yellow-700' : 'text-green-700'}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Panel title="Financial health" subtitle="Score out of 100">
          <ScoreRing score={health.score} color={health.grade.color} label={health.grade.label} />
          <ul className="mt-4 space-y-2">
            {health.checks.map((c) => (
              <li key={c.key}>
                <div className="flex justify-between text-xs">
                  <span>{c.label}</span>
                  <span className="font-semibold">
                    {c.score}/{c.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full" style={{ width: `${(c.score / c.max) * 100}%`, background: health.grade.color }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Budget vs 50/30/20 limit" subtitle="Where your plan sits against the rule" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={56} />
                <Tooltip content={<Money />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend />
                <Bar dataKey="Limit" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
                  {budgetBars.map((b) => (
                    <Cell key={b.key} fill={COLORS[b.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Top spending items" subtitle="Largest needs and wants each month">
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-500">Add line items in Step 2 to see them here.</p>
          ) : (
            <div style={{ height: topItems.length * 42 + 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<Money />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]} barSize={18}>
                    {topItems.map((t) => (
                      <Cell key={t.name} fill={COLORS[t.category]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Emergency fund" subtitle="Target: 6 months of spending">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{formatINR(emergencyFundSaved)}</p>
            <p className="text-sm text-gray-600">of {formatINR(target)}</p>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-yellow-400'}`}
              style={{ width: `${target > 0 ? Math.min(100, (emergencyFundSaved / target) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="text-lg font-bold">{monthsCovered.toFixed(1)}</p>
              <p className="text-xs text-gray-500">months covered</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="text-lg font-bold">{formatCompactINR(Math.max(0, target - emergencyFundSaved))}</p>
              <p className="text-xs text-gray-500">still to go</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              <p className="text-lg font-bold">{formatCompactINR(sinking)}</p>
              <p className="text-xs text-gray-500">annual-bill fund / mo</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        className="mt-3"
        title="Investment growth projection"
        subtitle={`${formatINR(monthlySip)} per month into ${complete ? sipAmount.primary.label : sipAmount.secondary.label}. Illustrative only, returns are not guaranteed.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="flex justify-between font-medium">
              Expected return <span>{rate}% / year</span>
            </span>
            <input type="range" min="4" max="18" step="0.5" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="mt-1 w-full accent-yellow-500" />
          </label>
          <label className="block text-sm">
            <span className="flex justify-between font-medium">
              Time horizon <span>{years} years</span>
            </span>
            <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(parseInt(e.target.value, 10))} className="mt-1 w-full accent-yellow-500" />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-lg font-bold">{formatCompactINR(final.invested)}</p>
            <p className="text-xs text-gray-500">you invest</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-lg font-bold text-green-700">{formatCompactINR(final.value - final.invested)}</p>
            <p className="text-xs text-gray-500">growth</p>
          </div>
          <div className="rounded-lg bg-highlight/60 p-2">
            <p className="text-lg font-bold">{formatCompactINR(final.value)}</p>
            <p className="text-xs text-gray-600">projected value</p>
          </div>
        </div>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tickLine={false} tickFormatter={(y) => `${y}y`} />
              <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={64} />
              <Tooltip content={<Money />} labelFormatter={(y) => `Year ${y}`} />
              <Legend />
              <Area type="monotone" dataKey="value" name="Projected value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.18} strokeWidth={2} />
              <Area type="monotone" dataKey="invested" name="Amount invested" stroke="#6b7280" fill="#9ca3af" fillOpacity={0.18} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Goal timeline" subtitle="Years to each goal, coloured by risk horizon">
          {goalBars.length === 0 ? (
            <p className="text-sm text-gray-500">Add goals in Step 7 to see them here.</p>
          ) : (
            <>
              <div style={{ height: goalBars.length * 42 + 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalBars} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v} ${v === 1 ? 'year' : 'years'}`} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="years" name="Timeline" radius={[0, 4, 4, 0]} barSize={18}>
                      {goalBars.map((g) => (
                        <Cell key={g.name} fill={HORIZON_COLOR[g.key]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-gray-600">
                {[['short', 'Under 2 yrs'], ['medium', '2–5 yrs'], ['long', 'Over 5 yrs']].map(([k, l]) => (
                  <span key={k} className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: HORIZON_COLOR[k] }} />
                    {l}
                  </span>
                ))}
              </div>
            </>
          )}
        </Panel>

        <Panel title="Smart insights" subtitle="Based on your current plan">
          <ul className="space-y-2">
            {insights.map((i, idx) => (
              <li key={idx} className={`rounded-lg border-l-4 px-3 py-2 text-sm ${toneCls[i.tone]}`}>
                {i.text}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
