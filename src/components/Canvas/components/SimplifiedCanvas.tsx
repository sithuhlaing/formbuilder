/**
 * Simplified Canvas Component
 * Implements the hard rules for drag-and-drop interactions
 */

import React, { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { SimpleDragDropRules } from '../core/DragDropRules';
import { CanvasStateManager } from '../core/CanvasStateManager';
import type { CanvasNode, Intent } from '../core/types';
import SimplifiedDropZone from './SimplifiedDropZone';
import SimplifiedRowLayout from './SimplifiedRowLayout';
import FormComponentRenderer from '../../molecules/forms/FormComponentRenderer';
import type { FormComponentData, ComponentType } from '../../../types';
import ComponentSelect from '../../atoms/interaction/ComponentSelect';

interface SimplifiedCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

const SimplifiedCanvas: React.FC<SimplifiedCanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent,
  onUpdateComponents,
  createComponent
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dropRules = new SimpleDragDropRules();
  
  // Initialize state manager
  const stateManager = new CanvasStateManager(
    { nodes: componentsToNodes(components) },
    createComponent
  );

  // Canvas drop zone for empty areas (Rule 8)
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component'],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        handleCanvasDrop(item);
      }
    }
  });

  drop(canvasRef);

  /**
   * Handle drops from palette to empty canvas areas
   * Rule 8: APPEND_TO_CANVAS_END
   */
  const handleCanvasDrop = useCallback((item: any) => {
    if (item.type && typeof item.type === 'string') {
      console.log('📋 Canvas: Appending to end:', item.type);
      onAddComponent(item.type);
    }
  }, [onAddComponent]);

  /**
   * Handle drops on specific components
   * Rules 7, 9-12: Intent-based operations
   */
  const handleComponentDrop = useCallback((
    draggedItem: any,
    targetId: string,
    intent: Intent,
    targetIndex: number
  ) => {
    console.log('🎯 Drop:', { 
      draggedType: draggedItem.type, 
      targetId, 
      intent, 
      targetIndex 
    });

    const isFromPalette = draggedItem.type && typeof draggedItem.type === 'string' && !draggedItem.id;
    const isFromCanvas = draggedItem.id && draggedItem.component;

    if (!dropRules.isValidDrop(intent, isFromPalette ? 'palette' : 'canvas')) {
      console.log('❌ Invalid drop prevented');
      return;
    }

    let newState: any;

    // Handle horizontal arrangements (Rules 12)
    if (intent === 'LEFT' || intent === 'RIGHT') {
      if (isFromPalette) {
        newState = stateManager.handleHorizontalArrangement(
          draggedItem.type,
          targetId,
          intent
        );
      } else {
        // Move existing canvas item to horizontal layout
        newState = stateManager.handleHorizontalArrangement(
          draggedItem.component,
          targetId,
          intent
        );
      }
    }
    // Handle vertical arrangements (Rules 9-11)
    else {
      if (isFromPalette) {
        newState = stateManager.handleVerticalArrangement(
          draggedItem.type,
          targetId,
          intent
        );
      } else {
        // Move existing canvas item vertically
        newState = stateManager.handleVerticalArrangement(
          draggedItem.component,
          targetId,
          intent
        );
      }
    }

    // Apply state changes and cleanup
    if (newState) {
      const updatedComponents = nodesToComponents(newState.nodes);
      onUpdateComponents(updatedComponents);
      
      // Rule 16: Cleanup RowLayout if needed
      setTimeout(() => {
        const cleanedState = stateManager.cleanupRowLayout();
        const finalComponents = nodesToComponents(cleanedState.nodes);
        onUpdateComponents(finalComponents);
      }, 0);
    }
  }, [stateManager, onUpdateComponents, dropRules]);

  /**
   * Handle component removal (Rules 13-14)
   */
  const handleRemoveFromRow = useCallback((componentId: string) => {
    console.log('🗑️ Removing from row:', componentId);
    
    const newState = stateManager.moveFromRowLayoutToCanvas(
      componentId,
      components.length,
      'APPEND_TO_CANVAS_END'
    );
    
    const updatedComponents = nodesToComponents(newState.nodes);
    onUpdateComponents(updatedComponents);

    // Cleanup empty RowLayout
    setTimeout(() => {
      const cleanedState = stateManager.cleanupRowLayout();
      const finalComponents = nodesToComponents(cleanedState.nodes);
      onUpdateComponents(finalComponents);
    }, 0);
  }, [stateManager, components.length, onUpdateComponents]);

  if (components.length === 0) {
    return (
      <div
        ref={canvasRef}
        style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          border: '2px dashed #e5e7eb',
          borderRadius: '8px',
          color: '#6b7280'
        }}
      >
        Drag components here to start building your form
      </div>
    );
  }

  return (
    <div ref={canvasRef} style={{ minHeight: '400px', padding: '16px' }}>
      {components.map((component, index) => {
        // Render RowLayout with special container
        if (component.type === 'horizontal_layout' && component.children) {
          return (
            <div key={component.id} style={{ marginBottom: '16px' }}>
              <SimplifiedRowLayout
                component={component}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
                onUpdateComponent={onUpdateComponent}
                onDeleteComponent={onDeleteComponent}
                onRemoveFromRow={handleRemoveFromRow}
              />
            </div>
          );
        }

        // Render regular component with drop zone
        return (
          <div key={component.id} style={{ marginBottom: '8px' }}>
            <SimplifiedDropZone
              component={component}
              index={index}
              onDrop={handleComponentDrop}
            >
              <ComponentSelect
                isSelected={selectedComponentId === component.id}
                onSelect={() => onSelectComponent(component.id)}
                onDelete={() => onDeleteComponent(component.id)}
              >
                <FormComponentRenderer
                  component={component}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={onSelectComponent}
                  onUpdateComponent={onUpdateComponent}
                />
              </ComponentSelect>
            </SimplifiedDropZone>
          </div>
        );
      })}
    </div>
  );
};

// Helper functions to convert between formats
function componentsToNodes(components: FormComponentData[]): CanvasNode[] {
  return components.map(component => ({
    id: component.id,
    type: component.type,
    props: extractProps(component),
    children: component.children ? componentsToNodes(component.children) : undefined
  }));
}

function nodesToComponents(nodes: CanvasNode[]): FormComponentData[] {
  return nodes.map(node => ({
    id: node.id,
    type: node.type as any,
    label: node.props?.label || `${node.type} Field`,
    fieldId: node.props?.fieldId || `field_${node.id}`,
    required: node.props?.required || false,
    ...node.props,
    children: node.children ? nodesToComponents(node.children) : undefined
  }));
}

function extractProps(component: FormComponentData): Record<string, any> {
  const { id, type, label, fieldId, required, children, ...props } = component;
  return { label, fieldId, required, ...props };
}

export default SimplifiedCanvas;