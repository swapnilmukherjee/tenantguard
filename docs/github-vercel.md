# GitHub and Vercel Workflow

## Branches

The intended workflow is:

- `main`: production branch connected to the production Vercel deployment.
- `staging`: integration branch connected to Vercel preview deployments.

## Create the GitHub repository

GitHub CLI is not installed locally, so use the GitHub website unless you want to install `gh`.

1. Go to GitHub and create a new repository named `tenantguard`.
2. Keep it empty. Do not add a README, license, or `.gitignore`.
3. Copy the repository SSH or HTTPS URL.
4. Run:

```bash
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
git push -u origin staging
```

## Vercel

1. Import the GitHub repository into Vercel.
2. Set production branch to `main`.
3. Add the environment variables from `.env.local`.
4. For production, set `APP_BASE_URL` to the production Vercel URL or your custom domain.
5. Add production Auth0 URLs:
   - Allowed Callback URLs: `https://YOUR_DOMAIN/auth/callback`
   - Allowed Logout URLs: `https://YOUR_DOMAIN`
   - Allowed Web Origins: `https://YOUR_DOMAIN`

For preview deployments, the Auth0 SDK can infer dynamic hostnames when `APP_BASE_URL` is omitted, but each preview callback URL must still be allowed by Auth0. For a portfolio app, it is simplest to test authentication on local and production URLs.
