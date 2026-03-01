-- Realtor Growth OS — Full Schema + RLS
-- Run in Supabase SQL Editor

-- ============ ENUMS ============
CREATE TYPE source_channel AS ENUM ('manual', 'event', 'open_house');
CREATE TYPE deal_status    AS ENUM ('active', 'closed', 'lost');
CREATE TYPE event_type     AS ENUM ('event', 'open_house');
CREATE TYPE message_channel AS ENUM ('sms', 'email');
CREATE TYPE message_status  AS ENUM ('sent', 'failed', 'pending');
CREATE TYPE trigger_type    AS ENUM ('event_based', 'time_delay', 'channel_based');

-- ============ TABLES ============

-- Realtors (profile linked to auth.users)
CREATE TABLE realtors (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  city          text,
  profile_bio   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE realtors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own profile"
  ON realtors FOR SELECT USING (id = auth.uid());
CREATE POLICY "Realtors can update own profile"
  ON realtors FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Realtors can insert own profile"
  ON realtors FOR INSERT WITH CHECK (id = auth.uid());

-- Contacts
CREATE TABLE contacts (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id               uuid NOT NULL REFERENCES realtors(id) ON DELETE CASCADE,
  first_name               text NOT NULL,
  last_name                text,
  email                    text,
  phone                    text,
  source_channel           source_channel NOT NULL DEFAULT 'manual',
  consent                  boolean NOT NULL DEFAULT false,
  unsubscribed             boolean NOT NULL DEFAULT false,
  monthly_message_count    integer NOT NULL DEFAULT 0,
  last_message_at          timestamptz,
  purchase_year            integer,
  estimated_property_value numeric,
  original_purchase_price  numeric,
  appreciation_triggered   boolean NOT NULL DEFAULT false,
  tags                     text[] DEFAULT '{}',
  created_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own contacts"
  ON contacts FOR SELECT USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can insert own contacts"
  ON contacts FOR INSERT WITH CHECK (realtor_id = auth.uid());
CREATE POLICY "Realtors can update own contacts"
  ON contacts FOR UPDATE USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can delete own contacts"
  ON contacts FOR DELETE USING (realtor_id = auth.uid());

-- Public insert policy for RSVP / sign-in (service role bypasses RLS,
-- but we also allow anon inserts so public forms work without auth)
CREATE POLICY "Public can insert contacts via forms"
  ON contacts FOR INSERT WITH CHECK (true);

-- Deals
CREATE TABLE deals (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id           uuid NOT NULL REFERENCES realtors(id) ON DELETE CASCADE,
  contact_id           uuid REFERENCES contacts(id) ON DELETE SET NULL,
  property_address     text,
  deal_value           numeric,
  status               deal_status NOT NULL DEFAULT 'active',
  closed_date          date,
  influenced_by_system boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own deals"
  ON deals FOR SELECT USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can insert own deals"
  ON deals FOR INSERT WITH CHECK (realtor_id = auth.uid());
CREATE POLICY "Realtors can update own deals"
  ON deals FOR UPDATE USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can delete own deals"
  ON deals FOR DELETE USING (realtor_id = auth.uid());

-- Events
CREATE TABLE events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id       uuid NOT NULL REFERENCES realtors(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  event_date       timestamptz,
  location         text,
  property_address text,
  event_type       event_type NOT NULL DEFAULT 'event',
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own events"
  ON events FOR SELECT USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can insert own events"
  ON events FOR INSERT WITH CHECK (realtor_id = auth.uid());
CREATE POLICY "Realtors can update own events"
  ON events FOR UPDATE USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can delete own events"
  ON events FOR DELETE USING (realtor_id = auth.uid());
-- Public select so RSVP/sign-in pages can fetch event info
CREATE POLICY "Public can view events"
  ON events FOR SELECT USING (true);

-- Messages
CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id  uuid NOT NULL REFERENCES realtors(id) ON DELETE CASCADE,
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content     text NOT NULL,
  channel     message_channel NOT NULL DEFAULT 'sms',
  status      message_status NOT NULL DEFAULT 'pending',
  sent_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own messages"
  ON messages FOR SELECT USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can insert own messages"
  ON messages FOR INSERT WITH CHECK (realtor_id = auth.uid());

-- Automations
CREATE TABLE automations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id      uuid NOT NULL REFERENCES realtors(id) ON DELETE CASCADE,
  name            text NOT NULL,
  trigger_type    trigger_type NOT NULL,
  trigger_config  jsonb NOT NULL DEFAULT '{}',
  action_type     text NOT NULL,
  action_config   jsonb NOT NULL DEFAULT '{}',
  enabled         boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors can view own automations"
  ON automations FOR SELECT USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can insert own automations"
  ON automations FOR INSERT WITH CHECK (realtor_id = auth.uid());
CREATE POLICY "Realtors can update own automations"
  ON automations FOR UPDATE USING (realtor_id = auth.uid());
CREATE POLICY "Realtors can delete own automations"
  ON automations FOR DELETE USING (realtor_id = auth.uid());
