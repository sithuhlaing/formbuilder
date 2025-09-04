/**
 * Centralized App State Management Hook
 * Replaces multiple useState calls with useReducer for better performance
 */

import { useReducer, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface AppState {
  currentView: 'list' | 'builder';
  showPreview: boolean;
  successModal: ModalState;
  errorModal: ModalState;
}

type AppAction = 
  | { type: 'SET_VIEW'; payload: 'list' | 'builder' }
  | { type: 'TOGGLE_PREVIEW'; payload?: boolean }
  | { type: 'SHOW_SUCCESS_MODAL'; payload: { title: string; message: string } }
  | { type: 'SHOW_ERROR_MODAL'; payload: { title: string; message: string } }
  | { type: 'CLOSE_SUCCESS_MODAL' }
  | { type: 'CLOSE_ERROR_MODAL' }
  | { type: 'CLOSE_ALL_MODALS' };

const initialState: AppState = {
  currentView: 'list',
  showPreview: false,
  successModal: { isOpen: false, title: '', message: '' },
  errorModal: { isOpen: false, title: '', message: '' }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'TOGGLE_PREVIEW':
      return { ...state, showPreview: action.payload ?? !state.showPreview };
    case 'SHOW_SUCCESS_MODAL':
      return { 
        ...state, 
        successModal: { isOpen: true, ...action.payload }
      };
    case 'SHOW_ERROR_MODAL':
      return { 
        ...state, 
        errorModal: { isOpen: true, ...action.payload }
      };
    case 'CLOSE_SUCCESS_MODAL':
      return { 
        ...state, 
        successModal: { isOpen: false, title: '', message: '' }
      };
    case 'CLOSE_ERROR_MODAL':
      return { 
        ...state, 
        errorModal: { isOpen: false, title: '', message: '' }
      };
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        successModal: { isOpen: false, title: '', message: '' },
        errorModal: { isOpen: false, title: '', message: '' }
      };
    default:
      return state;
  }
}

export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setView: useCallback((view: 'list' | 'builder') => {
      dispatch({ type: 'SET_VIEW', payload: view });
    }, []),

    togglePreview: useCallback((show?: boolean) => {
      dispatch({ type: 'TOGGLE_PREVIEW', payload: show });
    }, []),

    showSuccess: useCallback((title: string, message: string) => {
      dispatch({ type: 'SHOW_SUCCESS_MODAL', payload: { title, message } });
    }, []),

    showError: useCallback((title: string, message: string) => {
      dispatch({ type: 'SHOW_ERROR_MODAL', payload: { title, message } });
    }, []),

    closeSuccess: useCallback(() => {
      dispatch({ type: 'CLOSE_SUCCESS_MODAL' });
    }, []),

    closeError: useCallback(() => {
      dispatch({ type: 'CLOSE_ERROR_MODAL' });
    }, []),

    closeAllModals: useCallback(() => {
      dispatch({ type: 'CLOSE_ALL_MODALS' });
    }, [])
  };

  return { state, actions };
};
