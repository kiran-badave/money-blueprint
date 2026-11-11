import { useState } from 'react';
import { testConnection } from '../services/githubStorage.js';

export default function SettingsPanel({ settings, setSettings, onClose, onPull, resetData }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setSettings((s) => ({ ...s, [k]: e.target.value.trim() }));

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const repo = await testConnection(settings);
      setMsg({ ok: true, text: `Connected to ${repo.full_name} with write access.` });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-lg mt-8 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl font-bold">
            <span className="highlight">GitHub Settings</span>
          </h2>
          <button className="text-2xl leading-none px-2" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Your data is saved as <code>{settings.path}</code> in your own repository. Create a fine-grained Personal Access
          Token with <strong>Contents: Read and write</strong> permission for that repo.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="block text-sm font-medium">
            GitHub username
            <input className="input mt-1" value={settings.owner} onChange={set('owner')} placeholder="octocat" autoComplete="off" />
          </label>
          <label className="block text-sm font-medium">
            Repository name
            <input className="input mt-1" value={settings.repo} onChange={set('repo')} placeholder="money-blueprint" autoComplete="off" />
          </label>
          <label className="block text-sm font-medium">
            Personal Access Token
            <input
              className="input mt-1"
              type="password"
              value={settings.token}
              onChange={set('token')}
              placeholder="github_pat_…"
              autoComplete="off"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              Branch
              <input className="input mt-1" value={settings.branch} onChange={set('branch')} />
            </label>
            <label className="block text-sm font-medium">
              File path
              <input className="input mt-1" value={settings.path} onChange={set('path')} />
            </label>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          The token is stored only in this browser’s localStorage and sent only to api.github.com. Use a token scoped to a
          single repo, and avoid shared computers.
        </p>

        {msg && (
          <p className={`mt-3 text-sm font-medium ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>{msg.text}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn" onClick={test} disabled={busy || !settings.owner || !settings.repo || !settings.token}>
            {busy ? 'Testing…' : 'Test connection'}
          </button>
          <button
            className="btn btn-yellow"
            disabled={!settings.owner || !settings.repo || !settings.token}
            onClick={() => {
              onPull();
              onClose();
            }}
          >
            Save &amp; pull data
          </button>
          <button
            className="btn btn-ghost ml-auto"
            onClick={() => {
              if (window.confirm('Reset all data to the sample values? (Not pushed until you save to cloud.)')) {
                resetData();
                onClose();
              }
            }}
          >
            Reset to sample
          </button>
        </div>
      </div>
    </div>
  );
}
