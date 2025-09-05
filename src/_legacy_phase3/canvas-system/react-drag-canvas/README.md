# React Drag Canvas Package

## NPM-Ready Generic Drag & Drop Canvas Components

This package contains the modern, generic implementation of drag-drop canvas functionality designed for NPM package distribution.

## Architecture Decision

This package exists alongside the legacy shared components (`src/shared/components/`) intentionally:

### 🆕 **Package Components (NPM-Ready)**
- **Generic interfaces** suitable for any drag-drop use case
- **String-based types** instead of TypeScript enums for better interop
- **Configurable thresholds** (25% horizontal, 30% vertical per JSON specs)
- **Modern callback patterns**: `onItemAdd(string, {type, targetIndex})`

### 🔄 **Legacy Components (Internal)**  
- **Specific to form builder** internal usage
- **TypeScript enum types** for type safety in internal code
- **Fixed thresholds** optimized for form building
- **Legacy callback patterns**: `onInsertBetween(ComponentType, index)`

## Key Components

### BetweenElementsDropZone
Modern between-element drop zone with generic interfaces.

```typescript
<BetweenElementsDropZone
  beforeIndex={index}
  afterIndex={index + 1}
  onItemAdd={(itemType, position) => {
    // Generic string-based handling
    handleItemAdd(itemType, position);
  }}
  config={{ cssPrefix: 'my-canvas' }}
/>
```

### SmartDropZone  
Advanced position detection with configurable thresholds.

```typescript
<SmartDropZone
  item={item}
  onLayoutCreate={handleLayoutCreate}
  config={{
    dropZoneThresholds: { horizontal: 0.25, vertical: 0.3 }
  }}
/>
```

### DragDropCanvas
Main canvas component with integrated drop handling.

```typescript
<DragDropCanvas
  items={canvasItems}
  renderItem={renderMyItem}
  onItemAdd={handleItemAdd}
  config={{
    enableHorizontalLayouts: true,
    dropZoneThresholds: { horizontal: 0.25, vertical: 0.3 }
  }}
/>
```

## vs Legacy Components

| Feature | Package Components | Legacy Components |
|---------|-------------------|-------------------|
| **Purpose** | NPM package export | Internal usage |
| **Types** | Generic strings | TypeScript enums |
| **Callbacks** | `onItemAdd(string, pos)` | `onInsertBetween(ComponentType, idx)` |
| **Thresholds** | Configurable | Fixed |
| **Reusability** | Any drag-drop use case | Form builder specific |

## Both Are Intentionally Maintained

This is **not accidental duplication** - both patterns serve different architectural needs:

- **Package components**: External consumption, NPM distribution
- **Legacy components**: Internal consistency, test stability, backward compatibility

## Migration Strategy

When migrating from legacy to package components:

1. **Change callback signature**: `onInsertBetween` → `onItemAdd`  
2. **Update type handling**: `ComponentType` → `string`
3. **Add configuration**: Thresholds, CSS prefixes
4. **Test thoroughly**: Different data flows

## Documentation

See `/docs/DROP_ZONE_DUPLICATION_ANALYSIS.md` for complete architectural analysis.