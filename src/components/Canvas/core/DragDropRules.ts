/**
 * Simplified Drag-and-Drop Rules Implementation
 * Based on the specified hard rules for canvas interactions
 */

import type { DropZoneCalculator } from './types';
export type { Intent } from './types';
import { type Intent } from './types';

export class SimpleDragDropRules implements DropZoneCalculator {
  private static readonly LEFT_THRESHOLD = 0.35;
  private static readonly RIGHT_THRESHOLD = 0.65;
  private static readonly TOP_THRESHOLD = 0.5;

  /**
   * Rule 7: Determine drop intent based on pointer position
   */
  calculateIntent(
    clientOffset: { x: number; y: number },
    targetRect: DOMRect,
    isEmptyCanvasGap: boolean = false
  ): Intent {
    // Rule 8: Empty canvas gap
    if (isEmptyCanvasGap) {
      return 'APPEND_TO_CANVAS_END';
    }

    const x = clientOffset.x - targetRect.left;
    const y = clientOffset.y - targetRect.top;
    const width = targetRect.width;
    const height = targetRect.height;

    // Normalize to percentages
    const xPercent = x / width;
    const yPercent = y / height;

    // Rule 7.1: Left 35%
    if (xPercent < SimpleDragDropRules.LEFT_THRESHOLD) {
      return 'LEFT';
    }

    // Rule 7.2: Right 35%
    if (xPercent > SimpleDragDropRules.RIGHT_THRESHOLD) {
      return 'RIGHT';
    }

    // Rule 7.3: Top 50% of remaining center area
    if (yPercent < SimpleDragDropRules.TOP_THRESHOLD) {
      return 'BEFORE';
    }

    // Rule 7.4: Bottom 50% of remaining center area
    return 'AFTER';
  }

  /**
   * Validates if a drop operation is allowed
   * Rule 18: Prevent invalid drops
   */
  isValidDrop(intent: Intent, dragSource: 'palette' | 'canvas', targetContext?: any): boolean {
    // Rule 17: Never create nested RowLayouts
    if (intent === 'LEFT' || intent === 'RIGHT') {
      if (targetContext?.isInsideRowLayout && dragSource === 'canvas') {
        // Allow moving within existing RowLayout
        return true;
      }
      // Allow creating new RowLayout or expanding existing one
      return true;
    }

    return true;
  }
}
