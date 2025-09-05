import React, { useEffect, useState } from 'react';
import { useDragLayer } from 'react-dnd';

interface TouchDragPreviewProps {
  // Optional custom preview component
  renderPreview?: (item: any, isDragging: boolean) => React.ReactNode;
}

export const TouchDragPreview: React.FC<TouchDragPreviewProps> = ({ renderPreview }) => {
  const [mounted, setMounted] = useState(false);

  const {
    isDragging,
    item,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDragging || !currentOffset) {
    return null;
  }

  const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;

  const renderDefaultPreview = () => {
    if (item?.item?.type) {
      // Existing component preview
      return (
        <div className="touch-drag-preview touch-drag-preview--component">
          <div className="touch-drag-preview__icon">
            {getComponentIcon(item.item.type)}
          </div>
          <div className="touch-drag-preview__label">
            {getComponentLabel(item.item.type)}
          </div>
        </div>
      );
    } else if (item?.itemType) {
      // New component from palette preview
      return (
        <div className="touch-drag-preview touch-drag-preview--new">
          <div className="touch-drag-preview__icon">
            {getComponentIcon(item.itemType)}
          </div>
          <div className="touch-drag-preview__label">
            {getComponentLabel(item.itemType)}
          </div>
          <div className="touch-drag-preview__badge">New</div>
        </div>
      );
    }

    return (
      <div className="touch-drag-preview touch-drag-preview--generic">
        <div className="touch-drag-preview__icon">📱</div>
        <div className="touch-drag-preview__label">Dragging...</div>
      </div>
    );
  };

  return (
    <div
      className="touch-drag-layer"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="touch-drag-preview-container"
        style={{
          transform,
          WebkitTransform: transform,
        }}
      >
        {renderPreview ? renderPreview(item, isDragging) : renderDefaultPreview()}
      </div>
    </div>
  );
};

// Helper functions for component icons and labels
function getComponentIcon(type: string): string {
  const iconMap: Record<string, string> = {
    text: '📝',
    email: '📧',
    number: '🔢',
    textarea: '📄',
    select: '📋',
    radio: '⚪',
    checkbox: '☑️',
    file: '📎',
    date: '📅',
    time: '⏰',
    url: '🔗',
    tel: '📞',
    password: '🔒',
    range: '🎚️',
    color: '🎨',
    button: '🔘',
    submit: '✅',
    reset: '🔄',
    horizontal_layout: '↔️',
    vertical_layout: '↕️',
  };

  return iconMap[type] || '📦';
}

function getComponentLabel(type: string): string {
  const labelMap: Record<string, string> = {
    text: 'Text Input',
    email: 'Email Input',
    number: 'Number Input',
    textarea: 'Text Area',
    select: 'Dropdown',
    radio: 'Radio Group',
    checkbox: 'Checkbox',
    file: 'File Upload',
    date: 'Date Picker',
    time: 'Time Picker',
    url: 'URL Input',
    tel: 'Phone Input',
    password: 'Password Input',
    range: 'Range Slider',
    color: 'Color Picker',
    button: 'Button',
    submit: 'Submit Button',
    reset: 'Reset Button',
    horizontal_layout: 'Row Layout',
    vertical_layout: 'Column Layout',
  };

  return labelMap[type] || 'Component';
}
