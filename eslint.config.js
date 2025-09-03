import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow any types in this codebase for now - too many to fix at once
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused vars in tests and development code
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow require imports for dynamic imports
      '@typescript-eslint/no-require-imports': 'off',
      // Allow empty object types for composition interfaces
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow case declarations
      'no-case-declarations': 'off',
    },
  },
])
