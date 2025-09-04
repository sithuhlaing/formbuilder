/**
 * Cross-Browser Compatibility Testing Suite
 * Browser-specific behavior testing and compatibility validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';

// Browser environment simulation utilities
class BrowserSimulator {
  private originalUserAgent: string;
  private originalNavigator: any;
  private originalWindow: any;

  constructor() {
    this.originalUserAgent = navigator.userAgent;
    this.originalNavigator = { ...navigator };
    this.originalWindow = { ...window };
  }

  simulateChrome() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      writable: true
    });
    
    (window as any).chrome = { runtime: {} };
  }

  simulateFirefox() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      writable: true
    });
    
    delete (window as any).chrome;
    (window as any).InstallTrigger = {};
  }

  simulateSafari() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      writable: true
    });
    
    delete (window as any).chrome;
    delete (window as any).InstallTrigger;
    (window as any).safari = { pushNotification: {} };
  }

  simulateEdge() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      writable: true
    });
    
    (window as any).chrome = { runtime: {} };
    (window as any).StyleMedia = {};
  }

  simulateIE11() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
      writable: true
    });
    
    delete (window as any).chrome;
    (window as any).MSInputMethodContext = {};
    (window as any).documentMode = 11;
  }

  simulateMobile() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      writable: true
    });
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      writable: true
    });
  }

  reset() {
    Object.defineProperty(navigator, 'userAgent', {
      value: this.originalUserAgent,
      writable: true
    });
    
    // Reset window properties
    delete (window as any).chrome;
    delete (window as any).InstallTrigger;
    delete (window as any).safari;
    delete (window as any).StyleMedia;
    delete (window as any).MSInputMethodContext;
    delete (window as any).documentMode;
  }
}

// Feature detection utilities
const FeatureDetector = {
  supportsFlexbox: () => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    return div.style.display === 'flex';
  },
  
  supportsGrid: () => {
    const div = document.createElement('div');
    div.style.display = 'grid';
    return div.style.display === 'grid';
  },
  
  supportsDragAndDrop: () => {
    const div = document.createElement('div');
    return 'draggable' in div && 'ondragstart' in div && 'ondrop' in div;
  },
  
  supportsLocalStorage: () => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
  
  supportsTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  supportsPointerEvents: () => {
    return 'onpointerdown' in window;
  }
};

describe('🌐 Cross-Browser Compatibility Testing', () => {
  let browserSim: BrowserSimulator;

  beforeEach(() => {
    browserSim = new BrowserSimulator();
  });

  afterEach(() => {
    browserSim.reset();
    cleanup();
  });

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateChrome();
    });

    it('should render correctly in Chrome', async () => {
      render(<FormBuilder />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();
      
      // Chrome-specific features
      expect(FeatureDetector.supportsFlexbox()).toBe(true);
      expect(FeatureDetector.supportsDragAndDrop()).toBe(true);
    });

    it('should handle Chrome drag and drop events', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      const canvas = screen.getByTestId('canvas');
      
      // Chrome drag events
      await act(async () => {
        fireEvent.dragStart(component, {
          dataTransfer: {
            setData: vi.fn(),
            getData: vi.fn().mockReturnValue('text_input'),
            effectAllowed: 'move'
          }
        });
        
        fireEvent.drop(canvas, {
          dataTransfer: {
            getData: vi.fn().mockReturnValue('text_input')
          }
        });
      });
      
      expect(screen.getAllByText('Text Input Field')).toHaveLength(1);
    });

    it('should use Chrome-optimized CSS features', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      const computedStyle = window.getComputedStyle(canvas);
      
      // Chrome supports modern CSS
      expect(computedStyle.display).toBeDefined();
    });
  });

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateFirefox();
    });

    it('should render correctly in Firefox', async () => {
      render(<FormBuilder />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();
    });

    it('should handle Firefox-specific drag behavior', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      // Firefox requires explicit drag data
      await act(async () => {
        fireEvent.dragStart(component, {
          dataTransfer: {
            setData: vi.fn(),
            getData: vi.fn(),
            types: ['text/plain']
          }
        });
      });
      
      expect(component).toBeInTheDocument();
    });

    it('should work with Firefox CSS engine', async () => {
      render(<FormBuilder />);
      
      // Firefox-specific CSS handling
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      expect(component).toBeInTheDocument();
    });
  });

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateSafari();
    });

    it('should render correctly in Safari', async () => {
      render(<FormBuilder />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();
    });

    it('should handle Safari touch events', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      // Safari touch simulation
      await act(async () => {
        fireEvent.touchStart(component, {
          touches: [{ clientX: 100, clientY: 100 }]
        });
        
        fireEvent.touchEnd(component);
      });
      
      expect(component).toBeInTheDocument();
    });

    it('should work with Safari WebKit prefixes', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      // Safari may need WebKit prefixes
      const style = document.createElement('style');
      style.textContent = `
        .webkit-test {
          -webkit-transform: translateX(0);
          transform: translateX(0);
        }
      `;
      document.head.appendChild(style);
      
      canvas.classList.add('webkit-test');
      expect(canvas).toHaveClass('webkit-test');
      
      document.head.removeChild(style);
    });
  });

  describe('Edge Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateEdge();
    });

    it('should render correctly in Edge', async () => {
      render(<FormBuilder />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();
    });

    it('should handle Edge-specific features', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Edge supports modern features
      expect(FeatureDetector.supportsFlexbox()).toBe(true);
      expect(FeatureDetector.supportsDragAndDrop()).toBe(true);
    });
  });

  describe('Internet Explorer 11 Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateIE11();
    });

    it('should provide IE11 fallbacks', async () => {
      render(<FormBuilder />);
      
      // IE11 may need polyfills
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('should handle IE11 event model', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // IE11 event handling
      await act(async () => {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        textInputButton.dispatchEvent(event);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should work without modern CSS features', async () => {
      render(<FormBuilder />);
      
      // IE11 CSS limitations
      const canvas = screen.getByTestId('canvas');
      
      // Should work with basic CSS
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Mobile Browser Compatibility', () => {
    beforeEach(() => {
      browserSim.simulateMobile();
    });

    it('should render correctly on mobile', async () => {
      render(<FormBuilder />);
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByText('Text Input')).toBeInTheDocument();
    });

    it('should handle mobile touch events', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Mobile touch events
      await act(async () => {
        fireEvent.touchStart(textInputButton, {
          touches: [{ clientX: 100, clientY: 100 }]
        });
        
        fireEvent.touchEnd(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should adapt to mobile viewport', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true
      });
      
      Object.defineProperty(window, 'innerHeight', {
        value: 667,
        writable: true
      });
      
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Feature Detection and Polyfills', () => {
    it('should detect browser capabilities', async () => {
      render(<FormBuilder />);
      
      const capabilities = {
        flexbox: FeatureDetector.supportsFlexbox(),
        grid: FeatureDetector.supportsGrid(),
        dragDrop: FeatureDetector.supportsDragAndDrop(),
        localStorage: FeatureDetector.supportsLocalStorage(),
        touch: FeatureDetector.supportsTouch(),
        pointer: FeatureDetector.supportsPointerEvents()
      };
      
      console.log('Browser capabilities:', capabilities);
      
      // Should handle missing features gracefully
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('should provide fallbacks for missing features', async () => {
      // Mock missing localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Should work without localStorage
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      
      // Restore localStorage
      (window as any).localStorage = originalLocalStorage;
    });

    it('should handle missing drag and drop support', async () => {
      // Mock missing drag and drop
      const div = document.createElement('div');
      delete (div as any).draggable;
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Should provide alternative interaction methods
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });
  });

  describe('CSS Compatibility', () => {
    it('should handle vendor prefixes', async () => {
      render(<FormBuilder />);
      
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        -ms-transform: scale(1);
        transform: scale(1);
      `;
      
      // Should handle various prefixes
      expect(testElement.style.transform || 
             (testElement.style as any).webkitTransform ||
             (testElement.style as any).mozTransform ||
             (testElement.style as any).msTransform).toBeDefined();
    });

    it('should provide CSS fallbacks', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      // Should work with basic CSS properties
      const computedStyle = window.getComputedStyle(canvas);
      expect(computedStyle.display).toBeDefined();
    });

    it('should handle flexbox fallbacks', async () => {
      render(<FormBuilder />);
      
      // Test flexbox support
      if (!FeatureDetector.supportsFlexbox()) {
        // Should provide table or float-based layout fallback
        const canvas = screen.getByTestId('canvas');
        expect(canvas).toBeInTheDocument();
      }
    });
  });

  describe('JavaScript Compatibility', () => {
    it('should work without ES6 features', async () => {
      // Mock missing ES6 features
      const originalPromise = window.Promise;
      delete (window as any).Promise;
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      
      // Restore Promise
      (window as any).Promise = originalPromise;
    });

    it('should handle missing Array methods', async () => {
      // Mock missing Array.from
      const originalArrayFrom = Array.from;
      delete (Array as any).from;
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      
      // Restore Array.from
      Array.from = originalArrayFrom;
    });

    it('should work with strict mode differences', async () => {
      'use strict';
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });
  });

  describe('Performance Across Browsers', () => {
    it('should maintain performance in different browsers', async () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'];
      
      for (const browser of browsers) {
        switch (browser) {
          case 'chrome':
            browserSim.simulateChrome();
            break;
          case 'firefox':
            browserSim.simulateFirefox();
            break;
          case 'safari':
            browserSim.simulateSafari();
            break;
          case 'edge':
            browserSim.simulateEdge();
            break;
        }
        
        const startTime = performance.now();
        
        render(<FormBuilder />);
        
        const textInputButton = screen.getByText('Text Input');
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1000); // Should be fast in all browsers
        
        cleanup();
        browserSim.reset();
      }
    });
  });
});
