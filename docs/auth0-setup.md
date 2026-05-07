# Auth0 Setup Checklist

Verified against current Auth0 Next.js SDK v4, API permissions, RBAC, roles, and Actions docs on May 7, 2026.

Auth0 changes dashboard navigation often. If a label moved, use the dashboard search box for the object name in each section.

## 1. Create the Regular Web Application

1. In Auth0 Dashboard, go to **Applications > Applications**.
2. Select **Create Application**.
3. Name it `TenantGuard Local`.
4. Choose **Regular Web Applications**.
5. Open the new application's **Settings** tab.
6. Copy these values into your local `.env.local`:
   - Domain -> `AUTH0_DOMAIN`
   - Client ID -> `AUTH0_CLIENT_ID`
   - Client Secret -> `AUTH0_CLIENT_SECRET`
7. Add these URLs:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
8. Save changes.

Generate the local cookie secret:

```bash
openssl rand -hex 32
```

Paste that value into `AUTH0_SECRET`.

## 2. Create the API

1. Go to **Applications > APIs**.
2. Select **Create API**.
3. Name it `TenantGuard API`.
4. Set Identifier to `https://api.tenantguard.dev`.
5. Use signing algorithm `RS256`.
6. Open the API's **Permissions** tab.
7. Add these permissions:
   - `read:dashboard`
   - `read:audit_logs`
   - `manage:users`
   - `manage:settings`
   - `read:billing`
8. Open the API's **Settings** tab.
9. Enable **RBAC**.
10. Enable **Add Permissions in the Access Token**.
11. Save changes.

Set this in `.env.local`:

```bash
AUTH0_AUDIENCE=https://api.tenantguard.dev
AUTH0_SCOPE="openid profile email read:dashboard read:audit_logs manage:users manage:settings read:billing"
```

## 3. Create Roles

Go to **User Management > Roles** and create:

| Role | Permissions |
| --- | --- |
| Tenant Admin | `read:dashboard`, `read:audit_logs`, `manage:users`, `manage:settings`, `read:billing` |
| Security Analyst | `read:dashboard`, `read:audit_logs` |
| Billing Manager | `read:dashboard`, `read:billing` |
| Viewer | `read:dashboard` |

For each role, open the role, choose **Permissions**, select `TenantGuard API`, and add the listed permissions.

## 4. Create Test Users

1. Go to **User Management > Users**.
2. Create at least two users:
   - one assigned `Tenant Admin`
   - one assigned `Viewer`
3. On each user, open **Roles** and assign the role.

This lets the dashboard show allowed and denied API behavior.

## 5. Optional Organizations

If Organizations are available in your free tenant:

1. Go to **Organizations**.
2. Create:
   - `Acme Health`
   - `Globex Retail`
   - `Initech Finance`
3. Add your test users as members.
4. If the login flow requires an organization prompt, use the Auth0 application settings to enable organization usage for the app.

TenantGuard gracefully falls back to demo tenant data if organization claims are not present.

## 6. Optional Post-Login Action

Go to **Actions > Triggers > post-login**, create a custom Action, and add it to the post-login flow.

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://tenantguard.dev/claims";
  const roles = event.authorization?.roles || [];
  const permissions = event.authorization?.permissions || [];

  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
  api.idToken.setCustomClaim(`${namespace}/permissions`, permissions);
  api.idToken.setCustomClaim(`${namespace}/tenant_id`, event.organization?.id || "org_acme");
  api.idToken.setCustomClaim(`${namespace}/tenant_name`, event.organization?.display_name || "Acme Health");
  api.idToken.setCustomClaim(`${namespace}/tenant_plan`, "Enterprise");
  api.idToken.setCustomClaim(`${namespace}/risk_tier`, "Medium");
};
```

The app works without this Action, but the Token Inspector becomes more compelling with these custom claims.
