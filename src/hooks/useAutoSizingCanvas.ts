/**
 * Auto-Sizing Canvas Hook
 * Manages content-driven canvas sizing with automatic height adjustments
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import type { FormComponentData } from '../types';

interface CanvasSizeMetrics {
  height: number;
  width: number;
  contentHeight: number;
  itemCount: number;
  rowLayoutCount: number;
  estimatedHeight: number;
}

interface UseAutoSizingCanvasProps {
  components: FormComponentData[];
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoSizingCanvas({
  components,
  minHeight = 400,
  maxHeight = Infinity
}: UseAutoSizingCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<CanvasSizeMetrics>({
    height: minHeight,
    width: 0,
    contentHeight: 0,
    itemCount: 0,
    rowLayoutCount: 0,
    estimatedHeight: minHeight
  });

  /**
   * Calculate estimated height based on component count and types
   * Used for pre-sizing before content is fully rendered
   */
  const calculateEstimatedHeight = useCallback((components: FormComponentData[]): number => {
    const BASE_HEIGHT = 80; // Base height per component
    const ROW_LAYOUT_HEIGHT = 120; // Height for row layouts
    const SPACING = 12; // Gap between components
    const PADDING = 32; // Container padding

    let estimatedHeight = PADDING;

    components.forEach(component => {
      if (component.type === 'horizontal_layout') {
        estimatedHeight += ROW_LAYOUT_HEIGHT;
      } else {
        estimatedHeight += BASE_HEIGHT;
      }
      estimatedHeight += SPACING;
    });

    return Math.max(estimatedHeight, minHeight);
  }, [minHeight]);

  /**
   * Update canvas metrics
   */
  const updateMetrics = useCallback(() => {
    if (!canvasRef.current) return;

    const element = canvasRef.current;
    const contentHeight = element.scrollHeight;
    const actualHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
    const rowLayoutCount = components.filter(c => c.type === 'horizontal_layout').length;
    const estimatedHeight = calculateEstimatedHeight(components);

    setMetrics({
      height: actualHeight,
      width: element.clientWidth,
      contentHeight,
      itemCount: components.length,
      rowLayoutCount,
      estimatedHeight
    });
  }, [components, minHeight, maxHeight, calculateEstimatedHeight]);

  /**
   * Auto-resize effect
   */
  useEffect(() => {
    // Update immediately
    updateMetrics();

    // Update after a short delay to allow content to settle
    const timeoutId = setTimeout(updateMetrics, 100);

    // Set up ResizeObserver for automatic updates
    let resizeObserver: ResizeObserver;
    if (canvasRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateMetrics]);

  /**
   * Handle component addition - predicts height increase
   */
  const handleComponentAdd = useCallback((componentType: string) => {
    console.log('📏 Component added, canvas will grow:', {
      type: componentType,
      currentHeight: metrics.height,
      estimatedIncrease: componentType === 'horizontal_layout' ? 120 : 80
    });
  }, [metrics.height]);

  /**
   * Handle component removal - predicts height decrease
   */
  const handleComponentRemove = useCallback((componentId: string) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      console.log('📏 Component removed, canvas will shrink:', {
        type: component.type,
        currentHeight: metrics.height,
        estimatedDecrease: component.type === 'horizontal_layout' ? 120 : 80
      });
    }
  }, [components, metrics.height]);

  /**
   * Handle row layout changes - width distribution only
   */
  const handleRowLayoutChange = useCallback((rowId: string, action: 'add' | 'remove', childCount: number) => {
    console.log('📏 Row layout changed:', {
      rowId,
      action,
      childCount,
      heightChange: 'none (width redistributes only)',
      newWidthDistribution: `${Math.round(100 / childCount)}% per item`
    });
  }, []);

  /**
   * Get responsive canvas styles
   */
  const getCanvasStyles = useCallback(() => ({
    minHeight: `${minHeight}px`,
    height: 'auto', // Content-driven
    maxHeight: maxHeight !== Infinity ? `${maxHeight}px` : 'none',
    transition: 'min-height 0.2s ease',
    overflow: 'visible'
  }), [minHeight, maxHeight]);

  /**
   * Get container styles for scrollable wrapper
   */
  const getContainerStyles = useCallback(() => ({
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const
  }), []);

  /**
   * Scroll to specific position
   */
  const scrollTo = useCallback((position: 'top' | 'bottom' | number) => {
    if (!canvasRef.current) return;

    const element = canvasRef.current;
    let scrollTop: number;

    switch (position) {
      case 'top':
        scrollTop = 0;
        break;
      case 'bottom':
        scrollTop = element.scrollHeight;
        break;
      default:
        scrollTop = position;
    }

    element.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }, []);

  return {
    canvasRef,
    metrics,
    handleComponentAdd,
    handleComponentRemove,
    handleRowLayoutChange,
    getCanvasStyles,
    getContainerStyles,
    scrollTo,
    updateMetrics
  };
}