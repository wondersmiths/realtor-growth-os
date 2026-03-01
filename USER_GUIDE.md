# User Guide — Realtor Growth OS

A complete guide to using Realtor Growth OS to manage your contacts, events, messaging, deals, and ROI tracking.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Contact Management](#3-contact-management)
4. [Events](#4-events)
5. [Open Houses](#5-open-houses)
6. [Lead Capture](#6-lead-capture)
7. [Messaging](#7-messaging)
8. [Automations](#8-automations)
9. [Deal Tracking](#9-deal-tracking)
10. [Property Appreciation](#10-property-appreciation)
11. [ROI Dashboard](#11-roi-dashboard)
12. [Public Pages](#12-public-pages)

---

## 1. Getting Started

### First Login

1. Navigate to your app URL — you'll be redirected to the login page.
2. Enter your email address and click **Send magic link**.
3. Check your email inbox (and spam/junk folder) for the magic link.
4. Click the link — you'll be authenticated and redirected to the app.

No password is needed. A new magic link is sent each time you sign in.

### Creating Your Profile

Your realtor profile powers AI-generated messages and personalizes the experience. The profile is stored in the `realtors` table and includes:

| Field | Purpose |
|---|---|
| **Name** | Used in AI messages (e.g. "Hi Sarah, it's [Your Name]...") |
| **Email** | Your contact email |
| **Phone** | Your phone number |
| **City** | Used by AI to include local details in messages |
| **Profile Bio** | Used by AI to personalize message tone and content |

Your admin will set this up during initial deployment. To update your profile later, contact your admin or edit directly in the Supabase dashboard.

### Navigation

Once logged in, the main navigation bar gives you access to:

- **Dashboard** — ROI metrics and analytics
- **Contacts** — Contact/lead management
- **Events** — Event management and RSVP links
- **Open Houses** — Open house management and sign-in links
- **Sign out** — End your session

---

## 2. Dashboard

The dashboard at `/dashboard` provides a real-time overview of your outreach performance and ROI.

### Metrics Explained

| Metric | What It Shows |
|---|---|
| **Total Contacts** | The total number of contacts in your database, across all source channels |
| **Messages Sent** | Number of messages with "sent" status delivered in the current calendar month |
| **Influenced Deals** | Count of closed deals where the system detected that your messaging influenced the outcome (see [Deal Attribution](#attribution)) |
| **Influenced Revenue** | Total dollar value of all influenced closed deals |
| **ROI** | Return on investment calculated as: influenced revenue ÷ $500 monthly cost |

### Contacts by Source Chart

The bar chart breaks down your contacts by how they entered your system:

| Source | How Contacts Arrive |
|---|---|
| **Manual** | You added them directly through the contacts page |
| **Event** | They filled out an RSVP form for one of your events |
| **Open House** | They signed in at one of your open houses |

Each bar shows the count and percentage of total contacts from that source.

---

## 3. Contact Management

Manage your leads and contacts at `/contacts`.

### Adding a Contact Manually

1. Navigate to **Contacts**.
2. Fill in the contact form:
   - **First Name** (required)
   - **Last Name** (optional)
   - **Email** (optional)
   - **Phone** (optional)
   - **Consent** checkbox — check if the contact has agreed to receive messages
3. Click **Add Contact**.

Manually added contacts are tagged with source channel `manual`.

### Viewing Contacts

All your contacts appear in a list showing their name, contact info, source channel, and consent status.

### Editing a Contact

Click on a contact to view their details. You can update any field including:

- Name, email, phone
- Consent status
- Property details (purchase year, estimated value, original purchase price)
- Tags

### Deleting a Contact

Delete a contact from the contact detail view. This is permanent and also removes them from future automations and messaging.

### Source Channels

Every contact has a source channel indicating how they entered your system:

| Source | How It's Set |
|---|---|
| `manual` | You created the contact directly |
| `event` | Contact submitted an event RSVP form |
| `open_house` | Contact signed in at an open house |

### Consent Tracking

Consent is critical for compliance:

- **Consent = true**: The contact has agreed to receive follow-up messages. You can send them SMS.
- **Consent = false**: The contact has not consented. The system will block any attempt to message them.
- **Unsubscribed = true**: The contact has opted out. Even if they originally consented, messages are blocked.

Consent is captured during RSVP and open house sign-in via a checkbox. For manually added contacts, you set consent when creating or editing the contact.

---

## 4. Events

Manage events at `/events`. Events are used for community gatherings, networking events, seminars, or any occasion where you want to capture leads via RSVP.

### Creating an Event

1. Navigate to **Events**.
2. Fill in the event form:
   - **Title** (required) — the event name
   - **Description** (optional) — details shown on the RSVP page
   - **Date & Time** (optional) — when the event takes place
   - **Location** (optional) — where the event is held
3. Click **Create Event**.

### RSVP Links

After creating an event, you receive a shareable RSVP link:

```
https://your-app.vercel.app/rsvp/<event-id>
```

Share this link with potential attendees. When they fill out the form, they're automatically added to your contacts with source channel `event`.

### QR Codes

The app generates a QR code for each event's RSVP link. Use these QR codes on:

- Printed flyers and postcards
- Social media posts
- Email invitations
- Event signage

Anyone who scans the QR code is taken directly to the RSVP form.

---

## 5. Open Houses

Manage open houses at `/open-house`. Open houses work similarly to events but are specifically designed for property showings.

### Creating an Open House

1. Navigate to **Open Houses**.
2. Fill in the form:
   - **Title** (required) — e.g. "Open House at 123 Main St"
   - **Property Address** (optional) — shown on the sign-in page
   - **Description** (optional) — property details
   - **Date & Time** (optional) — when the open house takes place
   - **Location** (optional) — address or directions
3. Click **Create Open House**.

### Sign-In Links

Each open house gets a shareable sign-in link:

```
https://your-app.vercel.app/sign-in/<open-house-id>
```

### QR Codes

Print the QR code and display it at your open house entrance. Visitors scan it on their phone to fill out the sign-in form — no paper sign-in sheets needed.

---

## 6. Lead Capture

Lead capture happens automatically through your public RSVP and sign-in forms.

### How It Works

1. You create an event or open house in the app.
2. The app generates a unique link and QR code.
3. You share the link or display the QR code.
4. Visitors fill out the form with their info:
   - **First Name** (required)
   - **Last Name** (optional)
   - **Email** (optional)
   - **Phone** (optional)
   - **Consent** checkbox — "I consent to receive follow-up messages"
5. The system automatically creates a new contact in your database.

### Consent During Capture

The RSVP and sign-in forms include a consent checkbox. If the visitor checks it, consent is recorded as `true` and you can message them. If they leave it unchecked, consent is `false` and the system will block messaging until consent is updated.

### Automatic Contact Creation

When someone submits a public form:

- A new contact is created with the appropriate source channel (`event` or `open_house`).
- The contact is linked to your realtor account.
- If they provided a phone number and gave consent, they're ready to receive SMS.

---

## 7. Messaging

Send personalized messages to your contacts. Messages can be AI-generated or written manually.

### AI-Generated Messages

When you send a message without providing manual content, the system uses OpenAI's GPT-4o-mini model to generate a personalized SMS:

- Messages are kept under 160 characters.
- The AI includes a local detail about your city/neighborhood (pulled from your profile).
- Messages use a warm, personal tone with no hashtags or emojis.
- The contact is addressed by their first name.

Your realtor profile's **city** and **profile_bio** fields help the AI craft more relevant messages.

### Manual Messages

You can write your own message content instead of using AI generation. Simply provide the message text when sending.

### Compliance Rules

The system enforces strict messaging compliance to protect you and your contacts:

| Rule | Details |
|---|---|
| **Consent Required** | The contact must have `consent = true`. Messages to non-consented contacts are blocked. |
| **Unsubscribe Honored** | If a contact has `unsubscribed = true`, all messages are blocked regardless of prior consent. |
| **Monthly Limit** | Maximum **4 messages per contact per month**. The system tracks this automatically. |
| **Minimum Spacing** | Must wait at least **48 hours** between messages to the same contact. |

If any compliance rule is violated, the message is blocked and the API returns a `403 Forbidden` response with the specific reason.

### Message Delivery

When you send a message:

1. The system checks all compliance rules.
2. If no manual content was provided, an AI message is generated.
3. If the contact has a phone number, the message is sent via Twilio SMS.
4. The message is saved with a status: `sent`, `failed`, or `pending`.
5. The contact's `monthly_message_count` is incremented.
6. The contact's `last_message_at` timestamp is updated.

---

## 8. Automations

Automations let you set up rules that take action automatically when certain conditions are met. Manage automations via the API.

### Trigger Types

Automations fire based on one of three trigger types:

#### Event-Based Triggers

Respond to specific events in the system.

- **Trigger type**: `event_based`
- **Configuration**: `{ "event": "<event_name>" }`
- **Example events**: `new_contact`, `rsvp`
- **Use case**: Automatically send a welcome message when a new contact is added.

#### Time-Delay Triggers

Fire after a set number of days since the contact was created.

- **Trigger type**: `time_delay`
- **Configuration**: `{ "days_after_creation": <number> }`
- **Example**: `{ "days_after_creation": 7 }` — triggers 7 days after contact creation.
- **Use case**: Send a follow-up message one week after meeting someone at an open house.

#### Channel-Based Triggers

Fire when a contact's source channel matches a specific value.

- **Trigger type**: `channel_based`
- **Configuration**: `{ "channel": "manual" | "event" | "open_house" }`
- **Example**: `{ "channel": "open_house" }` — triggers for all open house leads.
- **Use case**: Automatically tag all open house visitors.

### Action Types

When a trigger fires, one of these actions is executed:

#### Send Message

Sends a message to the contact (follows all compliance rules).

- **Action type**: `send_message`
- **Configuration**: `{ "template": "<template_name>" }`
- **Default template**: `general_followup`
- **Note**: Compliance rules still apply — if the contact hasn't consented or has hit their monthly limit, the message won't send.

#### Add Tag

Adds a tag to the contact for organization and filtering.

- **Action type**: `add_tag`
- **Configuration**: `{ "tag": "<tag_name>" }`
- **Example**: `{ "tag": "open_house_lead" }`

### Creating an Automation

Send a POST request to `/api/automations` with:

```json
{
  "name": "Welcome New Open House Leads",
  "trigger_type": "channel_based",
  "trigger_config": { "channel": "open_house" },
  "action_type": "send_message",
  "action_config": { "template": "general_followup" }
}
```

### Running Automations

Automations are evaluated when you call `POST /api/automations/run` with:

```json
{
  "event": "new_contact",
  "contact_id": "<contact-uuid>"
}
```

The system evaluates all enabled automations against the provided context and executes matching ones.

### Enabling / Disabling

Automations have an `enabled` flag. When set to `false`, the automation is skipped during evaluation.

---

## 9. Deal Tracking

Track your real estate deals and see which ones were influenced by your outreach. Manage deals via the API.

### Creating a Deal

Send a POST request to `/api/deals` with:

```json
{
  "contact_id": "<contact-uuid>",
  "property_address": "123 Main St",
  "deal_value": 450000,
  "status": "active"
}
```

### Deal Statuses

| Status | Meaning |
|---|---|
| `active` | Deal is in progress |
| `closed` | Deal has closed successfully |
| `lost` | Deal fell through |

### Attribution

When a deal is created with `status: "closed"` and a `closed_date`, the system automatically checks for attribution:

1. It looks at the deal's linked contact.
2. It searches for any messages with status `sent` delivered to that contact.
3. If any sent message falls within a **90-day window** before the deal's close date, the deal is marked as `influenced_by_system = true`.
4. Influenced deals count toward your ROI metrics.

**Example**: You message a contact on January 15. They close a deal on March 1 (45 days later). Since 45 days < 90 days, this deal is attributed to your outreach.

---

## 10. Property Appreciation

The property appreciation feature identifies contacts whose property values have grown significantly, creating an opportunity for outreach.

### How It Works

For each contact with property data, the system calculates:

```
appreciation = (estimated_property_value - original_purchase_price) / original_purchase_price
```

### 20% Threshold

If the appreciation is **20% or greater**, the feature triggers. This means the contact's property has gained at least 20% in value since they purchased it — a strong signal that they might be interested in selling, refinancing, or buying a new property.

### Required Contact Fields

For appreciation to be calculated, the contact must have:

- `purchase_year` — the year they bought the property
- `estimated_property_value` — current estimated value
- `original_purchase_price` — what they paid (must be greater than 0)

### One-Time Trigger

Appreciation is a **one-time trigger** per contact. Once `appreciation_triggered` is set to `true`, it will not trigger again for the same contact — even if the property continues to appreciate. This prevents repeated notifications for the same opportunity.

---

## 11. ROI Dashboard

The ROI dashboard helps you understand the financial return of your outreach efforts.

### How ROI Is Calculated

```
ROI = Influenced Revenue ÷ Monthly Cost
```

- **Influenced Revenue**: The total `deal_value` of all deals where `influenced_by_system = true` and `status = 'closed'`.
- **Monthly Cost**: Defaults to **$500/month** — this represents your estimated cost of using the platform (subscription, Twilio credits, OpenAI usage, etc.).

**Example**: If you have $150,000 in influenced closed deals and a $500/month cost:

```
ROI = $150,000 ÷ $500 = 300x
```

This means for every $500 spent, you influenced $150,000 in revenue.

### What Counts as "Influenced"

A deal is influenced if:

1. The deal status is `closed`.
2. The deal has a `closed_date`.
3. A message with status `sent` was delivered to the deal's linked contact within 90 days before the close date.

See [Deal Tracking > Attribution](#attribution) for full details.

---

## 12. Public Pages

Public pages are accessible to anyone — no login required. The navigation bar is not shown on these pages.

### Event RSVP Page

**URL**: `/rsvp/<event-id>`

This page displays:
- Event title
- Event description
- Event date and time
- Event location
- RSVP form (first name, last name, email, phone, consent checkbox)

When submitted, a new contact is created with source channel `event`.

### Open House Sign-In Page

**URL**: `/sign-in/<open-house-id>`

This page displays:
- Open house title / property address
- Event date and time
- Sign-in form (first name, last name, email, phone, consent checkbox)

When submitted, a new contact is created with source channel `open_house`.

### Sharing Public Pages

For each event or open house, the app provides:

1. **Direct link** — copy and paste to share via text, email, or social media.
2. **QR code** — a 300×300px QR code image you can download and print for physical signage, flyers, or table displays.

### No Authentication Required

Public pages are intentionally accessible without login so that:
- Event attendees can RSVP without creating an account.
- Open house visitors can sign in quickly on their phones.
- The forms work on any device with a web browser.
