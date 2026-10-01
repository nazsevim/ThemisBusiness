# Themis Business — Analytics counter package

This package preserves the existing Themis Business HTML and adds a server-side Vercel Analytics counter endpoint.

## Files
- `index.html` — existing site, with the globe counters connected to `/api/visitors`.
- `api/visitors.js` — server-side Vercel Web Analytics API request. The token is never included in browser code.

## Deployment notes
1. Replace the repository's `index.html` with this package's `index.html`.
2. Create a directory named `api` in the repository and add `visitors.js` inside it.
3. Keep the existing Vercel environment variable `VERCEL_API_TOKEN` as a Secret in Production.
4. Optional: add `VERCEL_PROJECT_ID` with the project's ID and `VERCEL_TEAM_SLUG` with the team slug if the defaults do not match the Vercel dashboard. Defaults are `themisbusiness` and `juriscope`.
5. Commit and let Vercel deploy. Test `/api/visitors` before expecting numbers on the homepage.

The API counter intentionally displays `—` when data cannot be verified. `trackedVisitors` is counted from 2026-09-30, the earliest date visible in the supplied Analytics screenshot, not a claim of lifetime visits before tracking was enabled. Vercel token permissions, team slug, and endpoint response must be verified on the live deployment.
