const variantMap: Record<string, string> = {
  sent: "bg-green-50 text-green-700",
  enabled: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  pending: "bg-yellow-50 text-yellow-700",
  disabled: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant?: string;
}) {
  const key = variant || status;
  const colors = variantMap[key] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {status}
    </span>
  );
}
