/**
 * Auto-Sizing Canvas Demo
 * Demonstrates content-driven canvas sizing with automatic adjustments
 */

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ResponsiveCanvasWrapper } from './index';
import { SimplifiedProperties } from '../Properties';
import ComponentPalette from '../ComponentPalette/ComponentPalette';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import type { ComponentType } from '../../types';

const AutoSizingCanvasDemo: React.FC = () => {
  const {
    components,
    selectedComponent,
    selectedComponentId,
    addComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
    updateCurrentPageComponents,
    createComponent
  } = useFormBuilder();

  const [showMetrics, setShowMetrics] = useState(true);

  // Calculate canvas metrics
  const rowLayouts = components.filter(c => c.type === 'horizontal_layout');
  const totalRowItems = rowLayouts.reduce((sum, row) => sum + (row.children?.length || 0), 0);
  const regularComponents = components.filter(c => c.type !== 'horizontal_layout');

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '300px 1fr 300px',
        height: '100vh',
        background: '#f9fafb'
      }}>
        
        {/* Component Palette */}
        <div style={{ borderRight: '1px solid #e5e7eb', background: '#ffffff' }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Component Palette
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Drag to canvas → Height increases
            </p>
          </div>
          <ComponentPalette onAddComponent={addComponent} />
        </div>

        {/* Auto-Sizing Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Canvas Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                Auto-Sizing Canvas
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                Content-driven sizing • No manual resize needed
              </p>
            </div>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </button>
          </div>

          {/* Metrics Panel (if enabled) */}
          {showMetrics && (
            <div style={{
              padding: '12px 16px',
              background: '#f3f4f6',
              borderBottom: '1px solid #e5e7eb',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              fontSize: '12px'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>Total Items</div>
                <div style={{ color: '#6b7280' }}>{components.length}</div>
              </div>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>Regular Components</div>
                <div style={{ color: '#6b7280' }}>{regularComponents.length}</div>
              </div>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>Row Layouts</div>
                <div style={{ color: '#6b7280' }}>{rowLayouts.length}</div>
              </div>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>Items in Rows</div>
                <div style={{ color: '#6b7280' }}>{totalRowItems}</div>
              </div>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>Sizing Mode</div>
                <div style={{ color: '#059669' }}>Auto</div>
              </div>
            </div>
          )}

          {/* Responsive Canvas */}
          <ResponsiveCanvasWrapper
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={selectComponent}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
            onAddComponent={addComponent}
            onUpdateComponents={updateCurrentPageComponents}
            createComponent={createComponent}
          />
        </div>

        {/* Properties Panel */}
        <div style={{ borderLeft: '1px solid #e5e7eb', background: '#ffffff' }}>
          <SimplifiedProperties
            selectedComponent={selectedComponent}
            onUpdateComponent={updateComponent}
          />
        </div>
      </div>

      {/* Canvas Behavior Rules */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        maxWidth: '280px',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          📐 Canvas Sizing Rules:
        </div>
        <div>• <strong>Palette → Canvas:</strong> Height increases automatically</div>
        <div>• <strong>Row Layout:</strong> Width distributes, height unchanged</div>
        <div>• <strong>Remove Item:</strong> Canvas shrinks accordingly</div>
        <div>• <strong>No Manual Resize:</strong> Always content-driven</div>
      </div>

      {/* Quick Actions */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => {
            // Add multiple components to demo height growth
            ['text_input', 'email', 'textarea', 'select'].forEach((type, i) => {
              setTimeout(() => addComponent(type as ComponentType), i * 200);
            });
          }}
          style={{
            padding: '8px 12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          📈 Demo Height Growth
        </button>
        
        <button
          onClick={() => updateCurrentPageComponents([])}
          style={{
            padding: '8px 12px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🗑️ Clear All (Shrink)
        </button>
      </div>
    </DndProvider>
  );
};

export default AutoSizingCanvasDemo;