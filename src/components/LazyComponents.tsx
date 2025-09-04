/**
 * Lazy-loaded components for better performance
 * Code splitting to reduce initial bundle size
 */

import { lazy } from 'react';

// Lazy load heavy components
export const LazyComponentPalette = lazy(() => 
  import('../features/form-builder/components/ComponentPalette').then(module => ({
    default: module.ComponentPalette
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
  import('../features/form-builder/components/Canvas').then(module => ({
    default: module.Canvas
  }))
);
