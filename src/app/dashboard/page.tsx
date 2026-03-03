import DashboardCharts from "@/components/DashboardCharts";

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ROI Dashboard</h1>
      <DashboardCharts />
    </div>
  );
}
