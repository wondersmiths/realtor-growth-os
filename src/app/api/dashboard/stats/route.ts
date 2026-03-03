import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const realtorId = user.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalContacts },
    { data: contactsBySourceRaw },
    { count: monthlyMessagesSent },
    { data: influencedDealsRaw },
    { count: staleContacts },
    { count: eligibleContacts },
    { data: upcomingEvents },
    { data: recentMessages },
    { data: recentContacts },
  ] = await Promise.all([
    // Total contacts
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("realtor_id", realtorId),
    // Contacts by source
    supabase
      .from("contacts")
      .select("source_channel")
      .eq("realtor_id", realtorId),
    // Monthly messages sent
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("realtor_id", realtorId)
      .eq("status", "sent")
      .gte("sent_at", monthStart),
    // Influenced deals
    supabase
      .from("deals")
      .select("deal_value")
      .eq("realtor_id", realtorId)
      .eq("influenced_by_system", true)
      .eq("status", "closed"),
    // Stale contacts (not messaged in 30+ days, consent=true, not unsubscribed)
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("realtor_id", realtorId)
      .eq("consent", true)
      .eq("unsubscribed", false)
      .or(`last_message_at.is.null,last_message_at.lt.${thirtyDaysAgo}`),
    // Eligible contacts (consent=true, not unsubscribed, monthly_message_count < 4)
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("realtor_id", realtorId)
      .eq("consent", true)
      .eq("unsubscribed", false)
      .lt("monthly_message_count", 4),
    // Upcoming events (next 14 days)
    supabase
      .from("events")
      .select("id, title, event_date")
      .eq("realtor_id", realtorId)
      .gte("event_date", now.toISOString())
      .lte("event_date", fourteenDaysFromNow)
      .order("event_date", { ascending: true })
      .limit(3),
    // Recent messages (last 5 with contact join)
    supabase
      .from("messages")
      .select("id, content, status, created_at, contacts(first_name, last_name)")
      .eq("realtor_id", realtorId)
      .order("created_at", { ascending: false })
      .limit(5),
    // Recent contacts (last 5)
    supabase
      .from("contacts")
      .select("id, first_name, last_name, source_channel, created_at")
      .eq("realtor_id", realtorId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const contactsBySource: Record<string, number> = {};
  if (contactsBySourceRaw) {
    for (const c of contactsBySourceRaw) {
      const ch = c.source_channel || "manual";
      contactsBySource[ch] = (contactsBySource[ch] || 0) + 1;
    }
  }

  const influencedDeals = influencedDealsRaw?.length || 0;
  const influencedRevenue =
    influencedDealsRaw?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;

  const monthlyCost = 500;
  const roi = monthlyCost > 0 ? influencedRevenue / monthlyCost : 0;

  return NextResponse.json({
    total_contacts: totalContacts || 0,
    contacts_by_source: contactsBySource,
    monthly_messages_sent: monthlyMessagesSent || 0,
    influenced_deals: influencedDeals,
    influenced_revenue: influencedRevenue,
    roi: Math.round(roi * 100) / 100,
    stale_contacts: staleContacts || 0,
    eligible_contacts: eligibleContacts || 0,
    upcoming_events: upcomingEvents || [],
    recent_messages: recentMessages || [],
    recent_contacts: recentContacts || [],
  });
}
