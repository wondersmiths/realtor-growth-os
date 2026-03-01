import { SupabaseClient } from "@supabase/supabase-js";
import { Deal } from "./types";

export async function checkAttribution(
  supabase: SupabaseClient,
  deal: Deal
): Promise<boolean> {
  if (!deal.contact_id || !deal.closed_date) return false;

  const closedDate = new Date(deal.closed_date);
  const ninetyDaysAgo = new Date(closedDate);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sent_at")
    .eq("contact_id", deal.contact_id)
    .eq("status", "sent")
    .gte("sent_at", ninetyDaysAgo.toISOString())
    .lte("sent_at", closedDate.toISOString())
    .limit(1);

  if (messages && messages.length > 0) {
    await supabase
      .from("deals")
      .update({ influenced_by_system: true })
      .eq("id", deal.id);
    return true;
  }

  return false;
}
