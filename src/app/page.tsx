import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Realtor Growth OS</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          CRM, event lead capture, compliance-gated AI messaging, property
          appreciation triggers, deal attribution, and ROI dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/contacts"
            className="border px-6 py-2 rounded hover:bg-gray-100 text-sm"
          >
            View Contacts
          </Link>
        </div>
      </div>
    </div>
  );
}
