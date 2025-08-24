
import React from "react";

const EmptyCanvas: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-lg font-medium mb-2">No components yet</h3>
      <p className="text-sm text-center max-w-sm">
        Drag components from the sidebar or click on them to start building your form
      </p>
    </div>
  );
};

export default EmptyCanvas;
