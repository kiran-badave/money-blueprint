import { useState } from 'react';
import { Section, NumberField } from './ui.jsx';
import { goalHorizon, uid, yearsLabel } from '../utils/finance.js';

const BADGE = {
  short: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  long: 'bg-blue-100 text-blue-800',
};

export default function GoalMatrix({ goals, update }) {
  const [draft, setDraft] = useState({ name: '', years: 1 });
  const set = (id, patch) => update((d) => ({ goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  const sorted = [...goals].sort((a, b) => a.years - b.years);

  return (
    <Section id="step7" step={7} title="Put Every Financial Goal on a Timeline!">
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-2">Goal</th>
                <th className="py-2 pr-2">Timeline</th>
                <th className="py-2 pr-2">Where to Invest?</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((g) => {
                const h = goalHorizon(g.years);
                return (
                  <tr key={g.id} className="border-b border-gray-100 align-middle">
                    <td className="py-2 pr-2 min-w-40">
                      <input className="input" value={g.name} onChange={(e) => set(g.id, { name: e.target.value })} aria-label="Goal name" />
                    </td>
                    <td className="py-2 pr-2 min-w-32 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <NumberField prefix="" min={0.5} step={0.5} value={g.years} onChange={(v) => set(g.id, { years: v || 0.5 })} className="w-20" />
                        <span className="text-gray-600">{g.years === 1 ? 'year' : 'years'}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-2 min-w-52">
                      <span className={`mr-2 rounded px-2 py-0.5 text-xs font-semibold ${BADGE[h.key]}`}>{h.label}</span>
                      <span className="font-medium">{g.where || h.where}</span>
                    </td>
                    <td className="py-2">
                      <button className="btn btn-ghost px-3" aria-label={`Remove ${g.name}`} onClick={() => update((d) => ({ goals: d.goals.filter((x) => x.id !== g.id) }))}>
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form
          className="mt-4 grid gap-2 border-t border-gray-200 pt-4 sm:grid-cols-[1fr_140px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name.trim()) return;
            update((d) => ({ goals: [...d.goals, { id: uid(), name: draft.name.trim(), years: draft.years || 1, where: '' }] }));
            setDraft({ name: '', years: 1 });
          }}
        >
          <input className="input" placeholder="New goal, e.g. House down payment" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <NumberField prefix="" min={0.5} step={0.5} value={draft.years} onChange={(v) => setDraft({ ...draft, years: v })} label="" />
          <button className="btn btn-yellow" type="submit">
            Add Goal ({yearsLabel(draft.years || 1)})
          </button>
        </form>

        <ul className="mt-4 grid gap-1 text-xs text-gray-600 sm:grid-cols-3">
          <li>Under 2 years: FD, RD, Liquid Mutual Fund</li>
          <li>2–5 years: FD, Debt Fund</li>
          <li>Over 5 years: Equity Mutual fund</li>
        </ul>
        <p className="mt-3 font-medium">The shorter the goal, the safer should be your investment.</p>
      </div>
    </Section>
  );
}
