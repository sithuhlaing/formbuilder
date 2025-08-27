// Comprehensive layout types for better JSON ↔ UI mirroring

export interface LayoutSpacing {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export interface LayoutSize {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}

export interface LayoutPosition {
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;
}

export interface FlexLayoutProperties {
  display: 'flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
}

export interface GridLayoutProperties {
  display: 'grid';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignItems?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
}

export interface GridItemProperties {
  gridColumn?: string | number;
  gridRow?: string | number;
  gridArea?: string;
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
}

export interface BlockLayoutProperties {
  display: 'block' | 'inline-block' | 'inline';
}

// Main layout interface that encompasses all layout types
export interface ComponentLayout {
  // Core layout type
  layoutType: 'flex' | 'grid' | 'block';
  
  // Layout-specific properties (only one should be used based on layoutType)
  flex?: FlexLayoutProperties;
  grid?: GridLayoutProperties;
  gridItem?: GridItemProperties;
  block?: BlockLayoutProperties;
  
  // Common properties that apply to all layout types
  size?: LayoutSize;
  spacing?: {
    margin?: string | LayoutSpacing;
    padding?: string | LayoutSpacing;
  };
  position?: LayoutPosition;
  
  // Visual properties
  border?: {
    width?: string | number;
    style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    color?: string;
    radius?: string | number;
  };
  
  background?: {
    color?: string;
    image?: string;
    size?: string;
    position?: string;
    repeat?: string;
  };
  
  shadow?: {
    boxShadow?: string;
    textShadow?: string;
  };
  
  // Responsive properties
  responsive?: {
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    layout: Partial<ComponentLayout>;
  }[];
  
  // Custom CSS properties for advanced customization
  customCSS?: Record<string, string | number>;
}

// Helper function to generate CSS from layout properties
export function generateCSSFromLayout(layout: ComponentLayout): React.CSSProperties {
  const css: React.CSSProperties = {};
  
  // Apply layout-specific properties
  switch (layout.layoutType) {
    case 'flex':
      if (layout.flex) {
        Object.assign(css, {
          display: layout.flex.display,
          flexDirection: layout.flex.flexDirection,
          justifyContent: layout.flex.justifyContent,
          alignItems: layout.flex.alignItems,
          alignContent: layout.flex.alignContent,
          flexWrap: layout.flex.flexWrap,
          gap: layout.flex.gap,
          rowGap: layout.flex.rowGap,
          columnGap: layout.flex.columnGap,
        });
      }
      break;
      
    case 'grid':
      if (layout.grid) {
        Object.assign(css, {
          display: layout.grid.display,
          gridTemplateColumns: layout.grid.gridTemplateColumns,
          gridTemplateRows: layout.grid.gridTemplateRows,
          gridTemplateAreas: layout.grid.gridTemplateAreas,
          gridAutoColumns: layout.grid.gridAutoColumns,
          gridAutoRows: layout.grid.gridAutoRows,
          gridAutoFlow: layout.grid.gridAutoFlow,
          justifyItems: layout.grid.justifyItems,
          alignItems: layout.grid.alignItems,
          justifyContent: layout.grid.justifyContent,
          alignContent: layout.grid.alignContent,
          gap: layout.grid.gap,
          rowGap: layout.grid.rowGap,
          columnGap: layout.grid.columnGap,
        });
      }
      if (layout.gridItem) {
        Object.assign(css, {
          gridColumn: layout.gridItem.gridColumn,
          gridRow: layout.gridItem.gridRow,
          gridArea: layout.gridItem.gridArea,
          justifySelf: layout.gridItem.justifySelf,
          alignSelf: layout.gridItem.alignSelf,
        });
      }
      break;
      
    case 'block':
      if (layout.block) {
        css.display = layout.block.display;
      }
      break;
  }
  
  // Apply common properties
  if (layout.size) {
    Object.assign(css, {
      width: layout.size.width,
      height: layout.size.height,
      minWidth: layout.size.minWidth,
      maxWidth: layout.size.maxWidth,
      minHeight: layout.size.minHeight,
      maxHeight: layout.size.maxHeight,
    });
  }
  
  if (layout.spacing) {
    if (typeof layout.spacing.margin === 'string') {
      css.margin = layout.spacing.margin;
    } else if (layout.spacing.margin) {
      const m = layout.spacing.margin;
      css.marginTop = m.top;
      css.marginRight = m.right;
      css.marginBottom = m.bottom;
      css.marginLeft = m.left;
    }
    
    if (typeof layout.spacing.padding === 'string') {
      css.padding = layout.spacing.padding;
    } else if (layout.spacing.padding) {
      const p = layout.spacing.padding;
      css.paddingTop = p.top;
      css.paddingRight = p.right;
      css.paddingBottom = p.bottom;
      css.paddingLeft = p.left;
    }
  }
  
  if (layout.position) {
    Object.assign(css, {
      position: layout.position.position,
      top: layout.position.top,
      right: layout.position.right,
      bottom: layout.position.bottom,
      left: layout.position.left,
      zIndex: layout.position.zIndex,
    });
  }
  
  if (layout.border) {
    Object.assign(css, {
      borderWidth: layout.border.width,
      borderStyle: layout.border.style,
      borderColor: layout.border.color,
      borderRadius: layout.border.radius,
    });
  }
  
  if (layout.background) {
    Object.assign(css, {
      backgroundColor: layout.background.color,
      backgroundImage: layout.background.image,
      backgroundSize: layout.background.size,
      backgroundPosition: layout.background.position,
      backgroundRepeat: layout.background.repeat,
    });
  }
  
  if (layout.shadow) {
    Object.assign(css, {
      boxShadow: layout.shadow.boxShadow,
      textShadow: layout.shadow.textShadow,
    });
  }
  
  // Apply custom CSS
  if (layout.customCSS) {
    Object.assign(css, layout.customCSS);
  }
  
  return css;
}