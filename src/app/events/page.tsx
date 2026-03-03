"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import QRCode from "@/components/QRCode";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", event_date: "", location: "" });

  async function loadEvents() {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }

  useEffect(() => {
    loadEvents();
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
      event_type: "event",
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      loadEvents();
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  function startEditing(ev: Event) {
    setEditingId(ev.id);
    setEditForm({
      title: ev.title,
      description: ev.description || "",
      event_date: ev.event_date ? ev.event_date.slice(0, 16) : "",
      location: ev.location || "",
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
      }),
    });
    if (res.ok) {
      setEditingId(null);
      loadEvents();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) loadEvents();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Event"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-3 max-w-md"
        >
          <input
            name="title"
            placeholder="Event title *"
            required
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
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p className="text-gray-500">No events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="border rounded-lg p-4">
              {editingId === ev.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
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
                      onClick={() => handleSave(ev.id)}
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
                      <h2 className="font-semibold">{ev.title}</h2>
                      {ev.description && (
                        <p className="text-sm text-gray-600">{ev.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {ev.event_date
                          ? new Date(ev.event_date).toLocaleDateString()
                          : "No date set"}
                        {ev.location && ` — ${ev.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(ev)}
                        className="text-xs text-gray-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {ev.event_type}
                      </span>
                    </div>
                  </div>
                  <QRCode url={`${typeof window !== "undefined" ? window.location.origin : ""}/rsvp/${ev.id}`} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
