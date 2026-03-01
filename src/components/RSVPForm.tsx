"use client";

import { useState } from "react";

interface RSVPFormProps {
  eventId: string;
}

export default function RSVPForm({ eventId }: RSVPFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      consent: form.get("consent") === "on",
    };

    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || data.error || "RSVP failed");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-green-600 mb-2">You&apos;re in!</h2>
        <p className="text-gray-600">Your RSVP has been confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        name="first_name"
        placeholder="First name *"
        required
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="last_name"
        placeholder="Last name"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="phone"
        placeholder="Phone"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input name="consent" type="checkbox" />
        I consent to receive follow-up messages
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "RSVP Now"}
      </button>
    </form>
  );
}
