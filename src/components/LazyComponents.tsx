/**
 * Lazy-loaded components for better performance
 * Code splitting to reduce initial bundle size
 */

import { lazy } from 'react';

// Lazy load simple components - Phase 5 Integration
export const LazyComponentPalette = lazy(() => 
  import('./SimpleComponentPalette').then(module => ({
    default: module.SimpleComponentPalette
  }))
);

export const LazyPropertiesPanel = lazy(() => 
  import('../features/form-builder/components/PropertiesPanel').then(module => ({
    default: module.PropertiesPanel
  }))
);

export const LazyPreviewModal = lazy(() => 
  import('../features/form-builder/components/PreviewModal').then(module => ({
    default: module.PreviewModal
  }))
);

export const LazyTemplateListView = lazy(() => 
  import('../features/template-management/components/TemplateListView').then(module => ({
    default: module.TemplateListView
  }))
);

export const LazyCanvas = lazy(() => 
  import('./SimpleCanvas').then(module => ({
    default: module.SimpleCanvas
  }))
);
