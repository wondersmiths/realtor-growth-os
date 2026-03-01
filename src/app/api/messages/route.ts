import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkMessageCompliance } from "@/lib/compliance";
import { generateMessage } from "@/lib/ai-message";
import { sendSMS } from "@/lib/sms";
import { Contact, Realtor } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("realtor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contact_id, template, content: manualContent } = body;

  if (!contact_id) {
    return NextResponse.json(
      { error: "Validation failed", message: "contact_id is required" },
      { status: 400 }
    );
  }

  // Fetch contact
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contact_id)
    .eq("realtor_id", user.id)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Compliance check
  const compliance = checkMessageCompliance(contact as Contact);
  if (!compliance.allowed) {
    return NextResponse.json(
      { error: "Compliance blocked", message: compliance.reason },
      { status: 403 }
    );
  }

  // Fetch realtor profile
  const { data: realtor } = await supabase
    .from("realtors")
    .select("*")
    .eq("id", user.id)
    .single();

  const realtorData = realtor as Realtor | null;

  // Generate or use manual content
  let messageContent = manualContent;
  if (!messageContent) {
    messageContent = await generateMessage({
      contactName: contact.first_name,
      realtorName: realtorData?.name || "Your Realtor",
      realtorCity: realtorData?.city || undefined,
      realtorBio: realtorData?.profile_bio || undefined,
      template,
    });
  }

  // Send SMS if phone available
  let status: "sent" | "failed" | "pending" = "pending";
  if (contact.phone) {
    const smsResult = await sendSMS(contact.phone, messageContent);
    status = smsResult.success ? "sent" : "failed";
  }

  // Save message record
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      realtor_id: user.id,
      contact_id,
      content: messageContent,
      channel: "sms",
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Update contact message tracking
  await supabase
    .from("contacts")
    .update({
      monthly_message_count: (contact.monthly_message_count || 0) + 1,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", contact_id);

  return NextResponse.json(message, { status: 201 });
}
