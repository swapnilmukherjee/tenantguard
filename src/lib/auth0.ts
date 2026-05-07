import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope:
      process.env.AUTH0_SCOPE ??
      "openid profile email read:dashboard read:audit_logs manage:users manage:settings read:billing",
  },
});
