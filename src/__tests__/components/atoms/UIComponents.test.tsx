
import { describe, it, expect } from 'vitest';
import { ComponentRenderer } from '../core/ComponentRenderer';
import { FormComponentData } from '../types';

describe('UI Components', () => {
  it('should render a button component with the correct type', () => {
    const buttonComponent: FormComponentData = {
      id: 'button-1',
      type: 'button',
      label: 'Click Me',
      fieldId: 'button-1',
      required: false,
      buttonType: 'primary',
    };

    const rendered = ComponentRenderer.renderComponent(buttonComponent, 'preview');
    expect(rendered).toContain('Click Me');
  });

  it('should render a heading component with the correct level', () => {
    const headingComponent: FormComponentData = {
      id: 'heading-1',
      type: 'heading',
      label: 'My Heading',
      fieldId: 'heading-1',
      required: false,
      level: 2,
    };

    const rendered = ComponentRenderer.renderComponent(headingComponent, 'preview');
    expect(rendered).toContain('My Heading');
  });

  it('should render a card component with a title', () => {
    const cardComponent: FormComponentData = {
      id: 'card-1',
      type: 'card',
      label: 'My Card',
      fieldId: 'card-1',
      required: false,
      children: [],
    };

    const rendered = ComponentRenderer.renderComponent(cardComponent, 'preview');
    expect(rendered).toContain('My Card');
  });
});
