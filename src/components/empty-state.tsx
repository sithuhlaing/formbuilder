type EmptyStateProps = {
  title: string;
  description: string;
  onAction?: {
    text: string;
    onClick: () => void;
  };
  icon?: string;
};

export default function EmptyState({ title, description, onAction, icon = "📋" }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white py-16 text-center shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-cyan-100" aria-hidden />
      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4 px-6">
        <span className="text-6xl text-cyan-500 drop-shadow-sm">{icon}</span>
        <div>
          <h3 className="text-2xl font-semibold text-sky-900">{title}</h3>
          <p className="mt-2 text-sm text-sky-600">{description}</p>
        </div>
        {onAction && (
          <button
            onClick={onAction.onClick}
            className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            {onAction.text}
          </button>
        )}
      </div>
    </div>
  );
}
