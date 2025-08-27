import React from 'react';
import { useDrag } from 'react-dnd';
import type { ComponentType } from '../../types';

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

const componentList: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'text_input', label: 'Text Input', icon: 'T' },
  { type: 'textarea', label: 'Text Area', icon: '¶' },
  { type: 'number_input', label: 'Number Input', icon: '#' },
  { type: 'select', label: 'Select', icon: '▼' },
  { type: 'multi_select', label: 'Multi-Select', icon: 'V' },
  { type: 'radio_group', label: 'Radio Group', icon: '◉' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'date_picker', label: 'Date Picker', icon: '📅' },
  { type: 'file_upload', label: 'File Upload', icon: '📁' },
  { type: 'static_text', label: 'Static Text', icon: 'Ab' },
];

const ComponentPalette: React.FC = () => {
  return (
    <div className="component-palette">
      <h3>Components</h3>
      <div className="component-grid">
        {componentList.map(({ type, label, icon }) => (
          <PaletteItem key={type} type={type} label={label} icon={icon} />
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;
