export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  profile_bio?: string;
  created_at: string;
}

export type SourceChannel = "manual" | "event" | "open_house";

export interface Contact {
  id: string;
  realtor_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  source_channel: SourceChannel;
  consent: boolean;
  unsubscribed: boolean;
  monthly_message_count: number;
  last_message_at?: string;
  purchase_year?: number;
  estimated_property_value?: number;
  original_purchase_price?: number;
  appreciation_triggered: boolean;
  tags: string[];
  created_at: string;
}

export type DealStatus = "active" | "closed" | "lost";

export interface Deal {
  id: string;
  realtor_id: string;
  contact_id?: string;
  property_address?: string;
  deal_value?: number;
  status: DealStatus;
  closed_date?: string;
  influenced_by_system: boolean;
  created_at: string;
}

export type EventType = "event" | "open_house";

export interface Event {
  id: string;
  realtor_id: string;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  property_address?: string;
  event_type: EventType;
  created_at: string;
}

export type MessageChannel = "sms" | "email";
export type MessageStatus = "sent" | "failed" | "pending";

export interface Message {
  id: string;
  realtor_id: string;
  contact_id: string;
  content: string;
  channel: MessageChannel;
  status: MessageStatus;
  sent_at?: string;
  created_at: string;
}

export type TriggerType = "event_based" | "time_delay" | "channel_based";

export interface Automation {
  id: string;
  realtor_id: string;
  name: string;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_contacts: number;
  contacts_by_source: Record<string, number>;
  monthly_messages_sent: number;
  influenced_deals: number;
  influenced_revenue: number;
  roi: number;
  stale_contacts: number;
  eligible_contacts: number;
  upcoming_events: { id: string; title: string; event_date: string }[];
  recent_messages: {
    id: string;
    content: string;
    status: string;
    created_at: string;
    contacts: { first_name: string; last_name?: string };
  }[];
  recent_contacts: {
    id: string;
    first_name: string;
    last_name?: string;
    source_channel: string;
    created_at: string;
  }[];
}
