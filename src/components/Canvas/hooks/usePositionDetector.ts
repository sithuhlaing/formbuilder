import { useState, useCallback } from 'react';
import type { DropIntent } from '../../../dnd/types';

interface Position {
  x: number;
  y: number;
}

interface DropZone {
  type: 'top' | 'bottom' | 'left' | 'right' | 'center';
  intent: DropIntent;
}

/**
 * Hook for detecting drop position and intent
 */
export function usePositionDetector() {
  const [currentDropZone, setCurrentDropZone] = useState<DropZone | null>(null);
  const [isOverTarget, setIsOverTarget] = useState(false);

  const detectPosition = useCallback((
    element: Element,
    position: Position,
    dragSource: 'palette' | 'canvas' = 'palette'
  ): DropZone => {
    const rect = element.getBoundingClientRect();
    const relativeY = (position.y - rect.top) / rect.height;
    const relativeX = (position.x - rect.left) / rect.width;

    // Determine drop zone based on position
    if (relativeY < 0.3) {
      return { type: 'top', intent: 'INSERT_BEFORE' };
    }
    if (relativeY > 0.7) {
      return { type: 'bottom', intent: 'INSERT_AFTER' };
    }
    if (relativeX < 0.2) {
      return { type: 'left', intent: 'INSERT_HORIZONTAL_LEFT' };
    }
    if (relativeX > 0.8) {
      return { type: 'right', intent: 'INSERT_HORIZONTAL_RIGHT' };
    }

    // Center area - default to append
    return { type: 'center', intent: 'INSERT_AFTER' };
  }, []);

  const onDragEnter = useCallback(() => {
    setIsOverTarget(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsOverTarget(false);
    setCurrentDropZone(null);
  }, []);

  const onDragOver = useCallback((
    element: Element,
    position: Position,
    dragSource: 'palette' | 'canvas' = 'palette'
  ) => {
    const dropZone = detectPosition(element, position, dragSource);
    setCurrentDropZone(dropZone);
    return dropZone;
  }, [detectPosition]);

  const onDrop = useCallback(() => {
    const result = currentDropZone;
    setIsOverTarget(false);
    setCurrentDropZone(null);
    return result;
  }, [currentDropZone]);

  return {
    currentDropZone,
    isOverTarget,
    detectPosition,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
  };
}