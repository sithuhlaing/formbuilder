import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSimpleFormBuilder} from '../../hooks/useSimpleFormBuilder';

describe('Debug useSimpleFormBuilder Hook', () => {
  it('should add component correctly', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    console.log('Initial formState:', JSON.stringify(result.current.formState, null, 2));
    console.log('Initial currentComponents length:', result.current.currentComponents.length);
    
    // Add first component
    act(() => {
      result.current.addComponent('text_input');
    });
    
    console.log('After addComponent formState:', JSON.stringify(result.current.formState, null, 2));
    console.log('After addComponent currentComponents length:', result.current.currentComponents.length);
    
    if (result.current.currentComponents.length > 0) {
      console.log('First component:', JSON.stringify(result.current.currentComponents[0], null, 2));
    }
    
    expect(result.current.currentComponents).toHaveLength(1);
    expect(result.current.currentComponents[0].type).toBe('text_input');
  });

  it('should handle undo/redo correctly', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    console.log('\n=== UNDO/REDO TEST ===');
    console.log('Initial canUndo:', result.current.canUndo);
    console.log('Initial canRedo:', result.current.canRedo);
    console.log('Initial components length:', result.current.currentComponents.length);
    
    // Add first component
    act(() => {
      console.log('\n--- Adding component ---');
      result.current.addComponent('text_input');
    });
    
    console.log('After add canUndo:', result.current.canUndo);
    console.log('After add canRedo:', result.current.canRedo);
    console.log('After add components length:', result.current.currentComponents.length);
    
    // Test undo
    act(() => {
      console.log('\n--- Calling undo ---');
      result.current.undo();
    });
    
    console.log('After undo canUndo:', result.current.canUndo);
    console.log('After undo canRedo:', result.current.canRedo);
    console.log('After undo components length:', result.current.currentComponents.length);
    
    // Test redo
    act(() => {
      console.log('\n--- Calling redo ---');
      result.current.redo();
    });
    
    console.log('After redo canUndo:', result.current.canUndo);
    console.log('After redo canRedo:', result.current.canRedo);
    console.log('After redo components length:', result.current.currentComponents.length);
    
    expect(result.current.currentComponents).toHaveLength(1);
  });
});