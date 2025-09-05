/**
 * PERFORMANCE OPTIMIZATION - Lazy Loading for Large Forms
 * 
 * This component implements:
 * 1. Component lazy loading based on viewport intersection
 * 2. Progressive rendering for large forms
 * 3. Memory-efficient form handling
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FormComponentData } from '../../core/interfaces/ComponentInterfaces';

interface LazyFormRendererProps {
  components: FormComponentData[];
  renderComponent: (component: FormComponentData, index: number) => React.ReactNode;
  chunkSize?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

interface ComponentChunk {
  startIndex: number;
  endIndex: number;
  components: FormComponentData[];
  isVisible: boolean;
  isLoaded: boolean;
}

export const LazyFormRenderer: React.FC<LazyFormRendererProps> = ({
  components,
  renderComponent,
  chunkSize = 10,
  threshold = 0.1,
  rootMargin = '100px',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chunks, setChunks] = useState<ComponentChunk[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const chunkRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Create chunks from components
  const componentChunks = useMemo(() => {
    const result: ComponentChunk[] = [];
    
    for (let i = 0; i < components.length; i += chunkSize) {
      const endIndex = Math.min(i + chunkSize - 1, components.length - 1);
      result.push({
        startIndex: i,
        endIndex,
        components: components.slice(i, i + chunkSize),
        isVisible: i === 0, // First chunk is always visible
        isLoaded: i === 0   // First chunk is always loaded
      });
    }
    
    return result;
  }, [components, chunkSize]);

  // Initialize chunks state
  useEffect(() => {
    setChunks(componentChunks);
  }, [componentChunks]);

  // Intersection Observer setup
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const chunkIndex = parseInt(entry.target.getAttribute('data-chunk-index') || '0');
            
            if (entry.isIntersecting) {
              setChunks(prevChunks => 
                prevChunks.map((chunk, index) => 
                  index === chunkIndex 
                    ? { ...chunk, isVisible: true, isLoaded: true }
                    : chunk
                )
              );
            }
          });
        },
        {
          threshold,
          rootMargin
        }
      );
    }

    // Observe all chunk elements
    chunkRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // Ref callback for chunk elements
  const setChunkRef = useCallback((index: number) => (element: HTMLDivElement | null) => {
    if (element) {
      chunkRefs.current.set(index, element);
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    } else {
      const existingElement = chunkRefs.current.get(index);
      if (existingElement && observerRef.current) {
        observerRef.current.unobserve(existingElement);
      }
      chunkRefs.current.delete(index);
    }
  }, []);

  // Placeholder component for unloaded chunks
  const ChunkPlaceholder: React.FC<{ height: number }> = ({ height }) => (
    <div 
      style={{ 
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        borderRadius: '4px',
        color: '#6c757d'
      }}
    >
      <div className="loading-spinner">Loading components...</div>
    </div>
  );

  // Estimate chunk height based on component types
  const estimateChunkHeight = useCallback((chunk: ComponentChunk): number => {
    const baseHeight = 60; // Base height per component
    const heightMultipliers: Record<string, number> = {
      'textarea': 1.5,
      'rich_text': 3,
      'horizontal_layout': 1.2,
      'vertical_layout': 2,
      'section_divider': 0.5
    };

    return chunk.components.reduce((totalHeight, component) => {
      const multiplier = heightMultipliers[component.type] || 1;
      return totalHeight + (baseHeight * multiplier);
    }, 0);
  }, []);

  return (
    <div ref={containerRef} className={`lazy-form-renderer ${className}`}>
      {chunks.map((chunk, chunkIndex) => (
        <div
          key={`chunk-${chunk.startIndex}-${chunk.endIndex}`}
          ref={setChunkRef(chunkIndex)}
          data-chunk-index={chunkIndex}
          className="form-chunk"
          style={{ minHeight: '1px' }}
        >
          {chunk.isLoaded ? (
            <div className="chunk-content">
              {chunk.components.map((component, componentIndex) => (
                <div key={component.id} className="lazy-component">
                  {renderComponent(component, chunk.startIndex + componentIndex)}
                </div>
              ))}
            </div>
          ) : (
            <ChunkPlaceholder height={estimateChunkHeight(chunk)} />
          )}
        </div>
      ))}
      
    </div>
  );
};

export default LazyFormRenderer;