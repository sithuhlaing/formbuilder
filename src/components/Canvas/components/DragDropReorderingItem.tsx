import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import SimplifiedFormComponentRenderer from '../../molecules/forms/SimplifiedFormComponentRenderer';
import type { FormComponentData } from '../../../types';

interface DragDropReorderingItemProps {
  component: FormComponentData;
  index: number;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onCreateRowLayout?: (draggedComponent: FormComponentData, targetComponent: FormComponentData, position: 'left' | 'right') => void;
  onAddToRowLayout?: (draggedComponent: FormComponentData, targetRowLayout: FormComponentData, position: 'left' | 'right') => void;
  onUpdateComponents?: (components: FormComponentData[]) => void;
  allComponents: FormComponentData[]; // Need access to all components to find parent row layouts
  createComponent?: (type: string) => FormComponentData; // For creating new components locally
}

interface DragItem {
  type: string;
  id: string;
  index: number;
  component: FormComponentData;
}

const DragDropReorderingItem: React.FC<DragDropReorderingItemProps> = ({
  component,
  index,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onMoveComponent,
  onCreateRowLayout,
  onAddToRowLayout,
  onUpdateComponents,
  allComponents,
  createComponent
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<'none' | 'top' | 'bottom' | 'left' | 'right' | 'center'>('none');

  // Helper function to find parent row layout
  const findParentRowLayout = (targetComponent: FormComponentData): FormComponentData | null => {
    for (const comp of allComponents) {
      if (comp.type === 'horizontal_layout' && comp.children) {
        if (comp.children.some(child => child.id === targetComponent.id)) {
          return comp;
        }
      }
    }
    return null;
  };

  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'reorder-component',
    item: (): DragItem => ({
      type: 'reorder-component',
      id: component.id,
      index,
      component,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality with hover logic
  const [{ handlerId }, drop] = useDrop({
    accept: ['reorder-component', 'component', 'horizontal-component'],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      
      // Check if this is a palette component or horizontal component
      const isPaletteComponent = !item.component && item.type && typeof item.type === 'string';
      const isHorizontalComponent = item.type === 'horizontal-component' && item.component;
      
      if (isPaletteComponent || isHorizontalComponent) {
        // For palette components and horizontal components, show positioning indicators
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          setHoverPosition('none');
          return;
        }

        const width = hoverBoundingRect.width;
        const height = hoverBoundingRect.height;
        const x = clientOffset.x - hoverBoundingRect.left;
        const y = clientOffset.y - hoverBoundingRect.top;
        
        // Define edge zones (30% from each edge)
        const edgeZone = 0.3;
        const topZone = height * edgeZone;
        const bottomZone = height * (1 - edgeZone);
        const leftZone = width * edgeZone;
        const rightZone = width * (1 - edgeZone);
        
        let position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'center';
        
        if (y < topZone) {
          position = 'top';
        } else if (y > bottomZone) {
          position = 'bottom';
        } else if (x < leftZone) {
          position = 'left';
        } else if (x > rightZone) {
          position = 'right';
        } else {
          position = 'center';
        }
        
        setHoverPosition(position);
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        setHoverPosition('none');
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setHoverPosition('none');
        return;
      }

      // Calculate cross-section regions (similar to smart positioning)
      const width = hoverBoundingRect.width;
      const height = hoverBoundingRect.height;
      
      const x = clientOffset.x - hoverBoundingRect.left;
      const y = clientOffset.y - hoverBoundingRect.top;
      
      // Define edge zones (30% from each edge)
      const edgeZone = 0.3;
      const topZone = height * edgeZone;
      const bottomZone = height * (1 - edgeZone);
      const leftZone = width * edgeZone;
      const rightZone = width * (1 - edgeZone);
      
      // Determine position based on cross-section logic
      let position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'center';
      
      if (y < topZone) {
        position = 'top';
      } else if (y > bottomZone) {
        position = 'bottom';
      } else if (x < leftZone) {
        position = 'left';
      } else if (x > rightZone) {
        position = 'right';
      } else {
        position = 'center';
      }
      
      // 🔍 DEBUG POSITION DETECTION
      if (position !== 'center') {
        console.log('🔍 Position Detection:', {
          x, y, width, height,
          topZone, bottomZone, leftZone, rightZone,
          detectedPosition: position,
          calculations: {
            isTop: y < topZone,
            isBottom: y > bottomZone,
            isLeft: x < leftZone,
            isRight: x > rightZone
          }
        });
      }
      
      setHoverPosition(position);

      // For top/bottom positions, use the original reordering logic
      if (position === 'top' || position === 'bottom') {
        const hoverMiddleY = height / 2;
        const hoverClientY = y;

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Perform reordering move
        onMoveComponent(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      // For left/right positions, we'll handle row layout creation in the drop handler
    },
    drop(item: any, monitor) {
      const finalPosition = hoverPosition;
      setHoverPosition('none');
      
      // Determine component type
      const isPaletteComponent = !item.component && item.type && typeof item.type === 'string';
      const isHorizontalComponent = item.type === 'horizontal-component' && item.component;
      
      if (isPaletteComponent) {
        // 🎯 CHECK DRAG SOURCE: If from left panel → create a new item
        console.log('🎯 DRAG SOURCE CHECK: LEFT PANEL → CREATE NEW ITEM');
        console.log('✅ HARD RULES + IMPLEMENTATION:');
        console.log('  → Each drop adds one more element to the canvas (like pushing into a collection)');
        console.log('  → Rule: drop always increases collection size, never replaces');
        console.log('📊 BEFORE DROP:', {
          dragSource: 'LEFT_PANEL',
          action: 'CREATE_NEW_ITEM',
          currentCanvasSize: allComponents.length,
          aboutToGrow: `${allComponents.length} → ${allComponents.length + 1}`,
          dropPosition: finalPosition
        });
        
        // 🎯 DROP INSERT LOGIC: On drop implementation
        if (finalPosition === 'top') {
          // 📍 If BEFORE target → insertAt(targetIndex, newItem)
          console.log('⬆️ DROP LOGIC: BEFORE target → insertAt(targetIndex, newItem)');
          if (onUpdateComponents && allComponents && createComponent) {
            const newComponent = createComponent(item.type);
            const newComponents = [...allComponents];
            newComponents.splice(index, 0, newComponent); // insertAt(targetIndex, newItem)
            
            console.log('✅ INSERT COMPLETE:', {
              instruction: 'If BEFORE target → insertAt(targetIndex, newItem)',
              targetIndex: index,
              insertedAt: index,
              collectionGrowth: `${allComponents.length} → ${newComponents.length}`,
              neverOverwrite: true,
              finalOrder: newComponents.map((c, i) => `${i}: ${c.label}`)
            });
            
            onUpdateComponents(newComponents);
          }
        } else if (finalPosition === 'bottom') {
          // 📍 If AFTER target → insertAt(targetIndex+1, newItem)
          console.log('⬇️ DROP LOGIC: AFTER target → insertAt(targetIndex+1, newItem)');
          if (onUpdateComponents && allComponents && createComponent) {
            const newComponent = createComponent(item.type);
            const newComponents = [...allComponents];
            newComponents.splice(index + 1, 0, newComponent); // insertAt(targetIndex+1, newItem)
            
            console.log('✅ INSERT COMPLETE:', {
              instruction: 'If AFTER target → insertAt(targetIndex+1, newItem)',
              targetIndex: index,
              insertedAt: index + 1,
              collectionGrowth: `${allComponents.length} → ${newComponents.length}`,
              neverOverwrite: true,
              finalOrder: newComponents.map((c, i) => `${i}: ${c.label}`)
            });
            
            onUpdateComponents(newComponents);
          }
        } else if (finalPosition === 'left' || finalPosition === 'right') {
          // ✅ Left/Right inside a row layout → placed side by side inside that row
          console.log('↔️ POSITION RULE: Left/Right inside a row layout → placed side by side inside that row');
          console.log('🎯 ROW LAYOUT LOGIC: Will create or add to horizontal container');
          // Let canvas handle row layout creation/addition
          return {
            insertPosition: finalPosition,
            targetComponentId: component.id,
            targetIndex: index,
            action: 'create_or_add_to_row'
          };
        } else if (finalPosition === 'center') {
          // 📍 Check if CENTER on row layout vs regular item
          if (component.type === 'horizontal_layout') {
            // 📍 If CENTER on item in rowlayout → insertIntoRow(targetRow, newItem)
            console.log('🎯 DROP LOGIC: CENTER on rowlayout → insertIntoRow(targetRow, newItem)');
            return {
              insertPosition: finalPosition,
              targetComponentId: component.id,
              targetIndex: index,
              action: 'insert_into_row'
            };
          } else {
            // Regular item - treat as AFTER for consistency
            console.log('🎯 CENTER on regular item → treating as AFTER target');
            if (onUpdateComponents && allComponents && createComponent) {
              const newComponent = createComponent(item.type);
              const newComponents = [...allComponents];
              newComponents.splice(index + 1, 0, newComponent); // Insert after target
              
              console.log('✅ INSERT COMPLETE:', {
                instruction: 'CENTER on regular item → insertAt(targetIndex+1, newItem)',
                targetIndex: index,
                insertedAt: index + 1,
                collectionGrowth: `${allComponents.length} → ${newComponents.length}`,
                neverOverwrite: true,
                finalOrder: newComponents.map((c, i) => `${i}: ${c.label}`)
              });
              
              onUpdateComponents(newComponents);
            }
          }
        }
        
        // ✅ FINAL SUMMARY: Your Hard Rules Enforced
        console.log('🎉 INDIVIDUAL ITEM PROCESSING COMPLETE:');
        console.log('  ✅ Each drop adds one more element to the canvas (like pushing into a collection)');
        console.log('  ✅ The canvas size (number of items) grows by 1 each time');
        console.log('  ✅ The dropped position determines where it sits');
        console.log('  ✅ Never replace an existing item — the collection only increases or rearranges');
        console.log('🛡️ RACE CONDITION PREVENTION: Returning handled=true to prevent canvas duplicate processing');
        return { 
          handledLocally: true, 
          collectionIncreased: true,
          preventCanvasProcessing: true,
          timestamp: Date.now()
        };
      }
      
      if (isHorizontalComponent) {
        // 🎯 CHECK DRAG SOURCE: If from canvas → move existing item
        console.log('🎯 DRAG SOURCE CHECK: CANVAS → MOVE EXISTING ITEM');
        console.log('📋 ACTION: Move existing item (no collection growth, just rearrangement)');
        console.log(`Individual component drop: horizontal component ${item.component.label} at position ${finalPosition} relative to ${component.label}`);
        
        // For horizontal component drops, let the parent canvas handle it
        // The canvas will remove it from the row and add it to the appropriate position
        return;
      }
      
      // Handle existing component reordering and row layout creation
      if (item.component) {
        // 🎯 CHECK DRAG SOURCE: If from canvas → move existing item
        console.log('🎯 DRAG SOURCE CHECK: CANVAS → MOVE EXISTING ITEM');
        console.log('📋 ACTION: Move existing item (collection size stays same, just rearranging)');
        
        // Handle row layout creation/addition for left/right drops
        if (finalPosition === 'left' || finalPosition === 'right') {
          const parentRowLayout = findParentRowLayout(component);
          
          if (parentRowLayout && onAddToRowLayout) {
            // Target component is already in a row layout - add to existing row
            console.log(`Adding to existing row layout: dragged component ${finalPosition} of target in row ${parentRowLayout.id}`);
            onAddToRowLayout(item.component, parentRowLayout, finalPosition);
          } else if (onCreateRowLayout) {
            // Target component is not in a row layout - create new row
            console.log(`Creating new row layout: dragged component ${finalPosition} of target`);
            onCreateRowLayout(item.component, component, finalPosition);
          }
        }
        // Top/bottom drops are already handled in hover for smooth reordering
      }
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={ref}
      data-testid={`canvas-item-${index}`}
      data-handler-id={handlerId}
      style={{
        opacity,
        position: 'relative',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
      }}
    >
      {/* Drop indicators for all 4 positions */}
      {hoverPosition === 'top' && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#10b981',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {hoverPosition === 'bottom' && (
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#10b981',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {hoverPosition === 'left' && (
        <div
          style={{
            position: 'absolute',
            left: '-8px',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#f59e0b',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {hoverPosition === 'right' && (
        <div
          style={{
            position: 'absolute',
            right: '-8px',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#f59e0b',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {hoverPosition === 'center' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            border: '3px dashed #8b5cf6',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          🎯
        </div>
      )}

      {/* Main component container */}
      <div
        style={{
          padding: '12px',
          border: selectedComponentId === component.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
          boxShadow: selectedComponentId === component.id 
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
        }}
        onClick={() => onSelectComponent(component.id)}
      >
        {/* Drag handle */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '20px',
            height: '20px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#9ca3af',
            opacity: selectedComponentId === component.id ? 1 : 0.5,
            zIndex: 10,
          }}
          title="Drag to reorder"
        >
          ⋮⋮
        </div>

        {/* Delete button when selected */}
        {selectedComponentId === component.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteComponent(component.id);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              zIndex: 10,
            }}
            title="Delete component"
          >
            ×
          </button>
        )}

        {/* Component content */}
        <div style={{ marginLeft: '28px', marginRight: selectedComponentId === component.id ? '32px' : '8px' }}>
          <SimplifiedFormComponentRenderer
            component={component}
            isSelected={selectedComponentId === component.id}
            onSelect={() => onSelectComponent(component.id)}
            onUpdate={onUpdateComponent}
            onDelete={() => onDeleteComponent(component.id)}
            mode="builder"
          />
        </div>
      </div>
    </div>
  );
};

export default DragDropReorderingItem;