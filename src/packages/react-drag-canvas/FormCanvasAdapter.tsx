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
  onAddToLayout?: (componentType: ComponentType, layoutId: string) => void;
  selectedId?: string;
  useCspSafeRenderer?: boolean; // Allow choosing renderer type
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  components,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  onAddToLayout,
  selectedId,
  useCspSafeRenderer = true, // Default to CSP-safe for better security
}) => {
  // Convert FormComponentData to CanvasItem
  const canvasItems: CanvasItem[] = components.map(component => ({
    id: component.id,
    type: component.type,
    data: component as unknown as Record<string, unknown>,
    children: component.children?.map(child => ({
      id: child.id,
      type: child.type,
      data: child as unknown as Record<string, unknown>,
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
      const component = item.data as unknown as FormComponentData;
      
      // Enhanced context with selection handlers
      const enhancedContext = {
        ...context,
        selectedId: selectedId,
        onSelect: onSelect,
        onDelete: onDelete
      };
      
      const renderedContent = baseRenderFunction(item, enhancedContext);
      
      return (
        <div onClick={() => onSelect && onSelect(component.id)}>
          {renderedContent}
        </div>
      );
    };
  }, [renderer, onSelect, onDelete, selectedId]);

  return (
    <DragDropCanvas
      items={canvasItems}
      renderItem={renderFormComponent}
      onItemMove={onMove}
      onLayoutCreate={(itemType, targetId, position) => {
        // Handle both new items and existing items for horizontal layout creation
        console.log('FormCanvasAdapter onLayoutCreate:', { itemType, targetId, position });
        onDrop(itemType as ComponentType, targetId, position);
      }}
      onItemDelete={onDelete}
      onItemAdd={(itemType, position) => {
        console.log('🎯 Canvas received drop:', { itemType, position });
        if ((position as any).type === 'between' && (position as any).targetId !== undefined) {
          // Handle between-element insertion
          console.log('🎯 Handling between-element insertion');
          onDrop(itemType as ComponentType, (position as any).targetId || 'empty-canvas', 'before');
        } else {
          const mappedPosition = position.type === 'center' ? 'inside' : position.type;
          console.log('🎯 Handling regular drop with position:', mappedPosition);
          onDrop(itemType as ComponentType, position.targetId || 'empty-canvas', mappedPosition as 'before' | 'after' | 'left' | 'right' | 'inside');
        }
      }}
      onAddToLayout={(itemType, layoutId) => {
        console.log('FormCanvasAdapter onAddToLayout:', { itemType, layoutId });
        if (onAddToLayout) {
          onAddToLayout(itemType as ComponentType, layoutId);
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
