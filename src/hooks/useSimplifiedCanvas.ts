/**
 * Simplified Canvas Hook - Manages drag-and-drop state with hard rules
 * Implements the simplified specification for canvas interactions
 */

import { useCallback } from 'react';
import { CanvasStateManager } from '../components/Canvas/core/CanvasStateManager';
import type { CanvasNode } from '../components/Canvas/core/types';
import type { Intent } from '../components/Canvas/core/types';
import type { FormComponentData, ComponentType } from '../types';

interface UseSimplifiedCanvasProps {
  components: FormComponentData[];
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

export function useSimplifiedCanvas({
  components,
  onUpdateComponents,
  createComponent
}: UseSimplifiedCanvasProps) {
  
  const stateManager = new CanvasStateManager(
    { nodes: componentsToNodes(components) },
    createComponent
  );

  /**
   * Handle component drop with intent-based logic
   * Implements rules 5-6, 9-12
   */
  const handleComponentDrop = useCallback((
    draggedItem: any,
    targetId: string,
    intent: Intent,
    targetIndex: number
  ) => {
    console.log('🎯 Canvas Drop:', { draggedItem, targetId, intent, targetIndex });

    const isFromPalette = draggedItem.type && typeof draggedItem.type === 'string' && !draggedItem.id;
    const isFromCanvas = draggedItem.id && draggedItem.component;

    let newState: any;

    try {
      // Rule 12: Horizontal arrangements (LEFT/RIGHT)
      if (intent === 'LEFT' || intent === 'RIGHT') {
        if (isFromPalette) {
          // Create new component and add to horizontal layout
          newState = stateManager.handleHorizontalArrangement(
            draggedItem.type,
            targetId,
            intent
          );
        } else if (isFromCanvas) {
          // Move existing component to horizontal layout
          newState = stateManager.handleHorizontalArrangement(
            draggedItem.component,
            targetId,
            intent
          );
        }
      }
      // Rules 9-11: Vertical arrangements (BEFORE/AFTER/APPEND)
      else {
        if (isFromPalette) {
          // Create new component and add vertically
          newState = stateManager.handleVerticalArrangement(
            draggedItem.type,
            targetId,
            intent
          );
        } else if (isFromCanvas) {
          // Move existing component vertically
          newState = stateManager.handleVerticalArrangement(
            draggedItem.component,
            targetId,
            intent
          );
        }
      }

      if (newState) {
        const updatedComponents = nodesToComponents(newState.nodes);
        onUpdateComponents(updatedComponents);

        // Rule 16: Cleanup RowLayout if needed (after state settles)
        setTimeout(() => {
          const cleanedState = stateManager.cleanupRowLayout();
          const finalComponents = nodesToComponents(cleanedState.nodes);
          onUpdateComponents(finalComponents);
        }, 0);
      }
    } catch (error) {
      console.error('Drop operation failed:', error);
    }
  }, [stateManager, onUpdateComponents]);

  /**
   * Handle canvas drop (empty area)
   * Rule 8: APPEND_TO_CANVAS_END
   */
  const handleCanvasDrop = useCallback((draggedItem: any) => {
    console.log('📋 Canvas Drop (empty area):', draggedItem);

    if (draggedItem.type && typeof draggedItem.type === 'string') {
      try {
        const newState = stateManager.handleVerticalArrangement(
          draggedItem.type,
          null,
          'APPEND_TO_CANVAS_END'
        );

        if (newState) {
          const updatedComponents = nodesToComponents(newState.nodes);
          onUpdateComponents(updatedComponents);
        }
      } catch (error) {
        console.error('Canvas drop failed:', error);
      }
    }
  }, [stateManager, onUpdateComponents]);

  /**
   * Handle removal from row layout
   * Rules 13-14: Move from RowLayout to Canvas
   */
  const handleRemoveFromRow = useCallback((componentId: string) => {
    console.log('🗑️ Remove from row:', componentId);

    try {
      const newState = stateManager.moveFromRowLayoutToCanvas(
        componentId,
        components.length,
        'APPEND_TO_CANVAS_END'
      );

      if (newState) {
        const updatedComponents = nodesToComponents(newState.nodes);
        onUpdateComponents(updatedComponents);

        // Cleanup empty RowLayout
        setTimeout(() => {
          const cleanedState = stateManager.cleanupRowLayout();
          const finalComponents = nodesToComponents(cleanedState.nodes);
          onUpdateComponents(finalComponents);
        }, 0);
      }
    } catch (error) {
      console.error('Remove from row failed:', error);
    }
  }, [stateManager, components.length, onUpdateComponents]);

  /**
   * Export current state as JSON
   * Rule 22: Maintain JSON representation
   */
  const exportState = useCallback(() => {
    return stateManager.exportJSON();
  }, [stateManager]);

  return {
    handleComponentDrop,
    handleCanvasDrop,
    handleRemoveFromRow,
    exportState
  };
}

// Helper functions for format conversion
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