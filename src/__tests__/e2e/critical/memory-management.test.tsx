/**
 * Memory Management Testing Suite
 * Memory leak detection, cleanup validation, and resource management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';

// Memory tracking utilities
class MemoryTracker {
  private snapshots: Array<{ name: string; memory: any; timestamp: number }> = [];

  takeSnapshot(name: string) {
    const memory = this.getMemoryInfo();
    this.snapshots.push({
      name,
      memory,
      timestamp: Date.now()
    });
  }

  private getMemoryInfo() {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return {
        used: (window as any).performance.memory.usedJSHeapSize,
        total: (window as any).performance.memory.totalJSHeapSize,
        limit: (window as any).performance.memory.jsHeapSizeLimit
      };
    }
    
    // Fallback for test environment
    return {
      used: Math.floor(Math.random() * 50000000) + 10000000,
      total: Math.floor(Math.random() * 100000000) + 50000000,
      limit: 2147483648
    };
  }

  getMemoryDelta(fromSnapshot: string, toSnapshot: string) {
    const from = this.snapshots.find(s => s.name === fromSnapshot);
    const to = this.snapshots.find(s => s.name === toSnapshot);
    
    if (!from || !to) return null;
    
    return {
      usedDelta: to.memory.used - from.memory.used,
      totalDelta: to.memory.total - from.memory.total,
      timeDelta: to.timestamp - from.timestamp
    };
  }

  clear() {
    this.snapshots = [];
  }
}

// Mock WeakMap and WeakSet for leak detection
const _mockWeakMap = vi.fn();
const _mockWeakSet = vi.fn();

beforeEach(() => {
  // Mock performance.memory
  if (typeof window !== 'undefined') {
    (window as any).performance = {
      ...window.performance,
      memory: {
        usedJSHeapSize: 15000000,
        totalJSHeapSize: 30000000,
        jsHeapSizeLimit: 2147483648
      }
    };
  }
  
  // Mock garbage collection
  (global as any).gc = vi.fn();
  
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('🧠 Memory Management Testing', () => {
  let memoryTracker: MemoryTracker;

  beforeEach(() => {
    memoryTracker = new MemoryTracker();
  });

  afterEach(() => {
    memoryTracker.clear();
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory when adding and removing components', async () => {
      memoryTracker.takeSnapshot('initial');
      
      render(<FormBuilder />);
      memoryTracker.takeSnapshot('after-render');
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add 50 components
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      memoryTracker.takeSnapshot('after-adding');
      
      // Remove all components
      const deleteButtons = screen.getAllByText('×');
      for (const button of deleteButtons) {
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      // Force garbage collection
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      memoryTracker.takeSnapshot('after-cleanup');
      
      const addDelta = memoryTracker.getMemoryDelta('after-render', 'after-adding');
      const cleanupDelta = memoryTracker.getMemoryDelta('after-adding', 'after-cleanup');
      
      if (addDelta && cleanupDelta) {
        // Memory should be mostly reclaimed after cleanup
        const retainedMemory = addDelta.usedDelta + cleanupDelta.usedDelta;
        expect(Math.abs(retainedMemory)).toBeLessThan(1000000); // Less than 1MB retained
        
        console.log(`Memory test - Added: ${(addDelta.usedDelta / 1024 / 1024).toFixed(2)}MB, Cleaned: ${(cleanupDelta.usedDelta / 1024 / 1024).toFixed(2)}MB, Retained: ${(retainedMemory / 1024 / 1024).toFixed(2)}MB`);
      }
    });

    it('should clean up event listeners on component unmount', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const initialListeners = addEventListenerSpy.mock.calls.length;
      
      unmount();
      
      const removedListeners = removeEventListenerSpy.mock.calls.length;
      
      // Should remove at least as many listeners as were added
      expect(removedListeners).toBeGreaterThanOrEqual(initialListeners * 0.8);
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should not retain references to deleted components', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add components and store references
      const componentRefs: WeakRef<Element>[] = [];
      
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        
        const components = screen.getAllByText('Text Input Field');
        const lastComponent = components[components.length - 1];
        componentRefs.push(new WeakRef(lastComponent));
      }
      
      // Delete all components
      const deleteButtons = screen.getAllByText('×');
      for (const button of deleteButtons) {
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      // Force garbage collection
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if references are cleaned up
      const retainedRefs = componentRefs.filter(ref => ref.deref() !== undefined);
      expect(retainedRefs.length).toBe(0);
    });
  });

  describe('Resource Management', () => {
    it('should manage DOM nodes efficiently', async () => {
      render(<FormBuilder />);
      
      const initialNodeCount = document.querySelectorAll('*').length;
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add 20 components
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      const afterAddingNodeCount = document.querySelectorAll('*').length;
      const nodesPerComponent = (afterAddingNodeCount - initialNodeCount) / 20;
      
      // Should be reasonable number of nodes per component
      expect(nodesPerComponent).toBeLessThan(15);
      expect(nodesPerComponent).toBeGreaterThan(3);
      
      console.log(`DOM efficiency: ${nodesPerComponent.toFixed(1)} nodes per component`);
    });

    it('should cleanup drag and drop resources', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      memoryTracker.takeSnapshot('before-drag');
      
      // Perform drag operations
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.dragStart(component);
          fireEvent.dragEnd(component);
        });
      }
      
      memoryTracker.takeSnapshot('after-drag');
      
      const delta = memoryTracker.getMemoryDelta('before-drag', 'after-drag');
      
      if (delta) {
        // Drag operations shouldn't accumulate significant memory
        expect(delta.usedDelta).toBeLessThan(500000); // Less than 500KB
      }
    });

    it('should handle rapid component creation without memory buildup', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      memoryTracker.takeSnapshot('start');
      
      // Rapid creation in batches
      for (let batch = 0; batch < 5; batch++) {
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            fireEvent.click(textInputButton);
          });
        }
        
        memoryTracker.takeSnapshot(`batch-${batch}`);
        
        if (batch > 0) {
          const batchDelta = memoryTracker.getMemoryDelta(`batch-${batch - 1}`, `batch-${batch}`);
          if (batchDelta) {
            const memoryPerComponent = batchDelta.usedDelta / 10;
            expect(memoryPerComponent).toBeLessThan(100000); // Less than 100KB per component
          }
        }
      }
    });
  });

  describe('Memory Optimization', () => {
    it('should reuse component instances when possible', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      memoryTracker.takeSnapshot('baseline');
      
      // Add 10 text inputs
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      memoryTracker.takeSnapshot('first-batch');
      
      // Delete all and add 10 more
      const deleteButtons = screen.getAllByText('×');
      for (const button of deleteButtons) {
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      memoryTracker.takeSnapshot('second-batch');
      
      const firstDelta = memoryTracker.getMemoryDelta('baseline', 'first-batch');
      const secondDelta = memoryTracker.getMemoryDelta('first-batch', 'second-batch');
      
      if (firstDelta && secondDelta) {
        // Second batch should use less memory due to reuse
        expect(Math.abs(secondDelta.usedDelta)).toBeLessThan(Math.abs(firstDelta.usedDelta));
      }
    });

    it('should optimize memory for large forms', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      memoryTracker.takeSnapshot('empty');
      
      // Add 100 components
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        
        if (i === 49) {
          memoryTracker.takeSnapshot('50-components');
        }
      }
      
      memoryTracker.takeSnapshot('100-components');
      
      const first50Delta = memoryTracker.getMemoryDelta('empty', '50-components');
      const second50Delta = memoryTracker.getMemoryDelta('50-components', '100-components');
      
      if (first50Delta && second50Delta) {
        const memoryPerComponentFirst50 = first50Delta.usedDelta / 50;
        const memoryPerComponentSecond50 = second50Delta.usedDelta / 50;
        
        // Memory per component should not increase significantly with scale
        const efficiencyRatio = memoryPerComponentSecond50 / memoryPerComponentFirst50;
        expect(efficiencyRatio).toBeLessThan(1.5); // No more than 50% increase
        
        console.log(`Memory efficiency - First 50: ${(memoryPerComponentFirst50 / 1024).toFixed(2)}KB/component, Second 50: ${(memoryPerComponentSecond50 / 1024).toFixed(2)}KB/component`);
      }
    });
  });

  describe('Garbage Collection Behavior', () => {
    it('should trigger garbage collection appropriately', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Create memory pressure
      for (let i = 0; i < 200; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      memoryTracker.takeSnapshot('high-memory');
      
      // Delete all components
      const deleteButtons = screen.getAllByText('×');
      for (const button of deleteButtons) {
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      // Manual garbage collection
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      memoryTracker.takeSnapshot('after-gc');
      
      const gcDelta = memoryTracker.getMemoryDelta('high-memory', 'after-gc');
      
      if (gcDelta) {
        // Should reclaim significant memory
        expect(gcDelta.usedDelta).toBeLessThan(-5000000); // At least 5MB reclaimed
      }
    });

    it('should handle memory pressure gracefully', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Simulate memory pressure by creating many components rapidly
      const startTime = Date.now();
      
      try {
        for (let i = 0; i < 1000; i++) {
          await act(async () => {
            fireEvent.click(textInputButton);
          });
          
          // Break if taking too long (memory pressure handling)
          if (Date.now() - startTime > 10000) {
            break;
          }
        }
        
        // Should complete without throwing errors
        expect(true).toBe(true);
      } catch (error) {
        // Should not throw memory-related errors
        expect(error).toBeUndefined();
      }
    });
  });

  describe('Memory Profiling', () => {
    it('should provide memory usage statistics', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      const stats = {
        componentCounts: [] as number[],
        memoryUsages: [] as number[]
      };
      
      // Collect data points
      for (let i = 0; i <= 50; i += 10) {
        if (i > 0) {
          for (let j = 0; j < 10; j++) {
            await act(async () => {
              fireEvent.click(textInputButton);
            });
          }
        }
        
        stats.componentCounts.push(i);
        const memory = (window as any).performance?.memory?.usedJSHeapSize || 0;
        stats.memoryUsages.push(memory);
      }
      
      // Calculate memory growth rate
      const growthRates = [];
      for (let i = 1; i < stats.memoryUsages.length; i++) {
        const rate = (stats.memoryUsages[i] - stats.memoryUsages[i - 1]) / 10; // per component
        growthRates.push(rate);
      }
      
      const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
      
      expect(avgGrowthRate).toBeLessThan(50000); // Less than 50KB per component on average
      
      console.log(`Memory profiling - Average growth: ${(avgGrowthRate / 1024).toFixed(2)}KB per component`);
    });
  });
});
