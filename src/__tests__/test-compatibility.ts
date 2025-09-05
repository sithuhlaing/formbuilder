// Test Compatibility Layer
// This file provides shims for tests expecting the old architecture

// Mock ComponentEngine
export class ComponentEngine {
  static createComponent(type: string, props: any = {}) {
    return {
      id: `comp_${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...props
    };
  }
}

// Mock FormStateEngine
export class FormStateEngine {
  static createInitialState() {
    return {
      components: [],
      selectedId: null,
      templateName: 'Untitled Form',
      history: [],
      historyIndex: -1,
    };
  }
}

// Re-export simple form builder as useFormBuilder for tests
import { useSimpleFormBuilder as _useSimpleFormBuilder } from '../hooks/useSimpleFormBuilder';

export const useFormBuilder = _useSimpleFormBuilder;
