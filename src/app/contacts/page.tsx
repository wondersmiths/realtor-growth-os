"use client";

import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";
import { Contact } from "@/lib/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", consent: false });
  const [loading, setLoading] = useState(false);

  async function loadContacts() {
    const res = await fetch("/api/contacts");
    if (res.ok) setContacts(await res.json());
  }

  useEffect(() => {
    loadContacts();
  }, []);

  function startEditing(c: Contact) {
    setEditingId(c.id);
    setEditForm({
      first_name: c.first_name,
      last_name: c.last_name || "",
      email: c.email || "",
      phone: c.phone || "",
      consent: c.consent,
    });
  }

  async function handleSave(id: string) {
    setLoading(true);
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      loadContacts();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) loadContacts();
  }

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

      {contacts.length === 0 ? (
        <p className="text-gray-500">No contacts yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Consent</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b">
                {editingId === c.id ? (
                  <>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1">
                        <input
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="border rounded px-2 py-1 text-sm w-20"
                          placeholder="First"
                          required
                        />
                        <input
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="border rounded px-2 py-1 text-sm w-20"
                          placeholder="Last"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="border rounded px-2 py-1 text-sm w-full"
                        placeholder="Email"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="border rounded px-2 py-1 text-sm w-full"
                        placeholder="Phone"
                      />
                    </td>
                    <td className="py-2 pr-4">{c.source_channel}</td>
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        checked={editForm.consent}
                        onChange={(e) => setEditForm({ ...editForm, consent: e.target.checked })}
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(c.id)}
                          disabled={loading}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-4">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-2 pr-4">{c.email}</td>
                    <td className="py-2 pr-4">{c.phone}</td>
                    <td className="py-2 pr-4">{c.source_channel}</td>
                    <td className="py-2 pr-4">{c.consent ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(c)}
                          className="text-xs text-gray-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs text-gray-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
