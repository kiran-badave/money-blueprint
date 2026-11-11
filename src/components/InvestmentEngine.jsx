import { Section, NumberField } from './ui.jsx';
import { formatINR, investmentSplit, ordinal } from '../utils/finance.js';

function Rule({ active, title, a, b }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? 'border-yellow-400 bg-highlight/50' : 'border-gray-200 opacity-70'}`}>
      <p className="text-sm font-semibold">
        {title} {active && <span className="ml-1 rounded bg-ink px-1.5 py-0.5 text-xs text-white">Active</span>}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        <li>
          <strong>{formatINR(a.amount)}</strong> → {a.label}
        </li>
        <li>
          <strong>{formatINR(b.amount)}</strong> → {b.label}
        </li>
      </ul>
    </div>
  );
}

export default function InvestmentEngine({ savings, complete, salaryDay, update }) {
  const before = investmentSplit(savings, false);
  const after = investmentSplit(savings, true);
  const s1 = Math.min(28, salaryDay + 1);
  const s2 = Math.min(28, salaryDay + 2);
  return (
    <Section id="step6" step={6} title="Automate Your Investments!">
      <div className="card">
        <p className="text-sm text-gray-600">Monthly savings (20% of salary)</p>
        <p className="text-2xl font-bold">{formatINR(savings)}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Rule active={!complete} title="Till emergency fund is ready" a={before.primary} b={before.secondary} />
          <Rule active={complete} title="After emergency fund is ready" a={after.primary} b={after.secondary} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr] sm:items-end">
          <NumberField label="Salary day of month" prefix="" min={1} value={salaryDay} onChange={(v) => update({ salaryDay: Math.min(28, Math.max(1, v || 1)) })} />
          <p className="font-medium">
            Set SIP dates 1–2 days after salary day (if you are in a job):{' '}
            <span className="highlight">{ordinal(s1)} – {ordinal(s2)} of each month</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
