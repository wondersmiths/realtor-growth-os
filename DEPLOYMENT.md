# Deployment Guide — Realtor Growth OS

## Prerequisites

- Node.js >= 20
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account
- An [OpenAI](https://platform.openai.com) API key
- A [Twilio](https://www.twilio.com) account with an SMS-enabled phone number

---

## 1. Supabase Setup

### Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note your **Project URL** and **anon (public) key** from Settings > API.
3. Note the **service_role key** (keep this secret — never expose it client-side).

### Run the schema

1. Open the SQL Editor in your Supabase dashboard.
2. Paste the contents of `supabase/schema.sql` and run it. This creates all tables, enums, and RLS policies.

### Configure Auth

1. Go to Authentication > URL Configuration.
2. Set the **Site URL** to your production URL (e.g., `https://your-app.vercel.app`).
3. Add redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
4. Under Authentication > Providers, ensure **Email** is enabled with "Confirm email" turned on (magic link flow).

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Fill in all values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key for AI message generation |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164 format, e.g. `+1234567890`) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (`http://localhost:3000` locally, `https://your-app.vercel.app` in prod) |

---

## 3. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/auth/login`.

---

## 4. Vercel Deployment

### Connect the repository

1. Push your code to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel will auto-detect Next.js.

### Set environment variables

In the Vercel project settings (Settings > Environment Variables), add all 8 environment variables listed above. Set `NEXT_PUBLIC_APP_URL` to your production Vercel URL.

### Deploy

Click "Deploy". Vercel will build and deploy automatically. Subsequent pushes to your main branch trigger automatic deploys.

---

## 5. First Account Creation

1. Visit your deployed app URL — you'll land on `/auth/login`.
2. Enter your email and click "Send magic link".
3. Check your email and click the link to authenticate.
4. After signing in, create your realtor profile by inserting a row into the `realtors` table via the Supabase dashboard:

```sql
INSERT INTO realtors (id, name, email, city)
VALUES (
  'your-auth-user-uuid',  -- from Supabase Auth > Users
  'Your Name',
  'you@example.com',
  'Your City'
);
```

---

## 6. Public Pages

These pages work without authentication and are accessible to anyone with the link:

- `/rsvp/[eventId]` — Event RSVP form
- `/sign-in/[propertyId]` — Open house sign-in form
- `/api/events/[id]/rsvp` — RSVP API endpoint
- `/api/open-house/[id]/sign-in` — Open house sign-in API endpoint

Generate QR codes for these URLs to use at events and open houses.

---

## Troubleshooting

### "Unauthorized" errors on all API routes
- Ensure you're signed in. The middleware redirects to `/auth/login` if not authenticated.
- Check that your Supabase URL and anon key are correct.

### Magic link not arriving
- Check Supabase Auth > Email Templates — ensure the email provider is configured.
- Check spam/junk folders.
- Verify the redirect URL in Supabase Auth settings matches your app URL.

### SMS not sending
- Verify your Twilio credentials and phone number.
- Ensure the recipient phone number is in E.164 format.
- Check the Twilio console for error logs.

### AI message generation fails
- Verify your OpenAI API key is valid and has available credits.
- The app uses `gpt-4o-mini` — ensure your API key has access to this model.

### Build errors
- Ensure Node.js >= 20 is installed (`node --version`).
- Run `npm install` to ensure all dependencies are present.
- Run `npm run build` locally to check for TypeScript errors before deploying.
