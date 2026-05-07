import { NextResponse } from "next/server";
import { getAccessTokenPermissions, getSessionSafely } from "@/lib/auth0";
import {
  decideAccess,
  buildTenantMetrics,
  getTenant,
  getUserPermissions,
  getUserRoles,
} from "@/lib/iam";

export async function GET() {
  const session = await getSessionSafely();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const permissions = getUserPermissions(user, await getAccessTokenPermissions());
  const userRoles = getUserRoles(user, permissions);
  const decision = decideAccess(permissions, "read:dashboard");

  if (!decision.allowed) {
    return NextResponse.json({ decision }, { status: 403 });
  }

  return NextResponse.json({
    tenant: getTenant(user),
    metrics: buildTenantMetrics(permissions, userRoles),
    decision,
  });
}
