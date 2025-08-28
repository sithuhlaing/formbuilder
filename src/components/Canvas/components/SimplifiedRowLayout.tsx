/**
 * Simplified Row Layout Component
 * Implements Rule 15: Single RowLayout with multiple horizontal items
 */

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import SimplifiedFormComponentRenderer from '../../molecules/forms/SimplifiedFormComponentRenderer';
import type { FormComponentData } from '../../../types';

interface SimplifiedRowLayoutProps {
  component: FormComponentData;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onRemoveFromRow: (componentId: string) => void;
}

const SimplifiedRowLayout: React.FC<SimplifiedRowLayoutProps> = ({
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
      data-testid="row-layout"
      style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: isOver && canDrop ? 'rgba(245, 158, 11, 0.1)' : '#fafafa',
        position: 'relative'
      }}
    >
      {/* Row Layout Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500'
      }}>
        <span>Row Layout ({component.children.length} items)</span>
        <button
          onClick={() => onDeleteComponent(component.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Delete entire row layout"
        >
          ✕
        </button>
      </div>

      {/* Horizontal Items Container */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'stretch',
        minHeight: '60px',
        flexWrap: 'wrap'
      }}>
        {component.children.map((child, index) => (
          <div
            key={child.id}
            style={{
              flex: '1',
              minWidth: '200px',
              position: 'relative',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px',
              backgroundColor: '#ffffff'
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
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
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
                title="Remove from row (move to canvas)"
              >
                ↗
              </button>
            </div>

            {/* Component Renderer */}
            <SimplifiedFormComponentRenderer
              component={child}
              isSelected={selectedComponentId === child.id}
              onSelect={() => onSelectComponent(child.id)}
              onUpdate={(updates) => {
                // Update child in parent's children array
                const updatedChildren = component.children!.map(c => 
                  c.id === child.id ? { ...c, ...updates } : c
                );
                onUpdateComponent({
                  ...component,
                  children: updatedChildren
                });
              }}
              onDelete={() => {
                // Remove child from parent's children array
                const updatedChildren = component.children!.filter(c => c.id !== child.id);
                onUpdateComponent({
                  ...component,
                  children: updatedChildren
                });
              }}
              mode="builder"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplifiedRowLayout;