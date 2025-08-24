
export interface LayoutConfig {
  width?: string;
  height?: string;
  direction?: "horizontal" | "vertical";
  alignment?: "start" | "center" | "end";
  gap?: "small" | "medium" | "large";
}

export type DropPosition = 'left' | 'right' | 'top' | 'bottom' | null;
