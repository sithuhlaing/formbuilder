/**
 * PERFORMANCE OPTIMIZATION - Virtualization for Long Lists
 * 
 * This component implements:
 * 1. Virtual scrolling for large lists
 * 2. Dynamic item height calculation
 * 3. Efficient memory usage for thousands of items
 */

import React, { 
  useState, 
  useRef, 
  useCallback, 
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  CSSProperties 
} from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  itemHeight?: number | ((index: number) => number);
  height: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export interface VirtualizedListRef {
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  scrollToItem: (item: any, align?: 'start' | 'center' | 'end') => void;
  getScrollTop: () => number;
}

export const VirtualizedList = forwardRef<VirtualizedListRef, VirtualizedListProps<any>>(function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  height,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedListProps<T>, ref) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  // Calculate item height
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: VirtualItem[] = [];
    let currentPosition = 0;

    for (let i = 0; i < items.length; i++) {
      const size = getItemHeight(i);
      positions.push({
        index: i,
        start: currentPosition,
        end: currentPosition + size,
        size
      });
      currentPosition += size;
    }

    return positions;
  }, [items.length, getItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    return itemPositions[itemPositions.length - 1].end;
  }, [itemPositions]);

  // Find visible items based on scroll position
  const visibleItems = useMemo(() => {
    const containerHeight = height;
    const startIndex = itemPositions.findIndex(item => item.end > scrollTop);
    const endIndex = itemPositions.findIndex(item => item.start > scrollTop + containerHeight);
    
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(
      items.length - 1, 
      (endIndex === -1 ? items.length - 1 : endIndex) + overscan
    );

    const visible: Array<{ item: T; index: number; style: CSSProperties }> = [];
    
    for (let i = start; i <= end; i++) {
      if (i < items.length && itemPositions[i]) {
        const position = itemPositions[i];
        visible.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute',
            top: position.start,
            left: 0,
            right: 0,
            height: position.size,
            zIndex: 1
          }
        });
      }
    }

    return visible;
  }, [items, itemPositions, scrollTop, height, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current || !itemPositions[index]) return;

    const item = itemPositions[index];
    let targetScrollTop = item.start;

    if (align === 'center') {
      targetScrollTop = item.start - (height - item.size) / 2;
    } else if (align === 'end') {
      targetScrollTop = item.end - height;
    }

    targetScrollTop = Math.max(0, Math.min(totalHeight - height, targetScrollTop));
    scrollElementRef.current.scrollTop = targetScrollTop;
  }, [itemPositions, height, totalHeight]);

  // Scroll to specific item
  const scrollToItem = useCallback((item: T, align: 'start' | 'center' | 'end' = 'start') => {
    const index = items.indexOf(item);
    if (index !== -1) {
      scrollToIndex(index, align);
    }
  }, [items, scrollToIndex]);

  // Expose scroll methods via ref
  useImperativeHandle(ref, () => ({
    scrollToIndex,
    scrollToItem,
    getScrollTop: () => scrollTop
  }), [scrollToIndex, scrollToItem, scrollTop]);

  return (
    <div 
      className={`virtualized-list ${className}`}
      style={{ height, overflow: 'hidden' }}
    >
      <div
        ref={scrollElementRef}
        className="virtualized-list-container"
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
        onScroll={handleScroll}
      >
        <div
          className="virtualized-list-content"
          style={{
            position: 'relative',
            height: totalHeight,
            width: '100%'
          }}
        >
          {visibleItems.map(({ item, index, style }) => (
            <div
              key={`item-${index}`}
              className="virtualized-list-item"
              style={style}
            >
              {renderItem(item, index, style)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Hook for easier usage
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number | ((index: number) => number) = 50
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const handleScroll = useCallback((scrollTop: number) => {
    setScrollTop(scrollTop);
  }, []);

  return {
    VirtualizedList: ({ renderItem, ...props }: Omit<VirtualizedListProps<T>, 'items' | 'height' | 'itemHeight' | 'onScroll'>) => (
      <VirtualizedList
        items={items}
        renderItem={renderItem}
        height={containerHeight}
        itemHeight={itemHeight}
        onScroll={handleScroll}
        {...props}
      />
    ),
    scrollTop,
    totalItems: items.length
  };
}

export default VirtualizedList;