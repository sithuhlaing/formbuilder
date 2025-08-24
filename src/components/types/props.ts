
import type { ComponentType, FormComponentData } from './component';
import type { DropPosition } from './layout';

export interface ComponentIconProps {
  type: ComponentType;
  className?: string;
}

export interface ActionButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'danger' | 'primary' | 'warning' | 'delete';
  disabled?: boolean;
}

export interface ComponentSelectProps {
  componentId: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export interface ComponentDeleteProps {
  componentId: string;
  onDelete: (id: string) => void;
}

export interface DropZoneProps {
  componentId: string;
  onDropWithPosition: (type: ComponentType, targetId: string, position: DropPosition) => void;
  children: React.ReactNode;
}
