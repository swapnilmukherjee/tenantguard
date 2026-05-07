import { NextResponse } from "next/server";
import { getAccessTokenPermissions, getSessionSafely } from "@/lib/auth0";
import {
  buildDemoAccounts,
  decideAccess,
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
  const decision = decideAccess(permissions, "manage:users");

  if (!decision.allowed) {
    return NextResponse.json({ decision }, { status: 403 });
  }

  return NextResponse.json({
    accounts: buildDemoAccounts(user, getUserRoles(user, permissions)),
    decision,
  });
}
