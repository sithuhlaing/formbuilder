type EmptyStateProps = {
  title: string;
  description: string;
  onAction?: {
    text: string;
    onClick: () => void;
  };
  icon?: string;
};

export default function EmptyState({ 
  title, 
  description, 
  onAction, 
  icon = "📋" 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-7xl mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">{description}</p>
      
      {onAction && (
        <button
          onClick={onAction.onClick}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          {onAction.text}
        </button>
      )}
    </div>
  );
}
