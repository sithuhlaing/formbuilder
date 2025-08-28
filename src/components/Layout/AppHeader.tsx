import React from 'react';

interface AppHeaderProps {
  templateName: string;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
  onLoadJSON: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  templateName,
  onBack,
  onSave,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
  onLoadJSON,
}) => {
  return (
    <header className="header">
      <div className="header__container">
        {/* Left side - Brand and template name */}
        <div className="header__brand">
          <h1>Form Builder</h1>
          <span className="header__brand-subtitle">{templateName}</span>
        </div>

        {/* Right side - Actions */}
        <div className="header__actions">
          <button
            onClick={onBack}
            className="btn btn--secondary"
            title="Back to Templates"
          >
            ← Back
          </button>
          
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="btn btn--icon"
            title="Undo"
          >
            ↶
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="btn btn--icon"
            title="Redo"
          >
            ↷
          </button>
          
          <button
            onClick={onClearAll}
            className="btn btn--danger"
            title="Clear All Components"
          >
            Clear All
          </button>
          
          <button
            onClick={onLoadJSON}
            className="btn btn--secondary"
            title="Load from JSON file"
          >
            Load JSON
          </button>
          
          <button
            onClick={onSave}
            className="btn btn--primary"
          >
            Save
          </button>
          
          <button
            onClick={onExport}
            className="btn btn--secondary"
          >
            Export
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;