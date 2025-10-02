/**
 * Form Builder Canvas - Phase 4 Implementation using SimpleCanvas
 * Replaces: FormCanvasAdapter (moved to legacy)
 */

import React from 'react';
import { SimpleCanvas } from '../../../components/SimpleCanvas';
import type { Component, ComponentType } from '../../../types/components';

interface CanvasProps {
  components: Component[];
  selectedId: string | null;
  onDrop: (type: ComponentType, position?: { index: number }) => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (sourceId: string, targetId: string, position: 'before' | 'after') => void;
  onUpdateComponents?: (components: Component[]) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  onUpdateComponents,
}) => {
  return (
    <div data-testid="canvas" className="form-builder-canvas form-canvas">
      <div className="form-canvas__container">
        <SimpleCanvas
          components={components}
          selectedId={selectedId}
          onDrop={onDrop}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={onMove}
          onUpdateComponents={onUpdateComponents}
          mode="builder"
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