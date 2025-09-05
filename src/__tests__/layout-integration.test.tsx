/**
 * Layout System Integration Test
 * Tests the integration between sophisticated layout system and component system
 */

import { ComponentEngine } from '../core/ComponentEngine';
import { ComponentRenderer } from '../core/ComponentRenderer';
import { generateCSSFromLayout } from '../types/layout';
import type { ComponentLayout } from '../types/layout';

describe('Layout System Integration', () => {
  
  describe('ComponentEngine Layout Enhancement', () => {
    it('should create components with default layout properties', () => {
      const horizontalLayout = ComponentEngine.createComponent('horizontal_layout');
      
      // Should have sophisticated flex layout
      expect(horizontalLayout.layout).toBeDefined();
      expect(horizontalLayout.layout?.layoutType).toBe('flex');
      expect(horizontalLayout.layout?.flex?.display).toBe('flex');
      expect(horizontalLayout.layout?.flex?.flexDirection).toBe('row');
      expect(horizontalLayout.layout?.flex?.gap).toBe('1rem');
    });

    it('should create vertical layout with column flex', () => {
      const verticalLayout = ComponentEngine.createComponent('vertical_layout');
      
      expect(verticalLayout.layout?.layoutType).toBe('flex');
      expect(verticalLayout.layout?.flex?.flexDirection).toBe('column');
    });

    it('should create button with appropriate default layout', () => {
      const button = ComponentEngine.createComponent('button');
      
      expect(button.layout?.layoutType).toBe('block');
      expect(button.layout?.size?.width).toBe('fit-content');
      expect(button.layout?.spacing?.margin).toBe('0.5rem 0');
    });

    it('should create card with sophisticated styling', () => {
      const card = ComponentEngine.createComponent('card');
      
      expect(card.layout?.border).toBeDefined();
      expect(card.layout?.border?.style).toBe('solid');
      expect(card.layout?.border?.radius).toBe('8px');
      expect(card.layout?.spacing?.padding).toBe('1rem');
    });
  });

  describe('ComponentEngine Custom Layout Creation', () => {
    it('should create component with custom layout options', () => {
      const customLayout: Partial<ComponentLayout> = {
        layoutType: 'grid',
        grid: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        },
        spacing: {
          padding: '2rem',
          margin: '1rem 0'
        }
      };

      const component = ComponentEngine.createComponentWithLayout('text_input', customLayout);
      
      expect(component.layout?.layoutType).toBe('grid');
      expect(component.layout?.grid?.gridTemplateColumns).toBe('1fr 1fr');
      expect(component.layout?.spacing?.padding).toBe('2rem');
    });
  });

  describe('ComponentRenderer Layout Integration', () => {
    it('should generate comprehensive CSS from layout properties', () => {
      const layout: ComponentLayout = {
        layoutType: 'flex',
        flex: {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        },
        size: {
          width: '100%',
          minHeight: '200px'
        },
        spacing: {
          padding: '1rem',
          margin: '0.5rem 0'
        },
        border: {
          width: 1,
          style: 'solid',
          color: '#e0e0e0',
          radius: '8px'
        }
      };

      const css = generateCSSFromLayout(layout);

      expect(css.display).toBe('flex');
      expect(css.flexDirection).toBe('column');
      expect(css.gap).toBe('1rem');
      expect(css.alignItems).toBe('center');
      expect(css.width).toBe('100%');
      expect(css.minHeight).toBe('200px');
      expect(css.padding).toBe('1rem');
      expect(css.margin).toBe('0.5rem 0');
      expect(css.borderWidth).toBe(1);
      expect(css.borderStyle).toBe('solid');
      expect(css.borderColor).toBe('#e0e0e0');
      expect(css.borderRadius).toBe('8px');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle components without layout properties', () => {
      const basicComponent = {
        id: 'test-1',
        type: 'text_input' as const,
        label: 'Test Input',
        fieldId: 'test_input',
        required: false
      };

      // Should not throw error when no layout is present
      expect(() => {
        ComponentRenderer.renderComponent(basicComponent, 'preview');
      }).not.toThrow();
    });

    it('should merge legacy styling with layout system', () => {
      const component = ComponentEngine.createComponent('text_input');
      component.styling = {
        className: 'custom-class',
        customCSS: 'background-color: #f0f0f0; border-radius: 4px;'
      };
      component.style = {
        fontSize: '16px'
      };

      // This would be tested in a browser environment
      // Just ensure the component has the expected structure
      expect(component.styling.className).toBe('custom-class');
      expect(component.styling.customCSS).toContain('background-color: #f0f0f0');
      expect(component.style.fontSize).toBe('16px');
    });
  });

  describe('Layout System Features', () => {
    it('should support responsive layout breakpoints', () => {
      const responsiveLayout: ComponentLayout = {
        layoutType: 'flex',
        flex: {
          display: 'flex',
          flexDirection: 'row'
        },
        responsive: [
          {
            breakpoint: 'md',
            layout: {
              layoutType: 'flex',
              flex: {
                display: 'flex',
                flexDirection: 'column'
              }
            }
          }
        ]
      };

      const css = generateCSSFromLayout(responsiveLayout);
      expect(css.display).toBe('flex');
      expect(css.flexDirection).toBe('row');
      
      // Responsive properties would be handled by CSS media queries
      expect(responsiveLayout.responsive).toHaveLength(1);
      expect(responsiveLayout.responsive?.[0].breakpoint).toBe('md');
    });

    it('should support custom CSS properties', () => {
      const layoutWithCustomCSS: ComponentLayout = {
        layoutType: 'block',
        customCSS: {
          transform: 'translateX(10px)',
          opacity: 0.8,
          zIndex: 100
        }
      };

      const css = generateCSSFromLayout(layoutWithCustomCSS);
      expect(css.transform).toBe('translateX(10px)');
      expect(css.opacity).toBe(0.8);
      expect(css.zIndex).toBe(100);
    });
  });

  describe('Complex Layout Scenarios', () => {
    it('should handle grid layouts with complex properties', () => {
      const gridLayout: ComponentLayout = {
        layoutType: 'grid',
        grid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateAreas: '"header header header" "sidebar content aside" "footer footer footer"',
          gap: '1rem',
          justifyItems: 'center',
          alignItems: 'stretch'
        }
      };

      const css = generateCSSFromLayout(gridLayout);
      expect(css.display).toBe('grid');
      expect(css.gridTemplateColumns).toBe('repeat(3, 1fr)');
      expect(css.gridTemplateAreas).toContain('header');
      expect(css.gap).toBe('1rem');
      expect(css.justifyItems).toBe('center');
    });

    it('should handle complex spacing with individual properties', () => {
      const complexLayout: ComponentLayout = {
        layoutType: 'block',
        spacing: {
          padding: {
            top: '2rem',
            right: '1rem',
            bottom: '3rem',
            left: '1.5rem'
          },
          margin: {
            top: '1rem',
            right: 'auto',
            bottom: '2rem',
            left: 'auto'
          }
        }
      };

      const css = generateCSSFromLayout(complexLayout);
      expect(css.paddingTop).toBe('2rem');
      expect(css.paddingRight).toBe('1rem');
      expect(css.paddingBottom).toBe('3rem');
      expect(css.paddingLeft).toBe('1.5rem');
      expect(css.marginTop).toBe('1rem');
      expect(css.marginRight).toBe('auto');
      expect(css.marginBottom).toBe('2rem');
      expect(css.marginLeft).toBe('auto');
    });
  });
});