import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileKey2,
  KeyRound,
  LockKeyhole,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { ApiConsole } from "@/components/api-console";
import { getAccessTokenPermissions, getSessionSafely } from "@/lib/auth0";
import {
  auditEvents,
  claimNamespace,
  decideAccess,
  getTenant,
  getUserPermissions,
  getUserRoles,
  members,
  permissionLabels,
  roles,
  tenantMetrics,
  tenants,
  type Permission,
} from "@/lib/iam";

const featureCards: {
  title: string;
  description: string;
  permission: Permission;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    title: "Tenant dashboard",
    description: "Organization-aware account health and session telemetry.",
    permission: "read:dashboard",
    icon: Activity,
  },
  {
    title: "Member administration",
    description: "Role-based user management guarded by API permissions.",
    permission: "manage:users",
    icon: Users,
  },
  {
    title: "Security audit center",
    description: "Denied and allowed access decisions for review workflows.",
    permission: "read:audit_logs",
    icon: FileKey2,
  },
  {
    title: "Billing controls",
    description: "Sensitive commercial information separated by permission.",
    permission: "read:billing",
    icon: CreditCard,
  },
];

export default async function Home() {
  const session = await getSessionSafely();
  const user = session?.user as Record<string, unknown> | undefined;
  const accessTokenPermissions = await getAccessTokenPermissions();
  const permissions = getUserPermissions(user, accessTokenPermissions);
  const userRoles = getUserRoles(user, permissions);
  const tenant = getTenant(user);

  if (!session) {
    return <UnauthenticatedHome />;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">TenantGuard</p>
              <p className="text-sm text-slate-500">
                Auth0 IAM reference console
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
              {String(user?.email ?? user?.name ?? "Authenticated user")}
            </span>
            <a
              href="/auth/logout"
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Organization
            </p>
            <div className="mt-3 flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold">{tenant.name}</p>
                <p className="text-sm text-slate-500">{tenant.region}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <InfoPill label="Plan" value={tenant.plan} />
              <InfoPill label="Risk" value={tenant.riskTier} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Effective Roles
            </p>
            <div className="mt-3 space-y-2">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Permission Set
            </p>
            <div className="mt-3 space-y-2">
              {(Object.keys(permissionLabels) as Permission[]).map(
                (permission) => {
                  const allowed = permissions.includes(permission);
                  return (
                    <div
                      key={permission}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-slate-700">
                        {permissionLabels[permission]}
                      </span>
                      {allowed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <LockKeyhole className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Auth0 B2B IAM Portfolio Project
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Multi-tenant access control that is visible, testable, and
                  enforced.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  TenantGuard demonstrates Auth0 Universal Login,
                  organization-aware sessions, RBAC-protected APIs, custom
                  claims, and explainable authorization decisions in a Vercel
                  deployable SaaS console.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#api"
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Test protected APIs
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#token"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Inspect session claims
                  </a>
                </div>
              </div>
              <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Tenant Matrix
                </p>
                <div className="mt-4 space-y-3">
                  {tenants.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.name}</p>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                          {item.plan}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.region} · {item.riskTier} risk
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            {tenantMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-slate-500">{metric.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold">{metric.value}</p>
                  <span
                    className={
                      metric.tone === "positive"
                        ? "text-sm font-medium text-emerald-700"
                        : "text-sm font-medium text-amber-700"
                    }
                  >
                    {metric.delta}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            {featureCards.map((feature) => {
              const decision = decideAccess(permissions, feature.permission);
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={
                        decision.allowed
                          ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                      }
                    >
                      {decision.allowed ? "Allowed" : "Denied"}
                    </span>
                  </div>
                  <h2 className="mt-4 font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {decision.reason}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Members
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Tenant user access
                  </h2>
                </div>
                <Settings className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Last login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((member) => (
                      <tr key={member.email}>
                        <td className="py-3">
                          <p className="font-medium text-slate-950">
                            {member.name}
                          </p>
                          <p className="text-slate-500">{member.email}</p>
                        </td>
                        <td className="py-3 text-slate-700">{member.role}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {member.lastLogin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Role Model
              </p>
              <div className="mt-4 space-y-4">
                {Object.entries(roles).map(([role, rolePermissions]) => (
                  <div key={role}>
                    <p className="font-semibold">{role}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rolePermissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Audit Center
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Authorization decisions
                </h2>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-5 grid gap-3">
              {auditEvents.map((event) => (
                <div
                  key={`${event.action}-${event.time}`}
                  className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_130px_120px]"
                >
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.actor} → {event.target}
                    </p>
                  </div>
                  <span
                    className={
                      event.decision === "Allowed"
                        ? "h-fit rounded-full bg-emerald-50 px-2 py-1 text-center text-xs font-semibold text-emerald-700"
                        : "h-fit rounded-full bg-rose-50 px-2 py-1 text-center text-xs font-semibold text-rose-700"
                    }
                  >
                    {event.decision}
                  </span>
                  <p className="text-sm text-slate-500 md:text-right">
                    {event.time}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="api" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ApiConsole />
          </section>

          <section
            id="token"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Token Inspector
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Session claim map</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This panel intentionally displays only application-safe session
              claims. Secrets and raw tokens stay server-side.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Claim label="Subject" value={String(user?.sub ?? "Not set")} />
              <Claim label="Email" value={String(user?.email ?? "Not set")} />
              <Claim label="Auth0 org" value={String(user?.org_id ?? tenant.id)} />
              <Claim label="Tenant plan" value={tenant.plan} />
              <Claim label="Claim namespace" value={claimNamespace} />
              <Claim label="Permissions" value={permissions.join(", ")} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function UnauthenticatedHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">TenantGuard</span>
          </div>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
          >
            <KeyRound className="h-4 w-4" />
            Login
          </a>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Auth0 IAM Portfolio Project
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              B2B identity for a SaaS console, built to be audited.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              TenantGuard is a Vercel-ready reference app for Universal Login,
              Organizations, RBAC-protected APIs, custom claims, and
              authorization decision visibility.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Start secure session
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://auth0.com/docs/quickstart/webapp/nextjs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Auth0 Next.js docs
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-2xl">
            <div className="grid gap-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-white/10 bg-slate-900/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-emerald-300" />
                      <p className="font-semibold">{feature.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 p-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Claim({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-sm text-slate-800">
        {value}
      </p>
    </div>
  );
}
