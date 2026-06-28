import { beforeEach, vi, expect, beforeAll } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom/vitest';

// Import test compatibility layer
import './test-compatibility';

// Global mock for useFormBuilder hook
import { mockUseFormBuilder, createMockFormBuilderState } from './mocks/useFormBuilderMock';

// Set up default mock state for all tests
const defaultMockState = createMockFormBuilderState();

// Ensure the mock always returns a valid state
mockUseFormBuilder.mockImplementation(() => defaultMockState);

// Mock DnD globally for all tests
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
  useDrag: () => [{ isDragging: false }, () => {}, vi.fn()],
  useDrop: () => [{ isOver: false }, () => {}],
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'html5-backend',
  getEmptyImage: vi.fn(() => ({ img: new Image() }))
}));

// Mock useFormBuilder globally
vi.mock('../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: () => mockUseFormBuilder()
}));

// Mock SimpleDraggableComponent callbacks globally
vi.mock('../../components/SimpleDraggableComponent', () => ({
  SimpleDraggableComponent: ({ 
    component, 
    selected, 
    mode, 
    onSelect, 
    onDelete, 
    ...props 
  }: any) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode === 'builder' && typeof onSelect === 'function') {
        onSelect(selected ? null : component.id);
      }
    };
    
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (typeof onDelete === 'function') {
        onDelete(component.id);
      }
    };

    return React.createElement('div', {
      'data-testid': `draggable-component-${component.id}`,
      onClick: handleClick,
      style: { border: selected ? '2px solid blue' : '1px solid gray' },
      ...props
    }, [
      React.createElement('span', {}, component.label || component.type),
      mode === 'builder' && React.createElement('button', {
        onClick: handleDelete,
        'data-testid': `delete-${component.id}`
      }, 'Delete')
    ]);
  }
}));

// Reset mock before each test to ensure clean state
beforeEach(() => {
  vi.clearAllMocks();
  mockUseFormBuilder.mockReturnValue(defaultMockState);
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.options = options;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '';
    this.thresholds = options?.threshold ? 
      (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : 
      [0];
  }

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock performance.memory for all tests
  Object.defineProperty(window, 'performance', {
    value: {
      ...window.performance,
      memory: {
        usedJSHeapSize: 15000000,
        totalJSHeapSize: 30000000,
        jsHeapSizeLimit: 2147483648
      }
    },
    writable: true
  });

  // Mock garbage collection globally
  (global as any).gc = vi.fn();

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock DragEvent
  global.DragEvent = class DragEvent extends Event {
    dataTransfer: DataTransfer;
    altKey: boolean = false;
    button: number = 0;
    buttons: number = 0;
    clientX: number = 0;
    clientY: number = 0;
    ctrlKey: boolean = false;
    metaKey: boolean = false;
    offsetX: number = 0;
    offsetY: number = 0;
    pageX: number = 0;
    pageY: number = 0;
    relatedTarget: EventTarget | null = null;
    screenX: number = 0;
    screenY: number = 0;
    shiftKey: boolean = false;
    view: Window | null = null;
    which: number = 0;
    
    constructor(type: string, eventInitDict?: DragEventInit) {
      super(type, eventInitDict);
      this.dataTransfer = {
        dropEffect: 'none',
        effectAllowed: 'all',
        files: [] as any,
        items: [] as any,
        types: [],
        clearData: vi.fn(),
        getData: vi.fn(),
        setData: vi.fn(),
        setDragImage: vi.fn(),
    }
  } as any;
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Assign to global
global.IntersectionObserver = MockIntersectionObserver as any;
global.ResizeObserver = MockResizeObserver as any;

// Also mock window properties if needed
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock HTMLCanvasElement getContext globally at start
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn()
})) as any;

