import { Auth0Client } from "@auth0/nextjs-auth0/server";

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
});

export async function getSessionSafely() {
  if (!isAuth0Configured()) {
    return null;
  }

  return auth0.getSession();
}
