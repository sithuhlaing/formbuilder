/**
 * Core Module - SINGLE SOURCES OF TRUTH
 * Convergence: All core business logic in ONE place
 */

// Core Engines - Single Sources of Truth - ALIGNED WITH DOCUMENTATION
export { ComponentEngine } from './ComponentEngine';
export { FormStateEngine } from './FormStateEngine';
export { ComponentRenderer } from './ComponentRenderer';
export { ValidationEngine } from './ValidationEngine';
export { DependencyEngine } from './DependencyEngine';

// Services  
export { SchemaGenerator } from './services/schemaGenerator';

// Types
export type { FormStateAction } from './FormStateEngine';