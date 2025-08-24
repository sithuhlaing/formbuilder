import React from 'react';
import { useDrag } from 'react-dnd';
import type { ComponentType } from '../types';

interface PaletteItemProps {
  type: ComponentType;
  label: string;
  icon: string;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="palette-item"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span className="palette-item-icon">{icon}</span>
      <span className="palette-item-label">{label}</span>
    </div>
  );
};

const ComponentPalette: React.FC = () => {
  const components: Array<{ type: ComponentType; label: string; icon: string }> = [
    { type: 'text_input', label: 'Text Input', icon: '📝' },
    { type: 'number_input', label: 'Number Input', icon: '🔢' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'multi_select', label: 'Multi Select', icon: '☑️' },
    { type: 'checkbox', label: 'Checkbox', icon: '✅' },
    { type: 'radio_group', label: 'Radio Group', icon: '🔘' },
    { type: 'date_picker', label: 'Date Picker', icon: '📅' },
    { type: 'file_upload', label: 'File Upload', icon: '📎' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'section_divider', label: 'Section Divider', icon: '➖' },
    { type: 'horizontal_layout', label: 'Horizontal Layout', icon: '↔️' },
    { type: 'vertical_layout', label: 'Vertical Layout', icon: '↕️' },
  ];

  return (
    <div className="component-palette">
      <h3>Components</h3>
      {components.map((component) => (
        <PaletteItem
          key={component.type}
          type={component.type}
          label={component.label}
          icon={component.icon}
        />
      ))}
    </div>
  );
};

export { ComponentPalette, PaletteItem };
