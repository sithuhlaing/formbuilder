
import React, { useState, useEffect } from 'react';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  isEditing: boolean;
  onStartEdit: (e?: React.MouseEvent) => void;
  onCancelEdit: () => void;
  className?: string;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onSave,
  isEditing,
  onStartEdit,
  onCancelEdit,
  className = ''
}) => {
  const [tempTitle, setTempTitle] = useState(title);

  useEffect(() => {
    setTempTitle(title);
  }, [title, isEditing]);

  const handleSave = () => {
    if (tempTitle.trim()) {
      onSave(tempTitle.trim());
    } else {
      onCancelEdit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={tempTitle}
        onChange={(e) => setTempTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className={`bg-transparent border-b border-blue-300 focus:outline-none ${className}`}
        autoFocus
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => onStartEdit(e)}
      className={`cursor-pointer hover:text-blue-600 ${className}`}
      title="Double-click to edit"
    >
      {title}
    </span>
  );
};

export default EditableTitle;
