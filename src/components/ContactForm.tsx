"use client";

import { useState } from "react";

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
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
      source_channel: "manual",
      consent: form.get("consent") === "on",
    };

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || data.error || "Failed to create contact");
    } else {
      (e.target as HTMLFormElement).reset();
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
        placeholder="Email *"
        required
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="phone"
        placeholder="Phone"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input name="consent" type="checkbox" />
        Consent to receive messages
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Contact"}
      </button>
    </form>
  );
}
