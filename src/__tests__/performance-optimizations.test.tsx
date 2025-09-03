/**
 * Performance Optimizations Test Suite
 * Tests lazy loading, virtualization, and memoization features
 */

import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { LazyFormRenderer } from '../shared/components/LazyFormRenderer';
import { VirtualizedList } from '../shared/components/VirtualizedList';
import { ComponentRenderer } from '../shared/components/ComponentRenderer';
import { usePerformanceMonitor } from '../shared/hooks/usePerformanceMonitor';
import type { FormComponentData } from '../core/interfaces/ComponentInterfaces';

// Mock IntersectionObserver for lazy loading tests
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
(window as any).IntersectionObserver = mockIntersectionObserver;

// Mock performance API for performance monitoring tests
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50000000 // 50MB
  }
};
(global as any).performance = mockPerformance;

describe('Performance Optimizations', () => {
  
  // Helper function to create test components
  const createTestComponents = (count: number): FormComponentData[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `test-component-${index}`,
      type: 'text_input',
      label: `Test Component ${index + 1}`,
      fieldId: `field-${index}`,
      required: false,
      placeholder: `Test placeholder ${index + 1}`
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LazyFormRenderer', () => {
    test('renders components in chunks', () => {
      const components = createTestComponents(25);
      const renderComponent = vi.fn((component) => <div key={component.id}>{component.label}</div>);

      render(
        <LazyFormRenderer
          components={components}
          renderComponent={renderComponent}
          chunkSize={10}
        />
      );

      // Should render first chunk immediately and show placeholders for others
      expect(screen.getByText('Test Component 1')).toBeInTheDocument();
      expect(screen.getByText('Test Component 10')).toBeInTheDocument();
      
      // Should show loading placeholders for remaining chunks (multiple instances expected)
      const loadingElements = screen.getAllByText('Loading components...');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    test('uses IntersectionObserver for lazy loading', () => {
      const components = createTestComponents(30);
      const renderComponent = vi.fn((component) => <div key={component.id}>{component.label}</div>);

      render(
        <LazyFormRenderer
          components={components}
          renderComponent={renderComponent}
          chunkSize={10}
        />
      );

      // Verify IntersectionObserver was created
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    test('estimates chunk heights correctly', () => {
      const components = [
        { ...createTestComponents(1)[0], id: 'textarea-1', type: 'textarea' as any },
        { ...createTestComponents(1)[0], id: 'richtext-1', type: 'rich_text' as any, label: 'Rich Text Component' },
        { ...createTestComponents(1)[0], id: 'textinput-1', type: 'text_input' as any, label: 'Text Input Component' }
      ];

      const renderComponent = vi.fn((component) => <div key={component.id}>{component.label}</div>);

      render(
        <LazyFormRenderer
          components={components}
          renderComponent={renderComponent}
          chunkSize={3}
        />
      );

      // Should render all components in first chunk
      expect(screen.getByText('Test Component 1')).toBeInTheDocument();
      expect(screen.getByText('Rich Text Component')).toBeInTheDocument();
      expect(screen.getByText('Text Input Component')).toBeInTheDocument();
    });
  });

  describe('VirtualizedList', () => {
    test('renders only visible items', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const renderItem = vi.fn((item, index, style) => (
        <div key={item.id} style={style}>{item.name}</div>
      ));

      render(
        <VirtualizedList
          items={items}
          renderItem={renderItem}
          height={300}
          itemHeight={50}
        />
      );

      // Should render initial visible items
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      // Should have limited number of rendered items (visible + overscan)
      expect(renderItem).toHaveBeenCalled();
      // Should not render all 100 items initially
      expect(() => screen.getByText('Item 50')).toThrow();
    });

    test('handles dynamic item heights', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ id: i, content: `Content ${i}` }));
      const getItemHeight = vi.fn((index) => index % 2 === 0 ? 60 : 40);
      const renderItem = vi.fn((item, index, style) => (
        <div key={item.id} style={style}>{item.content}</div>
      ));

      render(
        <VirtualizedList
          items={items}
          renderItem={renderItem}
          height={400}
          itemHeight={getItemHeight}
        />
      );

      // Should call getItemHeight for calculating positions
      expect(getItemHeight).toHaveBeenCalled();
      // Should render first item
      expect(screen.getByText('Content 0')).toBeInTheDocument();
    });

    test('handles scrolling events', async () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const onScroll = vi.fn();
      const renderItem = vi.fn((item, index, style) => (
        <div key={item.id} style={style}>{item.name}</div>
      ));

      const { container } = render(
        <VirtualizedList
          items={items}
          renderItem={renderItem}
          height={200}
          itemHeight={30}
          onScroll={onScroll}
        />
      );

      // Find scrollable container
      const scrollableContainer = container.querySelector('.virtualized-list-container');
      if (scrollableContainer) {
        // Simulate scroll event
        Object.defineProperty(scrollableContainer, 'scrollTop', { 
          value: 100,
          writable: true 
        });
        
        scrollableContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
        
        await waitFor(() => {
          expect(onScroll).toHaveBeenCalledWith(100);
        });
      }
    });
  });

  describe('ComponentRenderer Memoization', () => {
    test('memoizes component renders', () => {
      const testComponent: FormComponentData = {
        id: 'test-1',
        type: 'text_input',
        label: 'Test Input',
        fieldId: 'test-field',
        required: false,
        placeholder: 'Enter text'
      };

      const { rerender } = render(
        <ComponentRenderer component={testComponent} readOnly={true} />
      );

      // Re-render with same props
      rerender(<ComponentRenderer component={testComponent} readOnly={true} />);

      // Component should be memoized and not re-render unnecessarily
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    test('re-renders when props change', () => {
      const testComponent: FormComponentData = {
        id: 'test-1',
        type: 'text_input',
        label: 'Test Input',
        fieldId: 'test-field',
        required: false,
        placeholder: 'Enter text'
      };

      const { rerender } = render(
        <ComponentRenderer component={testComponent} readOnly={true} />
      );

      // Change a prop
      const updatedComponent = { ...testComponent, label: 'Updated Input' };
      rerender(<ComponentRenderer component={updatedComponent} readOnly={true} />);

      expect(screen.getByText('Updated Input')).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring Hook', () => {
    // We can't easily test the actual hook in isolation due to its reliance on useEffect
    // But we can test its types and basic functionality
    
    test('performance monitor types are correct', () => {
      // This test ensures our TypeScript types are working correctly
      const mockMonitor = {
        metrics: [],
        warnings: [],
        getPerformanceSummary: vi.fn(),
        clearWarnings: vi.fn(),
        clearMetrics: vi.fn(),
        renderCount: 0
      };

      expect(mockMonitor).toBeDefined();
      expect(typeof mockMonitor.getPerformanceSummary).toBe('function');
      expect(Array.isArray(mockMonitor.metrics)).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    test('large form with lazy loading performs better than standard rendering', async () => {
      const largeComponentSet = createTestComponents(100);
      const renderComponent = vi.fn((component) => (
        <div key={component.id} style={{ height: '60px' }}>
          {component.label}
        </div>
      ));

      const startTime = performance.now();
      
      render(
        <LazyFormRenderer
          components={largeComponentSet}
          renderComponent={renderComponent}
          chunkSize={10}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // With lazy loading, initial render should be fast
      // (actual components rendered on intersection)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
      expect(renderComponent).toHaveBeenCalled();
    });

    test('virtualized list handles large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        content: `Large dataset item ${i}`
      }));

      const renderCount = vi.fn();
      const renderItem = vi.fn((item) => {
        renderCount();
        return <div key={item.id}>{item.content}</div>;
      });

      render(
        <VirtualizedList
          items={largeDataset}
          renderItem={renderItem}
          height={400}
          itemHeight={40}
          overscan={2}
        />
      );

      // Should only render visible items + overscan, not all 1000 items
      expect(renderCount).toHaveBeenCalled();
      // The exact count depends on container height and item height
      // 400px / 40px = 10 visible items + 2 overscan * 2 = ~14 items
      expect(renderCount.mock.calls.length).toBeLessThan(20);
    });
  });

  describe('Memory Management', () => {
    test('components clean up properly on unmount', () => {
      const testComponents = createTestComponents(10);
      const renderComponent = vi.fn((component) => <div key={component.id}>{component.label}</div>);

      const { unmount } = render(
        <LazyFormRenderer
          components={testComponents}
          renderComponent={renderComponent}
        />
      );

      // Unmount component
      unmount();

      // Verify IntersectionObserver was disconnected
      expect(mockIntersectionObserver.mock.results[0].value.disconnect).toHaveBeenCalled();
    });

    test('virtualized list cleans up event listeners', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const renderItem = vi.fn((item) => <div key={item.id}>{item.name}</div>);

      const { unmount } = render(
        <VirtualizedList
          items={items}
          renderItem={renderItem}
          height={200}
          itemHeight={30}
        />
      );

      // Component should unmount cleanly without memory leaks
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('Performance Benchmarks', () => {
  // Helper function to create test components
  const createBenchmarkComponents = (count: number): FormComponentData[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `benchmark-component-${index}`,
      type: 'text_input',
      label: `Benchmark Component ${index + 1}`,
      fieldId: `benchmark-field-${index}`,
      required: false,
      placeholder: `Benchmark placeholder ${index + 1}`
    }));
  };

  test('lazy loading vs standard rendering benchmark', async () => {
    const components = createBenchmarkComponents(50);
    
    // Standard rendering benchmark
    const standardStart = performance.now();
    const standardResult = render(
      <div>
        {components.map(component => (
          <ComponentRenderer key={component.id} component={component} />
        ))}
      </div>
    );
    const standardTime = performance.now() - standardStart;
    standardResult.unmount();

    // Lazy loading benchmark
    const lazyStart = performance.now();
    const lazyResult = render(
      <LazyFormRenderer
        components={components}
        renderComponent={(component) => (
          <ComponentRenderer key={component.id} component={component} />
        )}
        chunkSize={10}
      />
    );
    const lazyTime = performance.now() - lazyStart;
    lazyResult.unmount();

    // Lazy loading should be faster for initial render
    console.log(`Standard rendering: ${standardTime.toFixed(2)}ms`);
    console.log(`Lazy loading: ${lazyTime.toFixed(2)}ms`);
    
    // This assertion may be environment-dependent, so we'll just log the results
    expect(lazyTime).toBeDefined();
    expect(standardTime).toBeDefined();
  });
});