/**
 * Responsive Canvas Wrapper
 * Handles container sizing, scrolling, and responsive behavior
 * Ensures canvas is always content-driven without manual resize
 */

import React, { useRef, useEffect, useState } from 'react';
import AutoSizingCanvas from './AutoSizingCanvas';
import type { FormComponentData, ComponentType } from '../../../types';

interface ResponsiveCanvasWrapperProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

const ResponsiveCanvasWrapper: React.FC<ResponsiveCanvasWrapperProps> = (props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canvasMetrics, setCanvasMetrics] = useState({
    height: 0,
    width: 0,
    itemCount: 0,
    rowCount: 0
  });

  // Track canvas metrics for debugging/analytics
  useEffect(() => {
    const { components } = props;
    const rowCount = components.filter(c => c.type === 'horizontal_layout').length;
    
    setCanvasMetrics({
      height: wrapperRef.current?.scrollHeight || 0,
      width: wrapperRef.current?.clientWidth || 0,
      itemCount: components.length,
      rowCount
    });
  }, [props.components]);

  // Handle scroll behavior for long canvases
  const scrollToBottom = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: wrapperRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f9fafb'
    }}>
      {/* Canvas Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#ffffff',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500' }}>Canvas</span>
          <span>{canvasMetrics.itemCount} components</span>
          <span>{canvasMetrics.rowCount} row layouts</span>
          <span>Auto-sizing: {canvasMetrics.height}px</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {canvasMetrics.height > 800 && (
            <>
              <button
                onClick={scrollToTop}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#6b7280'
                }}
                title="Scroll to top"
              >
                ↑ Top
              </button>
              <button
                onClick={scrollToBottom}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#6b7280'
                }}
                title="Scroll to bottom"
              >
                ↓ Bottom
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Canvas Container */}
      <div
        ref={wrapperRef}
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#ffffff',
          position: 'relative'
        }}
      >
        {/* Content-driven canvas */}
        <AutoSizingCanvas {...props} />

        {/* Canvas Growth Indicator */}
        {canvasMetrics.itemCount > 5 && (
          <div style={{
            position: 'sticky',
            bottom: '16px',
            right: '16px',
            float: 'right',
            background: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 100
          }}>
            📏 Canvas auto-sized to {Math.round(canvasMetrics.height)}px
          </div>
        )}
      </div>

      {/* Canvas Sizing Rules Info */}
      <div style={{
        background: '#f3f4f6',
        padding: '8px 16px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '11px',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>📐 Height: Content-driven</span>
          <span>↔️ Row width: Auto-distributed</span>
          <span>🗑️ Removal: Auto-shrink</span>
        </div>
        <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
          Min: 400px | Current: {Math.round(canvasMetrics.height)}px
        </div>
      </div>
    </div>
  );
};

export default ResponsiveCanvasWrapper;