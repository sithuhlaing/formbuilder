
import React from 'react';

interface HeaderProps {
  isFormBuilderView?: boolean;
  onPreview?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isFormBuilderView = false,
  onPreview,
  onSave,
  onSettings,
  onDelete,
  onCopy
}) => {
  return (
    <header className={`header ${isFormBuilderView ? 'header--form-builder' : ''}`}>
      {!isFormBuilderView && (
        <h1 className="header__title">Form Builder</h1>
      )}
      
      <div className="header__actions">
        <button 
          className="header__action-btn" 
          onClick={onCopy}
          title="Copy"
        >
          📋
        </button>
        <button 
          className="header__action-btn header__action-btn--primary" 
          onClick={onPreview}
          title="Preview"
        >
          👁️
        </button>
        <button 
          className="header__action-btn header__action-btn--success" 
          onClick={onSave}
          title="Save"
        >
          💾
        </button>
        <button 
          className="header__action-btn" 
          onClick={onSettings}
          title="Settings"
        >
          ⚙️
        </button>
        <button 
          className="header__action-btn header__action-btn--danger" 
          onClick={onDelete}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </header>
  );
};

export default Header;
