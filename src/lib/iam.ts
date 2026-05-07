export type Permission =
  | "read:dashboard"
  | "read:audit_logs"
  | "manage:users"
  | "manage:settings"
  | "read:billing";

export type RoleName =
  | "Tenant Admin"
  | "Security Analyst"
  | "Billing Manager"
  | "Viewer";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: "Starter" | "Business" | "Enterprise";
  riskTier: "Low" | "Medium" | "High";
  region: string;
};

export type AccessDecision = {
  allowed: boolean;
  permission: Permission;
  reason: string;
};

export type TenantGuardClaims = {
  tenantPlan: string;
  riskTier: string;
  demoRole: string;
  authContext: string;
};

export type DemoAccount = {
  email: string;
  role: RoleName;
  status: string;
  permissions: Permission[];
};

export const claimNamespace = "https://tenantguard.dev/claims";

export const permissionLabels: Record<Permission, string> = {
  "read:dashboard": "Read dashboard",
  "read:audit_logs": "Read audit logs",
  "manage:users": "Manage users",
  "manage:settings": "Manage settings",
  "read:billing": "Read billing",
};

export const roles: Record<RoleName, Permission[]> = {
  "Tenant Admin": [
    "read:dashboard",
    "read:audit_logs",
    "manage:users",
    "manage:settings",
    "read:billing",
  ],
  "Security Analyst": ["read:dashboard", "read:audit_logs"],
  "Billing Manager": ["read:dashboard", "read:billing"],
  Viewer: ["read:dashboard"],
};

export const tenants: Tenant[] = [
  {
    id: "org_acme",
    name: "TenantGuard Demo Org",
    slug: "tenantguard-demo",
    plan: "Enterprise",
    riskTier: "Medium",
    region: "US-East",
  },
];

export function getUserPermissions(
  user?: Record<string, unknown>,
  accessTokenPermissions: Permission[] = [],
): Permission[] {
  if (accessTokenPermissions.length > 0) {
    return accessTokenPermissions;
  }

  const fromToken = user?.permissions;
  if (Array.isArray(fromToken)) {
    return fromToken.filter((permission): permission is Permission =>
      Object.hasOwn(permissionLabels, String(permission)),
    );
  }

  const namespacedPermissions = user?.[`${claimNamespace}/permissions`];
  if (Array.isArray(namespacedPermissions)) {
    return namespacedPermissions.filter((permission): permission is Permission =>
      Object.hasOwn(permissionLabels, String(permission)),
    );
  }

  return roles.Viewer;
}

export function getUserRoles(
  user?: Record<string, unknown>,
  permissions: Permission[] = [],
): RoleName[] {
  const namespacedRoles = user?.[`${claimNamespace}/roles`];
  if (Array.isArray(namespacedRoles)) {
    const validRoles = namespacedRoles.filter((role): role is RoleName =>
      Object.hasOwn(roles, String(role)),
    );

    if (validRoles.length > 0) {
      return validRoles;
    }
  }

  const inferredRoles = Object.entries(roles)
    .filter(([, rolePermissions]) =>
      rolePermissions.every((permission) => permissions.includes(permission)),
    )
    .map(([role]) => role as RoleName);

  if (inferredRoles.includes("Tenant Admin")) {
    return ["Tenant Admin"];
  }

  if (inferredRoles.length > 0) {
    return inferredRoles;
  }

  return ["Viewer"];
}

export function getTenant(user?: Record<string, unknown>): Tenant {
  const orgId = user?.org_id ?? user?.[`${claimNamespace}/tenant_id`];
  const orgName = user?.org_name ?? user?.[`${claimNamespace}/tenant_name`];
  const tenant =
    tenants.find((candidate) => candidate.id === orgId) ??
    tenants.find((candidate) => candidate.name === orgName);

  const fallback = tenant ?? tenants[0];
  const tenantPlan = user?.[`${claimNamespace}/tenant_plan`];
  const riskTier = user?.[`${claimNamespace}/risk_tier`];

  return {
    ...fallback,
    plan:
      tenantPlan === "Starter" ||
      tenantPlan === "Business" ||
      tenantPlan === "Enterprise"
        ? tenantPlan
        : fallback.plan,
    riskTier:
      riskTier === "Low" || riskTier === "Medium" || riskTier === "High"
        ? riskTier
        : fallback.riskTier,
  };
}

export function decideAccess(
  permissions: Permission[],
  permission: Permission,
): AccessDecision {
  const allowed = permissions.includes(permission);

  return {
    allowed,
    permission,
    reason: allowed
      ? `Granted by a role containing ${permission}.`
      : `Denied because the current token does not include ${permission}.`,
  };
}

export function getUserEmail(user?: Record<string, unknown>) {
  return String(user?.email ?? user?.name ?? "authenticated-user");
}

export function buildTenantMetrics(
  permissions: Permission[],
  userRoles: RoleName[],
) {
  const protectedRoutes: Permission[] = [
    "read:dashboard",
    "manage:users",
    "read:audit_logs",
    "read:billing",
  ];
  const deniedRoutes = protectedRoutes.filter(
    (permission) => !permissions.includes(permission),
  ).length;

  return [
    {
      label: "Authenticated principal",
      value: "1",
      detail: "Current Auth0 session",
      tone: "positive",
    },
    {
      label: "Effective roles",
      value: String(userRoles.length),
      detail: userRoles.join(", "),
      tone: "positive",
    },
    {
      label: "Granted permissions",
      value: `${permissions.length}/${Object.keys(permissionLabels).length}`,
      detail: "From Auth0 access token",
      tone: "positive",
    },
    {
      label: "Denied demo routes",
      value: String(deniedRoutes),
      detail: "Expected for limited roles",
      tone: deniedRoutes === 0 ? "positive" : "attention",
    },
  ];
}

export function buildDemoAccounts(
  user: Record<string, unknown> | undefined,
  currentRoles: RoleName[],
): DemoAccount[] {
  const email = getUserEmail(user);
  const [localPart, domain = "example.com"] = email.split("@");
  const baseLocalPart = localPart.includes("+")
    ? localPart.split("+")[0]
    : localPart;
  const roleTags: Record<RoleName, string> = {
    "Tenant Admin": "admin",
    "Security Analyst": "security",
    "Billing Manager": "billing",
    Viewer: "viewer",
  };

  return (Object.keys(roles) as RoleName[]).map((role) => ({
    email: `${baseLocalPart}+${roleTags[role]}@${domain}`,
    role,
    status: currentRoles.includes(role)
      ? "Current session"
      : "Configured test user",
    permissions: roles[role],
  }));
}

export function buildAuthorizationEvents(
  user: Record<string, unknown> | undefined,
  permissions: Permission[],
) {
  const actor = getUserEmail(user);
  const checks: { action: string; target: string; permission: Permission }[] = [
    {
      action: "Tenant summary requested",
      target: "/api/tenant-summary",
      permission: "read:dashboard",
    },
    {
      action: "Member directory requested",
      target: "/api/admin/users",
      permission: "manage:users",
    },
    {
      action: "Audit log requested",
      target: "/api/audit-log",
      permission: "read:audit_logs",
    },
    {
      action: "Billing summary requested",
      target: "/api/billing",
      permission: "read:billing",
    },
  ];

  return checks.map((check) => {
    const decision = decideAccess(permissions, check.permission);

    return {
      ...check,
      actor,
      decision: decision.allowed ? "Allowed" : "Denied",
      reason: decision.reason,
    };
  });
}

export function buildBillingSummary(
  user: Record<string, unknown> | undefined,
  tenant: Tenant,
) {
  return {
    tenant: tenant.name,
    plan: tenant.plan,
    billingContact: getUserEmail(user),
    entitlements: [
      "Universal Login",
      "Auth0 API Authorization",
      "RBAC permissions in access tokens",
      "Vercel preview and production deployments",
    ],
  };
}

export function getTenantGuardClaims(
  user?: Record<string, unknown>,
): TenantGuardClaims {
  return {
    tenantPlan: String(user?.[`${claimNamespace}/tenant_plan`] ?? "Not set"),
    riskTier: String(user?.[`${claimNamespace}/risk_tier`] ?? "Not set"),
    demoRole: String(user?.[`${claimNamespace}/demo_role`] ?? "Not set"),
    authContext: String(user?.[`${claimNamespace}/auth_context`] ?? "Not set"),
  };
}
