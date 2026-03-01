import { Contact } from "./types";

interface ComplianceResult {
  allowed: boolean;
  reason?: string;
}

export function checkMessageCompliance(contact: Contact): ComplianceResult {
  if (!contact.consent) {
    return { allowed: false, reason: "Contact has not given consent" };
  }

  if (contact.unsubscribed) {
    return { allowed: false, reason: "Contact has unsubscribed" };
  }

  if (contact.monthly_message_count >= 4) {
    return { allowed: false, reason: "Monthly message limit reached (4/month)" };
  }

  if (contact.last_message_at) {
    const last = new Date(contact.last_message_at).getTime();
    const hoursSince = (Date.now() - last) / (1000 * 60 * 60);
    if (hoursSince < 48) {
      return { allowed: false, reason: "Must wait 48 hours between messages" };
    }
  }

  return { allowed: true };
}
