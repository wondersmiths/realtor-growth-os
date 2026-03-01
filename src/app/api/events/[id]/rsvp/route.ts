import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch event to get realtor_id
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("realtor_id")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await req.json();
  if (!body.first_name) {
    return NextResponse.json(
      { error: "Validation failed", message: "first_name is required" },
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
      source_channel: "event",
      consent: body.consent || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
