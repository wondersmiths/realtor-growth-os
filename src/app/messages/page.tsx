"use client";

import { useEffect, useState } from "react";
import { Contact, Message } from "@/lib/types";
import { checkMessageCompliance } from "@/lib/compliance";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";

const templates = [
  { value: "follow_up", label: "General Follow-up" },
  { value: "custom", label: "Custom Message" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<(Message & { contacts?: { first_name: string; last_name?: string } })[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Compose form state
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("follow_up");
  const [customContent, setCustomContent] = useState("");

  async function loadData() {
    const [msgRes, contactRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/contacts"),
    ]);
    if (msgRes.ok) setMessages(await msgRes.json());
    if (contactRes.ok) setContacts(await contactRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  const eligibleContacts = contacts.filter(
    (c) => c.consent && !c.unsubscribed
  );

  const selectedContactObj = contacts.find((c) => c.id === selectedContact);
  const compliance = selectedContactObj
    ? checkMessageCompliance(selectedContactObj)
    : null;

  function getContactName(contactId: string, msg: Message & { contacts?: { first_name: string; last_name?: string } }) {
    if (msg.contacts) {
      return `${msg.contacts.first_name} ${msg.contacts.last_name || ""}`.trim();
    }
    const c = contacts.find((ct) => ct.id === contactId);
    return c ? `${c.first_name} ${c.last_name || ""}`.trim() : "Unknown";
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    const body: Record<string, string> = { contact_id: selectedContact };
    if (selectedTemplate === "custom") {
      body.content = customContent;
    } else {
      body.template = selectedTemplate;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowCompose(false);
      setSelectedContact("");
      setSelectedTemplate("follow_up");
      setCustomContent("");
      loadData();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to send message");
    }
    setSending(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Messages"
        actionLabel={showCompose ? "Cancel" : "Compose Message"}
        onAction={() => {
          setShowCompose(!showCompose);
          setError("");
        }}
      />

      {showCompose && (
        <div className="bg-white rounded-lg border shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Message</h2>
          <form onSubmit={handleSend} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact</label>
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Select a contact...</option>
                {eligibleContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name || ""} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedContactObj && compliance && !compliance.allowed && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">
                {compliance.reason}
              </div>
            )}

            {selectedContactObj && compliance && compliance.allowed && (
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-700">
                Contact eligible for messaging
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {templates.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate === "custom" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  required
                  rows={3}
                  maxLength={160}
                  placeholder="Type your message (max 160 chars)..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">{customContent.length}/160</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending || (compliance !== null && !compliance.allowed)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState
          icon={"\u2709"}
          title="No messages yet"
          description="Send your first message to a contact to get started."
          actionLabel="Compose Message"
          onAction={() => setShowCompose(true)}
        />
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="py-3 px-4 font-medium text-gray-600">Contact</th>
                <th className="py-3 px-4 font-medium text-gray-600">Content</th>
                <th className="py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {getContactName(msg.contact_id, msg)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {msg.content}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={msg.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {msg.sent_at
                      ? new Date(msg.sent_at).toLocaleString()
                      : msg.created_at
                        ? new Date(msg.created_at).toLocaleString()
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
