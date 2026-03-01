import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAttribution } from "@/lib/attribution";
import { Deal } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("deals")
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

  const { data, error } = await supabase
    .from("deals")
    .insert({ ...body, realtor_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Run attribution check if deal is closed
  const deal = data as Deal;
  if (deal.status === "closed" && deal.closed_date) {
    await checkAttribution(supabase, deal);
  }

  // Re-fetch to get updated attribution flag
  const { data: updated } = await supabase
    .from("deals")
    .select("*")
    .eq("id", deal.id)
    .single();

  return NextResponse.json(updated || deal, { status: 201 });
}
