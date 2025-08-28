import type { DragItem } from '../types';

export type DropPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface DropZone {
  position: DropPosition;
  area: DOMRect;
  isActive: boolean;
}

export interface PositionDetectionResult {
  position: DropPosition;
  targetIndex: number;
  shouldCreateRow: boolean;
  targetComponentId?: string;
  source?: DragItem;
}

export interface CrossSectionRegions {
  top: DOMRect;
  right: DOMRect;
  bottom: DOMRect;
  left: DOMRect;
  center: DOMRect;
}

export interface SmartDropZoneProps {
  componentId: string;
  componentIndex: number;
  elementRef: React.RefObject<HTMLElement | null>;
  onDrop: (result: PositionDetectionResult) => void;
  children: React.ReactNode;
}

export interface DropIndicatorProps {
  position: DropPosition;
  isVisible: boolean;
  bounds: DOMRect;
}