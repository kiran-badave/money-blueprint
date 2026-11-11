import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Section, Callout, NumberField } from './ui.jsx';
import { budgetLimits, formatINR, num, sumByCategory, uid } from '../utils/finance.js';

const CATS = {
  needs: { label: 'Needs', color: '#1f2937', rule: '50%' },
  wants: { label: 'Wants', color: '#eab308', rule: '30%' },
  savings: { label: 'Savings', color: '#16a34a', rule: '20%' },
};

function Donut({ title, data, total }) {
  return (
    <div className="h-64 sm:h-72">
      <p className="text-center text-sm font-semibold">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
            {data.map((d) => (
              <Cell key={d.key} fill={CATS[d.key].color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatINR(v)} />
          <Legend verticalAlign="bottom" height={28} />
          <text x="50%" y="46%" textAnchor="middle" className="fill-gray-700 text-xs">
            {formatINR(total)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BudgetAllocator({ data, update }) {
  const { salary, lineItems } = data;
  const [draft, setDraft] = useState({ name: '', category: 'needs', amount: 0 });
  const limits = budgetLimits(salary);
  const actual = sumByCategory(lineItems);

  const setItem = (id, patch) =>
    update((d) => ({ lineItems: d.lineItems.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const addItem = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    update((d) => ({ lineItems: [...d.lineItems, { id: uid(), ...draft, name: draft.name.trim() }] }));
    setDraft({ name: '', category: draft.category, amount: 0 });
  };

  const rule = Object.keys(CATS).map((key) => ({ key, name: CATS[key].label, value: limits[key] }));
  const real = Object.keys(CATS)
    .map((key) => ({ key, name: CATS[key].label, value: actual[key] }))
    .filter((d) => d.value > 0);

  return (
    <>
      <Section id="step1" step={1} title="Know Where Your Money Goes!">
        <p className="max-w-2xl">
          Download your last 3 months’ bank and credit card statements. Separate spending into:{' '}
          <strong>Needs</strong> (Rent, EMIs, groceries), <strong>Wants</strong> (Shopping, dining, travel), and{' '}
          <strong>Savings</strong> (SIPs, investments). Track every rupee!
        </p>
      </Section>

      <Section id="step2" step={2} title="Give Every Rupee a Job!">
        <p className="mb-4 max-w-2xl">Use the 50/30/20 rule for your income.</p>
        <div className="card">
          <NumberField label="Monthly in-hand salary" value={salary} onChange={(v) => update({ salary: v })} className="max-w-xs" />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Object.entries(CATS).map(([key, c]) => {
              const over = actual[key] > limits[key] && key !== 'savings';
              return (
                <div key={key} className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">
                    <span className="highlight font-semibold text-ink">{c.rule} {c.label}</span>
                  </p>
                  <p className="mt-2 text-2xl font-bold">{formatINR(limits[key])}</p>
                  <p className={`text-xs mt-1 ${over ? 'text-red-700 font-semibold' : 'text-gray-500'}`}>
                    Your items: {formatINR(actual[key])}
                    {over && ` (over by ${formatINR(actual[key] - limits[key])})`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Donut title="50/30/20 rule (max limits)" data={rule} total={salary} />
            <Donut
              title="Your actual allocation"
              data={real.length ? real : [{ key: 'needs', name: 'No items', value: 1 }]}
              total={actual.needs + actual.wants + actual.savings}
            />
          </div>

          <h3 className="mt-6 font-semibold">Your line items</h3>
          <div className="mt-2 space-y-2">
            {lineItems.map((i) => (
              <div key={i.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_130px_150px_auto] items-center">
                <input className="input" value={i.name} onChange={(e) => setItem(i.id, { name: e.target.value })} aria-label="Item name" />
                <select className="input" value={i.category} onChange={(e) => setItem(i.id, { category: e.target.value })} aria-label="Category">
                  {Object.entries(CATS).map(([k, c]) => (
                    <option key={k} value={k}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <NumberField prefix="₹" value={i.amount} onChange={(v) => setItem(i.id, { amount: v })} />
                <button
                  className="btn btn-ghost px-3"
                  aria-label={`Remove ${i.name}`}
                  onClick={() => update((d) => ({ lineItems: d.lineItems.filter((x) => x.id !== i.id) }))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addItem} className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px_150px_auto] items-center border-t border-gray-200 pt-4">
            <input className="input" placeholder="e.g. Internet bill" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {Object.entries(CATS).map(([k, c]) => (
                <option key={k} value={k}>
                  {c.label}
                </option>
              ))}
            </select>
            <NumberField value={draft.amount} onChange={(v) => setDraft({ ...draft, amount: num(v) })} />
            <button className="btn btn-yellow" type="submit">
              Add
            </button>
          </form>

          <Callout>Important: yearly expenses like insurance must fit into your “Needs” budget!</Callout>
        </div>
      </Section>
    </>
  );
}
