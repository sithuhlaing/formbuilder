/**
 * Core Module - SINGLE SOURCES OF TRUTH
 * Convergence: All core business logic in ONE place
 */

// Core Engines - Single Sources of Truth
export { ComponentEngine } from './ComponentEngine';
export { FormStateEngine } from './FormStateEngine';
export { ComponentRenderer } from './ComponentRenderer';

// Services  
export { SchemaGenerator } from './services/schemaGenerator';

// Types
export type { FormStateAction } from './FormStateEngine';