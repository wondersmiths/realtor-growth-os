"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardStats } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (!stats) return <p className="text-red-500">Failed to load stats.</p>;

  const sourceLabels: Record<string, string> = {
    manual: "Manual",
    event: "Events",
    open_house: "Open Houses",
  };

  const hasNudges =
    stats.stale_contacts > 0 ||
    stats.eligible_contacts > 0 ||
    stats.upcoming_events.length > 0;

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Contacts" value={stats.total_contacts} />
        <StatCard
          label="Messages Sent (This Month)"
          value={stats.monthly_messages_sent}
        />
        <StatCard label="Influenced Deals" value={stats.influenced_deals} />
        <StatCard
          label="Influenced Revenue"
          value={`$${stats.influenced_revenue.toLocaleString()}`}
        />
        <StatCard
          label="ROI"
          value={`${stats.roi}x`}
          sub="Based on $500/mo cost"
        />
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-sm p-5 border mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Action Items
        </h3>
        {hasNudges ? (
          <div className="space-y-2">
            {stats.stale_contacts > 0 && (
              <Link
                href="/messages"
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <span className="text-sm text-amber-800">
                  {stats.stale_contacts} contact{stats.stale_contacts !== 1 ? "s" : ""} haven&apos;t been messaged in 30+ days
                </span>
                <span className="text-xs text-amber-600 font-medium">Send Messages &rarr;</span>
              </Link>
            )}
            {stats.eligible_contacts > 0 && (
              <Link
                href="/contacts"
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <span className="text-sm text-blue-800">
                  {stats.eligible_contacts} contact{stats.eligible_contacts !== 1 ? "s" : ""} eligible for follow-up
                </span>
                <span className="text-xs text-blue-600 font-medium">View Contacts &rarr;</span>
              </Link>
            )}
            {stats.upcoming_events.map((ev) => (
              <Link
                key={ev.id}
                href="/events"
                className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <span className="text-sm text-purple-800">
                  &ldquo;{ev.title}&rdquo; is in {daysUntil(ev.event_date)} day{daysUntil(ev.event_date) !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-purple-600 font-medium">View Events &rarr;</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3 border border-green-200">
            You&apos;re all caught up!
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/messages"
          className="flex items-center justify-center gap-2 bg-white border rounded-lg p-4 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
        >
          <span>&#9993;</span> Send Follow-ups
        </Link>
        <Link
          href="/events"
          className="flex items-center justify-center gap-2 bg-white border rounded-lg p-4 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
        >
          <span>&#9734;</span> Create Event
        </Link>
        <Link
          href="/contacts"
          className="flex items-center justify-center gap-2 bg-white border rounded-lg p-4 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
        >
          <span>&#43;</span> Add Contact
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm p-5 border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Messages
          </h3>
          {stats.recent_messages.length === 0 ? (
            <p className="text-sm text-gray-400">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_messages.map((msg) => (
                <div key={msg.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {msg.contacts?.first_name} {msg.contacts?.last_name || ""}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={msg.status} />
                    <span className="text-xs text-gray-400">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow-sm p-5 border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Latest Contacts
          </h3>
          {stats.recent_contacts.length === 0 ? (
            <p className="text-sm text-gray-400">No contacts yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {c.first_name} {c.last_name || ""}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{c.source_channel.replace("_", " ")}</p>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contacts by Source */}
      <div className="bg-white rounded-lg shadow-sm p-5 border">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Contacts by Source
        </h3>
        <div className="space-y-2">
          {Object.entries(stats.contacts_by_source).map(([key, count]) => {
            const pct =
              stats.total_contacts > 0
                ? Math.round((count / stats.total_contacts) * 100)
                : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{sourceLabels[key] || key}</span>
                  <span>
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2">
                  <div
                    className="bg-blue-600 rounded h-2"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
