import type { XYCoord } from 'react-dnd';
import type { DropPosition, CrossSectionRegions, PositionDetectionResult } from '../types/positioning';

export class PositionDetector {
  private readonly ZONE_THRESHOLD = 0.3; // 30% of each edge for directional zones
  private readonly CENTER_THRESHOLD = 0.4; // 40% center zone

  /**
   * Calculates cross-section regions for a component element
   */
  calculateCrossSectionRegions(element: HTMLElement): CrossSectionRegions {
    const rect = element.getBoundingClientRect();
    const { width, height, top, left, right, bottom } = rect;
    
    const zoneWidth = width * this.ZONE_THRESHOLD;
    const zoneHeight = height * this.ZONE_THRESHOLD;
    const centerWidth = width * this.CENTER_THRESHOLD;
    const centerHeight = height * this.CENTER_THRESHOLD;
    
    const centerLeft = left + (width - centerWidth) / 2;
    const centerTop = top + (height - centerHeight) / 2;

    return {
      top: new DOMRect(left, top, width, zoneHeight),
      right: new DOMRect(right - zoneWidth, top, zoneWidth, height),
      bottom: new DOMRect(left, bottom - zoneHeight, width, zoneHeight),
      left: new DOMRect(left, top, zoneWidth, height),
      center: new DOMRect(centerLeft, centerTop, centerWidth, centerHeight)
    };
  }

  /**
   * Detects drop position based on mouse coordinates and component bounds
   */
  detectDropPosition(
    mouseX: number, 
    mouseY: number, 
    regions: CrossSectionRegions
  ): DropPosition {
    const point = { x: mouseX, y: mouseY };

    // Check each region in priority order (center first, then edges)
    if (this.isPointInRect(point, regions.center)) {
      return 'center';
    }
    if (this.isPointInRect(point, regions.top)) {
      return 'top';
    }
    if (this.isPointInRect(point, regions.right)) {
      return 'right';
    }
    if (this.isPointInRect(point, regions.bottom)) {
      return 'bottom';
    }
    if (this.isPointInRect(point, regions.left)) {
      return 'left';
    }

    // Fallback to center if no specific region matches
    return 'center';
  }

  /**
   * Determines the positioning result based on drop position and current state
   */
  calculatePositioningResult(
    position: DropPosition,
    targetIndex: number,
    targetComponentId: string,
    isTargetInRow: boolean = false
  ): PositionDetectionResult {
    switch (position) {
      case 'top':
        return {
          position,
          targetIndex,
          shouldCreateRow: false,
          targetComponentId
        };

      case 'bottom':
        return {
          position,
          targetIndex: targetIndex + 1,
          shouldCreateRow: false,
          targetComponentId
        };

      case 'left':
      case 'right':
        return {
          position,
          targetIndex,
          shouldCreateRow: !isTargetInRow, // Only create row if target isn't already in a row
          targetComponentId
        };

      case 'center':
      default:
        return {
          position,
          targetIndex: targetIndex + 1,
          shouldCreateRow: false,
          targetComponentId
        };
    }
  }

  /**
   * Gets visual indicator bounds for a drop position
   */
  getIndicatorBounds(position: DropPosition, elementBounds: DOMRect): DOMRect {
    const { top, left, width, height, right, bottom } = elementBounds;
    const INDICATOR_THICKNESS = 4;
    const MARGIN = 2;

    switch (position) {
      case 'top':
        return new DOMRect(
          left - MARGIN, 
          top - INDICATOR_THICKNESS - MARGIN, 
          width + (MARGIN * 2), 
          INDICATOR_THICKNESS
        );

      case 'right':
        return new DOMRect(
          right + MARGIN, 
          top - MARGIN, 
          INDICATOR_THICKNESS, 
          height + (MARGIN * 2)
        );

      case 'bottom':
        return new DOMRect(
          left - MARGIN, 
          bottom + MARGIN, 
          width + (MARGIN * 2), 
          INDICATOR_THICKNESS
        );

      case 'left':
        return new DOMRect(
          left - INDICATOR_THICKNESS - MARGIN, 
          top - MARGIN, 
          INDICATOR_THICKNESS, 
          height + (MARGIN * 2)
        );

      case 'center':
      default:
        return new DOMRect(
          left - MARGIN, 
          bottom + MARGIN, 
          width + (MARGIN * 2), 
          INDICATOR_THICKNESS
        );
    }
  }

  private isPointInRect(point: { x: number; y: number }, rect: DOMRect): boolean {
    return point.x >= rect.left && 
           point.x <= rect.right && 
           point.y >= rect.top && 
           point.y <= rect.bottom;
  }

  static detect(
    monitor: { getClientOffset: () => XYCoord | null },
    ref: React.RefObject<HTMLElement>,
    index: number,
    id: string
  ): PositionDetectionResult | null {
    if (!ref.current) {
      return null;
    }

    const hoverBoundingRect = ref.current.getBoundingClientRect();
    const clientOffset = monitor.getClientOffset();

    if (!clientOffset) {
      return null;
    }

    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    const isTopHalf = hoverClientY < hoverMiddleY;
    const isLeftHalf = hoverClientX < hoverMiddleX;

    // Simple vertical detection for now
    if (isTopHalf) {
      return { position: 'top', targetId: id, targetIndex: index };
    } else {
      return { position: 'bottom', targetId: id, targetIndex: index };
    }
  }
}

// Singleton instance
export const positionDetector = new PositionDetector();