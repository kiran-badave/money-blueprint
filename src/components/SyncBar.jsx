const NAV = [
  ['dashboard', 'Dashboard'],
  ['step1', 'Track'],
  ['step2', 'Budget'],
  ['step3', 'Accounts'],
  ['step4', 'Emergency'],
  ['step5', 'Annual bills'],
  ['step6', 'Invest'],
  ['step7', 'Goals'],
  ['step8', 'Review'],
];

export default function SyncBar({ configured, dirty, status, onPush, onPull, onSettings }) {
  const busy = status.type === 'loading';
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <div className="mr-auto min-w-0">
          <p className="font-serif font-bold text-base sm:text-lg truncate">
            <span className="highlight">The 1% Money Blueprint</span>
          </p>
          <p className="text-xs text-gray-500">
            {dirty ? '● Unsaved local changes' : '✓ In sync'}
            {!configured && ' · GitHub not connected'}
          </p>
        </div>
        <button className="btn btn-ghost text-sm" onClick={onSettings}>
          Settings
        </button>
        <button className="btn btn-ghost text-sm" onClick={onPull} disabled={!configured || busy}>
          Pull
        </button>
        <button className="btn btn-yellow text-sm" onClick={configured ? onPush : onSettings} disabled={busy}>
          {busy ? 'Working…' : 'Save to Cloud / Push Changes'}
        </button>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-gray-600 hover:bg-highlight hover:text-ink"
          >
            {label}
          </a>
        ))}
      </nav>
      {status.message && (
        <div
          className={`px-4 py-1.5 text-center text-xs font-medium ${
            status.type === 'error' ? 'bg-red-100 text-red-800' : status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
          }`}
          role="status"
        >
          {status.message}
        </div>
      )}
    </header>
  );
}
