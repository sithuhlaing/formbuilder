
import React from 'react';

const CanvasEmptyState: React.FC = () => {
  return (
    <div className="canvas-empty-state">
      <div className="canvas-empty-state__content">
        <div className="canvas-empty-state__icon">
          📝
        </div>
        <h3 className="canvas-empty-state__title">
          Start Building Your Form
        </h3>
        <p className="canvas-empty-state__description">
          Drag components from the sidebar to begin creating your form layout
        </p>
        <div className="canvas-empty-state__hint">
          <span className="canvas-empty-state__hint-icon">💡</span>
          <span>Tip: You can drag components here to create rows and columns</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasEmptyState;
