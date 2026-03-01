# Deployment Guide — Realtor Growth OS

A complete guide to deploying and maintaining your Realtor Growth OS instance.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Project Setup](#2-supabase-project-setup)
3. [Environment Variable Reference](#3-environment-variable-reference)
4. [Local Development Setup](#4-local-development-setup)
5. [Vercel Deployment](#5-vercel-deployment)
6. [First Account Creation](#6-first-account-creation)
7. [Post-Deployment Checklist](#7-post-deployment-checklist)
8. [Custom Domain & SSL](#8-custom-domain--ssl)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### System Requirements

- **Node.js** >= 20.0.0 (`node --version` to check)
- **npm** >= 9 (ships with Node 20)
- **Git** for version control

### Accounts & Services

| Service | Purpose | Sign-up |
|---|---|---|
| [Supabase](https://supabase.com) | Database, auth, and row-level security | Free tier available |
| [Vercel](https://vercel.com) | Hosting and serverless deployment | Free tier available |
| [OpenAI](https://platform.openai.com) | AI-powered message generation (GPT-4o-mini) | Pay-as-you-go |
| [Twilio](https://www.twilio.com) | SMS delivery | Pay-as-you-go |

### Twilio Setup

1. Create a Twilio account and verify your identity.
2. Purchase an SMS-enabled phone number from the Twilio console.
3. Note your **Account SID**, **Auth Token**, and the **phone number** (in E.164 format, e.g. `+15551234567`).

### OpenAI Setup

1. Create an OpenAI platform account.
2. Generate an API key from the [API keys page](https://platform.openai.com/api-keys).
3. Ensure your account has billing enabled — the app uses the `gpt-4o-mini` model.

---

## 2. Supabase Project Setup

### Create the Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Choose your organization, name the project (e.g. `realtor-growth-os`), set a strong database password, and select a region close to your users.
3. Wait for the project to finish provisioning.

### Collect API Credentials

From your Supabase project dashboard, go to **Settings > API** and note:

- **Project URL** — e.g. `https://abcdefgh.supabase.co`
- **anon (public) key** — safe to expose client-side
- **service_role key** — keep this secret; never expose in browser code

### Run the Database Schema

1. In the Supabase dashboard, open the **SQL Editor**.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.
3. This creates all tables, enums, and RLS policies:

| Table | Purpose |
|---|---|
| `realtors` | Realtor profiles linked to auth users |
| `contacts` | Lead/contact database |
| `events` | Events and open houses |
| `messages` | Message history and delivery status |
| `deals` | Deal tracking with system attribution |
| `automations` | Automation workflows |

4. Verify the tables were created by checking the **Table Editor** in the sidebar.

### Configure Authentication

1. Go to **Authentication > URL Configuration**.
2. Set the **Site URL** to your production URL (e.g. `https://your-app.vercel.app`).
3. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
4. Go to **Authentication > Providers** and ensure **Email** is enabled:
   - Turn on **Confirm email** (this enables the magic-link flow).
   - Disable password sign-in if you only want magic links.

### Email Templates (Optional)

Go to **Authentication > Email Templates** to customize the magic-link email. The default template works fine, but you can brand it with your name and logo.

---

## 3. Environment Variable Reference

All 8 required environment variables:

| Variable | Where Used | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Your Supabase project URL (e.g. `https://abcdefgh.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key for browser requests |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key — bypasses RLS for server-side operations. **Keep secret.** |
| `OPENAI_API_KEY` | Server only | OpenAI API key for AI message generation (GPT-4o-mini) |
| `TWILIO_ACCOUNT_SID` | Server only | Twilio account SID for SMS delivery |
| `TWILIO_AUTH_TOKEN` | Server only | Twilio auth token for SMS delivery. **Keep secret.** |
| `TWILIO_PHONE_NUMBER` | Server only | Your Twilio phone number in E.164 format (e.g. `+15551234567`) |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Your app's base URL — used for generating RSVP/sign-in links and QR codes |

**Important:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-only.
- Never commit `.env.local` to version control — it's already in `.gitignore`.

---

## 4. Local Development Setup

### Clone and Install

```bash
git clone <your-repo-url>
cd realtor_growth_os
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all 8 variables. For local development, set:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/auth/login` since no session exists.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build (checks for TypeScript errors) |
| `npm run start` | Start production server (run `build` first) |
| `npm run lint` | Run ESLint |

---

## 5. Vercel Deployment

### Connect Your Repository

1. Push your code to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and click **Import** next to your repo.
3. Vercel will auto-detect Next.js and configure the build settings.

### Set Environment Variables

In the Vercel project, go to **Settings > Environment Variables** and add all 8 variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_APP_URL` — set to your Vercel URL (e.g. `https://your-app.vercel.app`)

Select **Production**, **Preview**, and **Development** environments for each variable.

### Deploy

Click **Deploy**. Vercel will build and deploy automatically. Subsequent pushes to your main branch trigger automatic re-deploys.

### Update Supabase Redirect URLs

After your first deploy, copy your Vercel URL and ensure it's added to Supabase:

1. Go to **Authentication > URL Configuration** in Supabase.
2. Set the **Site URL** to your Vercel URL.
3. Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**.

---

## 6. First Account Creation

The app uses Supabase Auth for authentication and requires a matching row in the `realtors` table. Here's how to create your first account:

### Step 1 — Sign In via Magic Link

1. Visit your deployed app at its URL — you'll land on `/auth/login`.
2. Enter your email address and click **Send magic link**.
3. Check your inbox (and spam/junk folder) for the magic link email.
4. Click the link — you'll be redirected back to the app and authenticated.

### Step 2 — Create Your Realtor Profile

After signing in, your auth user exists but there's no realtor profile yet. Create one via the Supabase SQL Editor:

1. Go to **Authentication > Users** in Supabase and copy your user's UUID.
2. Open the **SQL Editor** and run:

```sql
INSERT INTO realtors (id, name, email, phone, city, profile_bio)
VALUES (
  'your-auth-user-uuid',   -- paste UUID from step 1
  'Your Full Name',
  'you@example.com',
  '+15551234567',           -- your phone (optional)
  'Your City',              -- used in AI-generated messages
  'Brief bio about you'     -- used in AI-generated messages (optional)
);
```

3. Refresh the app — you'll now have access to all features.

**Tip:** The `city` and `profile_bio` fields are used by the AI message generator to personalize messages with local details. Fill them in for best results.

---

## 7. Post-Deployment Checklist

Run through this checklist after deploying:

- [ ] App loads at your production URL
- [ ] Magic link login works (email arrives, callback succeeds)
- [ ] Realtor profile is created in the `realtors` table
- [ ] Dashboard loads at `/dashboard`
- [ ] Can create a contact at `/contacts`
- [ ] Can create an event at `/events`
- [ ] Can create an open house at `/open-house`
- [ ] RSVP form works at `/rsvp/<event-id>` (test with an event you created)
- [ ] Open house sign-in works at `/sign-in/<open-house-id>`
- [ ] QR code generation works for events and open houses
- [ ] SMS sends successfully (create a consented contact with a valid phone, then message them)
- [ ] AI message generation works (send a message without manual content)
- [ ] `npm run build` passes without errors

---

## 8. Custom Domain & SSL

### Vercel Custom Domain

1. In your Vercel project, go to **Settings > Domains**.
2. Add your custom domain (e.g. `app.yourdomain.com`).
3. Vercel will provide DNS records — add these at your domain registrar.
4. SSL is provisioned automatically by Vercel.

### Update Configuration After Domain Change

When switching to a custom domain, update these values:

1. **Vercel**: Update `NEXT_PUBLIC_APP_URL` environment variable to your new domain.
2. **Supabase**: Update the **Site URL** and **Redirect URLs** in Authentication > URL Configuration:
   - Site URL: `https://app.yourdomain.com`
   - Add redirect URL: `https://app.yourdomain.com/auth/callback`
3. **Redeploy** the Vercel app so the new `NEXT_PUBLIC_APP_URL` takes effect.

---

## 9. Monitoring & Maintenance

### Vercel Monitoring

- **Deployments**: View build logs and deployment status in the Vercel dashboard.
- **Functions**: Monitor serverless function invocations and errors under **Analytics > Functions**.
- **Logs**: Check real-time function logs under **Logs** for debugging API issues.

### Supabase Monitoring

- **Database**: Monitor table sizes and query performance under **Database > Reports**.
- **Auth**: View sign-in activity under **Authentication > Users**.
- **Logs**: Check API logs under **Logs > Edge Functions** and **Logs > Postgres**.

### Twilio Monitoring

- **Message Logs**: Check SMS delivery status in the Twilio console under **Messaging > Logs**.
- **Error Alerts**: Set up alerts for failed messages in **Monitor > Alerts**.

### OpenAI Monitoring

- **Usage**: Monitor API usage and costs at [platform.openai.com/usage](https://platform.openai.com/usage).
- **Rate Limits**: The app uses `gpt-4o-mini` with max 100 tokens per message — usage is minimal.

### Regular Maintenance

- **Monthly message counts**: The `monthly_message_count` field on contacts tracks messages per month for compliance. Consider resetting these monthly if you implement long-running usage, or track by checking `last_message_at` timestamps.
- **Database backups**: Supabase provides automatic daily backups on paid plans. For free-tier projects, export your data periodically via the Supabase dashboard.

---

## 10. Troubleshooting

### Authentication Issues

**Magic link email not arriving**
- Check your spam/junk folder.
- Verify the email provider is configured in Supabase **Authentication > Email Templates**.
- Ensure the **Site URL** in Supabase matches your app's URL.
- Check Supabase **Logs** for email delivery errors.
- On Supabase free tier, there's a rate limit of 4 emails per hour.

**"Unauthorized" errors on all API routes**
- Ensure you're signed in — the middleware redirects to `/auth/login` if not authenticated.
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
- Check that cookies are not being blocked by your browser.

**Auth callback fails or loops**
- Ensure `https://your-app.vercel.app/auth/callback` is listed in Supabase **Redirect URLs**.
- For local dev, add `http://localhost:3000/auth/callback`.
- Verify `NEXT_PUBLIC_APP_URL` matches the domain you're accessing the app from.

### SMS Issues

**SMS not sending**
- Verify your Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`).
- Ensure the recipient's phone number is in E.164 format (e.g. `+15551234567`).
- Check the Twilio console **Messaging > Logs** for delivery errors.
- Twilio trial accounts can only send to verified phone numbers.

**Compliance blocks sending**
- The contact must have `consent = true`.
- The contact must not be unsubscribed (`unsubscribed = false`).
- Maximum 4 messages per contact per month.
- Must wait 48 hours between messages to the same contact.
- Check the API response for a specific compliance error message.

### AI Message Generation Issues

**AI-generated messages failing**
- Verify your `OPENAI_API_KEY` is valid.
- Ensure your OpenAI account has billing enabled and sufficient credits.
- The app uses `gpt-4o-mini` — ensure your API key has access to this model.
- Check Vercel function logs for the specific error.

**Messages are generic or impersonal**
- Fill in `city` and `profile_bio` on your realtor profile — these are included in the AI prompt.
- The AI prompt instructs the model to include local details and address the contact by first name.

### Build Errors

**Build fails locally**
- Ensure Node.js >= 20 is installed (`node --version`).
- Delete `node_modules` and `package-lock.json`, then run `npm install`.
- Run `npm run build` to see specific TypeScript errors.

**Build fails on Vercel**
- Check that all 8 environment variables are set in Vercel project settings.
- Ensure variables are enabled for the correct environment (Production/Preview/Development).
- Review the build log in the Vercel dashboard for the specific error.

### Row-Level Security (RLS) Issues

**"Permission denied" or empty data returned**
- RLS policies restrict access per realtor. Each realtor can only see their own data.
- Ensure the authenticated user's UUID matches the `realtor_id` or `id` on the rows you expect to see.
- The `realtors` table requires `id` to match `auth.uid()`.
- Public endpoints (RSVP, sign-in) bypass auth but use the Supabase service role client.

**Contacts created via RSVP/sign-in not appearing**
- These contacts are created server-side using the service role key, which bypasses RLS.
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly.
- Check that the event/open-house ID in the URL is valid.

### Common HTTP Status Codes

| Code | Meaning | Common Cause |
|---|---|---|
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing required fields (e.g. `first_name` on contact) |
| 401 | Unauthorized | Not authenticated — session expired or missing |
| 403 | Forbidden | Compliance check failed (consent, limits, unsubscribed) |
| 404 | Not Found | Invalid event/open-house/contact ID |
| 500 | Internal Server Error | Missing env vars, Supabase/Twilio/OpenAI service error |
