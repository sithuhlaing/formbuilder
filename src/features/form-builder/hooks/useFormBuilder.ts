/**
 * COMPATIBILITY SHIM - For Legacy Tests
 * 
 * This file provides backward compatibility for tests that still import the old hook path.
 * The actual implementation has moved to src/hooks/useSimpleFormBuilder.ts
 * 
 * ⚠️ DO NOT USE THIS FILE IN NEW CODE
 * ⚠️ This is only for test compatibility during migration
 */

import { useSimpleFormBuilder } from '../../../hooks/useSimpleFormBuilder';

// Re-export the simplified hook for backward compatibility
export const useFormBuilder = useSimpleFormBuilder;