import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { decodeJwt } from "jose";
import { claimNamespace, permissionLabels, type Permission } from "@/lib/iam";

export function isAuth0Configured() {
  return Boolean(
    process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_SECRET &&
      (process.env.AUTH0_CLIENT_SECRET ||
        process.env.AUTH0_CLIENT_ASSERTION_SIGNING_KEY),
  );
}

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope:
      process.env.AUTH0_SCOPE ??
      "openid profile email read:dashboard read:audit_logs manage:users manage:settings read:billing",
  },
  beforeSessionSaved: async (session, idToken) => {
    if (!idToken) {
      return session;
    }

    const claims = decodeJwt(idToken);
    const namespacedClaims = Object.fromEntries(
      Object.entries(claims).filter(([key]) => key.startsWith(claimNamespace)),
    );

    return {
      ...session,
      user: {
        ...session.user,
        ...namespacedClaims,
      },
    };
  },
});

export async function getSessionSafely() {
  if (!isAuth0Configured()) {
    return null;
  }

  return auth0.getSession();
}

export async function getAccessTokenPermissions() {
  if (!isAuth0Configured()) {
    return [] satisfies Permission[];
  }

  try {
    const { token } = await auth0.getAccessToken();
    const payload = decodeJwt(token);
    const permissions = payload.permissions;

    if (!Array.isArray(permissions)) {
      return [] satisfies Permission[];
    }

    return permissions.filter((permission): permission is Permission =>
      Object.hasOwn(permissionLabels, String(permission)),
    );
  } catch {
    return [] satisfies Permission[];
  }
}
