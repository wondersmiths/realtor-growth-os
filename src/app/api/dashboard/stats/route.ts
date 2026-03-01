import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const realtorId = user.id;

  // Total contacts
  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("realtor_id", realtorId);

  // Contacts by source
  const { data: contactsBySourceRaw } = await supabase
    .from("contacts")
    .select("source_channel")
    .eq("realtor_id", realtorId);

  const contactsBySource: Record<string, number> = {};
  if (contactsBySourceRaw) {
    for (const c of contactsBySourceRaw) {
      const ch = c.source_channel || "manual";
      contactsBySource[ch] = (contactsBySource[ch] || 0) + 1;
    }
  }

  // Monthly messages sent (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: monthlyMessagesSent } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("realtor_id", realtorId)
    .eq("status", "sent")
    .gte("sent_at", monthStart);

  // Influenced deals
  const { data: influencedDealsRaw } = await supabase
    .from("deals")
    .select("deal_value")
    .eq("realtor_id", realtorId)
    .eq("influenced_by_system", true)
    .eq("status", "closed");

  const influencedDeals = influencedDealsRaw?.length || 0;
  const influencedRevenue =
    influencedDealsRaw?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;

  // ROI calculation (cost is configurable — using $500/month as default)
  const monthlyCost = 500;
  const roi = monthlyCost > 0 ? influencedRevenue / monthlyCost : 0;

  return NextResponse.json({
    total_contacts: totalContacts || 0,
    contacts_by_source: contactsBySource,
    monthly_messages_sent: monthlyMessagesSent || 0,
    influenced_deals: influencedDeals,
    influenced_revenue: influencedRevenue,
    roi: Math.round(roi * 100) / 100,
  });
}
