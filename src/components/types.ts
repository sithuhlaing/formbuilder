
import type { ComponentType } from "../types";

export interface SidebarProps {
  onAddComponent: (type: ComponentType) => void;
}
