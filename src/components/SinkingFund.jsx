import { useState } from 'react';
import { Section, NumberField } from './ui.jsx';
import { formatINR, num, sinkingMonthly, uid } from '../utils/finance.js';

export default function SinkingFund({ items, update }) {
  const [draft, setDraft] = useState({ name: '', amount: 0 });
  const total = items.reduce((s, i) => s + num(i.amount), 0);
  const monthly = sinkingMonthly(items);
  const set = (id, patch) => update((d) => ({ sinkingFund: d.sinkingFund.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  return (
    <Section id="step5" step={5} title="Plan for Annual Expenses">
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-2">Expense</th>
                <th className="py-2 pr-2">Per year</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">
                    <input className="input" value={i.name} onChange={(e) => set(i.id, { name: e.target.value })} aria-label="Expense name" />
                  </td>
                  <td className="py-2 pr-2 min-w-36">
                    <NumberField value={i.amount} onChange={(v) => set(i.id, { amount: v })} />
                  </td>
                  <td className="py-2">
                    <button className="btn btn-ghost px-3" aria-label={`Remove ${i.name}`} onClick={() => update((d) => ({ sinkingFund: d.sinkingFund.filter((x) => x.id !== i.id) }))}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-3">Total</td>
                <td className="py-3">{formatINR(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name.trim()) return;
            update((d) => ({ sinkingFund: [...d.sinkingFund, { id: uid(), name: draft.name.trim(), amount: draft.amount }] }));
            setDraft({ name: '', amount: 0 });
          }}
        >
          <input className="input" placeholder="e.g. Property tax" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <NumberField value={draft.amount} onChange={(v) => setDraft({ ...draft, amount: v })} />
          <button className="btn btn-yellow" type="submit">
            Add bill
          </button>
        </form>

        <p className="mt-5 text-gray-600 text-sm">
          {formatINR(total)} ÷ 12 =
        </p>
        <p className="text-3xl font-bold">
          <span className="highlight">{formatINR(monthly)}</span> <span className="text-base font-medium">/ month</span>
        </p>
        <p className="mt-3 font-medium">
          Set aside {formatINR(monthly)} every month. Annual bills shouldn’t become emergencies. You can also start a{' '}
          {formatINR(monthly)} RD for annual bills.
        </p>
      </div>
    </Section>
  );
}
