"use client";

import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";
import { Contact } from "@/lib/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);

  async function loadContacts() {
    try {
      const res = await fetch("/api/contacts");
      const text = await res.text();
      if (res.ok) {
        setContacts(JSON.parse(text));
        setDebug(null);
      } else {
        setDebug(`API ${res.status}: ${text.substring(0, 300)}`);
      }
    } catch (err) {
      setDebug(`Fetch error: ${err}`);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <ContactForm
            onSuccess={() => {
              setShowForm(false);
              loadContacts();
            }}
          />
        </div>
      )}

      {debug && (
        <pre className="mb-4 text-xs bg-red-50 border border-red-200 p-3 rounded whitespace-pre-wrap break-all text-red-800">
          {debug}
        </pre>
      )}

      {contacts.length === 0 && !debug ? (
        <p className="text-gray-500">No contacts yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2">Consent</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 pr-4">
                  {c.first_name} {c.last_name}
                </td>
                <td className="py-2 pr-4">{c.email}</td>
                <td className="py-2 pr-4">{c.phone}</td>
                <td className="py-2 pr-4">{c.source_channel}</td>
                <td className="py-2">{c.consent ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
