import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateTrigger, executeAction } from "@/lib/automation";
import { Automation, Contact } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const triggerEvent = body.event as string | undefined; // e.g. "new_contact", "rsvp"
  const contactId = body.contact_id as string | undefined;

  // Fetch enabled automations for this realtor
  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("realtor_id", user.id)
    .eq("enabled", true);

  if (!automations || automations.length === 0) {
    return NextResponse.json({ results: [], message: "No active automations" });
  }

  // Fetch the target contact if provided
  let contact: Contact | null = null;
  if (contactId) {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("realtor_id", user.id)
      .single();
    contact = data as Contact | null;
  }

  const results = [];

  for (const auto of automations as Automation[]) {
    const daysSinceCreation = contact
      ? Math.floor(
          (Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const triggered = evaluateTrigger(auto, {
      event: triggerEvent,
      contact: contact || undefined,
      days_since_creation: daysSinceCreation,
    });

    if (triggered && contact) {
      const result = await executeAction(auto, contact, user.id);
      results.push({ automation: auto.name, ...result });
    }
  }

  return NextResponse.json({ results });
}
