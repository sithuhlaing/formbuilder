/**
 * Generic Types for Drag-Drop Canvas Package
 */

export interface CanvasItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  children?: CanvasItem[];
}

export interface DropPosition {
  type: 'before' | 'after' | 'left' | 'right' | 'center';
  targetId?: string;
}

export interface CanvasConfig {
  cssPrefix?: string;
  enableHorizontalLayouts?: boolean;
  enableVerticalLayouts?: boolean;
  dropZoneThresholds?: {
    horizontal: number; // Default: 0.25 (25% from sides)
    vertical: number;   // Default: 0.3 (30% from top/bottom)
  };
}

export interface RenderContext {
  isSelected: boolean;
  isDragging: boolean;
  isHover: boolean;
  cssPrefix: string;
}

export interface DragItem {
  type: 'new-item' | 'existing-item';
  id: string;
  index?: number;
  itemType?: string;
  item?: CanvasItem;
}

// ============================================================================
// SOLID: Interface Segregation - Split into focused interfaces
// ============================================================================

// Core canvas data and rendering
export interface CanvasCore {
  items: CanvasItem[];
  renderItem: (item: CanvasItem, context: RenderContext) => React.ReactNode;
}

// Drag and drop event handlers
export interface CanvasDragDrop {
  onItemMove: (fromIndex: number, toIndex: number) => void;
  onLayoutCreate: (itemType: string, targetId: string, position: 'left' | 'right') => void;
  onItemDelete: (itemId: string) => void;
  onItemAdd?: (itemType: string, position: DropPosition) => void;
}

// UI and styling configuration
export interface CanvasUI {
  selectedItemId?: string;
  config?: CanvasConfig;
  className?: string;
}

// Combined interface for backward compatibility
// Composition interface combining all canvas capabilities
 
export interface DragDropCanvasProps extends CanvasCore, CanvasDragDrop, CanvasUI {}

// ============================================================================
// SOLID: Dependency Inversion - Renderer abstraction
// ============================================================================

export interface CanvasRenderer {
  render(item: CanvasItem, context: RenderContext): React.ReactNode;
}

// ============================================================================
// Component-specific interfaces for better separation
// ============================================================================

export interface SmartDropZoneProps {
  item: CanvasItem;
  index: number;
  renderItem: (item: CanvasItem, context: RenderContext) => React.ReactNode;
  onItemMove: (fromIndex: number, toIndex: number) => void;
  onLayoutCreate: (itemType: string, targetId: string, position: 'left' | 'right') => void;
  onItemDelete: (itemId: string) => void;
  onItemAdd?: (itemType: string, position: DropPosition) => void;
  selectedItemId?: string;
  config: Required<CanvasConfig>;
}

export interface HorizontalLayoutProps {
  item: CanvasItem;
  index: number;
  renderItem: (item: CanvasItem, context: RenderContext) => React.ReactNode;
  onItemDelete: (itemId: string) => void;
  onItemMove?: (fromIndex: number, toIndex: number) => void;
  onLayoutCreate?: (itemType: string, targetId: string, position: 'left' | 'right') => void;
  selectedItemId?: string;
  cssPrefix: string;
  config: Required<CanvasConfig>;
}
