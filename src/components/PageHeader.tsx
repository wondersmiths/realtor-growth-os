export default function PageHeader({
  title,
  actionLabel,
  onAction,
  showAction = true,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actionLabel && onAction && showAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
