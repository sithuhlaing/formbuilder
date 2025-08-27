/**
 * Simplified Canvas Demo - Shows how to use the new modular system
 * This demonstrates the implementation of the hard rules specification
 */

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  SimplifiedCanvas,
  SimplifiedDropZone,
  SimplifiedRowLayout,
  SimpleDragDropRules,
  CanvasStateManager,
  useSimplifiedCanvas
} from './index';
import { SimplifiedProperties } from '../Properties';
import { SimplifiedFormComponentRenderer } from '../molecules/forms';
import type { FormComponentData, ComponentType } from '../../types';

interface SimplifiedCanvasDemoProps {
  // Same props as the original canvas
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

/**
 * This is a drop-in replacement for the old canvas system
 * It implements all the hard rules from the specification
 */
const SimplifiedCanvasDemo: React.FC<SimplifiedCanvasDemoProps> = (props) => {
  const {
    components,
    selectedComponentId,
    onSelectComponent,
    onUpdateComponent,
    onDeleteComponent,
    onUpdateComponents,
    createComponent
  } = props;

  // Use the simplified canvas hook for state management
  const {
    handleComponentDrop,
    handleCanvasDrop,
    handleRemoveFromRow,
    exportState
  } = useSimplifiedCanvas({
    components,
    onUpdateComponents,
    createComponent
  });

  // Find selected component
  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh' }}>
        
        {/* Main Canvas Area */}
        <div style={{ flex: 1, padding: '16px' }}>
          <h2>Simplified Canvas System</h2>
          <p>Implements the hard rules specification:</p>
          <ul style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            <li>35% left/right zones for horizontal layout</li>
            <li>50% top/bottom zones for vertical insertion</li>
            <li>Single RowLayout with multiple items</li>
            <li>Auto-dissolution when only 1 item remains</li>
            <li>Stable IDs on move, new IDs on create</li>
          </ul>

          <SimplifiedCanvas
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onUpdateComponent={onUpdateComponent}
            onDeleteComponent={onDeleteComponent}
            onAddComponent={() => {}} // Handled by drops
            onUpdateComponents={onUpdateComponents}
            createComponent={createComponent}
          />
        </div>

        {/* Properties Panel */}
        <div style={{ width: '300px', borderLeft: '1px solid #e5e7eb' }}>
          <SimplifiedProperties
            selectedComponent={selectedComponent}
            onUpdateComponent={onUpdateComponent}
          />
        </div>
      </div>

      {/* Debug Information */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>Components: {components.length}</div>
        <div>Selected: {selectedComponentId || 'none'}</div>
        <div>RowLayouts: {components.filter(c => c.type === 'horizontal_layout').length}</div>
        <button
          onClick={() => console.log('Current State:', exportState())}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log State
        </button>
      </div>
    </DndProvider>
  );
};

export default SimplifiedCanvasDemo;