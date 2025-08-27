/**
 * Auto-Sizing Canvas Component
 * Implements content-driven sizing with automatic height/width adjustments
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { SimpleDragDropRules, Intent } from '../core/DragDropRules';
import { CanvasStateManager } from '../core/CanvasStateManager';
import SimplifiedDropZone from './SimplifiedDropZone';
import AutoSizingRowLayout from './AutoSizingRowLayout';
import { SimplifiedFormComponentRenderer } from '../../molecules/forms';
import type { FormComponentData, ComponentType } from '../../../types';

interface AutoSizingCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

const AutoSizingCanvas: React.FC<AutoSizingCanvasProps> = ({
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
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const dropRules = new SimpleDragDropRules();
  
  // Initialize state manager
  const stateManager = new CanvasStateManager(
    { nodes: componentsToNodes(components) },
    createComponent
  );

  /**
   * Auto-resize canvas based on content
   * Canvas height increases/decreases with content
   */
  useEffect(() => {
    if (canvasRef.current) {
      const updateHeight = () => {
        const scrollHeight = canvasRef.current?.scrollHeight || 0;
        const contentHeight = Math.max(scrollHeight, 400); // Minimum 400px
        setCanvasHeight(contentHeight);
      };

      // Update height after content changes
      const timeoutId = setTimeout(updateHeight, 0);
      
      // Also update on resize
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(canvasRef.current);

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    }
  }, [components]);

  // Canvas drop zone for empty areas - increases canvas height
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
   * Appends to canvas → increases height automatically
   */
  const handleCanvasDrop = useCallback((item: any) => {
    if (item.type && typeof item.type === 'string') {
      console.log('📋 Canvas: Appending to end (height will increase):', item.type);
      onAddComponent(item.type);
    }
  }, [onAddComponent]);

  /**
   * Handle drops on specific components
   * Vertical drops increase height, horizontal drops maintain height but distribute width
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
      targetIndex,
      heightWillChange: intent === 'BEFORE' || intent === 'AFTER'
    });

    const isFromPalette = draggedItem.type && typeof draggedItem.type === 'string' && !draggedItem.id;
    const isFromCanvas = draggedItem.id && draggedItem.component;

    if (!dropRules.isValidDrop(intent, isFromPalette ? 'palette' : 'canvas')) {
      console.log('❌ Invalid drop prevented');
      return;
    }

    let newState: any;

    // Handle horizontal arrangements (maintains height, distributes width)
    if (intent === 'LEFT' || intent === 'RIGHT') {
      console.log('↔️ Horizontal drop: Canvas height unchanged, row width will distribute');
      if (isFromPalette) {
        newState = stateManager.handleHorizontalArrangement(
          draggedItem.type,
          targetId,
          intent
        );
      } else {
        newState = stateManager.handleHorizontalArrangement(
          draggedItem.component,
          targetId,
          intent
        );
      }
    }
    // Handle vertical arrangements (increases/changes height)
    else {
      console.log('↕️ Vertical drop: Canvas height will adjust');
      if (isFromPalette) {
        newState = stateManager.handleVerticalArrangement(
          draggedItem.type,
          targetId,
          intent
        );
      } else {
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
      
      // Cleanup RowLayout if needed
      setTimeout(() => {
        const cleanedState = stateManager.cleanupRowLayout();
        const finalComponents = nodesToComponents(cleanedState.nodes);
        onUpdateComponents(finalComponents);
      }, 0);
    }
  }, [stateManager, onUpdateComponents, dropRules]);

  /**
   * Handle component removal - shrinks canvas height
   */
  const handleRemoveFromRow = useCallback((componentId: string) => {
    console.log('🗑️ Removing from row (canvas may shrink):', componentId);
    
    const newState = stateManager.moveFromRowLayoutToCanvas(
      componentId,
      components.length,
      'APPEND_TO_CANVAS_END'
    );
    
    const updatedComponents = nodesToComponents(newState.nodes);
    onUpdateComponents(updatedComponents);

    // Cleanup empty RowLayout - may shrink canvas
    setTimeout(() => {
      const cleanedState = stateManager.cleanupRowLayout();
      const finalComponents = nodesToComponents(cleanedState.nodes);
      onUpdateComponents(finalComponents);
      console.log('📏 Canvas height will adjust after cleanup');
    }, 0);
  }, [stateManager, components.length, onUpdateComponents]);

  /**
   * Handle component deletion - shrinks canvas height
   */
  const handleDeleteComponent = useCallback((componentId: string) => {
    console.log('🗑️ Deleting component (canvas will shrink):', componentId);
    onDeleteComponent(componentId);
  }, [onDeleteComponent]);

  if (components.length === 0) {
    return (
      <div
        ref={canvasRef}
        style={{
          minHeight: '400px',
          height: 'auto', // Content-driven
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          border: '2px dashed #e5e7eb',
          borderRadius: '8px',
          color: '#6b7280',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            Drag components here to start building
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            Canvas height grows automatically with content
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      style={{
        minHeight: '400px',
        height: 'auto', // Content-driven sizing
        padding: '16px',
        backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        transition: 'background-color 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Content-driven layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px', // Consistent spacing between components
        width: '100%'
      }}>
        {components.map((component, index) => {
          // Render RowLayout with auto-sizing and width distribution
          if (component.type === 'horizontal_layout' && component.children) {
            return (
              <div key={component.id}>
                <AutoSizingRowLayout
                  component={component}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={onSelectComponent}
                  onUpdateComponent={onUpdateComponent}
                  onDeleteComponent={handleDeleteComponent}
                  onRemoveFromRow={handleRemoveFromRow}
                />
              </div>
            );
          }

          // Render regular component with drop zone
          return (
            <div key={component.id}>
              <SimplifiedDropZone
                component={component}
                index={index}
                onDrop={handleComponentDrop}
              >
                <SimplifiedFormComponentRenderer
                  component={component}
                  isSelected={selectedComponentId === component.id}
                  onSelect={() => onSelectComponent(component.id)}
                  onUpdate={onUpdateComponent}
                  onDelete={() => handleDeleteComponent(component.id)}
                  mode="builder"
                />
              </SimplifiedDropZone>
            </div>
          );
        })}
      </div>

      {/* Canvas sizing indicator (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          H: {Math.round(canvasHeight)}px | Items: {components.length}
        </div>
      )}
    </div>
  );
};

// Helper functions
function componentsToNodes(components: FormComponentData[]): any[] {
  return components.map(component => ({
    id: component.id,
    type: component.type,
    props: extractProps(component),
    children: component.children ? componentsToNodes(component.children) : undefined
  }));
}

function nodesToComponents(nodes: any[]): FormComponentData[] {
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

export default AutoSizingCanvas;