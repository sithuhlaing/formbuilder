export const components = {
  input_components: {
    icon: "✏️",
    label: "Input Components",
    components: [
      {
        type: "text_input",
        icon: "📝",
        label: "Text Input",
        description: "Single line text field",
        properties: {
          label: "Text Input",
          placeholder: "Enter text",
          required: false,
        },
      },
      {
        type: "email_input",
        icon: "📧",
        label: "Email Input",
        description: "Email address field with validation",
        properties: {
          label: "Email Input",
          placeholder: "Enter email",
          required: true,
        },
      },
      {
        type: "password_input",
        icon: "🔒",
        label: "Password Input",
        description: "Password field with masking",
        properties: {
          label: "Password Input",
          placeholder: "Enter password",
          required: true,
        },
      },
      {
        type: "number_input",
        icon: "🔢",
        label: "Number Input",
        description: "Numeric input with validation",
        properties: {
          label: "Number Input",
          placeholder: "Enter number",
          required: false,
        },
      },
      {
        type: "textarea",
        icon: "📄",
        label: "Text Area",
        description: "Multi-line text input",
        properties: {
          label: "Text Area",
          placeholder: "Enter long text",
          required: false,
        },
      },
      {
        type: "rich_text",
        icon: "✍️",
        label: "Rich Text Editor",
        description: "WYSIWYG text editor",
        properties: {
          label: "Rich Text Editor",
          content: "Initial content",
        },
      },
      {
        type: "patient_id",
        icon: "🆔",
        label: "Patient ID",
        description: "Standardised patient identifier with validation",
        properties: {
          label: "Patient ID",
          placeholder: "e.g. PAT-123456",
          required: true,
          validation: [
            { type: "required", message: "Patient ID is required" },
            {
              type: "pattern",
              pattern: "^PAT-[0-9]{6}$",
              message: "Use format PAT-123456",
            },
          ],
        },
      },
      {
        type: "medical_record_number",
        icon: "📁",
        label: "Medical Record Number",
        description: "Unique MRN capture with format guardrails",
        properties: {
          label: "Medical Record Number",
          placeholder: "e.g. MRN-00000001",
          required: true,
          validation: [
            { type: "required", message: "Medical record number is required" },
            {
              type: "pattern",
              pattern: "^MRN-[0-9]{8}$",
              message: "Use format MRN-00000000",
            },
          ],
        },
      },
      {
        type: "insurance_member_number",
        icon: "💳",
        label: "Insurance Member Number",
        description: "Capture insurance membership identifiers",
        properties: {
          label: "Insurance Member Number",
          placeholder: "e.g. HMO-1234-5678",
          required: false,
          validation: [
            {
              type: "pattern",
              pattern: "^[A-Z]{2,3}-[0-9]{4}-[0-9]{4}$",
              message: "Use format HMO-1234-5678",
            },
          ],
        },
      },
      {
        type: "nhs_number",
        icon: "🏥",
        label: "NHS Number",
        description: "UK NHS compliant patient identifier",
        properties: {
          label: "NHS Number",
          placeholder: "000 000 0000",
          required: false,
          validation: [
            {
              type: "pattern",
              pattern: "^[0-9]{3}\\s?[0-9]{3}\\s?[0-9]{4}$",
              message: "Enter a 10 digit NHS number",
            },
          ],
        },
      },
    ],
  },
  selection_components: {
    icon: "☑️",
    label: "Selection Components",
    components: [
      {
        type: "select",
        icon: "🔽",
        label: "Select Dropdown",
        description: "Single selection dropdown",
        properties: {
          label: "Select Dropdown",
          options: ["Option 1", "Option 2", "Option 3"],
          required: false,
        },
      },
      {
        type: "multi_select",
        icon: "⏬",
        label: "Multi Select",
        description: "Multiple selection dropdown",
        properties: {
          label: "Multi Select",
          options: ["Option 1", "Option 2", "Option 3"],
          required: false,
        },
      },
      {
        type: "checkbox",
        icon: "✅",
        label: "Checkbox",
        description: "Single checkbox input",
        properties: {
          label: "Checkbox",
          required: false,
        },
      },
      {
        type: "radio_group",
        icon: "🔘",
        label: "Radio Group",
        description: "Single selection from multiple options",
        properties: {
          label: "Radio Group",
          options: ["Option 1", "Option 2", "Option 3"],
          required: false,
        },
      },
    ],
  },
  special_components: {
    icon: "⭐",
    label: "Special Components",
    components: [
      {
        type: "date_picker",
        icon: "📅",
        label: "Date Picker",
        description: "Calendar date selection",
        properties: {
          label: "Date Picker",
          required: false,
        },
      },
      {
        type: "file_upload",
        icon: "📤",
        label: "File Upload",
        description: "File selection and upload",
        properties: {
          label: "File Upload",
          required: false,
        },
      },
      {
        type: "signature",
        icon: "✒️",
        label: "Signature Pad",
        description: "Digital signature capture",
        properties: {
          label: "Signature Pad",
          required: false,
        },
      },
    ],
  },

  ui_components: {
    icon: "🎨",
    label: "UI Components",
    components: [
      {
        type: "section_divider",
        icon: "➖",
        label: "Section Divider",
        description: "Visual separator between form sections",
        properties: {},
      },
      {
        type: "button",
        icon: "🔘",
        label: "Button",
        description: "Action button for form interactions",
        properties: {
          label: "Button",
          variant: "primary",
        },
      },
      {
        type: "heading",
        icon: "🇭",
        label: "Heading",
        description: "Section heading or title",
        properties: {
          text: "Heading",
          level: "h2",
        },
      },
      {
        type: "card",
        icon: "📇",
        label: "Card Container",
        description: "Visual card container for grouping",
        properties: {},
      },
    ],
  },
};
