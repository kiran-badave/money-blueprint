import { Section, NumberField, ProgressBar } from './ui.jsx';
import { formatINR } from '../utils/finance.js';

export default function EmergencyFund({ monthly, target, saved, onChange }) {
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const complete = target > 0 && saved >= target;
  return (
    <Section id="step4" step={4} title="Build Your Emergency Fund">
      <div className="card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Monthly spending (Needs + Wants)</p>
            <p className="text-xl font-bold">{formatINR(monthly)}</p>
            <p className="mt-3 text-sm text-gray-600">Target: 6 months × {formatINR(monthly)}</p>
            <p className="text-3xl font-bold">
              <span className="highlight">{formatINR(target)}</span>
            </p>
          </div>
          <NumberField label="Amount saved so far" value={saved} onChange={onChange} />
        </div>

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>
              {formatINR(saved)} of {formatINR(target)}
            </span>
            <span>{pct}%</span>
          </div>
          <ProgressBar value={saved} max={target} color={complete ? 'bg-green-500' : 'bg-yellow-400'} />
          <p className="mt-2 text-sm">
            {complete ? 'Emergency fund is ready!' : `${formatINR(Math.max(0, target - saved))} still to go.`}
          </p>
        </div>

        <p className="mt-4 font-medium">Keep some cash instantly accessible. Park the rest in suitable Liquid Fund and FDs.</p>
      </div>
    </Section>
  );
}
