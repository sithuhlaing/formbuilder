# FormBuilder CSS Architecture

A modular, scalable CSS system for the Form Builder application.

## 🏗️ Architecture Overview

### File Structure
```
src/styles/
├── main.css          # Main entry point (imports all modules)
├── variables.css     # CSS custom properties (design tokens)
├── base.css          # Base styles and resets
├── components.css    # Reusable UI components
├── layout.css        # Application layout and structure
├── drag-drop.css     # Drag & drop specific styles
└── README.md         # This documentation
```

## 🎨 Design System

### Colors
- **Primary**: Blue palette (`--color-primary-*`)
- **Gray Scale**: Neutral grays (`--color-gray-*`)
- **Status**: Success, warning, error (`--color-success`, etc.)

### Typography
- **Font Family**: System font stack
- **Sizes**: `--text-xs` to `--text-4xl`
- **Weights**: Normal, medium, semibold, bold

### Spacing
- **Scale**: 4px base unit (`--space-1` = 4px)
- **Range**: `--space-1` (4px) to `--space-16` (64px)

### Shadows & Borders
- **Shadows**: `--shadow-sm` to `--shadow-xl`
- **Radius**: `--radius-sm` to `--radius-xl`

## 🧩 Component Classes

### Buttons
```css
.btn                    /* Base button */
.btn--primary          /* Blue primary button */
.btn--secondary        /* White secondary button */
.btn--danger           /* Red danger button */
.btn--sm, .btn--lg     /* Size variants */
```

### Forms
```css
.input                 /* Text inputs */
.select                /* Select dropdowns */
.textarea              /* Multi-line text */
.checkbox              /* Custom checkbox */
.label                 /* Form labels */
```

### Layout
```css
.app                   /* Main app container */
.header                /* Top header bar */
.sidebar               /* Left sidebar */
.canvas                /* Main canvas area */
.properties            /* Right properties panel */
.main                  /* Main content wrapper */
```

### Drag & Drop
```css
.draggable-item        /* Sidebar draggable components */
.drop-zone             /* Canvas drop zone */
.form-component        /* Components in canvas */
.empty-canvas          /* Empty state */
```

## 🎯 Usage Guidelines

### 1. Component Structure
Use BEM-like naming for component parts:
```css
.component             /* Block */
.component__element    /* Element */
.component--modifier   /* Modifier */
```

### 2. State Classes
```css
.is-selected          /* Selected state */
.is-dragging          /* Dragging state */
.is-over              /* Drop hover state */
```

### 3. Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px
- Flexible grid system

### 4. Accessibility
- Focus states with `outline`
- High contrast colors
- Screen reader support with `.sr-only`

## 🔧 Customization

### Adding New Colors
```css
:root {
  --color-custom-500: #your-color;
  --color-custom-light: #lighter-shade;
}
```

### Adding New Components
1. Define styles in `components.css`
2. Use existing design tokens
3. Follow BEM naming convention
4. Add responsive variants if needed

### Theme Modifications
All design tokens are in `variables.css`. Modify values there to change the entire theme.

## 📱 Responsive Features

- **Desktop**: Full 3-column layout
- **Tablet**: Reduced sidebar/properties width
- **Mobile**: Stacked layout, collapsed sidebars

## 🎨 Special Effects

### Animations
- Fade in: `.animate-fade-in`
- Slide in: `.animate-slide-in-right`
- Component appear: `.is-new` class
- Drag pulse: `.can-drop` class

### Visual Feedback
- Hover states on interactive elements
- Drag & drop visual cues
- Loading states with spinner
- Status indicators with dots

## 🔍 Debugging

### CSS Custom Properties
Use browser dev tools to inspect and modify CSS variables in real-time.

### Component States
Add temporary borders to debug layout:
```css
* { border: 1px solid red; }
```

## 📦 Build Output

The CSS is processed through Vite and:
- CSS imports are resolved
- Vendor prefixes are added
- Production build is minified
- Unused styles are purged

## 🚀 Performance

- **Modular loading**: Only import what you need
- **Cached custom properties**: Variables are computed once
- **Optimized selectors**: Avoid deep nesting
- **Minimal specificity**: Easy to override

---

**Note**: This CSS system is designed to be plug-and-play. You can easily swap out individual modules or modify the design tokens to match your brand.