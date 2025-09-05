/**
 * Core Module - SINGLE SOURCES OF TRUTH
 * Convergence: All core business logic in ONE place
 */

// Core Engines - Phase 5 Implementation  
export { DependencyEngine } from './DependencyEngine';

// Simple Component System - Phases 1-2 Implementation
export * from './componentUtils';
export * from './simpleComponents';

// Simple Renderer - Phase 4 Implementation
export { renderSimpleComponent, getSimpleComponentInfo } from '../components/SimpleRenderer';

// Services  
export { SchemaGenerator } from './services/schemaGenerator';

// Note: FormStateEngine moved to legacy - replaced by useSimpleFormBuilder hook