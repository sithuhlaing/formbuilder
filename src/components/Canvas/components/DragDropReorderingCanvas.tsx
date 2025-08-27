import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import DragDropReorderingItem from './DragDropReorderingItem';
import RowLayoutContainer from './RowLayoutContainer';
import type { FormComponentData, ComponentType } from '../../../types';

interface DragDropReorderingCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  onCreateRowLayout?: (draggedComponent: FormComponentData, targetComponent: FormComponentData, position: 'left' | 'right') => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
  onAddComponentToRow?: (componentType: ComponentType, rowId: string, position: 'left' | 'right', targetIndex: number) => void;
  createComponent?: (type: ComponentType) => FormComponentData;
}

const DragDropReorderingCanvas: React.FC<DragDropReorderingCanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onMoveComponent,
  onAddComponent,
  onUpdateComponents,
  onCreateRowLayout,
  onRemoveFromContainer,
  onMoveFromContainerToCanvas,
  onAddComponentToRow,
  createComponent,
}) => {
  // Handler for inserting components at specific positions
  const handleInsertAtPosition = useCallback((componentType: ComponentType, insertIndex: number) => {
    if (!createComponent) {
      console.warn('createComponent function not available, falling back to onAddComponent');
      onAddComponent(componentType);
      return;
    }
    
    console.log('🎯 handleInsertAtPosition:', { componentType, insertIndex, currentCount: components.length });
    
    // HARD RULE VALIDATION: Ensure no overwriting
    if (insertIndex < 0 || insertIndex > components.length) {
      console.error('❌ HARD RULE VIOLATION: Invalid insert index would cause overwriting!', {
        insertIndex,
        maxValidIndex: components.length,
        fallbackToAppend: true
      });
      // Fallback to append to prevent overwriting
      onAddComponent(componentType);
      return;
    }
    
    // Create the new component
    const newComponent = createComponent(componentType);
    
    // Insert at the specific position using splice (NEVER overwrite)
    const newComponents = [...components];
    newComponents.splice(insertIndex, 0, newComponent); // Insert, don't replace
    
    // HARD RULE VALIDATION: Ensure collection increased
    if (newComponents.length !== components.length + 1) {
      console.error('❌ HARD RULE VIOLATION: Collection did not increase by 1!', {
        oldSize: components.length,
        newSize: newComponents.length,
        expected: components.length + 1,
        rule: 'Drop always increases collection size, never replaces'
      });
    } else {
      console.log('✅ HARD RULE ENFORCED: Collection increased by 1', {
        oldSize: components.length,
        newSize: newComponents.length,
        insertIndex,
        newComponent: newComponent.label,
        rule: 'Never overwrite existing item'
      });
    }
    
    // Update components with positional insertion
    onUpdateComponents(newComponents);
  }, [components, createComponent, onAddComponent, onUpdateComponents]);

  // Drop zone for new components from the palette and components from row layouts
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['component', 'horizontal-component'],
    drop: (item: any, monitor) => {      
      console.log('📋 Canvas drop handler triggered:', {
        itemType: item.type,
        hasComponent: !!item.component,
        didDrop: monitor.didDrop(),
        isPaletteComponent: item.type && typeof item.type === 'string' && !item.component,
        dropResult: monitor.getDropResult()
      });

      const dropResult = monitor.getDropResult();
      
      // Check if individual item handled the drop locally
      if (dropResult && dropResult.handledLocally && item.type && typeof item.type === 'string' && !item.component) {
        console.log('✅ INDIVIDUAL ITEM HANDLED LOCALLY: Container increased by +1', dropResult);
        return { droppedOnCanvas: true, handledByIndividualItem: true };
      }

      // Handle insertIntoRow for CENTER on rowlayout
      if (dropResult && dropResult.action === 'insert_into_row' && item.type && typeof item.type === 'string' && !item.component) {
        console.log('🎯 DROP LOGIC: CENTER on rowlayout → insertIntoRow(targetRow, newItem)');
        const { targetComponentId } = dropResult;
        
        // Find the row layout component and add new item to it
        const targetRowLayout = components.find(c => c.id === targetComponentId);
        if (targetRowLayout && targetRowLayout.type === 'horizontal_layout' && createComponent) {
          const newComponent = createComponent(item.type);
          const updatedRowLayout = {
            ...targetRowLayout,
            children: [...(targetRowLayout.children || []), newComponent]
          };
          
          const newComponents = components.map(c => 
            c.id === targetComponentId ? updatedRowLayout : c
          );
          
          console.log('✅ INSERT INTO ROW COMPLETE:', {
            instruction: 'If CENTER on rowlayout → insertIntoRow(targetRow, newItem)',
            targetRow: targetRowLayout.label,
            newItem: newComponent.label,
            rowChildrenBefore: targetRowLayout.children?.length || 0,
            rowChildrenAfter: updatedRowLayout.children?.length || 0,
            collectionSizeUnchanged: newComponents.length === components.length,
            rowContentGrew: true
          });
          
          onUpdateComponents(newComponents);
        }
        
        return { droppedOnCanvas: true, insertedIntoRow: true };
      }

      // Handle row layout creation/addition (Left/Right drops)
      if (dropResult && dropResult.action === 'create_or_add_to_row' && item.type && typeof item.type === 'string' && !item.component) {
        console.log('↔️ ROW LAYOUT RULE: Left/Right inside a row layout → placed side by side inside that row');
        const { insertPosition, targetComponentId, targetIndex } = dropResult;
        
        if (createComponent) {
          const newComponent = createComponent(item.type);
          const targetComponent = components[targetIndex];
          
          if (targetComponent.type === 'horizontal_layout') {
            // Add to existing row layout
            console.log('📦 Adding to existing row layout');
            const updatedRowLayout = {
              ...targetComponent,
              children: insertPosition === 'left' 
                ? [newComponent, ...(targetComponent.children || [])]
                : [...(targetComponent.children || []), newComponent]
            };
            
            const newComponents = components.map((c, i) => 
              i === targetIndex ? updatedRowLayout : c
            );
            
            console.log('✅ COLLECTION GROWTH COMPLETE (Row Addition):', {
              rule: 'Left/Right inside existing row → added side by side',
              position: insertPosition,
              rowChildrenCount: updatedRowLayout.children?.length || 0,
              collectionSizeUnchanged: newComponents.length === components.length,
              rowContentGrew: (updatedRowLayout.children?.length || 0) > (targetComponent.children?.length || 0)
            });
            
            onUpdateComponents(newComponents);
          } else {
            // Create new row layout with target + new component
            console.log('🆕 Creating new row layout');
            const rowComponent = createComponent('horizontal_layout');
            rowComponent.label = 'Row Layout';
            rowComponent.children = insertPosition === 'left'
              ? [newComponent, targetComponent]
              : [targetComponent, newComponent];
            
            const newComponents = [...components];
            newComponents[targetIndex] = rowComponent;
            
            console.log('✅ COLLECTION GROWTH COMPLETE (Row Creation):', {
              rule: 'Left/Right on regular item → created new row layout',
              position: insertPosition,
              collectionSizeUnchanged: newComponents.length === components.length,
              newRowChildren: rowComponent.children?.length || 0,
              structureGrew: 'Converted 1 item into 1 row containing 2 items'
            });
            
            onUpdateComponents(newComponents);
          }
        }
        
        return { droppedOnCanvas: true, rowLayoutHandled: true };
      }

      // FALLBACK: Direct canvas drop (no individual item involved) 
      if (item.type && typeof item.type === 'string' && !item.component && !monitor.didDrop()) {
        // 📍 If CENTER on empty canvas → append(newItem)
        console.log('🎯 DROP LOGIC: CENTER on empty canvas → append(newItem)');
        console.log('🎯 DRAG SOURCE CHECK: LEFT PANEL → CREATE NEW ITEM');
        console.log('✅ IMPLEMENTATION + HARD RULES:');
        console.log('  → Rule: drop always increases collection size, never replaces');
        console.log('  → Never overwrite existing item');
        console.log('📊 APPEND OPERATION:', {
          instruction: 'If CENTER on empty canvas → append(newItem)',
          dragSource: 'LEFT_PANEL',
          action: 'CREATE_NEW_ITEM',
          type: item.type,
          beforeSize: components.length,
          afterSize: components.length + 1,
          operation: 'APPEND'
        });
        console.log('🎯 CALLING onAddComponent for type:', item.type);
        onAddComponent(item.type);
        console.log('✅ APPEND COMPLETE: New item added to end');
        return { droppedOnCanvas: true };
      }

      // Only handle container movements if not already handled
      if (!monitor.didDrop()) {
        if (item.component && item.containerPath && onMoveFromContainerToCanvas) {
          // Component being moved from row layout to canvas
          console.log('Moving component from row to canvas:', item.component.label);
          onMoveFromContainerToCanvas(item.component.id, item.containerPath);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Enhanced move component handler that updates the state
  const handleMoveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log(`Moving component from index ${dragIndex} to ${hoverIndex}`);
    
    if (dragIndex === hoverIndex) return;
    
    const draggedComponent = components[dragIndex];
    if (!draggedComponent) return;
    
    // Create new array with the component moved to the new position
    const newComponents = [...components];
    
    // Remove the dragged component from its original position
    newComponents.splice(dragIndex, 1);
    
    // Insert it at the new position
    newComponents.splice(hoverIndex, 0, draggedComponent);
    
    console.log('New component order:', newComponents.map((c, i) => `${i}: ${c.label}`));
    
    // Update the state with the new order
    onUpdateComponents(newComponents);
  }, [components, onUpdateComponents]);

  // Row layout creation handler
  const handleCreateRowLayout = useCallback((draggedComponent: FormComponentData, targetComponent: FormComponentData, position: 'left' | 'right') => {
    console.log(`Creating row layout: ${draggedComponent.label} ${position} of ${targetComponent.label}`);
    
    // Remove dragged component from current position
    const componentsWithoutDragged = components.filter(c => c.id !== draggedComponent.id);
    
    // Find target component index
    const targetIndex = componentsWithoutDragged.findIndex(c => c.id === targetComponent.id);
    if (targetIndex === -1) return;

    // Create row layout component
    const rowId = `row_${Date.now()}`;
    const rowComponent: FormComponentData = {
      id: rowId,
      type: 'horizontal_layout',
      label: 'Row Layout',
      fieldId: `field_${rowId}`,
      required: false,
      layout: {
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
      },
      children: position === 'left' 
        ? [draggedComponent, targetComponent]  // Dragged on left
        : [targetComponent, draggedComponent]  // Dragged on right
    };

    // Replace target component with the new row layout
    const newComponents = [
      ...componentsWithoutDragged.slice(0, targetIndex),
      rowComponent,
      ...componentsWithoutDragged.slice(targetIndex + 1)
    ];

    console.log('Created row layout:', rowComponent);
    onUpdateComponents(newComponents);
  }, [components, onUpdateComponents]);

  // Add to existing row layout handler
  const handleAddToRowLayout = useCallback((draggedComponent: FormComponentData, targetRowLayout: FormComponentData, position: 'left' | 'right') => {
    console.log(`Adding ${draggedComponent.label} to existing row layout ${targetRowLayout.id} at ${position}`);
    
    // Remove dragged component from current position
    const componentsWithoutDragged = components.filter(c => c.id !== draggedComponent.id);
    
    // Find the target component that was hovered over
    let targetChildIndex = -1;
    let targetChild: FormComponentData | null = null;
    
    if (targetRowLayout.children) {
      // We need to find which child in the row was being hovered over
      // This is a bit tricky - we'll add the component at the appropriate position
      // For now, let's add at the beginning or end based on position
      const newChildren = [...targetRowLayout.children];
      
      if (position === 'left') {
        newChildren.unshift(draggedComponent); // Add at beginning
      } else {
        newChildren.push(draggedComponent); // Add at end
      }
      
      // Update the row layout with new children
      const updatedRowLayout = {
        ...targetRowLayout,
        children: newChildren
      };
      
      // Update the components array
      const newComponents = componentsWithoutDragged.map(c => 
        c.id === targetRowLayout.id ? updatedRowLayout : c
      );
      
      console.log('Updated row layout with new child:', updatedRowLayout);
      onUpdateComponents(newComponents);
    }
  }, [components, onUpdateComponents]);

  // Handle adding component to row layout
  const handleAddComponentToRow = useCallback((componentType: ComponentType, rowId: string, position: 'left' | 'right', targetIndex: number) => {
    // Find the row layout component
    const rowComponent = components.find(c => c.id === rowId);
    if (!rowComponent || !rowComponent.children || !createComponent) return;
    
    // Create new component using proper createComponent function
    const newComponent = createComponent(componentType);
    
    const newChildren = [...rowComponent.children];
    
    if (position === 'left') {
      // Insert before target index
      newChildren.splice(targetIndex, 0, newComponent);
    } else {
      // Insert after target index  
      newChildren.splice(targetIndex + 1, 0, newComponent);
    }
    
    // Update the row layout
    const updatedRowComponent = {
      ...rowComponent,
      children: newChildren
    };
    
    // Update the components array
    const newComponents = components.map(c => 
      c.id === rowId ? updatedRowComponent : c
    );
    
    onUpdateComponents(newComponents);
  }, [components, onUpdateComponents, createComponent]);

  const isEmpty = components.length === 0;

  return (
    <div
      ref={drop}
      style={{
        flex: 1,
        padding: '24px',
        backgroundColor: isOver && canDrop ? '#eff6ff' : '#f9fafb',
        border: `2px dashed ${isOver && canDrop ? '#3b82f6' : '#d1d5db'}`,
        borderRadius: '8px',
        minHeight: '400px',
        transition: 'all 0.2s ease',
      }}
    >
      {isEmpty ? (
        // Empty state
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
            📝
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>
            Start building your form
          </h3>
          <p style={{ fontSize: '14px', margin: 0, maxWidth: '300px' }}>
            Drag components from the left panel to create your form. 
            Once added, you can reorder them by dragging up or down.
          </p>
          {isOver && canDrop && (
            <div
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Drop component here
            </div>
          )}
        </div>
      ) : (
        // Components list
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {components.map((component, index) => {
            // Render row layouts with specialized container
            if (component.type === 'horizontal_layout') {
              return (
                <div key={component.id} style={{ marginBottom: '16px' }}>
                  <RowLayoutContainer
                    component={component}
                    selectedComponentId={selectedComponentId}
                    onSelectComponent={onSelectComponent}
                    onUpdateComponent={(updates) => {
                      // Update the specific component in the components array
                      const updatedComponents = components.map(c => 
                        c.id === component.id ? { ...c, ...updates } : c
                      );
                      
                      // Check if the updated row layout has only one child and unwrap it
                      const updatedComponent = updatedComponents.find(c => c.id === component.id);
                      if (updatedComponent?.type === 'horizontal_layout' && 
                          updatedComponent.children && 
                          updatedComponent.children.length === 1) {
                        console.log('Auto-unwrapping single-child row layout');
                        const remainingChild = updatedComponent.children[0];
                        const finalComponents = updatedComponents.map(c => 
                          c.id === component.id ? remainingChild : c
                        );
                        onUpdateComponents(finalComponents);
                      } else {
                        onUpdateComponents(updatedComponents);
                      }
                    }}
                    onDeleteComponent={onDeleteComponent}
                    onUpdateComponents={onUpdateComponents}
                    onRemoveFromContainer={onRemoveFromContainer}
                    onMoveFromContainerToCanvas={onMoveFromContainerToCanvas}
                    onAddComponentToRow={handleAddComponentToRow}
                  />
                </div>
              );
            }
            
            // Render regular components with drag-drop functionality
            return (
              <DragDropReorderingItem
                key={component.id}
                component={component}
                index={index}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
                onUpdateComponent={onUpdateComponent}
                onDeleteComponent={onDeleteComponent}
                onMoveComponent={handleMoveComponent}
                onCreateRowLayout={handleCreateRowLayout}
                onAddToRowLayout={handleAddToRowLayout}
                onUpdateComponents={onUpdateComponents}
                allComponents={components}
                createComponent={createComponent}
              />
            );
          })}
          
          {/* Drop zone at the bottom for adding new components */}
          {isOver && canDrop && (
            <div
              style={{
                height: '60px',
                border: '2px dashed #3b82f6',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '16px',
              }}
            >
              Drop new component here
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DragDropReorderingCanvas;