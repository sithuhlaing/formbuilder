/**
 * PERFORMANCE OPTIMIZATION - Performance Monitoring Hook
 * 
 * This hook provides:
 * 1. Component render time tracking
 * 2. Memory usage monitoring  
 * 3. Performance metrics collection
 * 4. Performance warnings and recommendations
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  reRenderCount: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceWarning {
  type: 'slow-render' | 'frequent-rerenders' | 'memory-leak';
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  slowRenderThreshold?: number; // milliseconds
  reRenderWarningThreshold?: number; // count within time window
  enableMemoryMonitoring?: boolean;
  logToConsole?: boolean;
}

export function usePerformanceMonitor({
  componentName,
  slowRenderThreshold = 16, // 60fps = 16ms per frame
  reRenderWarningThreshold = 10,
  enableMemoryMonitoring = false,
  logToConsole = process.env.NODE_ENV === 'development'
}: UsePerformanceMonitorOptions) {
  
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const lastRenderTimes = useRef<number[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);

  // Start render time measurement
  const startRenderMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End render time measurement and record metrics
  const endRenderMeasurement = useCallback(() => {
    if (renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;

    // Keep track of recent render times for analysis
    lastRenderTimes.current.push(renderTime);
    if (lastRenderTimes.current.length > 50) {
      lastRenderTimes.current = lastRenderTimes.current.slice(-50);
    }

    // Create performance metric
    const metric: PerformanceMetrics = {
      renderTime,
      reRenderCount: renderCount.current,
      componentName,
      timestamp: Date.now(),
      memoryUsage: enableMemoryMonitoring ? getMemoryUsage() : undefined
    };

    setMetrics(prev => [...prev.slice(-99), metric]); // Keep last 100 metrics

    // Check for performance issues
    checkPerformanceIssues(renderTime, renderCount.current);

    if (logToConsole) {
      console.log(`🔍 [${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    renderStartTime.current = 0;
  }, [componentName, enableMemoryMonitoring, logToConsole, slowRenderThreshold, reRenderWarningThreshold]);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback((): number | undefined => {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }, []);

  // Check for performance issues and generate warnings
  const checkPerformanceIssues = useCallback((renderTime: number, reRenderCount: number) => {
    const newWarnings: PerformanceWarning[] = [];

    // Check for slow renders
    if (renderTime > slowRenderThreshold) {
      newWarnings.push({
        type: 'slow-render',
        message: `Component ${componentName} took ${renderTime.toFixed(2)}ms to render`,
        suggestion: 'Consider memoizing expensive calculations or using React.memo',
        severity: renderTime > slowRenderThreshold * 3 ? 'high' : 'medium'
      });
    }

    // Check for frequent re-renders
    if (reRenderCount > reRenderWarningThreshold) {
      const avgRenderTime = lastRenderTimes.current.reduce((a, b) => a + b, 0) / lastRenderTimes.current.length;
      newWarnings.push({
        type: 'frequent-rerenders',
        message: `Component ${componentName} has re-rendered ${reRenderCount} times (avg: ${avgRenderTime.toFixed(2)}ms)`,
        suggestion: 'Check dependencies in useEffect, useMemo, useCallback hooks',
        severity: reRenderCount > reRenderWarningThreshold * 2 ? 'high' : 'medium'
      });
    }

    // Memory leak detection (basic)
    if (enableMemoryMonitoring && metrics.length > 10) {
      const recentMemory = metrics.slice(-10).map(m => m.memoryUsage).filter(Boolean) as number[];
      if (recentMemory.length > 5) {
        const trend = recentMemory.slice(-5).reduce((acc, curr, idx) => acc + (curr - recentMemory[0]) * idx, 0);
        if (trend > 1000000) { // 1MB trend increase
          newWarnings.push({
            type: 'memory-leak',
            message: `Potential memory leak detected in ${componentName}`,
            suggestion: 'Check for uncleaned event listeners, intervals, or subscriptions',
            severity: 'high'
          });
        }
      }
    }

    if (newWarnings.length > 0) {
      setWarnings(prev => [...prev, ...newWarnings]);
      
      if (logToConsole) {
        newWarnings.forEach(warning => {
          const emoji = warning.severity === 'high' ? '🚨' : warning.severity === 'medium' ? '⚠️' : 'ℹ️';
          console.warn(`${emoji} [PERFORMANCE WARNING] ${warning.message}\n💡 ${warning.suggestion}`);
        });
      }
    }
  }, [componentName, slowRenderThreshold, reRenderWarningThreshold, enableMemoryMonitoring, metrics, logToConsole]);

  // Auto-start measurement on each render
  useEffect(() => {
    startRenderMeasurement();
    return () => {
      endRenderMeasurement();
    };
  });

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    if (metrics.length === 0) return null;

    const renderTimes = metrics.map(m => m.renderTime);
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      componentName,
      totalRenders: renderCount.current,
      avgRenderTime: parseFloat(avgRenderTime.toFixed(2)),
      maxRenderTime: parseFloat(maxRenderTime.toFixed(2)),
      minRenderTime: parseFloat(minRenderTime.toFixed(2)),
      warnings: warnings.length,
      lastRenderTime: renderTimes[renderTimes.length - 1]
    };
  }, [metrics, warnings, componentName]);

  // Clear warnings
  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics([]);
    renderCount.current = 0;
    lastRenderTimes.current = [];
  }, []);

  return {
    metrics,
    warnings,
    getPerformanceSummary,
    clearWarnings,
    clearMetrics,
    renderCount: renderCount.current
  };
}

// Global performance tracker for overall app performance
class GlobalPerformanceTracker {
  private static instance: GlobalPerformanceTracker;
  private components: Map<string, PerformanceMetrics[]> = new Map();
  
  static getInstance(): GlobalPerformanceTracker {
    if (!GlobalPerformanceTracker.instance) {
      GlobalPerformanceTracker.instance = new GlobalPerformanceTracker();
    }
    return GlobalPerformanceTracker.instance;
  }

  addMetric(componentName: string, metric: PerformanceMetrics) {
    const existing = this.components.get(componentName) || [];
    this.components.set(componentName, [...existing.slice(-49), metric]);
  }

  getGlobalSummary() {
    const summary: Record<string, any> = {};
    
    this.components.forEach((metrics, componentName) => {
      const renderTimes = metrics.map(m => m.renderTime);
      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      
      summary[componentName] = {
        totalRenders: metrics.length,
        avgRenderTime: parseFloat(avgRenderTime.toFixed(2)),
        maxRenderTime: Math.max(...renderTimes),
        recentRenders: metrics.slice(-10).length
      };
    });

    return summary;
  }

  getSlowComponents(threshold: number = 16) {
    const slowComponents: Array<{ name: string; avgRenderTime: number }> = [];
    
    this.components.forEach((metrics, componentName) => {
      const renderTimes = metrics.map(m => m.renderTime);
      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      
      if (avgRenderTime > threshold) {
        slowComponents.push({ name: componentName, avgRenderTime });
      }
    });

    return slowComponents.sort((a, b) => b.avgRenderTime - a.avgRenderTime);
  }
}

export const globalPerformanceTracker = GlobalPerformanceTracker.getInstance();

// Hook for global performance monitoring
export function useGlobalPerformance() {
  const [summary, setSummary] = useState(globalPerformanceTracker.getGlobalSummary());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(globalPerformanceTracker.getGlobalSummary());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    summary,
    getSlowComponents: globalPerformanceTracker.getSlowComponents.bind(globalPerformanceTracker)
  };
}