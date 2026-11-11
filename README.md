# How To Manage Your Money Like The 1%

A client-side React + Vite + Tailwind + Recharts dashboard for the 9-step money system. There is no backend. Your data is saved as `user-data.json` in your own GitHub repo through the GitHub REST API.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

Option A: automatic. Push to `main`. `.github/workflows/deploy.yml` builds the app and publishes it to the `gh-pages` branch. Then set **Settings → Pages → Source: `gh-pages` branch**.

Option B: manual. Run `npm run deploy`. This runs the `gh-pages` CLI and publishes `dist/`.

`vite.config.js` uses `base: './'`, so the build works under any repo path.

## Connect GitHub storage

1. Create a fine-grained Personal Access Token. Limit it to the one repo, with **Contents: Read and write**.
2. Open **Settings** in the app and enter your username, repo name and token. Branch defaults to `main` and file path to `user-data.json`.
3. Edit freely. Changes are cached in `localStorage`. Click **Save to Cloud / Push Changes** to commit them.
   - The app first runs `GET /repos/{owner}/{repo}/contents/{path}` to read the current `sha`.
   - It then runs `PUT` with the base64-encoded JSON and that `sha`, which creates a commit.
4. **Pull** loads the latest committed data.

The token lives only in your browser's localStorage and is sent only to `api.github.com`. Use a repo-scoped token, and don't use it on shared computers. If the repo is public, `user-data.json` is public too.

## Structure

```
src/
  App.jsx                    page composition + derived values
  services/githubStorage.js  GET/PUT against the GitHub contents API
  hooks/useAppState.js       state, localStorage cache, pull/push
  utils/finance.js           50/30/20, 6x emergency target, /12 sinking fund, split rules, goal horizons
  data/defaultData.js        sample values
  components/                one component per step + SyncBar + SettingsPanel
```
