"use client";

import { useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";

type ApiResult = {
  route: string;
  status: number;
  body: unknown;
};

const checks = [
  {
    label: "Tenant summary",
    route: "/api/tenant-summary",
    permission: "read:dashboard",
  },
  {
    label: "Admin members",
    route: "/api/admin/users",
    permission: "manage:users",
  },
  {
    label: "Audit log",
    route: "/api/audit-log",
    permission: "read:audit_logs",
  },
  {
    label: "Billing summary",
    route: "/api/billing",
    permission: "read:billing",
  },
];

export function ApiConsole() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function runCheck(route: string) {
    setLoading(route);
    const response = await fetch(route);
    const body = await response.json();

    setResults((current) => [
      { route, status: response.status, body },
      ...current.filter((result) => result.route !== route),
    ]);
    setLoading(null);
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          API Enforcement
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Permission-gated route checks
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {checks.map((check) => (
          <button
            key={check.route}
            onClick={() => runCheck(check.route)}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="block text-sm font-semibold text-slate-950">
              {check.label}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Requires {check.permission}
            </span>
            <span className="mt-3 block text-sm font-medium text-emerald-700">
              {loading === check.route ? "Checking..." : "Call API"}
            </span>
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => {
            const allowed = result.status < 400;

            return (
              <div
                key={result.route}
                className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {allowed ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-rose-300" />
                    )}
                    {result.route}
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                    HTTP {result.status}
                  </span>
                </div>
                <pre className="mt-3 max-h-52 overflow-auto rounded-md bg-black/30 p-3 text-xs leading-5 text-slate-200">
                  {JSON.stringify(result.body, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
