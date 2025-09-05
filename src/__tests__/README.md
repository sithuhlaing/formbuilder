# Test Directory Structure

This directory contains all test files for the application, organized by feature and test type.

## Directory Structure

```
__tests__/
├── components/               # Component tests
│   ├── atoms/               # Atomic component tests
│   ├── molecules/           # Molecule component tests
│   └── organisms/           # Organism component tests
│
├── core/                    # Core business logic tests
│   └── ...
│
├── e2e/                     # End-to-end test scenarios
│   └── critical/           # Critical path tests
│
├── features/                # Feature-specific tests
│   ├── form-builder/       # Form builder feature tests
│   └── drag-drop/          # Drag and drop functionality tests
│
├── integration/             # Integration tests
│   └── ...
│
└── utils/                   # Test utilities and debug tests
    └── ...
```

## Test Naming Conventions

- Component tests: `[ComponentName].test.tsx`
- Feature tests: `[feature-name].test.tsx`
- Integration tests: `[feature]-integration.test.tsx`
- E2E tests: `[scenario]-e2e.test.tsx`
- Debug tests: `debug-[purpose].test.tsx`

## Running Tests

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test src/__tests__/features/form-builder/
```

Run in watch mode:
```bash
npm test -- --watch
```

## Best Practices

1. Keep test files close to the code they test
2. Use descriptive test names
3. Group related tests with `describe` blocks
4. Test one thing per test case
5. Use test data factories for complex test data
6. Clean up after tests
7. Mock external dependencies
8. Test both happy paths and error cases
