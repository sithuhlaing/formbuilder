# Form Builder Layout Schema Guide

## Overview

The Form Builder now supports an advanced JSON schema format that defines the complete layout structure, including positioning, styling, and component relationships. This schema enables precise control over form layouts with row/column arrangements.

## Key Features Implemented

### 1. Advanced Drag & Drop with Positioning
- **Left/Right Drop Detection**: Components can be dropped to the left or right of existing components
- **Visual Drop Indicators**: Blue lines show exactly where components will be placed
- **Component Rearrangement**: Existing components can be dragged to reorder them
- **Grab Handles**: Dotted handles (⋮⋮) appear on hover for easy dragging

### 2. Functional Rich Text Editor
- **Toolbar Controls**: Bold, Italic, Underline, Lists, Headings
- **Keyboard Shortcuts**: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline)  
- **Live Preview**: Real-time formatting as you type
- **HTML Output**: Generates clean HTML for form submissions

### 3. Row/Column Layout Containers
- **Horizontal Layouts**: Components arranged side-by-side with equal widths
- **Vertical Layouts**: Components stacked vertically
- **Nested Containers**: Layouts can contain other layouts for complex structures
- **Visual Indicators**: Clear labels and drop zones for each container type

### 4. Comprehensive JSON Schema Format

The new layout schema includes:

#### Metadata
```json
{
  "metadata": {
    "id": "form-001",
    "name": "User Registration Form",
    "templateType": "registration",
    "created": "2024-01-01T00:00:00Z",
    "modified": "2024-01-02T12:00:00Z",
    "version": "1.0.0"
  }
}
```

#### Layout Structure
```json
{
  "layout": {
    "type": "container",
    "id": "header-section",
    "properties": {
      "direction": "horizontal",
      "distribution": "equal",
      "gap": "16px",
      "alignment": {
        "horizontal": "stretch",
        "vertical": "center"
      }
    },
    "children": [...]
  }
}
```

#### Component Properties
```json
{
  "type": "component",
  "id": "rich-text-bio",
  "properties": {
    "componentType": "rich_text",
    "label": "Biography",
    "fieldId": "biography",
    "required": false,
    "richTextConfig": {
      "toolbar": {
        "bold": true,
        "italic": true,
        "underline": true,
        "lists": true,
        "headings": true
      },
      "height": "200px",
      "maxLength": 1000
    }
  }
}
```

#### Validation Schema
```json
{
  "validation": {
    "jsonSchema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "minLength": 2,
          "maxLength": 50
        },
        "biography": {
          "type": "string",
          "maxLength": 1000
        }
      },
      "required": ["firstName"]
    }
  }
}
```

#### Styling Configuration
```json
{
  "styling": {
    "theme": "light",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#6b7280",
      "success": "#10b981",
      "error": "#ef4444"
    },
    "typography": {
      "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "fontSize": {
        "base": "1rem",
        "lg": "1.125rem"
      }
    }
  }
}
```

## Usage

### Export Options

The form builder now provides two export formats:

1. **Export JSON**: Traditional format for backward compatibility
2. **Export Schema**: Advanced layout schema with complete positioning and styling information

### Creating Layouts

1. **Start with Containers**: Use the "Add Row Layout" and "Add Column Layout" buttons
2. **Drag Components**: Drag form fields from the sidebar into containers
3. **Arrange Components**: Use the grab handles (⋮⋮) to reorder components
4. **Position Precisely**: Drop components to the left/right of existing components for exact placement

### Rich Text Configuration

Rich text components support:
- **Formatting**: Bold, italic, underline
- **Lists**: Bullet points and numbered lists  
- **Structure**: Headings and paragraphs
- **Validation**: Character limits and required fields

### Component Properties

Each component in the schema includes:
- **Basic Properties**: type, id, label, fieldId
- **Layout Properties**: size, margin, padding, alignment
- **Validation Rules**: required, min/max, patterns
- **Component-specific Config**: rich text toolbar, file upload settings, etc.

## Benefits

1. **Precise Control**: Exact positioning of form elements
2. **Responsive Design**: Containers adapt to different screen sizes
3. **Reusable Schemas**: Export and import complete form structures
4. **Validation Integration**: JSON Schema validation built-in
5. **Styling Consistency**: Centralized theme and styling configuration

This schema format enables the form builder to create professional, complex forms with precise layout control while maintaining clean, semantic structure.