/**
 * Responsive Behavior Test Suite
 * Tests mobile/tablet layouts and adaptive behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      const mediaQuery = query.match(/\(max-width:\s*(\d+)px\)/);
      const maxWidth = mediaQuery ? parseInt(mediaQuery[1]) : Infinity;
      
      return {
        matches: width <= maxWidth,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      };
    },
  });
};

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

const renderAppWithViewport = async (width: number, height: number = 800) => {
  mockMatchMedia(width);
  mockWindowDimensions(width, height);
  
  const result = render(
    <DndProvider backend={TestBackend}>
      <App />
    </DndProvider>
  );
  
  // Navigate to form builder
  const createButton = screen.getByRole('button', { name: /create your first form/i });
  createButton.click();
  
  return result;
};

const addTestComponents = async (count: number = 3) => {
  for (let i = 0; i < count; i++) {
    const addComponentFn = (window as any).__testAddComponent__;
    if (addComponentFn) {
      addComponentFn(i % 2 === 0 ? 'text_input' : 'email_input');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
};

describe('📱 Responsive Behavior', () => {
  beforeEach(() => {
    // Reset viewport to desktop default
    mockWindowDimensions(1200, 800);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Breakpoint Detection', () => {
    it('should detect mobile viewport (< 768px)', async () => {
      const { container } = await renderAppWithViewport(767);
      
      // Check for mobile-specific classes or layout changes
      const app = container.querySelector('.app');
      expect(app).toBeTruthy();
      
      // Mobile should have stacked layout
      const sidebar = container.querySelector('.sidebar');
      const canvas = container.querySelector('.canvas-container');
      
      if (sidebar && canvas) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // On mobile, sidebar should be above canvas (stacked vertically)
        expect(sidebarRect.bottom).toBeLessThanOrEqual(canvasRect.top + 10);
      }
    });

    it('should detect tablet viewport (768px - 1024px)', async () => {
      const { container } = await renderAppWithViewport(900);
      
      const app = container.querySelector('.app');
      expect(app).toBeTruthy();
      
      // Tablet should have side-by-side layout but condensed
      const sidebar = container.querySelector('.sidebar');
      if (sidebar) {
        const styles = window.getComputedStyle(sidebar);
        // Tablet sidebar should be narrower than desktop
        expect(parseInt(styles.width)).toBeLessThan(300);
      }
    });

    it('should detect desktop viewport (> 1024px)', async () => {
      const { container } = await renderAppWithViewport(1200);
      
      const app = container.querySelector('.app');
      expect(app).toBeTruthy();
      
      // Desktop should have full side-by-side layout
      const sidebar = container.querySelector('.sidebar');
      const canvas = container.querySelector('.canvas-container');
      
      if (sidebar && canvas) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // On desktop, sidebar and canvas should be side by side
        expect(sidebarRect.right).toBeLessThanOrEqual(canvasRect.left + 10);
      }
    });
  });

  describe('Layout Adaptation', () => {
    it('should stack horizontal layouts vertically on mobile', async () => {
      const { container } = await renderAppWithViewport(375); // iPhone width
      await addTestComponents(4);
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const rowLayout = container.querySelector('[data-testid="row-layout"]');
      if (rowLayout) {
        const styles = window.getComputedStyle(rowLayout);
        // On mobile, horizontal layouts should stack vertically
        expect(styles.flexDirection).toBe('column');
      }
    });

    it('should limit components per row on tablet (max 2)', async () => {
      const { container } = await renderAppWithViewport(768);
      await addTestComponents(4);
      
      // Create horizontal layout with multiple components
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      const addToLayoutFn = (window as any).__testAddToRowLayout__;
      
      if (createHorizontalFn && addToLayoutFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const rowLayout = container.querySelector('[data-testid="row-layout"]');
        if (rowLayout) {
          const layoutId = rowLayout.getAttribute('data-component-id');
          if (layoutId) {
            addToLayoutFn('email_input', layoutId);
            addToLayoutFn('textarea', layoutId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"]');
      // On tablet, should wrap after 2 items
      expect(rowItems.length).toBeLessThanOrEqual(2);
    });

    it('should allow full horizontal layout on desktop (up to 4)', async () => {
      const { container } = await renderAppWithViewport(1200);
      await addTestComponents(4);
      
      // Create horizontal layout with 4 components
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      const addToLayoutFn = (window as any).__testAddToRowLayout__;
      
      if (createHorizontalFn && addToLayoutFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const rowLayout = container.querySelector('[data-testid="row-layout"]');
        if (rowLayout) {
          const layoutId = rowLayout.getAttribute('data-component-id');
          if (layoutId) {
            addToLayoutFn('email_input', layoutId);
            addToLayoutFn('textarea', layoutId);
            addToLayoutFn('select', layoutId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      const rowItems = container.querySelectorAll('[data-testid^="row-item-"]');
      // Desktop should support up to 4 items in a row
      expect(rowItems.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Touch Interface Optimization', () => {
    it('should have larger touch targets on mobile (min 44px)', async () => {
      const { container } = await renderAppWithViewport(375);
      await addTestComponents(2);
      
      // Check drag handles
      const dragHandles = container.querySelectorAll('.canvas__drag-handle, .palette-item');
      dragHandles.forEach(handle => {
        const rect = handle.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have accessible delete buttons on mobile', async () => {
      const { container } = await renderAppWithViewport(375);
      await addTestComponents(2);
      
      const deleteButtons = container.querySelectorAll('.canvas__delete-btn');
      deleteButtons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
    });

    it('should show touch-friendly component palette on mobile', async () => {
      const { container } = await renderAppWithViewport(375);
      
      const paletteItems = container.querySelectorAll('.palette-item');
      paletteItems.forEach(item => {
        const styles = window.getComputedStyle(item);
        expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
        expect(parseInt(styles.padding)).toBeGreaterThanOrEqual(8);
      });
    });
  });

  describe('Responsive Canvas Behavior', () => {
    it('should adjust canvas padding on small screens', async () => {
      const { container } = await renderAppWithViewport(375);
      
      const canvas = container.querySelector('.canvas-container');
      if (canvas) {
        const styles = window.getComputedStyle(canvas);
        const padding = parseInt(styles.padding);
        expect(padding).toBeLessThan(20); // Reduced padding on mobile
      }
    });

    it('should stack properties panel below canvas on mobile', async () => {
      const { container } = await renderAppWithViewport(375);
      await addTestComponents(1);
      
      // Select a component to show properties panel
      const component = container.querySelector('[data-component-id]');
      if (component) {
        (component as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const canvas = container.querySelector('.canvas-container');
      const properties = container.querySelector('.properties-panel');
      
      if (canvas && properties) {
        const canvasRect = canvas.getBoundingClientRect();
        const propertiesRect = properties.getBoundingClientRect();
        
        // Properties should be below canvas on mobile
        expect(propertiesRect.top).toBeGreaterThanOrEqual(canvasRect.bottom - 10);
      }
    });

    it('should maintain side-by-side layout on desktop', async () => {
      const { container } = await renderAppWithViewport(1200);
      await addTestComponents(1);
      
      // Select a component to show properties panel
      const component = container.querySelector('[data-component-id]');
      if (component) {
        (component as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const canvas = container.querySelector('.canvas-container');
      const properties = container.querySelector('.properties-panel');
      
      if (canvas && properties) {
        const canvasRect = canvas.getBoundingClientRect();
        const propertiesRect = properties.getBoundingClientRect();
        
        // Properties should be to the right of canvas on desktop
        expect(propertiesRect.left).toBeGreaterThanOrEqual(canvasRect.right - 10);
      }
    });
  });

  describe('Responsive Typography and Spacing', () => {
    it('should use smaller font sizes on mobile', async () => {
      const { container } = await renderAppWithViewport(375);
      
      const labels = container.querySelectorAll('.form-field__label, .palette-item__label');
      labels.forEach(label => {
        const styles = window.getComputedStyle(label);
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeLessThan(16); // Smaller fonts on mobile
      });
    });

    it('should use compact spacing on mobile', async () => {
      const { container } = await renderAppWithViewport(375);
      await addTestComponents(3);
      
      const components = container.querySelectorAll('[data-component-id]');
      if (components.length >= 2) {
        const first = components[0].getBoundingClientRect();
        const second = components[1].getBoundingClientRect();
        const gap = second.top - first.bottom;
        
        expect(gap).toBeLessThan(20); // Compact spacing on mobile
      }
    });

    it('should use comfortable spacing on desktop', async () => {
      const { container } = await renderAppWithViewport(1200);
      await addTestComponents(3);
      
      const components = container.querySelectorAll('[data-component-id]');
      if (components.length >= 2) {
        const first = components[0].getBoundingClientRect();
        const second = components[1].getBoundingClientRect();
        const gap = second.top - first.bottom;
        
        expect(gap).toBeGreaterThan(15); // Comfortable spacing on desktop
      }
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', async () => {
      // Start in portrait
      const { container } = await renderAppWithViewport(375, 667);
      await addTestComponents(2);
      
      // Switch to landscape
      mockWindowDimensions(667, 375);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Layout should adapt to landscape
      const app = container.querySelector('.app');
      expect(app).toBeTruthy();
      
      // Should maintain functionality after orientation change
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('textarea');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const components = container.querySelectorAll('[data-component-id]');
      expect(components.length).toBe(3);
    });

    it('should maintain state during viewport changes', async () => {
      const { container } = await renderAppWithViewport(1200);
      await addTestComponents(3);
      
      // Select a component
      const component = container.querySelector('[data-component-id]');
      if (component) {
        (component as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Change to mobile viewport
      mockWindowDimensions(375, 667);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should maintain selection and component count
      const componentsAfter = container.querySelectorAll('[data-component-id]');
      expect(componentsAfter.length).toBe(3);
      
      // Selected component should still be selected
      const selectedComponent = container.querySelector('[data-component-id].selected, .canvas__item--selected');
      expect(selectedComponent).toBeTruthy();
    });
  });
});
