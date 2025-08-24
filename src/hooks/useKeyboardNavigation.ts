import { useEffect, useCallback } from 'react';
import type { FormComponentData } from '../components/types';

interface KeyboardNavigationProps {
  components: FormComponentData[];
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
    // Don't handle keyboard events when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    const selectedIndex = selectedComponentId 
      ? components.findIndex(c => c.id === selectedComponentId)
      : -1;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (selectedIndex > 0) {
          onSelectComponent(components[selectedIndex - 1].id);
        } else if (components.length > 0) {
          onSelectComponent(components[components.length - 1].id);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (selectedIndex < components.length - 1 && selectedIndex >= 0) {
          onSelectComponent(components[selectedIndex + 1].id);
        } else if (components.length > 0) {
          onSelectComponent(components[0].id);
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (selectedComponentId && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onDeleteComponent(selectedComponentId);
        }
        break;

      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (selectedIndex > 0) {
            onMoveComponent(selectedIndex, selectedIndex - 1);
          }
        }
        break;

      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < components.length - 1) {
            onMoveComponent(selectedIndex, selectedIndex + 1);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        onSelectComponent('');
        break;
    }
  }, [components, selectedComponentId, onSelectComponent, onDeleteComponent, onMoveComponent]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return any additional utilities if needed
    selectedIndex: selectedComponentId 
      ? components.findIndex(c => c.id === selectedComponentId)
      : -1,
  };
};
