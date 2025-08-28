
import React from 'react';
import { useDrop } from 'react-dnd';
import { COMPONENT_TYPE } from '../../../dnd/types';
import type { Page, FormComponentData, ComponentType } from '../../../types';
import SmartCanvasItem from './SmartCanvasItem';
import { getDropIntent, type Intent } from '../core/drop-intent';

// Define actions required by SmartCanvas and its children
interface CanvasActions {
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (componentType: ComponentType, index: number) => void; // Changed from onInsertBetween
}

interface SmartCanvasProps {
  currentPage: Page;
  actions: CanvasActions;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
}

const SmartCanvas: React.FC<SmartCanvasProps> = ({
  currentPage,
  actions,
  selectedComponentId,
  onSelectComponent,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleDrop = (result: Intent) => {
    if (result.intent === 'REORDER') {
      // This is handled by the drop on SmartCanvasItem itself
      return;
    }
    if (result.intent === 'INSERT_TOP' || result.intent === 'INSERT_BOTTOM') {
      const insertIndex = result.intent === 'INSERT_TOP' ? 0 : currentPage.components.length;
      actions.onAddComponent(result.componentType, insertIndex);
    } else if (result.intent === 'INSERT_BETWEEN') {
      actions.onAddComponent(result.componentType, result.insertAfterIndex! + 1);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: [COMPONENT_TYPE], // Accept new components from the palette
    hover(item, monitor) {
      // This space intentionally left blank for now
      // Hover logic for reordering is handled in SmartCanvasItem
    },
    drop(item: { type: ComponentType }, monitor) {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      const result = getDropIntent(monitor, ref);
      if (result) {
        handleDrop(result);
      }
    },
  }));

  drop(ref);

  return (
    <div
      ref={ref}
      data-testid="canvas"
      className="canvas"
      onClick={() => onSelectComponent(null)}
    >
      <div className="canvas__content">
      {currentPage.components.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Drop components here to start building your form.</p>
        </div>
      )}
      {currentPage.components.map((component, index) => (
        <SmartCanvasItem
          key={component.id}
          index={index}
          component={component}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onMoveComponent={actions.onMoveComponent}
        />
      ))}
      </div>
    </div>
  );
};

export default SmartCanvas;
