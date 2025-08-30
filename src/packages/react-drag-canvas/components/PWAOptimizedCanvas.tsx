/**
 * PWA-Optimized Drag-Drop Canvas Component
 * Addresses CSP, touch interactions, and offline functionality
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import type { 
  CanvasItem, 
  DragDropCanvasProps, 
  DragItem, 
  RenderContext,
  DropPosition 
} from '../types';

// PWA-specific configuration
interface PWAConfig {
  touchOptimized?: boolean;
  reducedMotion?: boolean;
  offlineMode?: boolean;
  minTouchTarget?: number; // WCAG minimum 44px
}

interface PWADragDropCanvasProps extends DragDropCanvasProps {
  pwaConfig?: PWAConfig;
  onOfflineStateChange?: (isOffline: boolean) => void;
}

// PWA-optimized drag handle component
const PWATouchHandle: React.FC<{
  cssPrefix: string;
  touchOptimized: boolean;
  reducedMotion: boolean;
}> = ({ cssPrefix, touchOptimized, reducedMotion }) => {
  const handleStyle: React.CSSProperties = {
    minHeight: touchOptimized ? '44px' : '24px',
    minWidth: touchOptimized ? '44px' : '24px',
    touchAction: 'none', // Prevent scroll during drag
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: reducedMotion ? 'none' : 'all 0.2s ease',
    fontSize: touchOptimized ? '18px' : '14px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  return (
    <div 
      className={`${cssPrefix}__drag-handle`}
      style={handleStyle}
      role="button"
      aria-label="Drag to reorder"
      tabIndex={0}
    >
      {/* Use CSS-based icon instead of Unicode for better PWA compatibility */}
      <div 
        className={`${cssPrefix}__drag-icon`}
        style={{
          width: '12px',
          height: '12px',
          background: `
            linear-gradient(currentColor 0 0) 0 0/100% 2px,
            linear-gradient(currentColor 0 0) 0 5px/100% 2px,
            linear-gradient(currentColor 0 0) 0 10px/100% 2px
          `,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};

// PWA-optimized delete button
const PWADeleteButton: React.FC<{
  cssPrefix: string;
  touchOptimized: boolean;
  onDelete: () => void;
}> = ({ cssPrefix, touchOptimized, onDelete }) => {
  const buttonStyle: React.CSSProperties = {
    minHeight: touchOptimized ? '44px' : '24px',
    minWidth: touchOptimized ? '44px' : '24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: touchOptimized ? '20px' : '16px',
    color: '#ef4444',
    borderRadius: '4px',
  };

  return (
    <button
      className={`${cssPrefix}__delete-btn`}
      style={buttonStyle}
      onClick={onDelete}
      aria-label="Delete item"
      type="button"
    >
      {/* CSS-based X icon for better PWA compatibility */}
      <div 
        style={{
          width: '12px',
          height: '12px',
          position: 'relative',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '2px',
            background: 'currentColor',
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '2px',
            background: 'currentColor',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
          }}
        />
      </div>
    </button>
  );
};

// Hook for PWA offline detection
const useOfflineDetection = (onOfflineStateChange?: (isOffline: boolean) => void) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOfflineStateChange?.(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      onOfflineStateChange?.(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOfflineStateChange]);

  return { isOnline, isOffline: !isOnline };
};

// Hook for reduced motion preference
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};

export const PWADragDropCanvas: React.FC<PWADragDropCanvasProps> = ({
  items,
  renderItem,
  onItemMove,
  onLayoutCreate,
  onItemDelete,
  onItemAdd,
  selectedItemId,
  config = {},
  className = '',
  pwaConfig = {},
  onOfflineStateChange,
}) => {
  const {
    cssPrefix = 'canvas',
    enableHorizontalLayouts = true,
    enableVerticalLayouts = true,
    dropZoneThresholds = { horizontal: 0.25, vertical: 0.3 }
  } = config;

  const {
    touchOptimized = true,
    offlineMode = false,
    minTouchTarget = 44
  } = pwaConfig;

  // PWA hooks
  const { isOnline, isOffline } = useOfflineDetection(onOfflineStateChange);
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = pwaConfig.reducedMotion ?? systemReducedMotion;

  // ============================================================================
  // PWA-OPTIMIZED SMART DROP ZONE
  // ============================================================================

  const PWASmartDropZone: React.FC<{
    item: CanvasItem;
    index: number;
  }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [dropPosition, setDropPosition] = useState<string>('');

    // Enhanced position calculation with touch considerations
    const calculateDropPosition = useCallback((clientOffset: { x: number; y: number } | null) => {
      if (!ref.current || !clientOffset) return 'center';

      const rect = ref.current.getBoundingClientRect();
      const x = clientOffset.x - rect.left;
      const y = clientOffset.y - rect.top;
      const { width, height } = rect;

      // Larger touch zones for mobile
      const horizontalThreshold = touchOptimized ? 0.3 : dropZoneThresholds.horizontal;
      const verticalThreshold = touchOptimized ? 0.35 : dropZoneThresholds.vertical;

      if (enableHorizontalLayouts) {
        if (x < width * horizontalThreshold) return 'left';
        if (x > width * (1 - horizontalThreshold)) return 'right';
      }

      if (enableVerticalLayouts) {
        if (y < height * verticalThreshold) return 'before';
        if (y > height * (1 - verticalThreshold)) return 'after';
      }

      return 'center';
    }, [enableHorizontalLayouts, enableVerticalLayouts, touchOptimized]);

    // PWA-optimized drag with touch support
    const [{ isDragging }, drag] = useDrag({
      type: 'existing-item',
      item: { 
        type: 'existing-item',
        id: item.id,
        index,
        item 
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    // PWA-optimized drop with touch support
    const [{ isOver }, drop] = useDrop({
      accept: ['new-item', 'existing-item'],
      hover: (dragItem: DragItem, monitor) => {
        const position = calculateDropPosition(monitor.getClientOffset());
        setDropPosition(position);
      },
      drop: (dragItem: DragItem, monitor) => {
        const position = calculateDropPosition(monitor.getClientOffset());
        
        if (dragItem.type === 'existing-item') {
          if (dragItem.index !== undefined && dragItem.index !== index) {
            onItemMove(dragItem.index, index);
          }
        } else if (dragItem.type === 'new-item' && dragItem.itemType) {
          if (position === 'left' || position === 'right') {
            onLayoutCreate(dragItem.itemType, item.id, position);
          } else if (onItemAdd) {
            onItemAdd(dragItem.itemType, { type: position as any, targetId: item.id });
          }
        }
        
        setDropPosition('');
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drag(drop(ref));

    const isSelected = selectedItemId === item.id;
    const isHover = isOver && dropPosition !== '';

    // PWA-optimized styles
    const itemStyle: React.CSSProperties = {
      opacity: isDragging ? 0.5 : 1,
      transition: reducedMotion ? 'none' : 'opacity 0.2s ease',
      minHeight: touchOptimized ? `${minTouchTarget}px` : 'auto',
      position: 'relative',
    };

    return (
      <div
        ref={ref}
        data-testid={`${cssPrefix}-item-${index}`}
        data-item-id={item.id}
        className={`
          ${cssPrefix}__item 
          ${cssPrefix}__smart-drop-zone
          ${isSelected ? `${cssPrefix}__item--selected` : ''}
          ${isDragging ? `${cssPrefix}__item--dragging` : ''}
          ${isHover ? `${cssPrefix}__item--hover` : ''}
          ${isHover ? `${cssPrefix}__item--drop-${dropPosition}` : ''}
          ${touchOptimized ? `${cssPrefix}__item--touch-optimized` : ''}
          ${isOffline ? `${cssPrefix}__item--offline` : ''}
        `.trim()}
        style={itemStyle}
      >
        {/* PWA-optimized drop indicator */}
        {isHover && (
          <div 
            className={`${cssPrefix}__drop-indicator ${cssPrefix}__drop-indicator--${dropPosition}`}
            style={{
              transition: reducedMotion ? 'none' : 'all 0.2s ease',
            }}
          >
            <span className={`${cssPrefix}__drop-label`}>
              {dropPosition === 'left' ? '← Drop Left' : 
               dropPosition === 'right' ? 'Drop Right →' :
               dropPosition === 'before' ? '↑ Drop Before' :
               dropPosition === 'after' ? '↓ Drop After' : 
               'Drop Here'}
            </span>
          </div>
        )}

        {/* PWA-optimized controls */}
        <div className={`${cssPrefix}__item-controls`}>
          <PWATouchHandle 
            cssPrefix={cssPrefix}
            touchOptimized={touchOptimized}
            reducedMotion={reducedMotion}
          />
          <PWADeleteButton
            cssPrefix={cssPrefix}
            touchOptimized={touchOptimized}
            onDelete={() => onItemDelete(item.id)}
          />
        </div>

        {/* Render item content - CSP-safe */}
        <div className={`${cssPrefix}__item-content`}>
          {renderItem(item, {
            isSelected,
            isDragging,
            isHover,
            cssPrefix
          })}
        </div>

        {/* Offline indicator */}
        {isOffline && (
          <div className={`${cssPrefix}__offline-indicator`}>
            <span>📴</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PWA-OPTIMIZED HORIZONTAL LAYOUT
  // ============================================================================

  const PWAHorizontalLayout: React.FC<{
    item: CanvasItem;
    index: number;
  }> = ({ item, index }) => {
    const children = item.children || [];

    const layoutStyle: React.CSSProperties = {
      minHeight: touchOptimized ? `${minTouchTarget}px` : 'auto',
    };

    return (
      <div 
        className={`${cssPrefix}__horizontal-layout ${touchOptimized ? `${cssPrefix}__horizontal-layout--touch` : ''}`}
        data-testid={`${cssPrefix}-layout`}
        data-item-id={item.id}
        style={layoutStyle}
      >
        <div className={`${cssPrefix}__layout-header`}>
          <span className={`${cssPrefix}__layout-label`}>
            Horizontal Layout ({children.length} items)
          </span>
          <PWADeleteButton
            cssPrefix={cssPrefix}
            touchOptimized={touchOptimized}
            onDelete={() => onItemDelete(item.id)}
          />
        </div>

        <div className={`${cssPrefix}__layout-content`}>
          {children.map((child, childIndex) => (
            <div
              key={child.id}
              data-testid={`${cssPrefix}-layout-item-${childIndex}`}
              className={`${cssPrefix}__layout-item`}
            >
              {renderItem(child, {
                isSelected: selectedItemId === child.id,
                isDragging: false,
                isHover: false,
                cssPrefix
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // PWA-OPTIMIZED MAIN CANVAS
  // ============================================================================

  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: ['new-item'],
    drop: (dragItem: DragItem) => {
      if (dragItem.type === 'new-item' && dragItem.itemType && onItemAdd) {
        onItemAdd(dragItem.itemType, { type: 'center' });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Connect the drop target to the ref
  drop(canvasRef);

  const canvasStyle: React.CSSProperties = {
    minHeight: touchOptimized ? '200px' : '100px',
    touchAction: 'pan-y', // Allow vertical scrolling but prevent horizontal
  };

  return (
    <div
      ref={canvasRef}
      className={`
        ${cssPrefix} 
        ${className} 
        ${isOver ? `${cssPrefix}--drop-active` : ''}
        ${touchOptimized ? `${cssPrefix}--touch-optimized` : ''}
        ${isOffline ? `${cssPrefix}--offline` : ''}
        ${reducedMotion ? `${cssPrefix}--reduced-motion` : ''}
      `.trim()}
      data-testid={cssPrefix}
      style={canvasStyle}
    >
      {/* PWA status indicator */}
      {isOffline && (
        <div className={`${cssPrefix}__pwa-status`}>
          <span>📴 Offline Mode - Changes saved locally</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className={`${cssPrefix}__empty-state`}>
          <p>No items yet. {touchOptimized ? 'Tap and drag' : 'Drag'} items here to get started.</p>
        </div>
      ) : (
        items.map((item, index) => {
          if (item.type === 'horizontal_layout') {
            return (
              <PWAHorizontalLayout
                key={item.id}
                item={item}
                index={index}
              />
            );
          }

          return (
            <PWASmartDropZone
              key={item.id}
              item={item}
              index={index}
            />
          );
        })
      )}
    </div>
  );
};
