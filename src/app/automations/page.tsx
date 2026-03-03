"use client";

import { useEffect, useState } from "react";
import { Automation, TriggerType } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";

const triggerTypes: { value: TriggerType; label: string }[] = [
  { value: "event_based", label: "Event Based" },
  { value: "time_delay", label: "Time Delay" },
  { value: "channel_based", label: "Channel Based" },
];

const actionTypes = [
  { value: "send_message", label: "Send Message" },
  { value: "add_tag", label: "Add Tag" },
];

function describeTrigger(a: Automation): string {
  const cfg = a.trigger_config;
  switch (a.trigger_type) {
    case "event_based":
      return `When "${cfg.event || "event"}" occurs`;
    case "time_delay":
      return `${cfg.days_after_creation || 0} days after creation`;
    case "channel_based":
      return `Source channel is "${cfg.channel || "any"}"`;
    default:
      return a.trigger_type;
  }
}

function describeAction(a: Automation): string {
  const cfg = a.action_config;
  switch (a.action_type) {
    case "send_message":
      return `Send "${cfg.template || "message"}"`;
    case "add_tag":
      return `Add tag "${cfg.tag || "tag"}"`;
    default:
      return a.action_type;
  }
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("event_based");
  const [actionType, setActionType] = useState("send_message");
  // Trigger config
  const [eventName, setEventName] = useState("");
  const [delayDays, setDelayDays] = useState(1);
  const [channel, setChannel] = useState("manual");
  // Action config
  const [template, setTemplate] = useState("follow_up");
  const [tagName, setTagName] = useState("");

  async function loadAutomations() {
    const res = await fetch("/api/automations");
    if (res.ok) setAutomations(await res.json());
  }

  useEffect(() => {
    loadAutomations();
  }, []);

  function resetForm() {
    setName("");
    setTriggerType("event_based");
    setActionType("send_message");
    setEventName("");
    setDelayDays(1);
    setChannel("manual");
    setTemplate("follow_up");
    setTagName("");
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let trigger_config: Record<string, unknown> = {};
    if (triggerType === "event_based") trigger_config = { event: eventName };
    else if (triggerType === "time_delay") trigger_config = { days_after_creation: delayDays };
    else if (triggerType === "channel_based") trigger_config = { channel };

    let action_config: Record<string, unknown> = {};
    if (actionType === "send_message") action_config = { template };
    else if (actionType === "add_tag") action_config = { tag: tagName };

    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        trigger_type: triggerType,
        trigger_config,
        action_type: actionType,
        action_config,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      resetForm();
      loadAutomations();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create automation");
    }
    setLoading(false);
  }

  async function handleToggle(a: Automation) {
    await fetch(`/api/automations/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !a.enabled }),
    });
    loadAutomations();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    const res = await fetch(`/api/automations/${id}`, { method: "DELETE" });
    if (res.ok) loadAutomations();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Automations"
        actionLabel={showForm ? "Cancel" : "New Automation"}
        onAction={() => {
          setShowForm(!showForm);
          if (showForm) resetForm();
        }}
      />

      {showForm && (
        <div className="bg-white rounded-lg border shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Create Automation</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Welcome new contacts"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {triggerTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {triggerType === "event_based" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Event Name</label>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder='e.g. "new_contact", "rsvp"'
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            )}

            {triggerType === "time_delay" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Days After Creation</label>
                <input
                  type="number"
                  min={1}
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            )}

            {triggerType === "channel_based" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Source Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="event">Event</option>
                  <option value="open_house">Open House</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {actionTypes.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {actionType === "send_message" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="follow_up">General Follow-up</option>
                  <option value="welcome">Welcome</option>
                  <option value="check_in">Check-in</option>
                </select>
              </div>
            )}

            {actionType === "add_tag" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tag Name</label>
                <input
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. hot-lead"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Automation"}
            </button>
          </form>
        </div>
      )}

      {automations.length === 0 ? (
        <EmptyState
          icon={"\u26A1"}
          title="No automations yet"
          description="Create your first automation to start engaging contacts automatically."
          actionLabel="New Automation"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {automations.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{a.name}</h3>
                    <StatusBadge
                      status={a.enabled ? "Enabled" : "Disabled"}
                      variant={a.enabled ? "enabled" : "disabled"}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Trigger: {describeTrigger(a)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Action: {describeAction(a)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(a)}
                    className={`text-xs px-3 py-1 rounded border ${
                      a.enabled
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {a.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
