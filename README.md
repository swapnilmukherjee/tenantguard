# TenantGuard

TenantGuard is a portfolio-grade Auth0 IAM reference app for a multi-tenant B2B SaaS console. It demonstrates Universal Login, organization-aware sessions, RBAC-protected APIs, custom claims, explainable authorization decisions, and a GitHub/Vercel deployment workflow.

## What It Showcases

- Auth0 Universal Login with the Next.js SDK v4.
- Regular Web Application setup for a server-rendered Next.js app.
- API audience, scopes, RBAC, and access-token permissions.
- Tenant-aware dashboard using Auth0 Organization claims when available.
- Policy-aware UI that explains why a feature is allowed or denied.
- Server-side API enforcement for dashboard, admin, and audit routes.
- Optional Post-Login Action for namespaced custom IAM claims.
- Mac-friendly, Vercel-friendly stack with no local database required.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth0 Next.js SDK
- Vercel deployment
- GitHub branches: `main` and `staging`

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and add your Auth0 values:

```bash
cp .env.example .env.local
openssl rand -hex 32
```

Use the generated value for `AUTH0_SECRET`.

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Auth0 Setup

Follow [docs/auth0-setup.md](docs/auth0-setup.md). The checklist covers:

- Regular Web Application
- API and permissions
- RBAC settings
- roles
- test users
- optional Organizations
- optional Post-Login Action

## GitHub and Vercel

Follow [docs/github-vercel.md](docs/github-vercel.md) after the local baseline is ready.

Recommended branch model:

- `main`: production
- `staging`: integration and preview work

## Demo Script

1. Start logged out and show the Auth0 Universal Login entry point.
2. Log in as a Viewer and show that dashboard access works while admin/audit API calls are denied.
3. Log in as a Tenant Admin and show admin/audit API calls succeed.
4. Open the permission model and explain the difference between UI gating and API enforcement.
5. Open the Token Inspector to show safe claims, roles, permissions, and tenant context.
6. Walk through the Auth0 dashboard setup and how RBAC maps into app behavior.

## Verification

```bash
npm run lint
npm run build
```

In this local sandbox, `npm run build` may need to run outside the sandbox because Next 16/Turbopack starts an internal process during production builds.
