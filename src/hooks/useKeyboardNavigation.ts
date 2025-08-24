import { useEffect, useCallback } from 'react';

interface KeyboardNavigationProps {
  components: any[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
}

export const useKeyboardNavigation = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
}: KeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedComponentId || components.length === 0) return;

    const currentIndex = components.findIndex(c => c.id === selectedComponentId);
    if (currentIndex === -1) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          onSelectComponent(components[currentIndex - 1].id);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < components.length - 1) {
          onSelectComponent(components[currentIndex + 1].id);
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (event.target instanceof HTMLElement && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
          event.preventDefault();
          onDeleteComponent(selectedComponentId);
        }
        break;

      case 'ArrowUp':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (currentIndex > 0) {
            onMoveComponent(currentIndex, currentIndex - 1);
          }
        }
        break;

      case 'ArrowDown':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (currentIndex < components.length - 1) {
            onMoveComponent(currentIndex, currentIndex + 1);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        // Deselect current component by selecting first component if exists
        if (components.length > 0) {
          onSelectComponent(components[0].id);
        }
        break;
    }
  }, [components, selectedComponentId, onSelectComponent, onDeleteComponent, onMoveComponent]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // ARIA announcements for screen readers
  const announceSelection = useCallback((componentLabel: string) => {
    const announcement = `Selected ${componentLabel} component. Use arrow keys to navigate, Delete to remove, or Ctrl+Arrow to reorder.`;
    
    // Create a temporary element for screen reader announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }, []);

  return {
    announceSelection,
  };
};