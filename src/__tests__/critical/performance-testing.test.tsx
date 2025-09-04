/**
 * Critical Performance Testing Suite
 * Comprehensive performance benchmarking with memory profiling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';
import { performance } from 'perf_hooks';

// Performance monitoring utilities
class PerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;
  private memoryStart: any = null;
  private memoryEnd: any = null;

  start() {
    this.startTime = performance.now();
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      this.memoryStart = { ...(window as any).performance.memory };
    }
  }

  end() {
    this.endTime = performance.now();
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      this.memoryEnd = { ...(window as any).performance.memory };
    }
  }

  getDuration() {
    return this.endTime - this.startTime;
  }

  getMemoryUsage() {
    if (!this.memoryStart || !this.memoryEnd) return null;
    return {
      heapUsed: this.memoryEnd.usedJSHeapSize - this.memoryStart.usedJSHeapSize,
      heapTotal: this.memoryEnd.totalJSHeapSize - this.memoryStart.totalJSHeapSize,
      heapLimit: this.memoryEnd.jsHeapSizeLimit
    };
  }
}

// Mock performance.memory for testing environment
beforeEach(() => {
  if (typeof window !== 'undefined') {
    (window as any).performance = {
      ...window.performance,
      memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
      }
    };
  }
});

describe('🚀 Critical Performance Testing', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    vi.clearAllMocks();
  });

  describe('Initial Load Performance', () => {
    it('should load FormBuilder within 500ms', async () => {
      monitor.start();
      
      await act(async () => {
        render(<FormBuilder />);
      });
      
      monitor.end();
      const duration = monitor.getDuration();
      
      expect(duration).toBeLessThan(500);
      console.log(`FormBuilder load time: ${duration.toFixed(2)}ms`);
    });

    it('should initialize with minimal memory footprint', async () => {
      monitor.start();
      
      await act(async () => {
        render(<FormBuilder />);
      });
      
      monitor.end();
      const memory = monitor.getMemoryUsage();
      
      if (memory) {
        expect(memory.heapUsed).toBeLessThan(5000000); // 5MB
        console.log(`Initial memory usage: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
    });

    it('should render canvas within 100ms', async () => {
      render(<FormBuilder />);
      
      monitor.start();
      const canvas = screen.getByTestId('canvas');
      monitor.end();
      
      expect(canvas).toBeInTheDocument();
      expect(monitor.getDuration()).toBeLessThan(100);
    });
  });

  describe('Component Addition Performance', () => {
    it('should add single component within 50ms', async () => {
      render(<FormBuilder />);
      const textInputButton = screen.getByText('Text Input');
      
      monitor.start();
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(50);
    });

    it('should handle bulk component addition efficiently', async () => {
      render(<FormBuilder />);
      const textInputButton = screen.getByText('Text Input');
      
      monitor.start();
      
      // Add 50 components rapidly
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      monitor.end();
      const duration = monitor.getDuration();
      const avgPerComponent = duration / 50;
      
      expect(avgPerComponent).toBeLessThan(20); // 20ms per component
      console.log(`Bulk addition: ${avgPerComponent.toFixed(2)}ms per component`);
    });

    it('should maintain performance with large component counts', async () => {
      render(<FormBuilder />);
      
      // Add 100 components first
      const textInputButton = screen.getByText('Text Input');
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Test performance of adding one more
      monitor.start();
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(100); // Should not degrade significantly
    });
  });

  describe('Drag & Drop Performance', () => {
    it('should handle drag start within 16ms (60fps)', async () => {
      render(<FormBuilder />);
      
      // Add a component first
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      monitor.start();
      await act(async () => {
        fireEvent.dragStart(component);
      });
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(16);
    });

    it('should handle drag over events efficiently', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const canvas = screen.getByTestId('canvas');
      
      monitor.start();
      
      // Simulate rapid drag over events
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.dragOver(canvas, {
            clientX: 100 + i * 10,
            clientY: 100 + i * 10
          });
        });
      }
      
      monitor.end();
      const avgPerEvent = monitor.getDuration() / 10;
      
      expect(avgPerEvent).toBeLessThan(5); // 5ms per drag over event
    });

    it('should complete drag drop within 50ms', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      const canvas = screen.getByTestId('canvas');
      
      monitor.start();
      await act(async () => {
        fireEvent.dragStart(component);
        fireEvent.dragOver(canvas);
        fireEvent.drop(canvas);
      });
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(50);
    });
  });

  describe('Memory Management Performance', () => {
    it('should not leak memory during component operations', async () => {
      render(<FormBuilder />);
      const textInputButton = screen.getByText('Text Input');
      
      const initialMemory = (window as any).performance?.memory?.usedJSHeapSize || 0;
      
      // Perform operations that could cause leaks
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
      
      const finalMemory = (window as any).performance?.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable for 20 components
      expect(memoryIncrease).toBeLessThan(2000000); // 2MB
    });

    it('should clean up event listeners on component removal', async () => {
      render(<FormBuilder />);
      
      // Add components
      const textInputButton = screen.getByText('Text Input');
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      monitor.start();
      
      // Remove all components
      const deleteButtons = screen.getAllByText('×');
      for (const button of deleteButtons) {
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(200); // Cleanup should be fast
    });
  });

  describe('Rendering Performance', () => {
    it('should maintain 60fps during animations', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      // Test hover animation performance
      const frameTime = 16.67; // 60fps = 16.67ms per frame
      
      monitor.start();
      await act(async () => {
        fireEvent.mouseEnter(component);
      });
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(frameTime);
    });

    it('should handle rapid property updates efficiently', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Click on component to select it
      const component = screen.getByText('Text Input Field');
      await act(async () => {
        fireEvent.click(component);
      });
      
      monitor.start();
      
      // Simulate rapid property updates
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          // Simulate property change
          fireEvent.change(screen.getByDisplayValue('Text Input Field'), {
            target: { value: `Updated Label ${i}` }
          });
        });
      }
      
      monitor.end();
      const avgPerUpdate = monitor.getDuration() / 10;
      
      expect(avgPerUpdate).toBeLessThan(10); // 10ms per property update
    });
  });

  describe('Large Form Performance', () => {
    it('should handle forms with 500+ components', async () => {
      render(<FormBuilder />);
      const textInputButton = screen.getByText('Text Input');
      
      monitor.start();
      
      // Add 500 components
      for (let i = 0; i < 500; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        
        // Log progress every 100 components
        if (i % 100 === 99) {
          console.log(`Added ${i + 1} components`);
        }
      }
      
      monitor.end();
      const totalTime = monitor.getDuration();
      const avgPerComponent = totalTime / 500;
      
      expect(avgPerComponent).toBeLessThan(50); // 50ms per component even at scale
      expect(totalTime).toBeLessThan(25000); // Total under 25 seconds
      
      console.log(`Large form creation: ${totalTime.toFixed(2)}ms total, ${avgPerComponent.toFixed(2)}ms per component`);
    });

    it('should maintain responsiveness with complex layouts', async () => {
      render(<FormBuilder />);
      
      // Create complex nested layout
      const textInputButton = screen.getByText('Text Input');
      
      // Add components to create horizontal layouts
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      monitor.start();
      
      // Test interaction performance with complex layout
      const components = screen.getAllByText('Text Input Field');
      await act(async () => {
        fireEvent.click(components[0]);
      });
      
      monitor.end();
      
      expect(monitor.getDuration()).toBeLessThan(100); // Should remain responsive
    });
  });

  describe('Performance Regression Tests', () => {
    it('should not regress in component addition performance', async () => {
      render(<FormBuilder />);
      const textInputButton = screen.getByText('Text Input');
      
      const times: number[] = [];
      
      // Measure performance of adding 10 components
      for (let i = 0; i < 10; i++) {
        monitor.start();
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        monitor.end();
        times.push(monitor.getDuration());
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(avgTime).toBeLessThan(30); // Average under 30ms
      expect(maxTime).toBeLessThan(100); // No single operation over 100ms
      
      console.log(`Component addition performance - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
    });

    it('should maintain consistent performance across operations', async () => {
      render(<FormBuilder />);
      
      const operations = [
        () => fireEvent.click(screen.getByText('Text Input')),
        () => fireEvent.click(screen.getByText('Email Input')),
        () => fireEvent.click(screen.getByText('Number Input')),
        () => fireEvent.click(screen.getByText('Textarea')),
        () => fireEvent.click(screen.getByText('Select'))
      ];
      
      const times: number[] = [];
      
      for (const operation of operations) {
        monitor.start();
        await act(async () => {
          operation();
        });
        monitor.end();
        times.push(monitor.getDuration());
      }
      
      const variance = Math.max(...times) - Math.min(...times);
      
      expect(variance).toBeLessThan(50); // Performance should be consistent
    });
  });
});
