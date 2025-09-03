/**
 * Form Canvas Adapter - Uses Generic DragDropCanvas for Form Building
 * SOLID: Updated to use CSPSafeComponentRenderer for consistency
 */

import React from 'react';
import { DragDropCanvas } from './components/DragDropCanvas';
import { CSPSafeComponentRenderer } from './components/CSPSafeComponentRenderer';
import { CanvasRendererFactory, createRenderItemFunction } from './abstractions/CanvasRenderer';
import type { CanvasItem, RenderContext } from './types';
import type { FormComponentData, ComponentType } from '../../types';

interface FormCanvasProps {
  components: FormComponentData[];
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'left' | 'right' | 'inside') => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  selectedId?: string;
  useCspSafeRenderer?: boolean; // Allow choosing renderer type
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  components,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  selectedId,
  useCspSafeRenderer = true, // Default to CSP-safe for better security
}) => {
  // Convert FormComponentData to CanvasItem
  const canvasItems: CanvasItem[] = components.map(component => ({
    id: component.id,
    type: component.type,
    data: component,
    children: component.children?.map(child => ({
      id: child.id,
      type: child.type,
      data: child,
    })),
  }));

  // Create renderer using abstraction layer with validation support
  const renderer = React.useMemo(() => {
    if (useCspSafeRenderer) {
      // Use CSP-safe renderer for better security and PWA compliance
      return CanvasRendererFactory.create({
        type: 'csp-safe',
        componentRenderer: CSPSafeComponentRenderer
      });
    } else {
      // Fallback to HTML renderer (legacy support)
      const { ComponentRenderer } = require('../../core/ComponentRenderer');
      return CanvasRendererFactory.create({
        type: 'html',
        htmlGenerator: (component: FormComponentData, mode: string) => 
          ComponentRenderer.renderComponent(component, mode)
      });
    }
  }, [useCspSafeRenderer]);

  // Create render function from abstract renderer
  const renderFormComponent = React.useMemo(() => {
    const baseRenderFunction = createRenderItemFunction(renderer);
    
    // Wrap with click handler for selection
    return (item: CanvasItem, context: RenderContext): React.ReactNode => {
      const component = item.data as FormComponentData;
      const renderedContent = baseRenderFunction(item, context);
      
      return (
        <div onClick={() => onSelect(component.id)}>
          {renderedContent}
        </div>
      );
    };
  }, [renderer, onSelect]);

  return (
    <DragDropCanvas
      items={canvasItems}
      renderItem={renderFormComponent}
      onItemMove={onMove}
      onLayoutCreate={(itemType, targetId, position) => {
        // Handle both new items and existing items for horizontal layout creation
        onDrop(itemType as ComponentType, targetId, position);
      }}
      onItemDelete={onDelete}
      onItemAdd={(itemType, position) => {
        if (position.type === 'between' && position.targetIndex !== undefined) {
          // Handle between-element insertion
          onDrop(itemType as ComponentType, `index-${position.targetIndex}`, 'before');
        } else {
          const mappedPosition = position.type === 'center' ? 'inside' : position.type;
          onDrop(itemType as ComponentType, position.targetId || 'empty-canvas', mappedPosition as 'before' | 'after' | 'left' | 'right' | 'inside');
        }
      }}
      selectedItemId={selectedId}
      config={{
        cssPrefix: 'form-canvas',
        enableHorizontalLayouts: true,
        enableVerticalLayouts: true,
        dropZoneThresholds: {
          horizontal: 0.25,
          vertical: 0.3
        }
      }}
      className="form-builder-canvas"
    />
  );
};
