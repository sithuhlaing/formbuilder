import type { ComponentType } from '../../../types';

export interface ComponentItem {
  type: ComponentType;
  name: string;
  icon: string;
  description: string;
}

export interface ComponentGroup {
  title: string;
  components: ComponentItem[];
}

export const componentGroups: ComponentGroup[] = [
  {
    title: "Input Fields",
    components: [
      { type: "text_input", name: "Text Input", icon: "📝", description: "Single line text input" },
      { type: "email_input", name: "Email", icon: "📧", description: "Email address input" },
      { type: "password_input", name: "Password", icon: "🔒", description: "Password input field" },
      { type: "number_input", name: "Number", icon: "🔢", description: "Numeric input field" },
      { type: "textarea", name: "Textarea", icon: "📄", description: "Multi-line text input" }
    ]
  },
  {
    title: "Selection",
    components: [
      { type: "select", name: "Dropdown", icon: "📋", description: "Single selection dropdown" },
      { type: "multi_select", name: "Multi Select", icon: "☑️", description: "Multiple selection dropdown" },
      { type: "radio_group", name: "Radio Group", icon: "🔘", description: "Single choice from options" },
      { type: "checkbox", name: "Checkbox", icon: "✅", description: "Multiple choice options" }
    ]
  },
  {
    title: "Advanced",
    components: [
      { type: "file_upload", name: "File Upload", icon: "📁", description: "File upload field" },
      { type: "signature", name: "Signature", icon: "✍️", description: "Digital signature pad" },
      { type: "rich_text", name: "Rich Text", icon: "🎨", description: "Formatted text editor" },
      { type: "section_divider", name: "Section Divider", icon: "➖", description: "Visual section separator" }
    ]
  },
  {
    title: "Date & Time",
    components: [
      { type: "date_picker", name: "Date Picker", icon: "📅", description: "Date selection field" }
    ]
  }
];