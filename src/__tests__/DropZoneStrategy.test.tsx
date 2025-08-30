import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BetweenComponentsDropStrategy, CanvasMainDropStrategy } from '../features/form-builder/components/Canvas/strategies/DropZoneStrategy';
import type { DragItem } from '../features/form-builder/components/Canvas/types';

// Define CanvasActions interface locally since it may not be exported
interface CanvasActions {
  onAddComponent: (componentType: string) => void;
  onInsertBetween?: (componentType: string, index: number) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string) => void;
}

describe('DropZoneStrategy', () => {
  let mockActions: CanvasActions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockActions = {
      onAddComponent: vi.fn(),
      onInsertBetween: vi.fn(),
      onMoveFromContainerToCanvas: vi.fn(),
    };
  });

  describe('BetweenComponentsDropStrategy', () => {
    test('should handle drop with onInsertBetween when available', () => {
      const strategy = new BetweenComponentsDropStrategy(mockActions, 2);
      const dragItem: DragItem = { type: 'text_input' };

      strategy.handleDrop(dragItem);

      expect(mockActions.onInsertBetween).toHaveBeenCalledWith('text_input', 2);
      expect(mockActions.onAddComponent).toHaveBeenCalledTimes(0);
    });

    test('should fallback to onAddComponent when onInsertBetween is not available', () => {
      const actionsWithoutInsert = { ...mockActions, onInsertBetween: undefined };
      const strategy = new BetweenComponentsDropStrategy(actionsWithoutInsert, 2);
      const dragItem: DragItem = { type: 'text_input' };

      strategy.handleDrop(dragItem);

      expect(actionsWithoutInsert.onAddComponent).toHaveBeenCalledWith('text_input');
    });

    test('should return correct accepted types', () => {
      const strategy = new BetweenComponentsDropStrategy(mockActions, 0);
      expect(strategy.getAcceptedTypes()).toEqual(['component']);
    });

    test('should return correct drop indicator text', () => {
      const strategy = new BetweenComponentsDropStrategy(mockActions, 0);
      expect(strategy.getDropIndicatorText()).toBe('Drop here to insert');
    });
  });

  describe('CanvasMainDropStrategy', () => {
    test('should handle drop for new component', () => {
      const strategy = new CanvasMainDropStrategy(mockActions);
      const dragItem: DragItem = { type: 'text_input', isFromContainer: false };

      strategy.handleDrop(dragItem);

      expect(mockActions.onAddComponent).toHaveBeenCalledWith('text_input');
    });

    test('should handle drop for component moved from container', () => {
      const strategy = new CanvasMainDropStrategy(mockActions);
      const dragItem: DragItem = {
        type: 'text_input',
        id: 'comp-1',
        isFromContainer: true,
        containerPath: 'container-1'
      };

      strategy.handleDrop(dragItem);

      expect(mockActions.onMoveFromContainerToCanvas).toHaveBeenCalledWith('comp-1', 'container-1');
    });

    test('should return correct accepted types', () => {
      const strategy = new CanvasMainDropStrategy(mockActions);
      expect(strategy.getAcceptedTypes()).toEqual(['component', 'nested-component']);
    });

    test('should return correct drop indicator text', () => {
      const strategy = new CanvasMainDropStrategy(mockActions);
      expect(strategy.getDropIndicatorText()).toBe('Drop components here to build your form');
    });
  });
});
