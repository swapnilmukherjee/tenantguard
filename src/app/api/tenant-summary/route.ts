import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  decideAccess,
  getTenant,
  getUserPermissions,
  tenantMetrics,
} from "@/lib/iam";

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const permissions = getUserPermissions(user);
  const decision = decideAccess(permissions, "read:dashboard");

  if (!decision.allowed) {
    return NextResponse.json({ decision }, { status: 403 });
  }

  return NextResponse.json({
    tenant: getTenant(user),
    metrics: tenantMetrics,
    decision,
  });
}
