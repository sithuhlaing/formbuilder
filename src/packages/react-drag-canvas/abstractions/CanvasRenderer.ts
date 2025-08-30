/**
 * Canvas Renderer Abstraction Layer
 * SOLID: Dependency Inversion - Abstract renderer interface
 */

import React from 'react';
import type { CanvasItem, RenderContext, CanvasRenderer } from '../types';

// ============================================================================
// ABSTRACT RENDERER INTERFACE
// ============================================================================

export abstract class AbstractCanvasRenderer implements CanvasRenderer {
  abstract render(item: CanvasItem, context: RenderContext): React.ReactNode;
}

// ============================================================================
// CONCRETE RENDERER IMPLEMENTATIONS
// ============================================================================

/**
 * HTML String Renderer - Uses dangerouslySetInnerHTML
 * Note: Not recommended for PWA/CSP environments
 */
export class HTMLStringRenderer extends AbstractCanvasRenderer {
  private htmlGenerator: (item: CanvasItem, mode: string) => string;
  
  constructor(htmlGenerator: (item: CanvasItem, mode: string) => string) {
    super();
    this.htmlGenerator = htmlGenerator;
  }

  render(item: CanvasItem, context: RenderContext): React.ReactNode {
    const htmlContent = this.htmlGenerator(item, 'builder');
    
    return React.createElement('div', {
      className: 'form-component__content',
      dangerouslySetInnerHTML: { __html: htmlContent },
      key: item.id
    });
  }
}

/**
 * CSP-Safe Renderer - Uses React components
 * Recommended for PWA environments
 */
interface CSPSafeRendererProps {
  item: CanvasItem;
  context: RenderContext;
  readOnly?: boolean;
}

export class CSPSafeRenderer extends AbstractCanvasRenderer {
  private componentRenderer: React.ComponentType<CSPSafeRendererProps>;
  
  constructor(componentRenderer: React.ComponentType<CSPSafeRendererProps>) {
    super();
    this.componentRenderer = componentRenderer;
  }

  render(item: CanvasItem, context: RenderContext): React.ReactNode {
    const Component = this.componentRenderer;
    return React.createElement(Component, {
      item,
      context,
      readOnly: true,
      key: item.id
    });
  }
}

/**
 * Custom Function Renderer - Uses provided render function
 * Most flexible approach
 */
export class FunctionRenderer extends AbstractCanvasRenderer {
  private renderFunction: (item: CanvasItem, context: RenderContext) => React.ReactNode;
  
  constructor(renderFunction: (item: CanvasItem, context: RenderContext) => React.ReactNode) {
    super();
    this.renderFunction = renderFunction;
  }

  render(item: CanvasItem, context: RenderContext): React.ReactNode {
    return this.renderFunction(item, context);
  }
}

// ============================================================================
// RENDERER FACTORY
// ============================================================================

export type RendererType = 'html' | 'csp-safe' | 'custom';

export interface RendererConfig {
  type: RendererType;
  htmlGenerator?: (item: any, mode: string) => string;
  componentRenderer?: React.ComponentType<any>;
  renderFunction?: (item: CanvasItem, context: RenderContext) => React.ReactNode;
}

export class CanvasRendererFactory {
  static create(config: RendererConfig): CanvasRenderer {
    switch (config.type) {
      case 'html':
        if (!config.htmlGenerator) {
          throw new Error('htmlGenerator is required for HTML renderer');
        }
        return new HTMLStringRenderer(config.htmlGenerator);
        
      case 'csp-safe':
        if (!config.componentRenderer) {
          throw new Error('componentRenderer is required for CSP-safe renderer');
        }
        return new CSPSafeRenderer(config.componentRenderer);
        
      case 'custom':
        if (!config.renderFunction) {
          throw new Error('renderFunction is required for custom renderer');
        }
        return new FunctionRenderer(config.renderFunction);
        
      default:
        throw new Error(`Unknown renderer type: ${config.type}`);
    }
  }
}

// ============================================================================
// RENDERER ADAPTER
// ============================================================================

/**
 * Adapter to convert CanvasRenderer to renderItem function
 * Allows using abstract renderers with existing canvas components
 */
export const createRenderItemFunction = (renderer: CanvasRenderer) => {
  return (item: CanvasItem, context: RenderContext): React.ReactNode => {
    return renderer.render(item, context);
  };
};
