/**
 * Canvas Card - Drag-drop component arrangement area
 * Part of the two-card middle panel structure
 */

import React from 'react';
import { Canvas } from './Canvas';
import type { FormComponentData } from '../../../types';

interface CanvasCardProps {
  components: FormComponentData[];
  onDrop: (componentType: string, targetId?: string, position?: string) => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  selectedId?: string;
}

export const CanvasCard: React.FC<CanvasCardProps> = ({
  components,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  selectedId,
}) => {
  return (
    <div className="canvas-card">
      <div className="canvas-card__header">
        <h3 className="canvas-card__title">Form Canvas</h3>
        <p className="canvas-card__description">
          Drag components from the left panel to build your form
        </p>
      </div>
      
      <div className="canvas-card__content">
        <Canvas
          components={components}
          onDrop={onDrop}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={onMove}
          selectedId={selectedId}
        />
      </div>
    </div>
  );
};
