import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock LocalStorage
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock alert
window.alert = vi.fn();

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

// Mock performance.memory
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

// Mock DragEvent globally for coordinate passing
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer;
  altKey = false;
  button = 0;
  buttons = 0;
  clientX = 0;
  clientY = 0;
  ctrlKey = false;
  metaKey = false;
  offsetX = 0;
  offsetY = 0;
  pageX = 0;
  pageY = 0;
  relatedTarget: EventTarget | null = null;
  screenX = 0;
  screenY = 0;
  shiftKey = false;
  view: Window | null = null;
  which = 0;
  
  constructor(type: string, eventInitDict?: DragEventInit & { clientX?: number; clientY?: number; pageX?: number; pageY?: number; offsetX?: number; offsetY?: number }) {
    super(type, eventInitDict);
    if (eventInitDict) {
      if (eventInitDict.clientX !== undefined) this.clientX = eventInitDict.clientX;
      if (eventInitDict.clientY !== undefined) this.clientY = eventInitDict.clientY;
      if (eventInitDict.pageX !== undefined) this.pageX = eventInitDict.pageX;
      if (eventInitDict.pageY !== undefined) this.pageY = eventInitDict.pageY;
      if (eventInitDict.offsetX !== undefined) this.offsetX = eventInitDict.offsetX;
      if (eventInitDict.offsetY !== undefined) this.offsetY = eventInitDict.offsetY;
    }
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
    } as DataTransfer;
  }
} as any;

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

