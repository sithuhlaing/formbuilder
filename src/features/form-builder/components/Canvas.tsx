/**
 * Form Builder Canvas - Now using FormCanvasAdapter with SOLID principles
 */

import React from 'react';
import { FormCanvas } from '../../../packages/react-drag-canvas/FormCanvasAdapter';
import type { FormComponentData } from '../../../types';

interface CanvasProps {
  components: FormComponentData[];
  onDrop: (componentType: string, targetId?: string, position?: string) => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  selectedId?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  components,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  selectedId,
}) => {
  return (
    <div data-testid="canvas" className="form-builder-canvas form-canvas">
      <div className="form-canvas__container">
        <FormCanvas
          components={components}
          onDrop={onDrop}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={onMove}
          selectedId={selectedId}
          useCspSafeRenderer={true}
        />
      </div>
    </div>
  );
};

// Expose test helpers for compatibility
if (typeof window !== 'undefined') {
  (window as any).__testMoveComponent__ = (fromIndex: number, toIndex: number) => {
    console.log('Test helper: moveComponent called', { fromIndex, toIndex });
  };
  
  (window as any).__testInsertHorizontalToComponent__ = (
    componentType: string, 
    targetId: string, 
    position: string
  ) => {
    console.log('Test helper: insertHorizontalToComponent called', { 
      componentType, 
      targetId, 
      position 
    });
  };
}