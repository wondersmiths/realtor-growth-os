import SignInForm from "@/components/SignInForm";
import { createServiceClient } from "@/lib/supabase/server";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, property_address, event_date, location")
    .eq("id", propertyId)
    .eq("event_type", "open_house")
    .single();

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Open house not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Open House Sign-In</h1>
        <p className="text-gray-700 font-medium">{event.title}</p>
        {event.property_address && (
          <p className="text-sm text-gray-500">{event.property_address}</p>
        )}
        {event.event_date && (
          <p className="text-sm text-gray-500">
            {new Date(event.event_date).toLocaleDateString()}
          </p>
        )}
        <hr className="my-4" />
        <SignInForm propertyId={propertyId} />
      </div>
    </div>
  );
}
