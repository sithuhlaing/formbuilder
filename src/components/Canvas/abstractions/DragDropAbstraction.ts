import type { DragItem } from '../types';

export interface IDragDropProvider {
  createDropZone(config: DropZoneConfig): DropZoneResult;
  createDragSource(config: DragSourceConfig): DragSourceResult;
}

export interface DropZoneConfig {
  accept: string[];
  onDrop: (item: DragItem, monitor: any) => any;
  onHover?: (item: DragItem, monitor: any) => void;
  canDrop?: (item: DragItem, monitor: any) => boolean;
  collect?: (monitor: any) => any;
}

export interface DragSourceConfig {
  type: string;
  item: DragItem;
  collect?: (monitor: any) => any;
  canDrag?: (monitor: any) => boolean;
}

export interface DropZoneResult {
  dropRef: React.RefObject<HTMLElement>;
  connect: (ref: React.RefObject<HTMLElement>) => void;
  monitor: any;
}

export interface DragSourceResult {
  dragRef: React.RefObject<HTMLElement>;
  connect: (ref: React.RefObject<HTMLElement>) => void;
  monitor: any;
}

// React DnD Implementation
import { useDrop, useDrag } from 'react-dnd';
import { useRef } from 'react';

export class ReactDndProvider implements IDragDropProvider {
  createDropZone(config: DropZoneConfig): DropZoneResult {
    const dropRef = useRef<HTMLElement>(null);
    
    const [monitor, drop] = useDrop(() => ({
      accept: config.accept,
      drop: config.onDrop,
      hover: config.onHover,
      canDrop: config.canDrop,
      collect: config.collect || (() => ({}))
    }));

    return {
      dropRef,
      connect: (ref) => drop(ref),
      monitor
    };
  }

  createDragSource(config: DragSourceConfig): DragSourceResult {
    const dragRef = useRef<HTMLElement>(null);
    
    const [monitor, drag] = useDrag(() => ({
      type: config.type,
      item: config.item,
      canDrag: config.canDrag,
      collect: config.collect || (() => ({}))
    }));

    return {
      dragRef,
      connect: (ref) => drag(ref),
      monitor
    };
  }
}