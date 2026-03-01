import { SupabaseClient } from "@supabase/supabase-js";
import { Automation, Contact } from "./types";
import { sendMessageToContact } from "./messages";

interface TriggerContext {
  event?: string; // e.g. "new_contact", "rsvp"
  contact?: Contact;
  days_since_creation?: number;
}

export function evaluateTrigger(
  automation: Automation,
  context: TriggerContext
): boolean {
  const config = automation.trigger_config as Record<string, unknown>;

  switch (automation.trigger_type) {
    case "event_based":
      return config.event === context.event;

    case "time_delay": {
      const delayDays = (config.days_after_creation as number) || 0;
      return (context.days_since_creation ?? 0) >= delayDays;
    }

    case "channel_based":
      return context.contact?.source_channel === config.channel;

    default:
      return false;
  }
}

export interface ActionResult {
  success: boolean;
  action: string;
  detail?: string;
}

export async function executeAction(
  supabase: SupabaseClient,
  automation: Automation,
  contact: Contact,
  realtorId: string
): Promise<ActionResult> {
  const config = automation.action_config as Record<string, unknown>;

  switch (automation.action_type) {
    case "send_message": {
      const result = await sendMessageToContact(supabase, {
        contact_id: contact.id,
        realtor_id: realtorId,
        template: (config.template as string) || "general_followup",
      });
      return {
        success: result.success,
        action: "send_message",
        detail: result.success
          ? `Message to ${contact.first_name}`
          : result.error || "Message send failed",
      };
    }

    case "add_tag": {
      return {
        success: true,
        action: "add_tag",
        detail: `Tag "${config.tag}" for ${contact.first_name}`,
      };
    }

    default:
      return { success: false, action: automation.action_type, detail: "Unknown action" };
  }
}
