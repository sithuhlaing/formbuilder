/**
 * Fixed Viewport Canvas Component
 * Size: boundary fixed_to_viewport, content: vertical expand_with_scroll, horizontal rowlayout_share_width
 * Canvas boundary does not resize when items are added - only content scrolls
 */

import React, { useCallback, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { SimpleDragDropRules } from '../Canvas/core/DragDropRules';
import type { Intent } from '../Canvas/core/types';
import { CanvasStateManager } from '../Canvas/core/CanvasStateManager';
import FixedBoundaryDropZone from './FixedBoundaryDropZone';
import FixedWidthRowLayout from './FixedWidthRowLayout';
import { SimplifiedFormComponentRenderer } from '../molecules/forms';
import type { FormComponentData, ComponentType } from '../../types';

interface FixedViewportCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
  isMobile: boolean;
}

const FixedViewportCanvas: React.FC<FixedViewportCanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent,
  onUpdateComponents,
  createComponent,
  isMobile
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const dropRules = new SimpleDragDropRules();

  // Initialize state manager
  const stateManager = new CanvasStateManager(
    { nodes: componentsToNodes(components) },
    createComponent
  );

  // Fixed viewport canvas drop zone - boundary never changes size
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
   * source_left_panel drop handler
   * action: "create_new_item", result: "increase canvas collection by 1"
   */
  const handleCanvasDrop = useCallback((item: any) => {
    if (item.type && typeof item.type === 'string') {
      console.log('📋 Left Panel → Canvas:', {
        action: 'create_new_item',
        type: item.type,
        result: 'increase canvas collection by 1',
        boundary: 'fixed (content scrolls)'
      });
      onAddComponent(item.type);
    }
  }, [onAddComponent]);

  /**
   * source_canvas drop handler
   * intent_before: "insert above target"
   * intent_after: "insert below target" 
   * intent_left: "insert left of target (create RowLayout if none)"
   * intent_right: "insert right of target (create RowLayout if none)"
   */
  const handleComponentDrop = useCallback((
    draggedItem: any,
    targetId: string,
    intent: Intent,
    targetIndex: number
  ) => {
    const intentActions = {
      'BEFORE': 'insert above target',
      'AFTER': 'insert below target', 
      'LEFT': 'insert left of target (create RowLayout if none)',
      'RIGHT': 'insert right of target (create RowLayout if none)'
    };
    
    console.log('🎯 Canvas Drop:', { 
      source: 'canvas',
      draggedType: draggedItem.type || 'existing-component', 
      targetId, 
      intent,
      action: intentActions[intent] || intent,
      targetIndex,
      boundaryChange: 'none (fixed to viewport)'
    });

    const isFromPalette = draggedItem.type && typeof draggedItem.type === 'string' && !draggedItem.id;
    const isFromCanvas = draggedItem.id && draggedItem.component;

    if (!dropRules.isValidDrop(intent, isFromPalette ? 'palette' : 'canvas')) {
      console.log('❌ Invalid drop prevented');
      return;
    }

    // 🔥 FIX: For palette drops, use onAddComponent to increase collection by 1
    if (isFromPalette) {
      console.log('📋 Palette → Canvas: Adding new component (collection +1)', {
        currentCount: components.length,
        newCount: components.length + 1,
        targetId: targetId,
        intent: intentActions[intent],
        layoutBehavior: 'increase collection by 1'
      });
      onAddComponent(draggedItem.type);
      return;
    }

    // Only use stateManager for canvas-to-canvas moves (rearrangement)
    if (isFromCanvas) {
      console.log('🔄 Canvas → Canvas: Rearranging existing component');
      let newState: any;

      // intent_left/right: "insert left/right of target (create RowLayout if none)"
      if (intent === 'LEFT' || intent === 'RIGHT') {
        console.log(`↔️ Horizontal arrangement: ${intentActions[intent]}`);
        console.log('rowlayout_rules: max_one_row=true, dissolve_if_one_left=true');
        newState = stateManager.handleHorizontalArrangement(
          draggedItem.component,
          targetId,
          intent
        );
      }
      // intent_before/after: "insert above/below target"
      else {
        console.log(`↕️ Vertical arrangement: ${intentActions[intent]}`);
        newState = stateManager.handleVerticalArrangement(
          draggedItem.component,
          targetId,
          intent
        );
      }

      // Apply state changes and cleanup
      if (newState) {
        const updatedComponents = nodesToComponents(newState.nodes);
        onUpdateComponents(updatedComponents);
        
        // rowlayout_rules: dissolve_if_one_left = true
        setTimeout(() => {
          console.log('🧹 Auto-cleanup: Checking RowLayout dissolution rule');
          const cleanedState = stateManager.cleanupRowLayout();
          const finalComponents = nodesToComponents(cleanedState.nodes);
          onUpdateComponents(finalComponents);
        }, 0);
      }
    }
  }, [stateManager, onUpdateComponents, dropRules, onAddComponent]);

  /**
   * Handle removing item from RowLayout
   * Rule: "If dropping outside a RowLayout, remove the item from that row"
   */
  const handleRemoveFromRow = useCallback((componentId: string) => {
    console.log('🗑️ Removing from row (placing at canvas position):', componentId);
    
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

  /**
   * Handle component deletion
   * Rule: "Dragging an item out of canvas removes it completely"
   */
  const handleDeleteComponent = useCallback((componentId: string) => {
    console.log('🗑️ Remove Item Rule: drag out → remove from canvas → update schema');
    
    // Use stateManager to handle removal with auto-cleanup
    const newState = stateManager.removeItemFromCanvas(componentId);
    const updatedComponents = nodesToComponents(newState.nodes);
    onUpdateComponents(updatedComponents);
  }, [stateManager, onUpdateComponents]);

  // Check if content overflows to show scroll indicator
  React.useEffect(() => {
    if (canvasRef.current) {
      const element = canvasRef.current;
      setShowScrollIndicator(element.scrollHeight > element.clientHeight);
    }
  }, [components]);

  if (components.length === 0) {
    return (
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%', // Fixed to viewport
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          border: '2px dashed #e5e7eb',
          borderRadius: '8px',
          color: '#6b7280',
          padding: '24px',
          overflow: 'auto', // Scroll enabled
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '8px' }}>
            {isMobile ? 'Tap + to add components' : 'Drag components here to start building'}
          </div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#9ca3af' }}>
            Canvas boundary is fixed to viewport • Content scrolls as needed
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '4px',
            border: '1px dashed rgba(59, 130, 246, 0.2)'
          }}>
            📋 Drop behavior: source_left_panel → create_new_item → increase collection by 1
          </div>
        </div>

        {/* Canvas boundary indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          Viewport: Fixed | Content: Scrollable
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%', // Fixed boundary to viewport
        overflow: 'auto', // Scroll enabled for content
        padding: '16px',
        backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        border: isOver && canDrop ? '2px dashed #3b82f6' : '2px dashed transparent',
        position: 'relative'
      }}
    >
      {/* Content area - can expand beyond viewport */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: 'max-content' // Content-driven height within fixed boundary
      }}>
        {components.map((component, index) => {
          // Render RowLayout with fixed width sharing
          if (component.type === 'horizontal_layout' && component.children) {
            return (
              <div key={component.id}>
                <FixedWidthRowLayout
                  component={component}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={onSelectComponent}
                  onUpdateComponent={onUpdateComponent}
                  onDeleteComponent={handleDeleteComponent}
                  onRemoveFromRow={handleRemoveFromRow}
                  isMobile={isMobile}
                />
              </div>
            );
          }

          // Render regular component with drop zone
          return (
            <div key={component.id}>
              <FixedBoundaryDropZone
                component={component}
                index={index}
                onDrop={handleComponentDrop}
                isMobile={isMobile}
              >
                <SimplifiedFormComponentRenderer
                  component={component}
                  isSelected={selectedComponentId === component.id}
                  onSelect={() => onSelectComponent(component.id)}
                  onUpdate={onUpdateComponent}
                  onDelete={() => handleDeleteComponent(component.id)}
                  mode="builder"
                />
              </FixedBoundaryDropZone>
            </div>
          );
        })}
      </div>

      {/* Dynamic drag feedback */}
      {isOver && canDrop && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(59, 130, 246, 0.95)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }}>
          <div>📋 Palette → Canvas</div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
            Collection: {components.length} → {components.length + 1} items
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
            Action: create_new_item
          </div>
        </div>
      )}

      {/* Fixed viewport boundary indicators */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <div>Boundary: Fixed</div>
        <div>Collection: {components.length} items</div>
        <div>Rows: {components.filter(c => c.type === 'horizontal_layout').length}</div>
        <div style={{ fontSize: '8px', opacity: 0.7 }}>
          Next drop: +1 item
        </div>
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          ↕️ Scroll for more content
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

export default FixedViewportCanvas;