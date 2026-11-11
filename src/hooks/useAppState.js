import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultData, currentMonthKey } from '../data/defaultData.js';
import { fetchUserData, saveUserData } from '../services/githubStorage.js';

const DATA_KEY = 'mb:data';
const SETTINGS_KEY = 'mb:settings';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalize = (d) => {
  const merged = { ...defaultData(), ...d };
  // Checklist resets automatically when a new month begins.
  if (merged.checklist?.month !== currentMonthKey()) merged.checklist = { month: currentMonthKey(), done: {} };
  return merged;
};

export const emptySettings = { owner: '', repo: '', token: '', branch: 'main', path: 'user-data.json' };

/**
 * App state = financial data (cached in localStorage) + GitHub settings.
 * `dirty` is true when local data differs from what was last synced with GitHub.
 * status: { type: 'idle'|'loading'|'success'|'error', message }
 */
export function useAppState() {
  const [data, setData] = useState(() => normalize(read(DATA_KEY, defaultData())));
  const [settings, setSettings] = useState(() => ({ ...emptySettings, ...read(SETTINGS_KEY, {}) }));
  const [dirty, setDirty] = useState(() => localStorage.getItem('mb:dirty') === '1');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const started = useRef(false);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('mb:dirty', dirty ? '1' : '0');
  }, [dirty]);

  const update = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
    setDirty(true);
  }, []);

  const configured = Boolean(settings.owner && settings.repo && settings.token);

  const pull = useCallback(async () => {
    setStatus({ type: 'loading', message: 'Pulling from GitHub…' });
    try {
      const { data: remote } = await fetchUserData(settings);
      if (remote) {
        setData(normalize(remote));
        setDirty(false);
        setStatus({ type: 'success', message: 'Loaded latest data from GitHub.' });
      } else {
        setStatus({ type: 'success', message: 'No user-data.json yet — push to create it.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: e.message });
    }
  }, [settings]);

  const push = useCallback(async () => {
    setStatus({ type: 'loading', message: 'Committing to GitHub…' });
    try {
      const payload = { ...data, updatedAt: new Date().toISOString() };
      await saveUserData(settings, payload);
      setData(payload);
      setDirty(false);
      setStatus({ type: 'success', message: 'Saved to cloud — changes committed to your repo.' });
    } catch (e) {
      setStatus({ type: 'error', message: e.message });
    }
  }, [data, settings]);

  // On first load, if GitHub is configured and there are no unsynced local edits, pull the latest.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (configured && !dirty) pull();
  }, [configured, dirty, pull]);

  const resetData = () => {
    setData(defaultData());
    setDirty(true);
  };

  return { data, update, settings, setSettings, configured, dirty, status, pull, push, resetData };
}
