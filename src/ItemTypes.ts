/**
 * Drag and Drop Item Types for React DnD
 */

export const ItemTypes = {
  COMPONENT: 'component',
  FORM_ELEMENT: 'form_element',
  CANVAS_ITEM: 'canvas_item',
  PALETTE_ITEM: 'palette_item',
  ROW_LAYOUT: 'row_layout',
  COLUMN_LAYOUT: 'column_layout'
} as const;

export type ItemType = typeof ItemTypes[keyof typeof ItemTypes];