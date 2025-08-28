import type { DropIntent } from '../../../dnd/types';

// Export Intent as alias for backwards compatibility
export type Intent = DropIntent;

/**
 * Determines the drop intent based on drop position and target
 */
export function getDropIntent(
  targetElement: Element | null,
  dropPosition: { x: number; y: number },
  dragSource: 'palette' | 'canvas'
): DropIntent {
  if (!targetElement) {
    return 'INVALID';
  }

  const rect = targetElement.getBoundingClientRect();
  const relativeY = dropPosition.y - rect.top;
  const relativeX = dropPosition.x - rect.left;
  
  // Calculate position percentages
  const yPercent = relativeY / rect.height;
  const xPercent = relativeX / rect.width;

  // If dragging from palette, determine insertion intent
  if (dragSource === 'palette') {
    // Top 30% -> Insert before
    if (yPercent < 0.3) {
      return 'INSERT_BEFORE';
    }
    // Bottom 30% -> Insert after
    if (yPercent > 0.7) {
      return 'INSERT_AFTER';
    }
    
    // Middle 40% horizontal zones
    // Far left (< 20%) -> Insert horizontal left
    if (xPercent < 0.2) {
      return 'INSERT_HORIZONTAL_LEFT';
    }
    // Far right (> 80%) -> Insert horizontal right
    if (xPercent > 0.8) {
      return 'INSERT_HORIZONTAL_RIGHT';
    }
    
    // Middle area -> Insert after (append)
    return 'INSERT_AFTER';
  }
  
  // If dragging from canvas (reordering), determine reorder intent
  if (dragSource === 'canvas') {
    // Top 50% -> Insert before
    if (yPercent < 0.5) {
      return 'INSERT_BEFORE';
    }
    // Bottom 50% -> Insert after
    return 'INSERT_AFTER';
  }

  return 'INVALID';
}

/**
 * Gets the drop zone type based on element and position
 */
export function getDropZone(
  element: Element,
  position: { x: number; y: number }
): 'top' | 'bottom' | 'left' | 'right' | 'center' {
  const rect = element.getBoundingClientRect();
  const relativeY = (position.y - rect.top) / rect.height;
  const relativeX = (position.x - rect.left) / rect.width;
  
  if (relativeY < 0.3) return 'top';
  if (relativeY > 0.7) return 'bottom';
  if (relativeX < 0.3) return 'left';
  if (relativeX > 0.7) return 'right';
  
  return 'center';
}