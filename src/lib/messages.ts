import { SupabaseClient } from "@supabase/supabase-js";
import { checkMessageCompliance } from "./compliance";
import { generateMessage } from "./ai-message";
import { sendEmail } from "./email";
import { Contact, Realtor } from "./types";

interface SendMessageInput {
  contact_id: string;
  realtor_id: string;
  template?: string;
  content?: string;
}

interface SendMessageResult {
  success: boolean;
  message?: Record<string, unknown>;
  error?: string;
  status?: number;
}

export async function sendMessageToContact(
  supabase: SupabaseClient,
  input: SendMessageInput
): Promise<SendMessageResult> {
  const { contact_id, realtor_id, template, content: manualContent } = input;

  // Fetch contact
  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contact_id)
    .eq("realtor_id", realtor_id)
    .single();

  if (contactError || !contact) {
    return { success: false, error: "Contact not found", status: 404 };
  }

  // Compliance check
  const compliance = checkMessageCompliance(contact as Contact);
  if (!compliance.allowed) {
    return { success: false, error: compliance.reason || "Compliance blocked", status: 403 };
  }

  // Fetch realtor profile
  const { data: realtor } = await supabase
    .from("realtors")
    .select("*")
    .eq("id", realtor_id)
    .single();

  const realtorData = realtor as Realtor | null;

  // Generate or use manual content
  let messageContent = manualContent;
  if (!messageContent) {
    try {
      messageContent = await generateMessage({
        contactName: contact.first_name,
        realtorName: realtorData?.name || "Your Realtor",
        realtorCity: realtorData?.city || undefined,
        realtorBio: realtorData?.profile_bio || undefined,
        template,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "AI message generation failed";
      return { success: false, error: errMsg, status: 500 };
    }
  }

  // Send email if address available
  let status: "sent" | "failed" | "pending" = "pending";
  if (contact.email) {
    const subject = template
      ? `${template.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} from ${realtorData?.name || "Your Realtor"}`
      : `A message from ${realtorData?.name || "Your Realtor"}`;
    const emailResult = await sendEmail(contact.email, subject, messageContent);
    status = emailResult.success ? "sent" : "failed";
  }

  // Save message record
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      realtor_id,
      contact_id,
      content: messageContent,
      channel: "email",
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (msgError) {
    return { success: false, error: msgError.message, status: 500 };
  }

  // Update contact message tracking
  await supabase
    .from("contacts")
    .update({
      monthly_message_count: (contact.monthly_message_count || 0) + 1,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", contact_id);

  return { success: true, message: message as Record<string, unknown> };
}
