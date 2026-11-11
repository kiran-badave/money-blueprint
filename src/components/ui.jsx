export function StepTitle({ step, children }) {
  return (
    <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mb-3">
      <span className="highlight">
        Step {step}: {children}
      </span>
    </h2>
  );
}

export function Section({ id, step, title, children }) {
  return (
    <section id={id} className="scroll-mt-32 py-8">
      <StepTitle step={step}>{title}</StepTitle>
      {children}
    </section>
  );
}

export function Callout({ children }) {
  return (
    <div className="mt-4 rounded-lg border-l-4 border-yellow-400 bg-highlight/60 px-4 py-3 text-sm font-medium">
      {children}
    </div>
  );
}

export function NumberField({ value, onChange, label, prefix = '₹', min = 0, step = 1, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm font-medium mb-1">{label}</span>}
      <span className="relative block">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          className={`input ${prefix ? 'pl-7' : ''}`}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === '' ? 0 : Math.max(min, parseFloat(e.target.value) || 0))}
        />
      </span>
    </label>
  );
}

export function ProgressBar({ value, max, color = 'bg-yellow-400' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="h-4 w-full rounded-full bg-gray-200 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}
