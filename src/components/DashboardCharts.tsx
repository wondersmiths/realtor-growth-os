"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/lib/types";

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
    <div className="bg-white rounded-lg shadow p-5 border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
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

  return (
    <div>
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

      <div className="bg-white rounded-lg shadow p-5 border">
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
