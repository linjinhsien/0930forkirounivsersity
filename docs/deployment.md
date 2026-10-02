# Deployment Guide

## GitHub Pages

This project is deployed as a Vite SPA through GitHub Pages. No Azure Static Web Apps resource or Azure deployment token is required.

### Prerequisites

- Node.js 20+
- npm 10+
- GitHub repository with GitHub Pages enabled
- GitHub Actions enabled for the repository

### Local production build

1. Install dependencies with `npm ci`.
2. Copy `.env.production.example` to `.env.production` when local production defaults need to be overridden.
3. Run `npm run lint`, `npm run format:check`, `npm run type-check`, `npm run test:unit`, and `npm run build`.
4. Run `npm run preview` and verify navigation and assets.

Never commit real credentials or secrets. Variables prefixed with `VITE_` are bundled into browser code and must be treated as public.

### GitHub Actions deployment

The `.github/workflows/deploy-pages.yml` workflow runs on pushes to `main` and can also be started manually.

It:
1. Installs dependencies with `npm ci`.
2. Runs lint, formatting, type checking, and unit tests.
3. Builds the Vite application.
4. Uploads `dist/` as a Pages artifact.
5. Deploys the artifact with the GitHub Pages deployment action.

The Vite configuration automatically uses `/0930forkirounivsersity/` as the production base path in GitHub Actions.

In repository settings, set **Pages → Source** to **GitHub Actions**.

### SPA routing

GitHub Pages serves static files, while Vue Router uses client-side routing. The deployment should therefore include a fallback for direct route access. If direct navigation to a nested route returns 404, add a Pages-compatible `404.html` fallback that redirects to `index.html`, or use the repository's existing SPA fallback strategy.

### Rollback

Revert the problematic commit on `main`. GitHub Actions will rebuild and redeploy the reverted commit.

### Monitoring and error tracking

Client-side diagnostics are available through:
- `src/utils/errorTracking.ts` for the last 50 tracked errors.
- `src/utils/performanceMonitor.ts` for performance metrics and slow-operation diagnostics.

These records are local browser diagnostics and are not a replacement for centralized telemetry.

### Troubleshooting

**Build succeeds but assets return 404:** verify the Vite GitHub Pages base path matches the repository name.

**Nested route returns 404:** verify the GitHub Pages SPA fallback is configured.

**Deployment does not start:** check that GitHub Pages is configured to use GitHub Actions and that Actions are enabled.

**Build fails in Actions:** use Node.js 20 and `npm ci`, then inspect the failed workflow job logs.

### One-time Pages enablement

The workflow requests Pages enablement automatically. GitHub may reject that API call when the Actions token does not have repository administration permission. If the workflow reports **Resource not accessible by integration** during `Configure Pages`, enable it once in the repository UI:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Save the setting.
4. Re-run the latest **Deploy to GitHub Pages** workflow.

After Pages is enabled, the workflow can build and deploy the site without an Azure deployment token.
