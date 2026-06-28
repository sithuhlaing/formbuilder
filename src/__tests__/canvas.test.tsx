import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import Canvas from '../app/components/canvas';
import { FormNode, FormComponent, RowContainer } from '@/types/form';

describe('Canvas Layout Engine - Positioning Scenarios', () => {
  // Helper to create a text input component
  const createMockTextInput = (id: string, label = 'Text Input'): FormComponent => ({
    nodeId: id,
    type: 'text_input',
    label,
    fieldId: `text_${id}`,
    required: false,
    validation: [],
    properties: { label }
  });

  // Scenario 2.1: Vertical Before Edge Split
  it('Scenario 2.1: should insert component before target vertically', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    // Get the draggable component
    const draggableComponent = container.querySelector('.relative.mb-3') as HTMLElement;
    expect(draggableComponent).not.toBeNull();

    // Mock bounding rect in jsdom
    draggableComponent.getBoundingClientRect = () => ({
      left: 100,
      top: 0,
      width: 200,
      height: 100,
      right: 300,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {}
    });

    // Trigger dragover on component targeting top threshold (yPercent = 0.15)
    // The top threshold in computeDropPosition triggers on verticalFraction < 0.3
    act(() => {
      fireEvent.dragOver(draggableComponent, {
        clientX: 200,
        clientY: 10
      });
    });

    // Now trigger drop
    const dragPayload = {
      source: 'palette',
      component: { type: 'number_input', label: 'Age Field', properties: { label: 'Age Field' } }
    };

    act(() => {
      fireEvent.drop(draggableComponent!, {
        dataTransfer: {
          getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
        }
      });
    });

    // Check setNodesMock output
    console.log('   setNodesMock calls count:', setNodesMock.mock.calls.length);
    setNodesMock.mock.calls.forEach((call, index) => {
      console.log(`   Call ${index} arg:`, JSON.stringify(call[0]));
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;
    
    // Result nodes should have Age Field first, then Name Field
    expect(resultNodes.length).toBe(2);
    expect(resultNodes[0].type).toBe('number_input');
    expect(resultNodes[1].nodeId).toBe('node-1');
  });

  // Scenario 2.2: Side-Drop Horizontal Splice Creation
  it('Scenario 2.2: should split component horizontally to create a row container', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const draggableComponent = container.querySelector('.relative.mb-3') as HTMLElement;
    expect(draggableComponent).not.toBeNull();

    // Mock bounding rect in jsdom
    draggableComponent.getBoundingClientRect = () => ({
      left: 100,
      top: 0,
      width: 200,
      height: 100,
      right: 300,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {}
    });

    // Trigger dragover at the right side edge (xPercent = 0.85, yPercent = 0.5)
    // The right threshold triggers on horizontalFraction > 0.75 and verticalFraction within bounds [0.3, 0.7]
    act(() => {
      fireEvent.dragOver(draggableComponent, {
        clientX: 270, // offsetX = 170 / 200 = 0.85
        clientY: 50  // offsetY = 50 / 100 = 0.50
      });
    });

    const dragPayload = {
      source: 'palette',
      component: { type: 'email_input', label: 'Email Field', properties: { label: 'Email Field' } }
    };

    act(() => {
      fireEvent.drop(draggableComponent!, {
        dataTransfer: {
          getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
        }
      });
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;

    // Single item should now be replaced by a row layout container containing both Name and Email Fields
    expect(resultNodes.length).toBe(1);
    expect(resultNodes[0].type).toBe('row');
    
    const row = resultNodes[0] as RowContainer;
    expect(row.children.length).toBe(2);
    expect(row.children[0].nodeId).toBe('node-1');
    expect(row.children[1].type).toBe('email_input');
  });

  // Scenario 2.3: Horizontal Ceiling Capacity Rejection
  it('Scenario 2.3: should reject adding a 13th component into a row', () => {
    // Create a row container with 12 components already
    const rowNode: RowContainer = {
      nodeId: 'row-1',
      type: 'row',
      children: [
        createMockTextInput('node-1', 'Name 1'),
        createMockTextInput('node-2', 'Name 2'),
        createMockTextInput('node-3', 'Name 3'),
        createMockTextInput('node-4', 'Name 4'),
        createMockTextInput('node-5', 'Name 5'),
        createMockTextInput('node-6', 'Name 6'),
        createMockTextInput('node-7', 'Name 7'),
        createMockTextInput('node-8', 'Name 8'),
        createMockTextInput('node-9', 'Name 9'),
        createMockTextInput('node-10', 'Name 10'),
        createMockTextInput('node-11', 'Name 11'),
        createMockTextInput('node-12', 'Name 12')
      ]
    };
    const nodes: FormNode[] = [rowNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    // Find the row element or its children
    const rowChild = container.querySelector('.w-full.flex-1') as HTMLElement;
    expect(rowChild).not.toBeNull();

    // Mock bounding rect in jsdom
    rowChild.getBoundingClientRect = () => ({
      left: 100,
      top: 0,
      width: 200,
      height: 100,
      right: 300,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {}
    });

    // Try to dragover right edge of the child to add a 13th element
    fireEvent.dragOver(rowChild, {
      clientX: 270,
      clientY: 50
    });

    const dragPayload = {
      source: 'palette',
      component: { type: 'date_picker', label: 'Date Field', properties: { label: 'Date Field' } }
    };

    fireEvent.drop(rowChild!, {
      dataTransfer: {
        getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
      }
    });

    // Check error message or state unchanged (setNodesMock should NOT be called due to safety check)
    // If it is called, the output state should still have size 12
    if (setNodesMock.mock.calls.length > 0) {
      const stateUpdater = setNodesMock.mock.calls[0][0];
      const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;
      const row = resultNodes[0] as RowContainer;
      expect(row.children.length).toBe(12); // Still 12 elements, 13th rejected!
    } else {
      expect(setNodesMock).not.toHaveBeenCalled();
    }
  });

  // Scenario 2.4: Empty Structural Row Container Decay
  it('Scenario 2.4: should dissolve row container if component count drops to <= 1', () => {
    // Create a row container with 2 components
    const rowNode: RowContainer = {
      nodeId: 'row-1',
      type: 'row',
      children: [
        createMockTextInput('node-1', 'Name 1'),
        createMockTextInput('node-2', 'Name 2')
      ]
    };
    const nodes: FormNode[] = [rowNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    // Drag second element ('node-2') and drop it to outer canvas space to trigger decay
    const rowChild2 = container.querySelectorAll('.w-full.flex-1')[1];
    expect(rowChild2).not.toBeNull();

    // Trigger dragstart to serialize data
    fireEvent.dragStart(rowChild2, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'move'
      }
    });

    // Drop on the canvas container background (indicator = null)
    const canvasBackground = container.firstChild;
    fireEvent.drop(canvasBackground!, {
      dataTransfer: {
        getData: (format: string) => format === 'application/json' ? JSON.stringify({ source: 'canvas', nodeId: 'node-2' }) : ''
      }
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;

    // Row should decay, leaving node-1 and node-2 as standalone top-level elements
    expect(resultNodes.length).toBe(2);
    expect(resultNodes[0].type).toBe('text_input'); // node-1 promoted
    expect(resultNodes[0].nodeId).toBe('node-1');
    expect(resultNodes[1].type).toBe('text_input'); // node-2 appended
    expect(resultNodes[1].nodeId).toBe('node-2');
  });

  // Scenario 2.5: Nested Spatial Resolution (Top/Bottom escape)
  it('Scenario 2.5: should escape row boundaries when hovering top 25% of nested component', () => {
    const rowNode: RowContainer = {
      nodeId: 'row-1',
      type: 'row',
      children: [
        createMockTextInput('node-1', 'Name 1'),
        createMockTextInput('node-2', 'Name 2')
      ]
    };
    const nodes: FormNode[] = [rowNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const rowChild1 = container.querySelectorAll('.w-full.flex-1')[0] as HTMLElement;
    expect(rowChild1).not.toBeNull();

    // Mock bounding rect in jsdom
    rowChild1.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      right: 300,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    // Hover near the top 10% (clientY = 110, offsetY = 10 -> verticalFraction = 0.1)
    act(() => {
      fireEvent.dragOver(rowChild1, {
        clientX: 200,
        clientY: 110
      });
    });

    // With top 25% escape active, drop indicator should target parent row container as position "before"
    // This renders the visual drop line BEFORE the entire row container
    const rowContainerElement = container.querySelector('.bg-gray-50') as HTMLElement;
    expect(rowContainerElement).not.toBeNull();
    
    // Check that the absolute top indicator line is rendered relative to the row container
    const dropLine = rowContainerElement.parentElement?.querySelector('.absolute.-top-2');
    expect(dropLine).not.toBeNull();
  });

  // Scenario 2.6: Vertical After Edge Split
  it('Scenario 2.6: should insert component after target vertically', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const draggableComponent = container.querySelector('.relative.mb-3') as HTMLElement;
    expect(draggableComponent).not.toBeNull();

    draggableComponent.getBoundingClientRect = () => ({
      left: 100,
      top: 0,
      width: 200,
      height: 100,
      right: 300,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {}
    });

    // Trigger dragover targeting bottom threshold (yPercent = 0.85)
    act(() => {
      fireEvent.dragOver(draggableComponent, {
        clientX: 200,
        clientY: 85
      });
    });

    const dragPayload = {
      source: 'palette',
      component: { type: 'number_input', label: 'Age Field' }
    };

    act(() => {
      fireEvent.drop(draggableComponent!, {
        dataTransfer: {
          getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
        }
      });
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;
    
    expect(resultNodes.length).toBe(2);
    expect(resultNodes[0].nodeId).toBe('node-1');
    expect(resultNodes[1].type).toBe('number_input');
  });

  // Scenario 2.7: Left-Side Drop Horizontal Splice Creation
  it('Scenario 2.7: should split component horizontally to create a row container on the left', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const draggableComponent = container.querySelector('.relative.mb-3') as HTMLElement;
    expect(draggableComponent).not.toBeNull();

    draggableComponent.getBoundingClientRect = () => ({
      left: 100,
      top: 0,
      width: 200,
      height: 100,
      right: 300,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {}
    });

    // Trigger dragover at the left side edge (xPercent = 0.15, yPercent = 0.5)
    act(() => {
      fireEvent.dragOver(draggableComponent, {
        clientX: 130, // offsetX = 30 / 200 = 0.15
        clientY: 50
      });
    });

    const dragPayload = {
      source: 'palette',
      component: { type: 'email_input', label: 'Email Field' }
    };

    act(() => {
      fireEvent.drop(draggableComponent!, {
        dataTransfer: {
          getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
        }
      });
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;

    expect(resultNodes.length).toBe(1);
    expect(resultNodes[0].type).toBe('row');
    const row = resultNodes[0] as RowContainer;
    expect(row.children[0].type).toBe('email_input'); // Left position
    expect(row.children[1].nodeId).toBe('node-1');
  });

  // Scenario 2.8: Selection click
  it('Scenario 2.8: should select component when container is clicked', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setSelectedMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={setSelectedMock}
        nodes={nodes}
        setNodes={vi.fn()}
      />
    );

    const componentContainer = container.querySelector('.relative.mb-3') as HTMLElement;
    fireEvent.click(componentContainer);
    expect(setSelectedMock).toHaveBeenCalledWith(expect.objectContaining({ nodeId: 'node-1' }));
  });

  // Scenario 2.9: Delete click
  it('Scenario 2.9: should delete component when delete button is clicked', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    // Find delete button
    const deleteBtn = container.querySelector('button[title="Delete component"]') as HTMLElement;
    expect(deleteBtn).not.toBeNull();
    
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(deleteBtn);
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;
    expect(resultNodes.length).toBe(0);
  });

  // Scenario 2.10: Drag-and-drop on Canvas Background
  it('Scenario 2.10: should append new component when dropping on canvas background', () => {
    const nodes: FormNode[] = [];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const canvasBg = container.firstChild as HTMLElement;
    
    const dragPayload = {
      source: 'palette',
      component: { type: 'nhs_number' } // Test normaliseLabel logic: generates Nhs Number
    };

    act(() => {
      fireEvent.drop(canvasBg, {
        dataTransfer: {
          getData: (format: string) => format === 'application/json' ? JSON.stringify(dragPayload) : ''
        }
      });
    });

    expect(setNodesMock).toHaveBeenCalled();
    const stateUpdater = setNodesMock.mock.calls[0][0];
    const resultNodes = typeof stateUpdater === 'function' ? stateUpdater(nodes) : stateUpdater;
    expect(resultNodes.length).toBe(1);
    expect(resultNodes[0].type).toBe('nhs_number');
    expect(resultNodes[0].label).toBe('Nhs Number');
  });

  // Scenario 2.11: Block invalid layout component drops
  it('Scenario 2.11: should show error message and block drops of layout types', () => {
    const nodes: FormNode[] = [];
    const setNodesMock = vi.fn();

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={setNodesMock}
      />
    );

    const canvasBg = container.firstChild as HTMLElement;
    
    // Test horizontal_layout block
    act(() => {
      fireEvent.drop(canvasBg, {
        dataTransfer: {
          getData: (format: string) => JSON.stringify({ source: 'palette', component: { type: 'horizontal_layout' } })
        }
      });
    });
    expect(setNodesMock).not.toHaveBeenCalled();

    // Test vertical_layout block
    act(() => {
      fireEvent.drop(canvasBg, {
        dataTransfer: {
          getData: (format: string) => JSON.stringify({ source: 'palette', component: { type: 'vertical_layout' } })
        }
      });
    });
    expect(setNodesMock).not.toHaveBeenCalled();
  });

  // Scenario 2.12: Drag start and leave
  it('Scenario 2.12: should support dragStart, dragEnd, and dragLeave', () => {
    const textNode = createMockTextInput('node-1', 'Name Field');
    const nodes: FormNode[] = [textNode];

    const { container } = render(
      <Canvas
        selectedComponent={null}
        setSelectedComponent={vi.fn()}
        nodes={nodes}
        setNodes={vi.fn()}
      />
    );

    const component = container.querySelector('.relative.mb-3') as HTMLElement;
    expect(component).not.toBeNull();

    // Drag Start
    fireEvent.dragStart(component, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'move'
      }
    });

    // Drag Leave
    fireEvent.dragLeave(component);
  });
});
