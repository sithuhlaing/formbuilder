import { useState, useCallback, useRef, useEffect } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoActions {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  reset: (newState: any) => void;
  clear: () => void;
}

export function useUndoRedo<T>(initialState: T, maxHistorySize = 50): [T, (newState: T) => void, UndoRedoActions] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const lastUpdateTime = useRef<number>(0);
  const debounceTime = 300; // ms

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const updateState = useCallback((newState: T) => {
    const now = Date.now();
    const shouldDebounce = now - lastUpdateTime.current < debounceTime;
    
    setState(currentState => {
      // If debouncing and states are similar, replace current state instead of adding to history
      if (shouldDebounce && currentState.past.length > 0) {
        return {
          past: currentState.past,
          present: newState,
          future: [] // Clear future when new state is set
        };
      }

      // Add current state to past and set new state
      const newPast = [
        ...currentState.past,
        currentState.present
      ].slice(-maxHistorySize); // Limit history size

      return {
        past: newPast,
        present: newState,
        future: [] // Clear future when new state is set
      };
    });

    lastUpdateTime.current = now;
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;

      const newPast = currentState.past.slice(0, -1);
      const previousState = currentState.past[currentState.past.length - 1];

      return {
        past: newPast,
        present: previousState,
        future: [currentState.present, ...currentState.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;

      const nextState = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: nextState,
        future: newFuture
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: []
    });
  }, []);

  const clear = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
      event.preventDefault();
      undo();
    } else if ((event.ctrlKey || event.metaKey) && 
               ((event.shiftKey && event.key === 'Z') || event.key === 'y')) {
      event.preventDefault();
      redo();
    }
  }, [undo, redo]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const actions: UndoRedoActions = {
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
    clear
  };

  return [state.present, updateState, actions];
}