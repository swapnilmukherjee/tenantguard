# Vercel Environment Variable Classification

Vercel dotenv imports provide key/value pairs, but they do not encode the dashboard's Sensitive flag. If you add variables manually or through the Vercel CLI, classify them this way.

## Preview

Upload `.env.vercel.preview` for the Preview environment.

Do not include `APP_BASE_URL` for Preview. The Auth0 SDK should infer the Vercel preview host from the incoming request.

| Key | Sensitive? |
| --- | --- |
| `AUTH0_DOMAIN` | No |
| `AUTH0_CLIENT_ID` | No |
| `AUTH0_CLIENT_SECRET` | Yes |
| `AUTH0_SECRET` | Yes |
| `AUTH0_AUDIENCE` | No |
| `AUTH0_SCOPE` | No |

## Production

Production should use the same classification, with `APP_BASE_URL` added and marked non-sensitive.

| Key | Sensitive? |
| --- | --- |
| `AUTH0_DOMAIN` | No |
| `AUTH0_CLIENT_ID` | No |
| `AUTH0_CLIENT_SECRET` | Yes |
| `AUTH0_SECRET` | Yes |
| `APP_BASE_URL` | No |
| `AUTH0_AUDIENCE` | No |
| `AUTH0_SCOPE` | No |

## Vercel CLI

If using the Vercel CLI instead of the dashboard:

```bash
vercel env add AUTH0_DOMAIN preview --no-sensitive
vercel env add AUTH0_CLIENT_ID preview --no-sensitive
vercel env add AUTH0_CLIENT_SECRET preview --sensitive
vercel env add AUTH0_SECRET preview --sensitive
vercel env add AUTH0_AUDIENCE preview --no-sensitive
vercel env add AUTH0_SCOPE preview --no-sensitive
```

