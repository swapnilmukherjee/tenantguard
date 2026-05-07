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
    name: "Acme Health",
    slug: "acme-health",
    plan: "Enterprise",
    riskTier: "Medium",
    region: "US-East",
  },
  {
    id: "org_globex",
    name: "Globex Retail",
    slug: "globex-retail",
    plan: "Business",
    riskTier: "Low",
    region: "US-West",
  },
  {
    id: "org_initech",
    name: "Initech Finance",
    slug: "initech-finance",
    plan: "Starter",
    riskTier: "High",
    region: "US-East",
  },
];

export const tenantMetrics = [
  {
    label: "Active sessions",
    value: "1,284",
    delta: "+8.6%",
    tone: "positive",
  },
  {
    label: "Denied API calls",
    value: "37",
    delta: "-12.4%",
    tone: "positive",
  },
  {
    label: "MFA enrollment",
    value: "94%",
    delta: "+2.1%",
    tone: "positive",
  },
  {
    label: "Risk reviews",
    value: "6",
    delta: "+3 open",
    tone: "attention",
  },
];

export const members = [
  {
    name: "Maya Chen",
    email: "maya.chen@example.com",
    role: "Tenant Admin" as RoleName,
    status: "Active",
    lastLogin: "Today, 9:14 AM",
  },
  {
    name: "Noah Reed",
    email: "noah.reed@example.com",
    role: "Security Analyst" as RoleName,
    status: "Active",
    lastLogin: "Yesterday, 4:32 PM",
  },
  {
    name: "Priya Shah",
    email: "priya.shah@example.com",
    role: "Billing Manager" as RoleName,
    status: "Pending MFA",
    lastLogin: "Apr 29, 2026",
  },
  {
    name: "Jon Bell",
    email: "jon.bell@example.com",
    role: "Viewer" as RoleName,
    status: "Active",
    lastLogin: "Apr 24, 2026",
  },
];

export const auditEvents = [
  {
    action: "Member role changed",
    actor: "maya.chen@example.com",
    target: "noah.reed@example.com",
    decision: "Allowed",
    policy: "manage:users",
    time: "9:18 AM",
  },
  {
    action: "Billing page opened",
    actor: "priya.shah@example.com",
    target: "Globex Retail",
    decision: "Allowed",
    policy: "read:billing",
    time: "8:54 AM",
  },
  {
    action: "Security logs requested",
    actor: "jon.bell@example.com",
    target: "Acme Health",
    decision: "Denied",
    policy: "read:audit_logs",
    time: "Yesterday",
  },
  {
    action: "Tenant setting updated",
    actor: "maya.chen@example.com",
    target: "MFA required",
    decision: "Allowed",
    policy: "manage:settings",
    time: "Yesterday",
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

  return tenant ?? tenants[0];
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
