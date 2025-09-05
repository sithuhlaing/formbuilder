/**
 * Performance Requirements Test Suite
 * Tests component load performance, memory usage, and render times
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';
import { performance } from 'perf_hooks';

// Performance test utilities
const measurePerformance = async (testFn: () => Promise<void> | void) => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  await testFn();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return {
    renderTime: endTime - startTime,
    memoryUsed: endMemory - startMemory,
    totalMemory: endMemory
  };
};

const createMockComponents = (count: number) => {
  const components = [];
  for (let i = 0; i < count; i++) {
    components.push({
      id: `component-${i}`,
      type: i % 4 === 0 ? 'text_input' : i % 4 === 1 ? 'email_input' : i % 4 === 2 ? 'textarea' : 'select',
      label: `Component ${i}`,
      required: i % 3 === 0,
      fieldId: `field-${i}`
    });
  }
  return components;
};

const renderAppWithComponents = async (componentCount: number = 0) => {
  const result = render(
    <DndProvider backend={TestBackend}>
      <App />
    </DndProvider>
  );
  
  if (componentCount > 0) {
    // Navigate to form builder
    const createButton = screen.getByRole('button', { name: /create your first form/i });
    createButton.click();
    
    // Add components via test helpers
    const components = createMockComponents(componentCount);
    for (const component of components) {
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn(component.type);
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }
  
  return result;
};

describe('🚀 Performance Requirements', () => {
  beforeEach(() => {
    // Clear any existing performance marks
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Load Testing', () => {
    it('should render small forms (<50ms) - 10 components', async () => {
      const metrics = await measurePerformance(async () => {
        await renderAppWithComponents(10);
      });
      
      expect(metrics.renderTime).toBeLessThan(50);
      console.log(`Small form (10 components): ${metrics.renderTime.toFixed(2)}ms`);
    });

    it('should render medium forms (<150ms) - 50 components', async () => {
      const metrics = await measurePerformance(async () => {
        await renderAppWithComponents(50);
      });
      
      expect(metrics.renderTime).toBeLessThan(150);
      console.log(`Medium form (50 components): ${metrics.renderTime.toFixed(2)}ms`);
    });

    it('should render large forms (<300ms) - 200 components', async () => {
      const metrics = await measurePerformance(async () => {
        await renderAppWithComponents(200);
      });
      
      expect(metrics.renderTime).toBeLessThan(300);
      console.log(`Large form (200 components): ${metrics.renderTime.toFixed(2)}ms`);
    });

    it('should handle massive forms (<1000ms) - 1000 components', async () => {
      const metrics = await measurePerformance(async () => {
        await renderAppWithComponents(1000);
      });
      
      expect(metrics.renderTime).toBeLessThan(1000);
      console.log(`Massive form (1000 components): ${metrics.renderTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Testing', () => {
    it('should use <50MB for initial load with 100 components', async () => {
      const metrics = await measurePerformance(async () => {
        await renderAppWithComponents(100);
      });
      
      const memoryMB = metrics.totalMemory / (1024 * 1024);
      expect(memoryMB).toBeLessThan(50);
      console.log(`Initial load memory: ${memoryMB.toFixed(2)}MB`);
    });

    it('should maintain <80MB after interactions', async () => {
      const { container } = await renderAppWithComponents(50);
      
      // Simulate 50 interactions
      const metrics = await measurePerformance(async () => {
        for (let i = 0; i < 50; i++) {
          // Simulate component selection
          const components = container.querySelectorAll('[data-component-id]');
          if (components[i % components.length]) {
            (components[i % components.length] as HTMLElement).click();
          }
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      });
      
      const memoryMB = metrics.totalMemory / (1024 * 1024);
      expect(memoryMB).toBeLessThan(80);
      console.log(`After interactions memory: ${memoryMB.toFixed(2)}MB`);
    });

    it('should detect memory leaks in long sessions', async () => {
      const initialMetrics = await measurePerformance(async () => {
        await renderAppWithComponents(20);
      });
      
      // Simulate 30-minute session with continuous interactions
      const sessionMetrics = await measurePerformance(async () => {
        for (let i = 0; i < 100; i++) {
          // Add and remove components
          const addFn = (window as any).__testAddComponent__;
          const deleteFn = (window as any).__testDeleteComponent__;
          
          if (addFn) addFn('text_input');
          await new Promise(resolve => setTimeout(resolve, 1));
          
          if (deleteFn) {
            const components = document.querySelectorAll('[data-component-id]');
            if (components.length > 10) {
              const lastComponent = components[components.length - 1];
              const componentId = lastComponent.getAttribute('data-component-id');
              if (componentId) deleteFn(componentId);
            }
          }
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      });
      
      const memoryGrowthMB = sessionMetrics.memoryUsed / (1024 * 1024);
      expect(memoryGrowthMB).toBeLessThan(50); // Should not grow more than 50MB
      console.log(`Memory growth during session: ${memoryGrowthMB.toFixed(2)}MB`);
    });
  });

  describe('Render Time Validation', () => {
    it('should maintain 60fps during drag operations', async () => {
      await renderAppWithComponents(20);
      
      const dragMetrics = await measurePerformance(async () => {
        // Simulate drag operations
        for (let i = 0; i < 10; i++) {
          const moveComponentFn = (window as any).__testMoveComponent__;
          if (moveComponentFn) {
            moveComponentFn(i % 5, (i + 1) % 5);
            await new Promise(resolve => setTimeout(resolve, 16)); // 60fps = 16ms per frame
          }
        }
      });
      
      const avgFrameTime = dragMetrics.renderTime / 10;
      expect(avgFrameTime).toBeLessThan(16); // 60fps requirement
      console.log(`Average drag frame time: ${avgFrameTime.toFixed(2)}ms`);
    });

    it('should respond quickly to user interactions (<100ms)', async () => {
      const { container } = await renderAppWithComponents(50);
      
      const interactionMetrics = await measurePerformance(async () => {
        // Test component selection response time
        const components = container.querySelectorAll('[data-component-id]');
        for (let i = 0; i < Math.min(10, components.length); i++) {
          const startTime = performance.now();
          (components[i] as HTMLElement).click();
          await new Promise(resolve => setTimeout(resolve, 1));
          const responseTime = performance.now() - startTime;
          expect(responseTime).toBeLessThan(100);
        }
      });
      
      console.log(`Interaction response time: ${interactionMetrics.renderTime.toFixed(2)}ms`);
    });
  });

  describe('Optimization Validation', () => {
    it('should use efficient rendering strategies', async () => {
      // Test that components are not unnecessarily re-rendered
      let renderCount = 0;
      const originalRender = React.createElement;
      
      // Mock createElement to count renders
      (React as any).createElement = (...args: any[]) => {
        renderCount++;
        return originalRender.apply(React, args);
      };
      
      await renderAppWithComponents(20);
      const initialRenderCount = renderCount;
      
      // Make a small change that shouldn't trigger full re-render
      const updateFn = (window as any).__testUpdateComponent__;
      if (updateFn) {
        const components = document.querySelectorAll('[data-component-id]');
        if (components.length > 0) {
          const componentId = components[0].getAttribute('data-component-id');
          if (componentId) {
            updateFn(componentId, { label: 'Updated Label' });
          }
        }
      }
      
      const finalRenderCount = renderCount;
      const rerenderRatio = (finalRenderCount - initialRenderCount) / initialRenderCount;
      
      // Should not re-render more than 20% of components for a single update
      expect(rerenderRatio).toBeLessThan(0.2);
      
      // Restore original createElement
      (React as any).createElement = originalRender;
      
      console.log(`Re-render efficiency: ${(rerenderRatio * 100).toFixed(2)}% of components re-rendered`);
    });

    it('should batch state updates efficiently', async () => {
      await renderAppWithComponents(10);
      
      const batchMetrics = await measurePerformance(async () => {
        // Perform multiple rapid updates that should be batched
        const updateFn = (window as any).__testBatchUpdate__;
        if (updateFn) {
          const updates = [];
          for (let i = 0; i < 5; i++) {
            updates.push({
              componentId: `component-${i}`,
              updates: { label: `Batch Update ${i}` }
            });
          }
          updateFn(updates);
        }
      });
      
      // Batch updates should be faster than individual updates
      expect(batchMetrics.renderTime).toBeLessThan(50);
      console.log(`Batch update time: ${batchMetrics.renderTime.toFixed(2)}ms`);
    });
  });
});
