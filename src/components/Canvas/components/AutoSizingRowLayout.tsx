/**
 * Auto-Sizing Row Layout Component
 * Implements flexible width distribution using CSS Grid/Flexbox
 * Canvas height remains unchanged when items are added/removed from row
 */

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { SimplifiedFormComponentRenderer } from '../../molecules/forms';
import type { FormComponentData } from '../../../types';

interface AutoSizingRowLayoutProps {
  component: FormComponentData;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onRemoveFromRow: (componentId: string) => void;
}

const AutoSizingRowLayout: React.FC<AutoSizingRowLayoutProps> = ({
  component,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onRemoveFromRow
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'canvas-item'],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    })
  });

  drop(ref);

  if (!component.children || component.children.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: isOver && canDrop ? 'rgba(245, 158, 11, 0.1)' : '#fafafa',
        position: 'relative',
        // Height remains fixed regardless of content
        minHeight: '120px',
        height: 'auto'
      }}
    >
      {/* Row Layout Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Row Layout</span>
          <span style={{ 
            background: '#e0e7ff', 
            color: '#3730a3', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            {component.children.length} items
          </span>
          <span style={{ color: '#9ca3af', fontSize: '10px' }}>
            Width auto-distributes
          </span>
        </div>
        <button
          onClick={() => onDeleteComponent(component.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Delete entire row layout"
        >
          🗑️ Delete Row
        </button>
      </div>

      {/* Auto-distributing Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${component.children.length}, 1fr)`, // Equal distribution
        gap: '12px',
        alignItems: 'stretch',
        minHeight: '60px',
        width: '100%'
      }}>
        {component.children.map((child, index) => (
          <div
            key={child.id}
            style={{
              position: 'relative',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              // Each item takes equal width automatically
              minWidth: '0', // Prevents overflow
              overflow: 'hidden'
            }}
          >
            {/* Item Controls */}
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              display: 'flex',
              gap: '4px',
              zIndex: 10
            }}>
              <button
                onClick={() => onRemoveFromRow(child.id)}
                style={{
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#6b7280';
                }}
                title="Move to canvas (removes from row)"
              >
                ↗
              </button>
            </div>

            {/* Item Index Indicator */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              background: '#f3f4f6',
              color: '#6b7280',
              fontSize: '10px',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              {index + 1}/{component.children?.length}
            </div>

            {/* Component Content */}
            <div style={{ 
              marginTop: '24px',
              flex: 1,
              minHeight: 0 // Allows proper shrinking
            }}>
              <SimplifiedFormComponentRenderer
                component={child}
                isSelected={selectedComponentId === child.id}
                onSelect={() => onSelectComponent(child.id)}
                onUpdate={(updates) => {
                  // Update child in parent's children array
                  const updatedChildren = component.children?.map(c => 
                    c.id === child.id ? { ...c, ...updates } : c
                  );
                  onUpdateComponent({
                    ...component,
                    children: updatedChildren
                  });
                }}
                onDelete={() => {
                  // Remove child from parent's children array
                  const updatedChildren = component.children?.filter(c => c.id !== child.id);
                  onUpdateComponent({
                    ...component,
                    children: updatedChildren
                  });
                  console.log('🔄 Row item deleted, width will redistribute among remaining items');
                }}
                mode="builder"
              />
            </div>

            {/* Width Distribution Indicator */}
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              color: '#9ca3af',
              textAlign: 'center',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '4px'
            }}>
              Width: {Math.round(100 / (component.children?.length || 1))}%
            </div>
          </div>
        ))}
      </div>

      {/* Row Layout Information */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        {component.children.length === 1 && 'Single item - row will dissolve when saved'}
        {component.children.length === 2 && 'Two items - 50% width each'}
        {component.children.length === 3 && 'Three items - 33.3% width each'}
        {component.children.length >= 4 && `${component.children.length} items - ${Math.round(100/component.children.length)}% width each`}
      </div>
    </div>
  );
};

export default AutoSizingRowLayout;