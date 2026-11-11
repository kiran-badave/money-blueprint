import { Section } from './ui.jsx';
import { CHECKLIST_ITEMS } from '../data/defaultData.js';

export default function MonthlyReview({ checklist, update }) {
  const done = checklist.done || {};
  const count = CHECKLIST_ITEMS.filter((i) => done[i.id]).length;
  const monthLabel = new Date(`${checklist.month}-01T00:00:00`).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const toggle = (id) => update((d) => ({ checklist: { ...d.checklist, done: { ...d.checklist.done, [id]: !d.checklist.done?.[id] } } }));

  return (
    <Section id="step8" step={8} title="Do a 15-Minute Monthly Money Review">
      <div className="card">
        <p className="mb-3 text-sm text-gray-600">
          On the <strong>1st of every month</strong> · {monthLabel} · {count}/{CHECKLIST_ITEMS.length} done
        </p>
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((i) => (
            <li key={i.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-highlight/30">
                <input type="checkbox" className="h-5 w-5 accent-yellow-500" checked={Boolean(done[i.id])} onChange={() => toggle(i.id)} />
                <span className={done[i.id] ? 'line-through text-gray-400' : 'font-medium'}>{i.label}</span>
              </label>
            </li>
          ))}
        </ul>
        {count === CHECKLIST_ITEMS.length && <p className="mt-3 font-semibold text-green-700">Review complete for this month. 🎉</p>}
      </div>
    </Section>
  );
}
