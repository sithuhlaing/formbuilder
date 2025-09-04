/**
 * Custom Drag Preview Component - Shows preview fields during drag
 */

import React from 'react';
import { ComponentRenderer } from '../../core/ComponentRenderer';
import type { ComponentType, FormComponentData } from '../../types';

interface DragPreviewProps {
  componentType: ComponentType;
  isDragging: boolean;
}

export const DragPreview: React.FC<DragPreviewProps> = ({ componentType, isDragging }) => {
  if (!isDragging) return null;

  // Create a mock component data for preview
  const mockComponent: FormComponentData = {
    id: 'drag-preview',
    type: componentType,
    label: ComponentRenderer.getComponentInfo(componentType).label,
    fieldId: 'preview-field',
    required: false,
    placeholder: 'Preview field...',
    children: []
  };

  return (
    <div className="drag-preview">
      <div className="drag-preview__container">
        <div className="drag-preview__field">
          {ComponentRenderer.renderComponent(mockComponent, 'preview')}
        </div>
        <div className="drag-preview__label">
          {ComponentRenderer.getComponentInfo(componentType).label}
        </div>
      </div>
    </div>
  );
};
