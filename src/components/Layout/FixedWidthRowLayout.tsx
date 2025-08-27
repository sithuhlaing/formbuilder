/**
 * Fixed Width Row Layout Component
 * Implements row layout with equal width distribution (CSS Grid)
 * Canvas boundary stays fixed - only row width is distributed
 */

import React from 'react';
import { SimplifiedFormComponentRenderer } from '../molecules/forms';
import type { FormComponentData } from '../../types';

interface FixedWidthRowLayoutProps {
  component: FormComponentData;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onRemoveFromRow: (componentId: string) => void;
  isMobile: boolean;
}

const FixedWidthRowLayout: React.FC<FixedWidthRowLayoutProps> = ({
  component,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onRemoveFromRow,
  isMobile
}) => {
  const children = component.children || [];
  const childCount = children.length;

  if (childCount === 0) {
    return null;
  }

  // Calculate equal width distribution
  const itemWidth = Math.round(100 / Math.max(childCount, 1));

  console.log('📐 Row Layout:', {
    id: component.id,
    childCount,
    widthDistribution: `${itemWidth}% each`,
    boundaryChange: 'none (fixed to viewport)'
  });

  return (
    <div style={{
      border: '1px dashed #e5e7eb',
      borderRadius: '8px',
      padding: '8px',
      backgroundColor: '#fafafa',
      position: 'relative'
    }}>
      {/* Row layout header */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '8px',
        background: '#ffffff',
        padding: '2px 8px',
        fontSize: '10px',
        color: '#6b7280',
        fontWeight: '500',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>↔️ Row Layout</span>
        <span>({childCount} items @ {itemWidth}% each)</span>
      </div>

      {/* CSS Grid for equal width distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${childCount}, 1fr)`,
        gap: isMobile ? '8px' : '12px',
        alignItems: 'start',
        minHeight: '80px',
        padding: '12px 0'
      }}>
        {children.map((child, index) => (
          <div 
            key={child.id}
            style={{
              minWidth: '0', // Prevent grid overflow
              position: 'relative',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              padding: '8px'
            }}
          >
            {/* Width indicator */}
            <div style={{
              position: 'absolute',
              top: '2px',
              right: '4px',
              fontSize: '9px',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              {itemWidth}%
            </div>

            {/* Remove from row button */}
            <button
              onClick={() => onRemoveFromRow(child.id)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '4px',
                width: '16px',
                height: '16px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Remove from row layout"
            >
              ✕
            </button>

            <div style={{ marginTop: '12px' }}>
              <SimplifiedFormComponentRenderer
                component={child}
                isSelected={selectedComponentId === child.id}
                onSelect={() => onSelectComponent(child.id)}
                onUpdate={onUpdateComponent}
                onDelete={() => onDeleteComponent(child.id)}
                mode="builder"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Row layout actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>Width: Auto-distributed ({childCount} columns)</span>
          <span>Boundary: Fixed to viewport</span>
        </div>
        
        <button
          onClick={() => onDeleteComponent(component.id)}
          style={{
            border: '1px solid #ef4444',
            background: 'none',
            color: '#ef4444',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            cursor: 'pointer'
          }}
          title="Delete entire row layout"
        >
          🗑️ Delete Row
        </button>
      </div>
    </div>
  );
};

export default FixedWidthRowLayout;