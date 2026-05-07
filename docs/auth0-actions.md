# Auth0 Post-Login Action

Use this Action to add TenantGuard-specific custom claims to the ID token. The app preserves these namespaced claims in the server-side session and displays them in the Token Inspector.

## Create the Action

1. Go to **Actions > Library**.
2. Select **Build Custom**.
3. Name it `TenantGuard Custom Claims`.
4. Trigger: **Login / Post Login**.
5. Runtime: use the current recommended Node runtime.
6. Paste this code.

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://tenantguard.dev/claims";
  const roles = event.authorization?.roles || [];
  const permissions = event.authorization?.permissions || [];

  const demoRole =
    roles.includes("Tenant Admin") ? "Tenant Admin" :
    roles.includes("Security Analyst") ? "Security Analyst" :
    roles.includes("Billing Manager") ? "Billing Manager" :
    roles.includes("Viewer") ? "Viewer" :
    "Unassigned";

  const tenantPlan =
    demoRole === "Tenant Admin" ? "Enterprise" :
    demoRole === "Billing Manager" ? "Business" :
    "Starter";

  const riskTier =
    demoRole === "Tenant Admin" || demoRole === "Security Analyst"
      ? "Medium"
      : "Low";

  api.idToken.setCustomClaim(`${namespace}/tenant_plan`, tenantPlan);
  api.idToken.setCustomClaim(`${namespace}/risk_tier`, riskTier);
  api.idToken.setCustomClaim(`${namespace}/demo_role`, demoRole);
  api.idToken.setCustomClaim(`${namespace}/auth_context`, "Auth0 Post-Login Action");

  api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
  api.accessToken.setCustomClaim(`${namespace}/permissions_count`, permissions.length);
};
```

## Add It To The Login Flow

1. Go to **Actions > Triggers > post-login**.
2. Drag `TenantGuard Custom Claims` into the flow.
3. Click **Apply**.

Log out and log back in. The Token Inspector should show the TenantGuard custom claims.

