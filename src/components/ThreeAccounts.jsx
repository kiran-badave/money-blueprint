import { Section } from './ui.jsx';
import { formatINR } from '../utils/finance.js';

function Account({ n, title, note, amount, accent }) {
  return (
    <div className={`card flex-1 text-center ${accent ? 'ring-2 ring-yellow-300' : ''}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500">Account {n}</p>
      <p className="mt-1 font-semibold">
        <span className="highlight">{title}</span>
      </p>
      <p className="mt-3 text-3xl font-bold">{formatINR(amount)}</p>
      <p className="mt-1 text-sm text-gray-600">{note}</p>
    </div>
  );
}

const Arrow = ({ label }) => (
  <div className="flex flex-row items-center justify-center gap-2 text-gray-500 lg:flex-col" aria-hidden="true">
    <span className="text-2xl rotate-90 lg:rotate-0">→</span>
    <span className="text-xs">{label}</span>
  </div>
);

export default function ThreeAccounts({ salary, expenses }) {
  const savings = Math.max(0, salary - expenses);
  return (
    <Section id="step3" step={3} title="Follow the 3-Account System!">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <Account n={1} title="Salary credited here" note="Income lands here first" amount={salary} accent />
        <Arrow label="Needs + Wants" />
        <Account n={2} title="For monthly expenses" note="Needs + Wants" amount={expenses} />
        <Arrow label="The rest" />
        <Account n={3} title="Savings and investments" note="Savings & investments" amount={savings} />
      </div>
      <p className="mt-4 font-medium">Automate (or manually make) transfers on salary day!</p>
    </Section>
  );
}
