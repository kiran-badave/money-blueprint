/**
 * Git-backed storage: persists app state as a JSON file inside a GitHub repo
 * using the GitHub REST API "contents" endpoints. No backend required.
 *
 *   GET /repos/{owner}/{repo}/contents/{path}?ref={branch}  -> content (base64) + sha
 *   PUT /repos/{owner}/{repo}/contents/{path}               -> commit new content
 *
 * `config` shape: { owner, repo, token, branch = 'main', path = 'user-data.json' }
 */

const API = 'https://api.github.com';

export class GitHubStorageError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubStorageError';
    this.status = status;
  }
}

// ---- Unicode-safe base64 helpers (btoa/atob alone break on ₹ and other non-Latin1 chars)
export function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeBase64(b64) {
  // GitHub wraps base64 with newlines; strip them before decoding.
  const binary = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function assertConfig(config) {
  const missing = ['owner', 'repo', 'token'].filter((k) => !config?.[k]?.trim());
  if (missing.length) {
    throw new GitHubStorageError(`Missing GitHub settings: ${missing.join(', ')}`);
  }
}

function contentsUrl({ owner, repo, path = 'user-data.json' }) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`;
}

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function parseError(res) {
  let detail = '';
  try {
    detail = (await res.json()).message || '';
  } catch {
    /* ignore non-JSON bodies */
  }
  if (res.status === 401) return new GitHubStorageError('Invalid or expired token (401).', 401);
  if (res.status === 403) return new GitHubStorageError(`Access forbidden (403). ${detail}`, 403);
  if (res.status === 404)
    return new GitHubStorageError('Repository or file not found (404). Check username, repo name and token scope.', 404);
  if (res.status === 409 || res.status === 422)
    return new GitHubStorageError(`Conflict while saving (${res.status}). Pull the latest data and retry. ${detail}`, res.status);
  return new GitHubStorageError(`GitHub API error ${res.status}. ${detail}`, res.status);
}

/**
 * GET the JSON file. Returns { data, sha } or { data: null, sha: null } if the file doesn't exist yet.
 */
export async function fetchUserData(config) {
  assertConfig(config);
  const branch = config.branch || 'main';
  const res = await fetch(`${contentsUrl(config)}?ref=${encodeURIComponent(branch)}`, {
    headers: headers(config.token),
    cache: 'no-store',
  });

  if (res.status === 404) {
    // Distinguish "file missing" from "repo missing" so first-time setup works.
    const repoRes = await fetch(`${API}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`, {
      headers: headers(config.token),
    });
    if (!repoRes.ok) throw await parseError(repoRes);
    return { data: null, sha: null };
  }
  if (!res.ok) throw await parseError(res);

  const json = await res.json();
  let text;
  if (json.content) {
    text = decodeBase64(json.content);
  } else {
    // Files > 1MB come back without inline content; fetch the raw blob instead.
    const raw = await fetch(contentsUrl(config) + `?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers(config.token), Accept: 'application/vnd.github.raw+json' },
    });
    if (!raw.ok) throw await parseError(raw);
    text = await raw.text();
  }
  try {
    return { data: JSON.parse(text), sha: json.sha };
  } catch {
    throw new GitHubStorageError('user-data.json exists but is not valid JSON.');
  }
}

/**
 * Commit `data` to the repo. Always fetches the file's current `sha` first
 * (required by the API to update an existing file), then PUTs base64 content.
 */
export async function saveUserData(config, data, message) {
  assertConfig(config);
  const branch = config.branch || 'main';
  const { sha } = await fetchUserData(config);

  const body = {
    message: message || `Update user-data.json (${new Date().toISOString()})`,
    content: encodeBase64(JSON.stringify(data, null, 2) + '\n'),
    branch,
  };
  if (sha) body.sha = sha; // omit when creating the file for the first time

  const res = await fetch(contentsUrl(config), {
    method: 'PUT',
    headers: { ...headers(config.token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  const json = await res.json();
  return { sha: json.content?.sha, commitUrl: json.commit?.html_url };
}

/** Lightweight credential/repo check used by the settings screen. */
export async function testConnection(config) {
  assertConfig(config);
  const res = await fetch(`${API}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`, {
    headers: headers(config.token),
  });
  if (!res.ok) throw await parseError(res);
  const repo = await res.json();
  if (repo.permissions && !repo.permissions.push) {
    throw new GitHubStorageError('Token can read this repo but has no write (push) access.');
  }
  return repo;
}
