import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageToContact } from "@/lib/messages";

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
  const { contact_id, template, content } = body;

  if (!contact_id) {
    return NextResponse.json(
      { error: "Validation failed", message: "contact_id is required" },
      { status: 400 }
    );
  }

  const result = await sendMessageToContact(supabase, {
    contact_id,
    realtor_id: user.id,
    template,
    content,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.message, { status: 201 });
}
