import RSVPForm from "@/components/RSVPForm";
import { createServiceClient } from "@/lib/supabase/server";

export default async function RSVPPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, description, event_date, location")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
        {event.description && (
          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
        )}
        {event.event_date && (
          <p className="text-sm text-gray-500 mb-1">
            {new Date(event.event_date).toLocaleDateString()}
          </p>
        )}
        {event.location && (
          <p className="text-sm text-gray-500 mb-4">{event.location}</p>
        )}
        <hr className="my-4" />
        <RSVPForm eventId={eventId} />
      </div>
    </div>
  );
}
