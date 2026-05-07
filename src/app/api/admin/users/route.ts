import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { decideAccess, getUserPermissions, members } from "@/lib/iam";

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = getUserPermissions(session.user as Record<string, unknown>);
  const decision = decideAccess(permissions, "manage:users");

  if (!decision.allowed) {
    return NextResponse.json({ decision }, { status: 403 });
  }

  return NextResponse.json({ members, decision });
}
