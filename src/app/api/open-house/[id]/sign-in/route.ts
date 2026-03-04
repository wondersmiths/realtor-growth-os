import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("realtor_id, property_address")
    .eq("id", id)
    .eq("event_type", "open_house")
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Open house not found" }, { status: 404 });
  }

  const body = await req.json();
  if (!body.first_name || !body.email) {
    return NextResponse.json(
      { error: "Validation failed", message: "first_name and email are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      realtor_id: event.realtor_id,
      first_name: body.first_name,
      last_name: body.last_name || null,
      email: body.email || null,
      phone: body.phone || null,
      source_channel: "open_house",
      consent: body.consent || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
