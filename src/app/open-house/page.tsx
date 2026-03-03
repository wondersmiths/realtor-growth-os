"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import QRCode from "@/components/QRCode";

export default function OpenHousePage() {
  const [openHouses, setOpenHouses] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", event_date: "", location: "", property_address: "" });

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

  function startEditing(oh: Event) {
    setEditingId(oh.id);
    setEditForm({
      title: oh.title,
      description: oh.description || "",
      event_date: oh.event_date ? oh.event_date.slice(0, 16) : "",
      location: oh.location || "",
      property_address: oh.property_address || "",
    });
  }

  async function handleSave(id: string) {
    setLoading(true);
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        event_date: editForm.event_date || null,
        location: editForm.location,
        property_address: editForm.property_address,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      loadOpenHouses();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this open house?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) loadOpenHouses();
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
              {editingId === oh.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <input
                    value={editForm.property_address}
                    onChange={(e) => setEditForm({ ...editForm, property_address: e.target.value })}
                    placeholder="Property address"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={editForm.event_date}
                    onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(oh.id)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold">{oh.title}</h2>
                      {oh.property_address && (
                        <p className="text-sm text-gray-600">{oh.property_address}</p>
                      )}
                      {oh.description && (
                        <p className="text-sm text-gray-500">{oh.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {oh.event_date
                          ? new Date(oh.event_date).toLocaleDateString()
                          : "No date set"}
                        {oh.location && ` — ${oh.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(oh)}
                        className="text-xs text-gray-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(oh.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <QRCode url={`${typeof window !== "undefined" ? window.location.origin : ""}/sign-in/${oh.id}`} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
