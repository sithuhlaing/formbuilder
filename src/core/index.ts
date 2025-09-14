/**
 * Core Module - SINGLE SOURCES OF TRUTH
 * Convergence: All core business logic in ONE place
 */

// Core Engines - Phase 5 Implementation  
// DependencyEngine removed - was unused

// Simple Component System - Phases 1-2 Implementation
export * from './componentUtils';
export * from './simpleComponents';

// Simple Renderer - Phase 4 Implementation
export { renderSimpleComponent, getSimpleComponentInfo } from '../components/SimpleRenderer';

// Services  
// SchemaGenerator removed - was unused

// Note: FormStateEngine moved to legacy - replaced by useSimpleFormBuilder hook