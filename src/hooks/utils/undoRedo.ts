
import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormPage } from "../../types";

export function useUndoRedo(
  pages: FormPage[],
  setPages: (pages: FormPage[]) => void
) {
  const [history, setHistory] = useState<FormPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Save state to history when pages change (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedoAction.current && pages.length > 0) {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(pages)));
        
        // Limit history size to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        
        return newHistory;
      });
      
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }
    isUndoRedoAction.current = false;
  }, [pages, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const previousState = history[historyIndex - 1];
      setPages(JSON.parse(JSON.stringify(previousState)));
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, setPages]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setPages(JSON.parse(JSON.stringify(nextState)));
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, setPages]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    undo,
    redo,
    canUndo,
    canRedo
  };
}
