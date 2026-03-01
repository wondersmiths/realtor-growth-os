"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types";

export default function OpenHousePage() {
  const [openHouses, setOpenHouses] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadOpenHouses() {
    const res = await fetch("/api/open-house");
    if (res.ok) setOpenHouses(await res.json());
  }

  useEffect(() => {
    loadOpenHouses();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      event_date: form.get("event_date") || null,
      location: form.get("location"),
      property_address: form.get("property_address"),
    };

    const res = await fetch("/api/open-house", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      loadOpenHouses();
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Open Houses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Open House"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-3 max-w-md"
        >
          <input
            name="title"
            placeholder="Open house title *"
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            name="property_address"
            placeholder="Property address"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            name="event_date"
            type="datetime-local"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            name="location"
            placeholder="Location"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Open House"}
          </button>
        </form>
      )}

      {openHouses.length === 0 ? (
        <p className="text-gray-500">No open houses yet.</p>
      ) : (
        <div className="space-y-3">
          {openHouses.map((oh) => (
            <div key={oh.id} className="border rounded-lg p-4">
              <h2 className="font-semibold">{oh.title}</h2>
              {oh.property_address && (
                <p className="text-sm text-gray-600">{oh.property_address}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {oh.event_date
                  ? new Date(oh.event_date).toLocaleDateString()
                  : "No date set"}
                {oh.location && ` — ${oh.location}`}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Sign-in link: /sign-in/{oh.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
