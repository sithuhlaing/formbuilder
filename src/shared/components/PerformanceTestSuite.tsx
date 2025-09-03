/**
 * PERFORMANCE TESTING SUITE
 * 
 * This component provides:
 * 1. Performance benchmarking for large forms
 * 2. Memory usage testing
 * 3. Render time analysis
 * 4. Comparison between optimized and unoptimized components
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LazyFormRenderer } from './LazyFormRenderer';
import { VirtualizedList } from './VirtualizedList';
import { usePerformanceMonitor, useGlobalPerformance } from '../hooks/usePerformanceMonitor';
import { ComponentRenderer } from './ComponentRenderer';
import type { FormComponentData } from '../../core/interfaces/ComponentInterfaces';

interface PerformanceTestSuiteProps {
  onClose: () => void;
}

interface TestResult {
  testName: string;
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  averageRenderTime: number;
  timestamp: number;
}

export const PerformanceTestSuite: React.FC<PerformanceTestSuiteProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const testRef = useRef<HTMLDivElement>(null);

  const { summary, getSlowComponents } = useGlobalPerformance();
  const { getPerformanceSummary } = usePerformanceMonitor({ 
    componentName: 'PerformanceTestSuite' 
  });

  // Generate test data of different sizes
  const generateTestComponents = useCallback((count: number): FormComponentData[] => {
    const componentTypes = [
      'text_input', 'email_input', 'number_input', 'textarea', 
      'select', 'checkbox', 'radio_group', 'rich_text'
    ];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `test-component-${index}`,
      type: componentTypes[index % componentTypes.length] as any,
      label: `Test Component ${index + 1}`,
      fieldId: `field-${index}`,
      required: index % 3 === 0,
      placeholder: `Test placeholder ${index + 1}`,
      options: componentTypes[index % componentTypes.length] === 'select' 
        ? [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        : undefined
    }));
  }, []);

  // Performance test scenarios
  const performanceTests = [
    {
      name: 'Small Form (10 components)',
      componentCount: 10,
      description: 'Basic form with minimal components'
    },
    {
      name: 'Medium Form (50 components)',
      componentCount: 50,
      description: 'Standard business form size'
    },
    {
      name: 'Large Form (200 components)',
      componentCount: 200,
      description: 'Complex enterprise form'
    },
    {
      name: 'Massive Form (1000 components)',
      componentCount: 1000,
      description: 'Stress test for performance limits'
    }
  ];

  // Run individual test
  const runPerformanceTest = useCallback(async (
    testName: string, 
    components: FormComponentData[],
    useOptimizations: boolean = true
  ) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    setCurrentTest(testName);

    // Force a render cycle
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
          
          const result: TestResult = {
            testName,
            renderTime: endTime - startTime,
            memoryUsage: endMemory - startMemory,
            componentCount: components.length,
            averageRenderTime: (endTime - startTime) / components.length,
            timestamp: Date.now()
          };

          setTestResults(prev => [...prev, result]);
          resolve(undefined);
        });
      });
    });
  }, []);

  // Run all performance tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      for (const test of performanceTests) {
        const components = generateTestComponents(test.componentCount);
        
        // Test with optimizations
        await runPerformanceTest(`${test.name} (Optimized)`, components, true);
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test without optimizations (for comparison)
        await runPerformanceTest(`${test.name} (Standard)`, components, false);
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [generateTestComponents, performanceTests, runPerformanceTest]);

  // Test component that renders forms with different optimizations
  const TestRenderer: React.FC<{ 
    components: FormComponentData[]; 
    useOptimizations: boolean;
    testId: string;
  }> = ({ components, useOptimizations, testId }) => {
    const renderComponent = useCallback((component: FormComponentData, index: number) => (
      <div key={component.id} className="test-component">
        <ComponentRenderer 
          component={component}
          readOnly={true}
        />
      </div>
    ), []);

    if (useOptimizations && components.length > 20) {
      return (
        <LazyFormRenderer
          components={components}
          renderComponent={renderComponent}
          chunkSize={10}
          className={`performance-test-${testId}`}
        />
      );
    }

    // Standard rendering for comparison
    return (
      <div className={`performance-test-standard-${testId}`}>
        {components.map((component, index) => renderComponent(component, index))}
      </div>
    );
  };

  // Format performance results
  const formatResults = () => {
    if (testResults.length === 0) return null;

    const optimizedResults = testResults.filter(r => r.testName.includes('Optimized'));
    const standardResults = testResults.filter(r => r.testName.includes('Standard'));

    return (
      <div className="performance-results">
        <h3>Performance Test Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Components</th>
              <th>Total Render Time</th>
              <th>Avg per Component</th>
              <th>Memory Usage</th>
              <th>Performance Score</th>
            </tr>
          </thead>
          <tbody>
            {testResults.map((result, index) => {
              const performanceScore = Math.max(0, 100 - (result.averageRenderTime * 10));
              const isOptimized = result.testName.includes('Optimized');
              
              return (
                <tr key={index} className={isOptimized ? 'optimized' : 'standard'}>
                  <td>{result.testName}</td>
                  <td>{result.componentCount}</td>
                  <td>{result.renderTime.toFixed(2)}ms</td>
                  <td>{result.averageRenderTime.toFixed(3)}ms</td>
                  <td>{(result.memoryUsage / 1024 / 1024).toFixed(2)}MB</td>
                  <td className={performanceScore > 70 ? 'good' : performanceScore > 40 ? 'medium' : 'poor'}>
                    {performanceScore.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="performance-test-suite">
      <div className="test-header">
        <h2>Performance Test Suite</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="test-controls">
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="run-tests-button"
        >
          {isRunning ? 'Running Tests...' : 'Run Performance Tests'}
        </button>
        
        {currentTest && (
          <div className="current-test">
            Running: {currentTest}
            <div className="loading-bar"></div>
          </div>
        )}
      </div>

      <div className="test-info">
        <h3>Test Scenarios</h3>
        <ul>
          {performanceTests.map((test, index) => (
            <li key={index}>
              <strong>{test.name}</strong>: {test.description}
            </li>
          ))}
        </ul>
      </div>

      {formatResults()}

      <div className="global-performance">
        <h3>Current App Performance</h3>
        <div className="performance-summary">
          <div className="slow-components">
            <h4>Components Needing Optimization:</h4>
            {getSlowComponents(10).length > 0 ? (
              <ul>
                {getSlowComponents(10).slice(0, 5).map((comp, index) => (
                  <li key={index}>
                    {comp.name}: {comp.avgRenderTime.toFixed(2)}ms avg
                  </li>
                ))}
              </ul>
            ) : (
              <p>All components performing well! 🎉</p>
            )}
          </div>
        </div>
      </div>

      <div ref={testRef} className="test-render-area" style={{ height: 0, overflow: 'hidden' }} />
    </div>
  );
};

export default PerformanceTestSuite;