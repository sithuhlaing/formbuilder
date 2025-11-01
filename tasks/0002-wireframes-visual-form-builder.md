# Visual Form Builder — Wireframes & Screen Flow
## PRD-Aligned Version 1.0

This document contains low-fidelity wireframes (ASCII) and interaction flows for the **Visual Form Builder PRD**.

**Focus**: Core drag-drop building experience with horizontal/vertical layouts, domain support, and template management.

---

## Legend

* `[]` - Inputs / Buttons / Clickable elements
* `()` - Radio buttons / Toggles
* `----` - Separators / Borders
* `<>` - Tags / Badges / Indicators
* `#` - Headings / Section titles
* `{}` - Metadata / Info text
* `⋮⋮` - Drag handle
* `↑↓←→` - Drop position indicators
* `...` - Content continuation
* `█` - Selected/Highlighted state
* `▾` - Expandable/Collapsible section

---

# CORE SCREENS

## 1) Initial Landing / Domain Selection (Route: `/`)

```
+-----------------------------------------------------------------------------------+
|                         # Visual Form Builder                                     |
|                                                                                   |
|                     Create forms, surveys, or workflows                           |
|                           without writing code                                    |
|                                                                                   |
|  +----------------------+  +----------------------+  +----------------------+     |
|  |                      |  |                      |  |                      |     |
|  |      📝 FORMS        |  |      📊 SURVEYS      |  |      🔄 WORKFLOWS    |     |
|  |                      |  |                      |  |                      |     |
|  | General-purpose      |  | Question-focused     |  | Step-based           |     |
|  | form building        |  | data collection      |  | processes            |     |
|  |                      |  |                      |  |                      |     |
|  | All components       |  | Limited components   |  | Action-focused       |     |
|  | Full flexibility     |  | Survey terminology   |  | Workflow terminology |     |
|  |                      |  |                      |  |                      |     |
|  | [Create Form]        |  | [Create Survey]      |  | [Create Workflow]    |     |
|  +----------------------+  +----------------------+  +----------------------+     |
|                                                                                   |
|                    [Browse Templates] [View Documentation]                        |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

**Interaction Flow:**
- User selects domain → Routes to builder with domain context
- "Browse Templates" → Template library with domain filter pre-applied
- Domain selection stored in session: `fb.session.domain`

---

## 2) Main Builder Screen - EMPTY STATE (Route: `/builder?domain=forms`)

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # New Form                                    [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (0) | Redo (0)            |
+-------------------------------------------------------------------------------------------+
| COMPONENT PALETTE (Left)   | CANVAS (Center - Empty State)      | PROPERTIES (Right)     |
| Width: 280px               | Width: Flexible (800-1200px)        | Width: 320px           |
+----------------------------+-------------------------------------+------------------------+
|                            |                                     |                        |
| [Search components... 🔍]  |          🎨 Canvas (Empty)          | # Component Properties |
|                            |                                     |                        |
| # 📝 Input Components ▾    |     Drag components here            | {No component selected}|
|   ⋮⋮ Text Input            |     to start building               |                        |
|   ⋮⋮ Email Input           |                                     | Select a component     |
|   ⋮⋮ Password Input        |          [Get Started]              | from the canvas or     |
|   ⋮⋮ Number Input          |                                     | drag one from the      |
|   ⋮⋮ Textarea              |   OR                                | palette to begin       |
|   ⋮⋮ Rich Text             |                                     | editing properties.    |
|                            |     [Load Template]                 |                        |
| # ☑️ Selection Comp. ▾     |                                     |                        |
|   ⋮⋮ Select Dropdown       |                                     |                        |
|   ⋮⋮ Multi Select          |                                     |                        |
|   ⋮⋮ Checkbox              |                                     |                        |
|   ⋮⋮ Radio Group           |                                     |                        |
|                            |                                     |                        |
| # ⭐ Special Comp. ▾        |                                     |                        |
|   ⋮⋮ Date Picker           |                                     |                        |
|   ⋮⋮ File Upload           |                                     |                        |
|   ⋮⋮ Signature             |                                     |                        |
|                            |                                     |                        |
| # 📐 Layout Comp. ▾        |                                     |                        |
|   ⋮⋮ Horizontal Layout     |                                     |                        |
|   ⋮⋮ Vertical Layout       |                                     |                        |
|                            |                                     |                        |
| # 🎨 UI Components ▾       |                                     |                        |
|   ⋮⋮ Section Divider       |                                     |                        |
|   ⋮⋮ Button                |                                     |                        |
|   ⋮⋮ Heading               |                                     |                        |
|   ⋮⋮ Card                  |                                     |                        |
|                            |                                     |                        |
+----------------------------+-------------------------------------+------------------------+
| Status: Ready to build                                                                    |
+-------------------------------------------------------------------------------------------+
```

**Key Features:**
- 5 categorized component groups (collapsible)
- Drag handles (⋮⋮) visible on hover
- Empty state with clear call-to-action
- Domain indicator at top (affects available components)

---

## 3) Builder - FIRST COMPONENT DROP (State Transition)

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # New Form                                    [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (1) | Redo (0)            |
+-------------------------------------------------------------------------------------------+
| COMPONENT PALETTE          | CANVAS (First Component Added)     | PROPERTIES             |
+----------------------------+-------------------------------------+------------------------+
|                            |                                     |                        |
| [Search components... 🔍]  |  ┌────────────────────────────┐    | # Text Input           |
|                            |  │ ⋮⋮ Text Input         ✎ ⎘ 🗑 │ █  |                        |
| # 📝 Input Components ▾    |  │                                │    | ## Basic             |
|   ⋮⋮ Text Input            |  │ Label: [Text Input____]        │    | Label *              |
|   ⋮⋮ Email Input           |  │                                │    | [Text Input______]   |
|   ⋮⋮ Password Input        |  │ [_____________________]        │    |                      |
|   ⋮⋮ Number Input          |  │                                │    | Field ID *           |
|   ⋮⋮ Textarea              |  │ Help: Enter text               │    | [text_input_1____]   |
|   ⋮⋮ Rich Text             |  └────────────────────────────┘    |                      |
|                            |                                     | Placeholder          |
| # ☑️ Selection Comp. ▾     |                                     | [Enter text here_]   |
|   ⋮⋮ Select Dropdown       |     {Drop Zone Indicators}          |                      |
|   ⋮⋮ Multi Select          |                                     | Help Text            |
|   ⋮⋮ Checkbox              |     ↑ Insert Above                  | [Optional help___]   |
|   ⋮⋮ Radio Group           |     ← Insert Left                   |                      |
|                            |     → Insert Right                  | ## Validation ▾      |
| # ⭐ Special Comp. ▾        |     ↓ Insert Below                  | [ ] Required         |
|   ⋮⋮ Date Picker           |                                     |                      |
|   ⋮⋮ File Upload           |     (Shows when dragging)           | Pattern              |
|   ⋮⋮ Signature             |                                     | [_______________]    |
|                            |                                     |                      |
| # 📐 Layout Comp. ▾        |                                     | Min/Max Length       |
|   ⋮⋮ Horizontal Layout     |                                     | Min: [____] Max: [__]|
|   ⋮⋮ Vertical Layout       |                                     |                      |
|                            |                                     | ## Advanced ▾        |
| # 🎨 UI Components ▾       |                                     | Default Value        |
|   ⋮⋮ Section Divider       |                                     | [_______________]    |
|   ⋮⋮ Button                |                                     |                      |
|   ⋮⋮ Heading               |                                     | Conditional Logic    |
|   ⋮⋮ Card                  |                                     | [+ Add Rule]         |
|                            |                                     |                      |
+----------------------------+-------------------------------------+------------------------+
| Status: 1 component • Last action: Added Text Input                                      |
+-------------------------------------------------------------------------------------------+
```

**Key Changes:**
- Component added to canvas with selection highlight (█)
- Properties panel populated with selected component details
- Quick actions visible on hover (✎ Edit, ⎘ Duplicate, 🗑 Delete)
- Undo count increased to 1
- Drop zone indicators appear when dragging new component

---

## 4) Builder - VERTICAL LAYOUT (Top/Bottom Drops)

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # New Form                                    [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (3) | Redo (0)            |
+-------------------------------------------------------------------------------------------+
| COMPONENT PALETTE          | CANVAS (Vertical Stack)             | PROPERTIES             |
+----------------------------+-------------------------------------+------------------------+
|                            |                                     |                        |
| [Search components... 🔍]  |  ┌────────────────────────────┐    | # Email Input          |
|                            |  │ ⋮⋮ Text Input         ✎ ⎘ 🗑 │    |                        |
| # 📝 Input Components ▾    |  │ Label: Full Name               │    | ## Basic             |
|   ⋮⋮ Text Input            |  │ [_____________________]        │    | Label *              |
|   ⋮⋮ Email Input           |  └────────────────────────────┘    | [Email Address___]   |
|   ⋮⋮ Password Input        |                                     |                      |
|   ⋮⋮ Number Input          |  ┌────────────────────────────┐    | Field ID *           |
|   ⋮⋮ Textarea              |  │ ⋮⋮ Email Input        ✎ ⎘ 🗑 │ █  | [email___________]   |
|   ⋮⋮ Rich Text             |  │ Label: Email Address           │    |                      |
|                            |  │ [_____________________]        │    | ## Validation ▾      |
| # ☑️ Selection Comp. ▾     |  └────────────────────────────┘    | [✓] Required         |
|   ⋮⋮ Select Dropdown       |                                     | [✓] Email Format     |
|   ⋮⋮ Multi Select          |  ┌────────────────────────────┐    |                      |
|   ⋮⋮ Checkbox              |  │ ⋮⋮ Select             ✎ ⎘ 🗑 │    | Error Message        |
|   ⋮⋮ Radio Group           |  │ Label: Country                 │    | [Enter valid email]  |
|                            |  │ [Select... ▾__________]        │    |                      |
| # ⭐ Special Comp. ▾        |  └────────────────────────────┘    |                      |
|   ⋮⋮ Date Picker           |                                     |                      |
|   ⋮⋮ File Upload           |                                     |                      |
|   ⋮⋮ Signature             |     {Dragging Email component}      |                      |
|                            |     Blue line indicators:           |                      |
| # 📐 Layout Comp. ▾        |     ========== ← Insert Above       |                      |
|   ⋮⋮ Horizontal Layout     |     ========== ← Insert Below       |                      |
|   ⋮⋮ Vertical Layout       |                                     |                      |
|                            |                                     |                      |
+----------------------------+-------------------------------------+------------------------+
| Status: 3 components • Column layout (vertical)                                          |
+-------------------------------------------------------------------------------------------+
```

**Key Features:**
- Components stacked vertically (default column layout)
- Drop indicators show as horizontal blue lines (top/bottom positions)
- Each component is independently draggable
- Status bar shows component count and layout type

---

## 5) Builder - HORIZONTAL LAYOUT CREATION (Left/Right Drop)

### 5A) BEFORE - Two Standalone Components

```
+-------------------------------------------------------------------------------------------+
| CANVAS                                                                                    |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌──────────────────────────────────────────────┐                                        |
|  │ ⋮⋮ Text Input (First Name)      ✎ ⎘ 🗑       │                                        |
|  │ [_____________________]                       │                                        |
|  └──────────────────────────────────────────────┘                                        |
|                                                                                           |
|  ┌──────────────────────────────────────────────┐                                        |
|  │ ⋮⋮ Text Input (Last Name)       ✎ ⎘ 🗑       │ ← Dragging to the RIGHT of First Name |
|  │ [_____________________]                       │                                        |
|  └──────────────────────────────────────────────┘                                        |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

### 5B) DURING - Drop Position Detection

```
+-------------------------------------------------------------------------------------------+
| CANVAS - Drop Position Indicators Active                                                  |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌──────────────────────────────────────────────┐                                        |
|  │ ⋮⋮ Text Input (First Name)      ✎ ⎘ 🗑       │                                        |
|  │                                               │                                        |
|  │   [20%]  [60% CENTER]  [20%]                 │ ← Drop zones by mouse position         |
|  │    |         ✗           ║                    │    Left 20% = LEFT                     |
|  │   LEFT    BLOCKED     RIGHT                  │    Right 20% = RIGHT                   |
|  │                              ║                │    Center 60% = BLOCKED                |
|  │ [_____________________]      ║                │                                        |
|  └──────────────────────────────║───────────────┘                                        |
|                                 ║                                                         |
|                                 ║ ← BLUE DROP LINE (Right Side)                           |
|                                 ║                                                         |
|         [LAST NAME - Dragging...] ← Ghost preview                                         |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

### 5C) AFTER - Horizontal Row Container Created

```
+-------------------------------------------------------------------------------------------+
| CANVAS - Horizontal Layout Created                                                        |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌─────────────────────────── ROW LAYOUT (2/4) ──────────────────────────────┐          |
|  │ ⋮⋮ Drag Row                                                    ✎ ⎘ 🗑      │ █        |
|  │                                                                             │          |
|  │  ┌───────────────────────┐  ┌───────────────────────┐                     │          |
|  │  │ ⋮⋮ First Name   ✎ ⎘ 🗑│  │ ⋮⋮ Last Name    ✎ ⎘ 🗑│                     │          |
|  │  │ [______________]      │  │ [______________]      │                     │          |
|  │  └───────────────────────┘  └───────────────────────┘                     │          |
|  │                                                                             │          |
|  │  ← → Drop zones within row: can only position LEFT or RIGHT                │          |
|  └─────────────────────────────────────────────────────────────────────────────┘          |
|                                                                                           |
|     ↑↓ Drop zones outside row: can position ABOVE or BELOW entire row                    |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

**Key Features:**
- Row container created automatically when left/right drop detected
- Row header shows: drag handle, capacity (2/4), actions
- Components within row show individual drag handles but limited to left/right movement
- Row container can be dragged as single unit (all children move together)
- Drop zones clearly differentiated: internal (left/right) vs external (top/bottom)

---

## 6) Builder - COMPLEX MIXED LAYOUT (Rows + Columns)

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # Contact Form                                [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (12) | Redo (0)           |
+-------------------------------------------------------------------------------------------+
| COMPONENT PALETTE          | CANVAS (Mixed Layout)               | PROPERTIES             |
+----------------------------+-------------------------------------+------------------------+
|                            |                                     |                        |
| [Search components... 🔍]  |  ┌────────────────────────────┐    | # Row Layout           |
|                            |  │ ⋮⋮ Heading            ✎ ⎘ 🗑 │    |                        |
| # 📝 Input Components ▾    |  │ # Contact Information          │    | {Container for         |
|   ⋮⋮ Text Input            |  └────────────────────────────┘    |  horizontal layout}    |
|   ⋮⋮ Email Input           |                                     |                        |
|   ⋮⋮ Password Input        |  ┌────── ROW (2/4) ──────────┐    | Capacity: 2/4          |
|   ⋮⋮ Number Input          |  │ ⋮⋮        ✎ ⎘ 🗑            │ █  |                        |
|   ⋮⋮ Textarea              |  │ ┌──────────┐ ┌──────────┐  │    | ## Layout Config       |
|   ⋮⋮ Rich Text             |  │ │First Name│ │Last Name │  │    | Distribution           |
|                            |  │ │[_______] │ │[_______] │  │    | (•) Equal Width        |
| # ☑️ Selection Comp. ▾     |  │ └──────────┘ └──────────┘  │    | ( ) Auto Width         |
|   ⋮⋮ Select Dropdown       |  └───────────────────────────┘    | ( ) Custom             |
|   ⋮⋮ Multi Select          |                                     |                        |
|   ⋮⋮ Checkbox              |  ┌────────────────────────────┐    | Spacing                |
|   ⋮⋮ Radio Group           |  │ ⋮⋮ Email          ✎ ⎘ 🗑    │    | (•) Normal             |
|                            |  │ [_____________________]        │    | ( ) Tight              |
| # ⭐ Special Comp. ▾        |  └────────────────────────────┘    | ( ) Loose              |
|   ⋮⋮ Date Picker           |                                     |                        |
|   ⋮⋮ File Upload           |  ┌────────────────────────────┐    | Alignment              |
|   ⋮⋮ Signature             |  │ ⋮⋮ Phone          ✎ ⎘ 🗑    │    | ( ) Top                |
|                            |  │ [_____________________]        │    | (•) Center             |
| # 📐 Layout Comp. ▾        |  └────────────────────────────┘    | ( ) Bottom             |
|   ⋮⋮ Horizontal Layout     |                                     |                        |
|   ⋮⋮ Vertical Layout       |  ┌────── ROW (3/4) ──────────┐    | ## Children (2)        |
|                            |  │ ⋮⋮        ✎ ⎘ 🗑            │    | - First Name (text)    |
| # 🎨 UI Components ▾       |  │ ┌────┐ ┌────┐ ┌────┐       │    | - Last Name (text)     |
|   ⋮⋮ Section Divider       |  │ │City│ │State│ │Zip │       │    |                        |
|   ⋮⋮ Button                |  │ │[__]│ │[▾__]│ │[__]│       │    | [Dissolve Row]         |
|   ⋮⋮ Heading               |  │ └────┘ └────┘ └────┘       │    | (Moves children to     |
|   ⋮⋮ Card                  |  └───────────────────────────┘    |  column level)         |
|                            |                                     |                        |
|                            |  ┌────────────────────────────┐    |                        |
|                            |  │ ⋮⋮ Textarea       ✎ ⎘ 🗑    │    |                        |
|                            |  │ Message:                       │    |                        |
|                            |  │ [_____________________]        │    |                        |
|                            |  │ [_____________________]        │    |                        |
|                            |  └────────────────────────────┘    |                        |
|                            |                                     |                        |
+----------------------------+-------------------------------------+------------------------+
| Status: 8 components • 2 rows, 5 standalone • All changes saved                          |
+-------------------------------------------------------------------------------------------+
```

**Layout Structure:**
```
Canvas (Column - Always Vertical)
├── Heading (standalone)
├── Row Container (2/4) ← Horizontal
│   ├── First Name
│   └── Last Name
├── Email (standalone)
├── Phone (standalone)
├── Row Container (3/4) ← Horizontal
│   ├── City
│   ├── State
│   └── Zip
└── Textarea (standalone)
```

**Key Features:**
- Mixed vertical (column) and horizontal (row) layouts
- Row capacity indicators (2/4, 3/4)
- Properties panel adapts based on selection (component vs row container)
- Manual "Dissolve Row" action available for row containers
- Status bar shows component count and layout summary

---

## 7) Builder - ROW LAYOUT DRAGGING (Moving Entire Row)

### 7A) BEFORE - Selecting Row to Drag

```
+-------------------------------------------------------------------------------------------+
| CANVAS                                                                                    |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Email           ✎ ⎘ 🗑  │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|                                                                                           |
|  ┌────── ROW (2/4) ──────────┐ ← Hover shows drag handle                                |
|  │ ⋮⋮⋮       ✎ ⎘ 🗑            │    (Row can be dragged as single unit)                  |
|  │ ┌──────────┐ ┌──────────┐  │                                                          |
|  │ │First Name│ │Last Name │  │                                                          |
|  │ └──────────┘ └──────────┘  │                                                          |
|  └───────────────────────────┘                                                          |
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Phone          ✎ ⎘ 🗑   │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

### 7B) DURING - Dragging Row Container

```
+-------------------------------------------------------------------------------------------+
| CANVAS - Row Drag in Progress                                                             |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Email           ✎ ⎘ 🗑  │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|  ========== ← ABOVE (Valid drop - blue line)                                             |
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Phone          ✎ ⎘ 🗑   │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|  ========== ← BELOW (Valid drop - blue line)                                             |
|                                                                                           |
|      [ROW: First Name | Last Name] ← Ghost preview (semi-transparent)                    |
|                                                                                           |
|  ⚠ Note: Cannot drop LEFT/RIGHT - only TOP/BOTTOM (vertical repositioning)               |
|  ⚠ Note: Cannot nest inside another row container                                        |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

### 7C) AFTER - Row Repositioned

```
+-------------------------------------------------------------------------------------------+
| CANVAS - Row Moved to New Position                                                        |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Email           ✎ ⎘ 🗑  │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|                                                                                           |
|  ┌────── ROW (2/4) ──────────┐ ← Row moved above Phone                                  |
|  │ ⋮⋮        ✎ ⎘ 🗑            │                                                          |
|  │ ┌──────────┐ ┌──────────┐  │                                                          |
|  │ │First Name│ │Last Name │  │                                                          |
|  │ └──────────┘ └──────────┘  │                                                          |
|  └───────────────────────────┘                                                          |
|                                                                                           |
|  ┌────────────────────────────┐                                                          |
|  │ ⋮⋮ Phone          ✎ ⎘ 🗑   │                                                          |
|  │ [_____________________]     │                                                          |
|  └────────────────────────────┘                                                          |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

**Key Constraints:**
- Row layouts can ONLY be repositioned vertically (top/bottom drops)
- Cannot drop row layouts left/right of other elements
- Cannot nest row layouts inside other row layouts
- All child components move together as single unit

---

## 8) Builder - AUTO-DISSOLUTION SCENARIOS

### 8A) Delete from 2-Element Row → Auto-Dissolve

**BEFORE:**
```
┌────── ROW (2/4) ──────────┐
│ ⋮⋮        ✎ ⎘ 🗑            │
│ ┌──────────┐ ┌──────────┐  │
│ │First Name│ │Last Name │🗑│ ← Delete Last Name
│ └──────────┘ └──────────┘  │
└───────────────────────────┘
```

**AFTER:** (Row auto-dissolved, First Name promoted to column)
```
┌────────────────────────────┐
│ ⋮⋮ First Name     ✎ ⎘ 🗑   │ ← Now standalone in column
│ [_____________________]     │
└────────────────────────────┘

Alert: "Row container dissolved (≤1 child). Component promoted to column level."
```

### 8B) Drag Out from 2-Element Row → Auto-Dissolve

**BEFORE:**
```
┌────── ROW (2/4) ──────────┐
│ ⋮⋮        ✎ ⎘ 🗑            │
│ ┌──────────┐ ┌──────────┐  │
│ │First Name│ │Last Name │⋮⋮│ ← Drag Last Name out
│ └──────────┘ └──────────┘  │
└───────────────────────────┘
```

**AFTER:** (Row dissolved, both components now standalone)
```
┌────────────────────────────┐
│ ⋮⋮ First Name     ✎ ⎘ 🗑   │
│ [_____________________]     │
└────────────────────────────┘

┌────────────────────────────┐
│ ⋮⋮ Last Name      ✎ ⎘ 🗑   │
│ [_____________________]     │
└────────────────────────────┘

Alert: "Row container dissolved (≤1 child). Components converted to standalone."
```

### 8C) Drag Out from 3-Element Row → Row Preserved

**BEFORE:**
```
┌────── ROW (3/4) ──────────────────┐
│ ⋮⋮        ✎ ⎘ 🗑                    │
│ ┌────┐ ┌────┐ ┌────┐              │
│ │City│ │State│ │Zip │⋮⋮ ← Drag Zip out
│ └────┘ └────┘ └────┘              │
└───────────────────────────────────┘
```

**AFTER:** (Row still valid with 2 components, no dissolution)
```
┌────── ROW (2/4) ──────────┐
│ ⋮⋮        ✎ ⎘ 🗑            │
│ ┌────┐ ┌────┐              │
│ │City│ │State│              │
│ └────┘ └────┘              │
└───────────────────────────┘

┌────────────────────────────┐
│ ⋮⋮ Zip            ✎ ⎘ 🗑   │ ← Moved to column level
│ [_____________________]     │
└────────────────────────────┘

Alert: "Component moved to column. Row preserved with 2 components."
```

**Dissolution Logic:**
```
IF (rowContainer.children.length <= 1) THEN
  - Extract remaining child (if any)
  - Delete row container
  - Promote child(ren) to column level
  - Show alert notification
END IF
```

---

## 9) Builder - ROW CAPACITY LIMIT (Max 4 Components)

```
+-------------------------------------------------------------------------------------------+
| CANVAS - Attempting to Add 5th Component to Row                                          |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌────── ROW (4/4) FULL ────────────────────────────────────────┐                       |
|  │ ⋮⋮        ✎ ⎘ 🗑                                              │                       |
|  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │                       |
|  │ │Field 1 │ │Field 2 │ │Field 3 │ │Field 4 │    🚫           │ ← Blocked drop        |
|  │ └────────┘ └────────┘ └────────┘ └────────┘                 │                       |
|  └───────────────────────────────────────────────────────────────┘                       |
|           [FIELD 5 - Cannot drop here] ← Red indicator                                   |
|                                                                                           |
|  ╔════════════════════════════════════════════════════════════════╗                      |
|  ║ ⚠ ERROR: Row Capacity Exceeded                                ║                      |
|  ║                                                                 ║                      |
|  ║ This row already contains the maximum of 4 components.         ║                      |
|  ║                                                                 ║                      |
|  ║ Options:                                                        ║                      |
|  ║ • Drop above or below this row to add to column layout         ║                      |
|  ║ • Create a new row by dropping left/right of another component ║                      |
|  ║ • Remove a component from this row first                       ║                      |
|  ║                                                                 ║                      |
|  ║                                            [OK, Got It]         ║                      |
|  ╚════════════════════════════════════════════════════════════════╝                      |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

**Validation:**
- Visual feedback: Red "blocked" indicator (🚫) appears on hover
- Cursor changes to "not-allowed" symbol
- Clear error message explains the limit and provides alternatives
- Drop action is prevented programmatically

---

## 10) Builder - MULTI-PAGE FORM INTERFACE

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # Multi-Page Registration Form                [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (8) | Redo (2)            |
+-------------------------------------------------------------------------------------------+
| Pages: [1. Personal Info] [2. Contact] [3. Preferences] [+ Add Page]                     |
|        ─────────────────  (Current: Page 1)                                              |
+-------------------------------------------------------------------------------------------+
| COMPONENT PALETTE          | CANVAS (Page 1: Personal Info)      | PROPERTIES             |
+----------------------------+-------------------------------------+------------------------+
|                            |                                     |                        |
| [Search components... 🔍]  |  Page 1 of 3: Personal Info         | # Page Settings        |
|                            |                                     |                        |
| # 📝 Input Components ▾    |  ┌────────────────────────────┐    | Page Title             |
|   ⋮⋮ Text Input            |  │ ⋮⋮ Heading            ✎ ⎘ 🗑 │    | [Personal Info___]   |
|   ⋮⋮ Email Input           |  │ # Personal Information         │    |                      |
|   ⋮⋮ Password Input        |  └────────────────────────────┘    | Description            |
|   ⋮⋮ Number Input          |                                     | [Provide your basic_]|
|   ⋮⋮ Textarea              |  ┌────── ROW (2/4) ──────────┐    | [information_______]  |
|   ⋮⋮ Rich Text             |  │ ┌──────────┐ ┌──────────┐  │    |                      |
|                            |  │ │First Name│ │Last Name │  │    | ## Page Validation   |
| # ☑️ Selection Comp. ▾     |  │ └──────────┘ └──────────┘  │    | [✓] Validate before  |
|   ⋮⋮ Select Dropdown       |  └───────────────────────────┘    |     next page        |
|   ⋮⋮ Multi Select          |                                     |                      |
|   ⋮⋮ Checkbox              |  ┌────────────────────────────┐    | Required Fields: 3   |
|   ⋮⋮ Radio Group           |  │ ⋮⋮ Email          ✎ ⎘ 🗑    │    | Optional Fields: 1   |
|                            |  │ [_____________________]        │    |                      |
| # ⭐ Special Comp. ▾        |  └────────────────────────────┘    | ## Navigation        |
|   ⋮⋮ Date Picker           |                                     | [✓] Show "Next" btn  |
|   ⋮⋮ File Upload           |  ┌────────────────────────────┐    | [ ] Show "Back" btn  |
|   ⋮⋮ Signature             |  │ ⋮⋮ Date Picker    ✎ ⎘ 🗑    │    | [✓] Show progress    |
|                            |  │ Date of Birth:                 │    |                      |
| # 📐 Layout Comp. ▾        |  │ [__/__/____]                   │    |                      |
|   ⋮⋮ Horizontal Layout     |  └────────────────────────────┘    |                      |
|   ⋮⋮ Vertical Layout       |                                     |                      |
|                            |                                     |                      |
| # 🎨 UI Components ▾       |  [Next: Contact →]                  |                      |
|   ⋮⋮ Section Divider       |                                     |                      |
|   ⋮⋮ Button                |                                     |                      |
|   ⋮⋮ Heading               |                                     |                      |
|   ⋮⋮ Card                  |                                     |                      |
|                            |                                     |                      |
+----------------------------+-------------------------------------+------------------------+
| Status: Page 1 of 3 • 4 components • 3 required fields                                   |
+-------------------------------------------------------------------------------------------+
```

**Page Management Features:**
- Tab navigation at top shows all pages
- Current page highlighted with underline
- "+ Add Page" button to create new pages
- Page-specific properties panel when canvas area is selected
- Automatic "Next" button shown on pages (except last)
- Progress indicator option for multi-page forms
- Page validation settings (validate before allowing next page navigation)

**Page Operations:**
- Drag pages to reorder
- Rename page via properties panel
- Delete page (with confirmation if it contains components)
- Duplicate page with all components

---

## 11) Builder - DOMAIN-SPECIFIC VIEWS

### 11A) FORMS Domain (Default - All Components)

```
+----------------------------+
| COMPONENT PALETTE          |
| Domain: Forms              |
+----------------------------+
| [Search components... 🔍]  |
|                            |
| # 📝 Input Components ▾    |
|   All 6 types shown        |
|                            |
| # ☑️ Selection Comp. ▾     |
|   All 4 types shown        |
|                            |
| # ⭐ Special Comp. ▾        |
|   All 3 types shown        |
|                            |
| # 📐 Layout Comp. ▾        |
|   All 2 types shown        |
|                            |
| # 🎨 UI Components ▾       |
|   All 4 types shown        |
+----------------------------+
| Terminology:               |
| - "Field"                  |
| - "Component"              |
| - "Form"                   |
+----------------------------+
```

### 11B) SURVEYS Domain (Limited Components, Different Terminology)

```
+----------------------------+
| COMPONENT PALETTE          |
| Domain: Surveys            |
+----------------------------+
| [Search questions... 🔍]   |
|                            |
| # 📝 Input Questions ▾     |
|   ⋮⋮ Text Input            |
|   ⋮⋮ Textarea              |
|   ⋮⋮ Rich Text             |
|   (Email, Password, Number |
|    not shown)              |
|                            |
| # ☑️ Choice Questions ▾    |
|   ⋮⋮ Select Dropdown       |
|   ⋮⋮ Radio Group           |
|   ⋮⋮ Checkbox              |
|   (Multi Select hidden)    |
|                            |
| # ⭐ Special Questions ▾   |
|   ⋮⋮ Date Picker           |
|   (File Upload, Signature  |
|    not shown)              |
|                            |
| # 🎨 UI Elements ▾         |
|   ⋮⋮ Section Divider       |
|   ⋮⋮ Heading               |
|   (Button, Card hidden)    |
+----------------------------+
| Terminology:               |
| - "Question"               |
| - "Question Type"          |
| - "Survey"                 |
+----------------------------+
```

### 11C) WORKFLOWS Domain (Action-Focused Components)

```
+----------------------------+
| COMPONENT PALETTE          |
| Domain: Workflows          |
+----------------------------+
| [Search steps... 🔍]       |
|                            |
| # 📝 Input Steps ▾         |
|   ⋮⋮ Text Input            |
|   ⋮⋮ Textarea              |
|   (Others hidden)          |
|                            |
| # ☑️ Selection Steps ▾     |
|   ⋮⋮ Select Dropdown       |
|   ⋮⋮ Checkbox              |
|   (Radio, Multi hidden)    |
|                            |
| # 🎨 UI Elements ▾         |
|   ⋮⋮ Button                |
|   ⋮⋮ Heading               |
|   ⋮⋮ Card                  |
|   (Section Divider hidden) |
+----------------------------+
| Terminology:               |
| - "Step"                   |
| - "Action"                 |
| - "Workflow"               |
+----------------------------+
```

**Domain Adaptation:**
- Component filtering based on domain selection
- Terminology changes throughout UI (labels, tooltips, help text)
- Domain indicator always visible at top of screen
- Can switch domains (with warning about potential component compatibility)

---

## 12) Builder - UNDO/REDO SYSTEM

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # Contact Form                                [Preview] [Save] [Export ▾]    |
| Domain: Forms                                             Undo (12) | Redo (3)           |
|                                                           [↶]        [↷]                  |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| Undo/Redo Controls:                                                                       |
| • Keyboard: Ctrl+Z (Undo), Ctrl+Shift+Z (Redo)                                           |
| • Buttons: ↶ Undo, ↷ Redo                                                                |
| • Count indicators show available actions                                                 |
|                                                                                           |
| ╔════════════════════════════════════════════════════════════════╗                        |
| ║ Action History (Last 50 Actions)                               ║                        |
| ║                                                                 ║                        |
| ║ 12. Added Email component to row                              ↶║ ← Current             |
| ║ 11. Created horizontal layout (First Name, Last Name)         ↶║                        |
| ║ 10. Updated Email validation rules                            ↶║                        |
| ║  9. Deleted Phone component                                   ↶║                        |
| ║  8. Moved Textarea below Email                                ↶║                        |
| ║  7. Added Textarea component                                  ↶║                        |
| ║  6. Updated Text Input label to "Full Name"                   ↶║                        |
| ║  5. Added Phone component                                     ↶║                        |
| ║  4. Added Email component                                     ↶║                        |
| ║  3. Added Select component                                    ↶║                        |
| ║  2. Added Text Input component                                ↶║                        |
| ║  1. Created new form                                          ↶║                        |
| ║                                                                 ║                        |
| ║ ─────────────────────────────────────────────────────────────  ║                        |
| ║ Undone Actions (Can Redo):                                     ║                        |
| ║                                                                 ║                        |
| ║ 13. Deleted Section Divider                                   ↷║ ← Can redo            |
| ║ 14. Added Button component                                    ↷║                        |
| ║ 15. Updated Button label                                      ↷║                        |
| ║                                                                 ║                        |
| ╚════════════════════════════════════════════════════════════════╝                        |
|                                                                                           |
| Notes:                                                                                     |
| • History limited to last 50 actions (FIFO)                                               |
| • Redo stack cleared when new action performed after undo                                |
| • Each action stores complete state snapshot for reliable restoration                     |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

**Action Types Tracked:**
1. Component additions (from palette or duplication)
2. Component deletions
3. Component moves/repositioning
4. Property updates
5. Horizontal layout creation
6. Horizontal layout dissolution
7. Row layout dragging
8. Page operations (add, delete, reorder)
9. Validation rule changes

**Undo/Redo Behavior:**
- **Undo**: Reverts last action, moves it to redo stack
- **Redo**: Reapplies undone action, moves it back to undo stack
- **New Action After Undo**: Clears redo stack (branching prevented)
- **History Limit**: Maintains 50 most recent actions, oldest discarded (FIFO)

---

## 13) Builder - TEMPLATE SAVE FLOW

### 13A) Save Template Button Click

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # Contact Form                                [Preview] [Save] [Export ▾]    |
|                                                                     ↑                     |
|                                                                     Click                 |
+-------------------------------------------------------------------------------------------+
```

### 13B) Save Template Modal

```
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ╔═══════════════════════════ Save as Template ═══════════════════════════════╗          |
|  ║                                                                              ║          |
|  ║  Template Name *                                                             ║          |
|  ║  [Contact Form - Medical Practice____________________________]              ║          |
|  ║                                                                              ║          |
|  ║  Description                                                                 ║          |
|  ║  [Basic contact information form for new patients____________]              ║          |
|  ║  [_____________________________________________________________]             ║          |
|  ║                                                                              ║          |
|  ║  Domain                                                                      ║          |
|  ║  (•) Forms    ( ) Surveys    ( ) Workflows                                  ║          |
|  ║                                                                              ║          |
|  ║  Category (Select all that apply)                                            ║          |
|  ║  [✓] Medical    [ ] General    [✓] Registration    [ ] Documentation        ║          |
|  ║  [ ] Administrative    [ ] Compliance    [+ Add Custom Category]            ║          |
|  ║                                                                              ║          |
|  ║  Tags (comma-separated)                                                      ║          |
|  ║  [medical, contact, patient intake, registration_____________]              ║          |
|  ║                                                                              ║          |
|  ║  Thumbnail                                                                   ║          |
|  ║  (•) Auto-generate screenshot    ( ) Upload custom image                    ║          |
|  ║  [Preview: Canvas screenshot shown here]                                     ║          |
|  ║                                                                              ║          |
|  ║  Estimated Completion Time                                                   ║          |
|  ║  [~5] minutes (auto-calculated based on field count)                        ║          |
|  ║                                                                              ║          |
|  ║  Metadata Summary:                                                           ║          |
|  ║  • Components: 8                                                             ║          |
|  ║  • Required fields: 4                                                        ║          |
|  ║  • Pages: 1                                                                  ║          |
|  ║  • Horizontal layouts: 1                                                     ║          |
|  ║                                                                              ║          |
|  ║                                         [Cancel]  [Save Template]            ║          |
|  ╚══════════════════════════════════════════════════════════════════════════════╝          |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

**Save Validation:**
- Template name is required (shows error if empty)
- Description optional but recommended
- Domain defaults to current builder domain
- Categories are multi-select
- Auto-generated thumbnail captures current canvas state
- Metadata automatically extracted from form structure

### 13C) Save Success Confirmation

```
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ╔═══════════════════════════════════════════════════════════════╗                        |
|  ║  ✓ Template Saved Successfully                                ║                        |
|  ║                                                                 ║                        |
|  ║  "Contact Form - Medical Practice" has been saved to your      ║                        |
|  ║  template library.                                             ║                        |
|  ║                                                                 ║                        |
|  ║  [View in My Templates]  [Continue Editing]  [Create New Form] ║                        |
|  ╚═══════════════════════════════════════════════════════════════╝                        |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

---

## 14) Template Library Browser (Route: `/templates`)

```
+-------------------------------------------------------------------------------------------+
| # Template Library                                        [Create New Form ▾]            |
|                                                           [Create New Survey]             |
|                                                           [Create New Workflow]           |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| [Search templates... 🔍__________________]                                               |
|                                                                                           |
| Filters:  Domain: [All ▾]  Category: [All ▾]  Tags: [All ▾]                             |
|           [✓] My Templates  [ ] Public Templates  [ ] Shared with me                     |
|                                                                                           |
| Sort by:  ( ) Recent  (•) Name  ( ) Most Used  ( ) Component Count                       |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
| Results (24 templates)                                                                    |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐             |
|  │ [Thumbnail Image]   │  │ [Thumbnail Image]   │  │ [Thumbnail Image]   │             |
|  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤             |
|  │ Contact Form        │  │ Patient Intake      │  │ Employee Onboarding │             |
|  │ - Medical Practice  │  │ - Adult             │  │ - New Hire Form     │             |
|  │                     │  │                     │  │                     │             |
|  │ <Medical> <Contact> │  │ <Medical> <Intake>  │  │ <HR> <Onboarding>   │             |
|  │                     │  │                     │  │                     │             |
|  │ {8 components}      │  │ {24 components}     │  │ {18 components}     │             |
|  │ {~5 min}            │  │ {~10 min}           │  │ {~8 min}            │             |
|  │ {Forms}             │  │ {Forms}             │  │ {Workflows}         │             |
|  │                     │  │                     │  │                     │             |
|  │ Modified: 2 days ago│  │ Modified: 1 week ago│  │ Modified: 3 days ago│             |
|  │                     │  │                     │  │                     │             |
|  │ [Preview] [Use]     │  │ [Preview] [Use]     │  │ [Preview] [Use]     │             |
|  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘             |
|                                                                                           |
|  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐             |
|  │ [More templates...] │  │ [More templates...] │  │ [More templates...] │             |
|  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘             |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
| [Load More]                                                                               |
+-------------------------------------------------------------------------------------------+
```

**Library Features:**
- Card-based layout with thumbnail previews
- Multiple filter options (domain, category, tags, ownership)
- Search functionality across template names, descriptions, tags
- Sort options for different user preferences
- Template metadata visible on cards
- Quick actions: Preview, Use
- "My Templates" toggle to show user-created templates

---

## 15) Template Preview Modal (Route: `/templates/:id/preview`)

```
+-------------------------------------------------------------------------------------------+
| [× Close]                      # Template Preview                                         |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  LEFT PANEL (60%)                          | RIGHT PANEL (40%)                            |
|  Scrollable Preview                        | Template Details                             |
|  ─────────────────────────────────────────────────────────────────────────────────────── |
|                                             |                                              |
|  ┌──────────────────────────────────────┐  | # Contact Form - Medical Practice           |
|  │ # Contact Information                │  |                                              |
|  ├──────────────────────────────────────┤  | ## Metadata                                 |
|  │                                      │  | Domain: Forms                                |
|  │ First Name:  [____________]          │  | Categories: Medical, Registration           |
|  │ Last Name:   [____________]          │  | Tags: medical, contact, patient intake      |
|  │                                      │  |                                              |
|  │ Email:       [____________]          │  | ## Statistics                               |
|  │                                      │  | Components: 8                                |
|  │ Phone:       [____________]          │  | Required fields: 4                           |
|  │                                      │  | Pages: 1                                     |
|  │ City:  [___] State: [▾] Zip: [___]  │  | Horizontal layouts: 1                        |
|  │                                      │  | Estimated time: ~5 minutes                   |
|  │ Message:                             │  |                                              |
|  │ [__________________________]         │  | ## Description                              |
|  │ [__________________________]         │  | Basic contact information form for new       |
|  │ [__________________________]         │  | patients. Includes name, contact details,    |
|  │                                      │  | location, and message field.                 |
|  └──────────────────────────────────────┘  |                                              |
|                                             | ## Components List ▾                         |
|  (Preview shows actual layout              | 1. Heading (Contact Information)             |
|   with validation hints, help text,        | 2. Text Input (First Name) - Required        |
|   and proper spacing)                      | 3. Text Input (Last Name) - Required         |
|                                             | 4. Email Input (Email) - Required            |
|                                             | 5. Text Input (Phone)                        |
|                                             | 6. Horizontal Layout (City, State, Zip)      |
|                                             | 7. Textarea (Message)                        |
|                                             |                                              |
|                                             | ## Validation Summary ▾                      |
|                                             | • 4 required fields                          |
|                                             | • 1 email format validation                  |
|                                             | • 2 length validations                       |
|                                             |                                              |
|                                             | ## Actions                                   |
|                                             | [Use This Template]                          |
|                                             | [Duplicate & Edit]                           |
|                                             | [Export JSON]                                |
|                                             |                                              |
|                                             | Created: Oct 28, 2025                        |
|                                             | Modified: Oct 30, 2025                       |
|                                             | Used: 12 times                               |
|                                             |                                              |
+-------------------------------------------------------------------------------------------+
```

**Preview Features:**
- Split view: Interactive preview (left) + Details (right)
- Preview shows rendered form as end-user would see it
- Detailed metadata and statistics
- Expandable sections for component list, validation rules
- Multiple action buttons: Use, Duplicate, Export
- Usage statistics if available

---

## 16) Builder - EXPORT OPTIONS

```
+-------------------------------------------------------------------------------------------+
| [←] Back    # Contact Form                                [Preview] [Save] [Export ▾]    |
|                                                                              ↑            |
|                                                                              Click        |
+-------------------------------------------------------------------------------------------+
```

### Export Dropdown Menu

```
┌─────────────────────────────────┐
│ Export Options                  │
├─────────────────────────────────┤
│ 📄 Export as JSON               │ ← Headless form structure
│ 📋 Export Advanced Schema       │ ← Full configuration with metadata
│ 📝 Export Component List        │ ← CSV of all components
│ 🔗 Generate Public Link (Pro)   │ ← Share view-only link
└─────────────────────────────────┘
```

### 16A) Export JSON Modal

```
+-------------------------------------------------------------------------------------------+
|  ╔══════════════════════════ Export Form as JSON ═══════════════════════════╗            |
|  ║                                                                            ║            |
|  ║  Form: Contact Form - Medical Practice                                    ║            |
|  ║                                                                            ║            |
|  ║  Export Options:                                                           ║            |
|  ║  [✓] Include validation rules                                             ║            |
|  ║  [✓] Include layout configuration                                         ║            |
|  ║  [✓] Include metadata                                                     ║            |
|  ║  [ ] Include component IDs (for updates)                                  ║            |
|  ║  [ ] Minify JSON                                                          ║            |
|  ║                                                                            ║            |
|  ║  Format:                                                                   ║            |
|  ║  (•) Pretty Print    ( ) Compact                                          ║            |
|  ║                                                                            ║            |
|  ║  Preview:                                                                  ║            |
|  ║  ┌────────────────────────────────────────────────────────────────┐       ║            |
|  ║  │ {                                                              │       ║            |
|  ║  │   "formId": "form-abc123",                                     │       ║            |
|  ║  │   "name": "Contact Form - Medical Practice",                   │       ║            |
|  ║  │   "domain": "forms",                                           │       ║            |
|  ║  │   "version": "1.0",                                            │       ║            |
|  ║  │   "pages": [                                                   │       ║            |
|  ║  │     {                                                           │       ║            |
|  ║  │       "pageId": "page-1",                                      │       ║            |
|  ║  │       "components": [                                          │       ║            |
|  ║  │         {                                                       │       ║            |
|  ║  │           "type": "text_input",                                │       ║            |
|  ║  │           "id": "comp-1",                                      │       ║            |
|  ║  │           "fieldId": "first_name",                             │       ║            |
|  ║  │           "label": "First Name",                               │       ║            |
|  ║  │           "required": true,                                    │       ║            |
|  ║  │           ...                                                   │       ║            |
|  ║  │ (Scrollable preview of full JSON)                              │       ║            |
|  ║  └────────────────────────────────────────────────────────────────┘       ║            |
|  ║                                                                            ║            |
|  ║  File size: ~3.2 KB                                                       ║            |
|  ║                                                                            ║            |
|  ║  [Copy to Clipboard]  [Download as File]  [Cancel]                       ║            |
|  ╚════════════════════════════════════════════════════════════════════════════╝            |
+-------------------------------------------------------------------------------------------+
```

**Export Features:**
- Multiple export options (JSON, Advanced Schema, Component List)
- Configurable export settings (include/exclude specific data)
- Live preview of export output
- Copy to clipboard or download as file
- File size estimation
- Format options (pretty print vs compact)

---

## 17) Builder - PREVIEW MODE (Route: `/builder/preview`)

```
+-------------------------------------------------------------------------------------------+
| [← Back to Builder]              # Preview — Contact Form                                 |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| Device Preview:  [Desktop 💻] [Tablet 📱] [Mobile 📱]      [Test Validation]             |
|                  ──────────                                                              |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|                        ┌──────────────────────────────┐                                  |
|                        │ # Contact Information        │                                  |
|                        │                              │                                  |
|                        │ First Name *                 │                                  |
|                        │ [_____________________]      │                                  |
|                        │                              │                                  |
|                        │ Last Name *                  │                                  |
|                        │ [_____________________]      │                                  |
|                        │                              │                                  |
|                        │ Email Address *              │                                  |
|                        │ [_____________________]      │                                  |
|                        │ ⓘ Enter a valid email        │                                  |
|                        │                              │                                  |
|                        │ Phone Number                 │                                  |
|                        │ [_____________________]      │                                  |
|                        │                              │                                  |
|                        │ City    State  Zip Code      │                                  |
|                        │ [____]  [▾__]  [_____]       │                                  |
|                        │                              │                                  |
|                        │ Message                      │                                  |
|                        │ [_____________________]      │                                  |
|                        │ [_____________________]      │                                  |
|                        │ [_____________________]      │                                  |
|                        │                              │                                  |
|                        │        [Submit Form]         │                                  |
|                        └──────────────────────────────┘                                  |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
| Preview Features:                                                                         |
| • Interactive form (can fill out and test)                                               |
| • Real-time validation feedback                                                          |
| • Responsive design preview (switch between devices)                                     |
| • Test validation button triggers all validation rules                                   |
| • Shows help text, error messages, required indicators                                   |
| • Matches end-user experience exactly                                                    |
+-------------------------------------------------------------------------------------------+
```

**Preview Mode Features:**
- Fully interactive preview
- Device size switching (desktop, tablet, mobile)
- Real-time validation testing
- Shows form as end-users would see it
- "Test Validation" button simulates form submission without saving
- All help text, placeholders, and error messages visible

---

# INTERACTION FLOWS

## Flow 1: Create New Form from Scratch

```
┌─────────────┐
│   Landing   │
│   Screen    │
│             │
│  Select:    │
│  • Forms    │
│  • Surveys  │
│  • Workflows│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Builder   │
│ Empty State │
│             │
│  [Get       │
│   Started]  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Drag      │
│  Components │
│   from      │
│   Palette   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Arrange   │
│  Vertical   │
│     or      │
│ Horizontal  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Configure  │
│ Properties  │
│ Validation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Preview   │
│    Test     │
│  Validate   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Save     │
│     as      │
│  Template   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Export    │
│    JSON     │
└─────────────┘
```

## Flow 2: Use Existing Template

```
┌─────────────┐
│  Template   │
│   Library   │
│             │
│  Browse     │
│  Filter     │
│  Search     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Template   │
│   Preview   │
│             │
│  View       │
│  Details    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Use This   │
│  Template   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Builder   │
│   (Pre-     │
│  populated) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Modify    │
│  Components │
│   Layout    │
│ Properties  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Save as    │
│   Custom    │
│  Template   │
│    (opt)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Export    │
└─────────────┘
```

## Flow 3: Horizontal Layout Creation

```
┌─────────────┐
│   Canvas    │
│    with     │
│  Component  │
│      A      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Drag     │
│  Component  │
│      B      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Drop LEFT or │
│ RIGHT of A  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   System    │
│   Creates   │
│Row Container│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Row Contains │
│   A and B   │
│  (2/4 cap)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Can add   │
│   2 more    │
│ components  │
│  (max 4)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Row at 1 or 0│
│ components  │
│   = Auto-   │
│  Dissolve   │
└─────────────┘
```

## Flow 4: Component Property Editing

```
┌─────────────┐
│   Select    │
│  Component  │
│  on Canvas  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Properties  │
│   Panel     │
│  Updates    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Edit:    │
│  • Label    │
│  • Field ID │
│  • Required │
│  • Validate │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Changes   │
│   Applied   │
│  Real-time  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Action    │
│   Added to  │
│   History   │
│  (for undo) │
└─────────────┘
```

## Flow 5: Undo/Redo Operation

```
┌─────────────┐
│    User     │
│   Performs  │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Action    │
│   Added to  │
│   History   │
│  (Stack 50) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   User      │
│   Clicks    │
│    Undo     │
│   (Ctrl+Z)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Revert    │
│    Last     │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Move      │
│  Action to  │
│Redo Stack   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   User      │
│   Clicks    │
│    Redo     │
│ (Ctrl+Sh+Z) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reapply    │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│New Action = │
│Clear Redo   │
│   Stack     │
└─────────────┘
```

---

# STATE DIAGRAMS

## Canvas State Machine

```
┌──────────────┐
│              │
│    EMPTY     │ ◄─────────────────────┐
│              │                       │
└──────┬───────┘                       │
       │                               │
       │ Add first component           │ Clear all
       │                               │
       ▼                               │
┌──────────────┐                       │
│              │                       │
│ ONE ELEMENT  │                       │
│  (Column)    │                       │
│              │                       │
└──────┬───────┘                       │
       │                               │
       │ Add component                 │
       │                               │
       ├─────┬─────┐                   │
       │     │     │                   │
  Drop │     │     │ Drop              │
  Top/ │     │     │ Left/             │
 Bottom│     │     │ Right             │
       │     │     │                   │
       ▼     │     ▼                   │
┌───────┐    │  ┌──────────┐           │
│       │    │  │          │           │
│  TWO  │    │  │   ROW    │           │
│ELEMENT│    │  │ CREATED  │           │
│COLUMN │    │  │  (2/4)   │           │
│       │    │  │          │           │
└───┬───┘    │  └────┬─────┘           │
    │        │       │                 │
    │        │       │ Add to row      │
    │   Keep │       │ or column       │
    │  adding│       │                 │
    │        │       ▼                 │
    │        │  ┌──────────┐           │
    │        │  │          │           │
    │        │  │  MIXED   │           │
    │        │  │  LAYOUT  │           │
    │        │  │ (Rows +  │           │
    │        │  │ Columns) │           │
    │        │  │          │           │
    │        │  └────┬─────┘           │
    │        │       │                 │
    └────────┴───────┴─────────────────┘
             Continue building
```

## Component Selection State

```
┌──────────────┐
│              │
│ NO SELECTION │ ◄───────────────┐
│              │                 │
└──────┬───────┘                 │
       │                         │
       │ Click component         │ Deselect
       │                         │ (click canvas)
       ▼                         │
┌──────────────┐                 │
│              │                 │
│  COMPONENT   │─────────────────┘
│  SELECTED    │
│              │
└──────┬───────┘
       │
       │ Properties shown
       │ Actions available
       │
       ▼
┌──────────────┐
│              │
│   EDITING    │
│  PROPERTIES  │
│              │
└──────────────┘
```

## Drag-Drop State Machine

```
┌──────────────┐
│              │
│     IDLE     │
│              │
└──────┬───────┘
       │
       │ Mouse down on component
       │
       ▼
┌──────────────┐
│              │
│   DRAGGING   │
│              │
└──────┬───────┘
       │
       │ Mouse move
       │
       ▼
┌──────────────┐
│              │
│   OVER       │ ◄─────────┐
│   TARGET     │           │
│              │           │
└──────┬───────┘           │
       │                   │
       │ Calculate         │ Move to
       │ drop position     │ different
       │                   │ target
       ▼                   │
┌──────────────┐           │
│              │           │
│   SHOW       │───────────┘
│  DROP ZONE   │
│  INDICATOR   │
│              │
└──────┬───────┘
       │
       │ Mouse up
       │
       ├────────┬──────────┐
       │        │          │
  Valid │   Invalid│   Cancel│
   drop │     drop │    (Esc)│
       │        │          │
       ▼        ▼          ▼
┌──────────┐ ┌────────┐ ┌─────┐
│          │ │        │ │     │
│ INSERT   │ │ ERROR  │ │IDLE │
│COMPONENT │ │MESSAGE │ │     │
│          │ │        │ │     │
└──────────┘ └────────┘ └─────┘
```

---

# ERROR STATES & VALIDATION

## Error Scenario 1: Row Capacity Exceeded

```
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ╔════════════════════════════════════════════════════════════════╗                      |
|  ║ ⚠ ERROR: Cannot Add Component                                 ║                      |
|  ║                                                                 ║                      |
|  ║ This row already contains the maximum of 4 components.         ║                      |
|  ║                                                                 ║                      |
|  ║ To add this component:                                          ║                      |
|  ║ • Drop it above or below this row                              ║                      |
|  ║ • Create a new row by dropping it beside another component     ║                      |
|  ║ • Remove a component from this row first                       ║                      |
|  ║                                                                 ║                      |
|  ║                                            [OK]                 ║                      |
|  ╚════════════════════════════════════════════════════════════════╝                      |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

## Error Scenario 2: Invalid Component Type in Survey Domain

```
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ╔════════════════════════════════════════════════════════════════╗                      |
|  ║ ⚠ Component Not Available                                     ║                      |
|  ║                                                                 ║                      |
|  ║ "Password Input" is not available in Survey domain.            ║                      |
|  ║                                                                 ║                      |
|  ║ Survey domain is limited to question-focused components.       ║                      |
|  ║                                                                 ║                      |
|  ║ Available alternatives:                                         ║                      |
|  ║ • Text Input                                                    ║                      |
|  ║ • Textarea                                                      ║                      |
|  ║ • Select Dropdown                                               ║                      |
|  ║                                                                 ║                      |
|  ║ Or switch to "Forms" domain for full component access.        ║                      |
|  ║                                                                 ║                      |
|  ║                    [Switch to Forms]  [Cancel]                 ║                      |
|  ╚════════════════════════════════════════════════════════════════╝                      |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

## Error Scenario 3: Template Save Without Required Fields

```
+-------------------------------------------------------------------------------------------+
|                                                                                           |
|  ╔════════════════════════════════════════════════════════════════╗                      |
|  ║ ⚠ Cannot Save Template                                         ║                      |
|  ║                                                                 ║                      |
|  ║ Please fix the following issues:                                ║                      |
|  ║                                                                 ║                      |
|  ║ ✗ Template name is required                                    ║                      |
|  ║ ✗ At least one category must be selected                       ║                      |
|  ║                                                                 ║                      |
|  ║                                            [OK]                 ║                      |
|  ╚════════════════════════════════════════════════════════════════╝                      |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

## Validation Summary Panel

```
+----------------------------+
| PROPERTIES (Right Panel)   |
+----------------------------+
| # Validation Status        |
|                            |
| ✓ All components valid     |
|                            |
| OR                         |
|                            |
| ⚠ 3 Issues Found           |
|                            |
| 1. Email: Invalid format   |
|    Line 12, Component ID:  |
|    email_input_1           |
|    [Fix Now]               |
|                            |
| 2. Row Layout: Over cap    |
|    Line 24, Row contains   |
|    5 components (max 4)    |
|    [Fix Now]               |
|                            |
| 3. Text Input: Missing     |
|    required field ID       |
|    Line 8, Component must  |
|    have unique field ID    |
|    [Fix Now]               |
|                            |
| [Validate All]             |
+----------------------------+
```

---

# KEYBOARD SHORTCUTS

```
+-------------------------------------------------------------------------------------------+
| # Keyboard Shortcuts                                                                      |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| ## General                                                                                |
| Ctrl + Z          Undo last action                                                        |
| Ctrl + Shift + Z  Redo last action                                                        |
| Ctrl + S          Save template                                                           |
| Ctrl + P          Preview form                                                            |
| Ctrl + E          Export JSON                                                             |
| Esc               Deselect component / Close modal                                        |
|                                                                                           |
| ## Component Manipulation                                                                 |
| Delete            Delete selected component                                               |
| Ctrl + D          Duplicate selected component                                            |
| Ctrl + C          Copy selected component                                                 |
| Ctrl + V          Paste component                                                         |
| Arrow Keys        Move selected component (column rearrangement)                          |
| Tab               Select next component                                                   |
| Shift + Tab       Select previous component                                               |
|                                                                                           |
| ## Builder Navigation                                                                     |
| Ctrl + F          Focus search (component palette)                                        |
| Ctrl + /          Show keyboard shortcuts                                                 |
| Alt + 1-5         Jump to component category (1=Input, 2=Selection, etc.)               |
|                                                                                           |
| ## Accessibility                                                                          |
| Space             Activate drag on focused component (keyboard drag)                      |
| Arrow Keys        Move component during keyboard drag                                     |
| Enter             Drop component at current position                                      |
| Esc               Cancel drag operation                                                   |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

---

# ROUTE SUMMARY

```
/                                  Landing / Domain Selection
/builder                           Main builder (empty or with template)
/builder?domain=forms              Builder with Forms domain
/builder?domain=surveys            Builder with Surveys domain
/builder?domain=workflows          Builder with Workflows domain
/builder?templateId=abc123         Builder with loaded template
/builder/preview                   Preview mode (interactive form test)
/templates                         Template library browser
/templates?domain=surveys          Template library filtered by domain
/templates/:id/preview             Template preview modal
/templates/my                      User's saved templates
```

---

# TECHNICAL IMPLEMENTATION NOTES

## LocalStorage Keys

```javascript
// Session data
'fb.session.domain'              // Current domain (forms/surveys/workflows)
'fb.session.current'             // Current form state (auto-save)
'fb.session.history'             // Undo/redo history (50 actions)

// User preferences
'fb.prefs.lastDomain'            // Last selected domain
'fb.prefs.paletteCollapsed'      // Component palette collapse state
'fb.prefs.showShortcuts'         // Show keyboard shortcuts overlay

// Templates
'fb.templates.library'           // User's saved templates
'fb.templates.recent'            // Recently used templates (5 max)
'fb.templates.lastFilters'       // Last applied library filters
```

## Component State Interface

```typescript
interface FormState {
  domain: 'forms' | 'surveys' | 'workflows';
  pages: Page[];
  currentPageIndex: number;
  selectedComponentId: string | null;
  history: Action[];
  historyIndex: number;
  metadata: FormMetadata;
}

interface Page {
  pageId: string;
  title: string;
  components: FormComponentData[];
}

interface FormComponentData {
  type: ComponentType;
  id: string;
  fieldId: string;
  label: string;
  required: boolean;
  validation: ValidationRules;
  properties: Record<string, any>;
  children?: FormComponentData[]; // For horizontal layouts
}

interface HorizontalLayoutComponent extends FormComponentData {
  type: 'horizontal_layout';
  children: FormComponentData[]; // 2-4 components
  layoutConfig: {
    distribution: 'equal' | 'auto' | 'custom';
    spacing: 'tight' | 'normal' | 'loose';
    alignment: 'top' | 'center' | 'bottom';
  };
}
```

## Drop Position Calculation

```typescript
function calculateDropPosition(
  mouseX: number,
  mouseY: number,
  targetElement: HTMLElement
): DropPosition {
  const rect = targetElement.getBoundingClientRect();
  const xPercent = (mouseX - rect.left) / rect.width;
  const yPercent = (mouseY - rect.top) / rect.height;
  
  // Horizontal layout detection (left/right 20% edges)
  if (xPercent < 0.2) return 'left';
  if (xPercent > 0.8) return 'right';
  
  // Vertical positioning (top/bottom 30% edges)
  if (yPercent < 0.3) return 'before';
  if (yPercent > 0.7) return 'after';
  
  // Center area (blocked for external drops into rows)
  return 'center';
}
```

## Auto-Dissolution Logic

```typescript
function checkAndDissolveRowContainer(rowId: string) {
  const row = findComponentById(rowId);
  
  if (row.type === 'horizontal_layout' && row.children.length <= 1) {
    // Extract remaining children
    const children = [...row.children];
    
    // Remove row container from parent
    const parent = findParentOfComponent(rowId);
    const rowIndex = parent.components.indexOf(row);
    parent.components.splice(rowIndex, 1);
    
    // Insert children at row's former position
    parent.components.splice(rowIndex, 0, ...children);
    
    // Show notification
    showNotification(
      'Row container dissolved (≤1 child). ' +
      'Components promoted to column level.',
      'info'
    );
    
    // Add to history
    addActionToHistory({
      type: 'DISSOLVE_HORIZONTAL_LAYOUT',
      rowId,
      formerChildren: children
    });
  }
}
```

---

# PERFORMANCE TARGETS

```
+-------------------------------------------------------------------------------------------+
| Metric                          | Target             | Measurement Method                |
|---------------------------------|--------------------|-----------------------------------|
| Initial page load               | < 2 seconds        | Time to interactive (TTI)         |
| Template load                   | < 1 second         | From click to canvas populated    |
| Component drag response         | < 100ms            | Time from drag to visual feedback |
| Properties panel update         | < 50ms             | Time from edit to canvas update   |
| Undo/Redo operation             | < 100ms            | Time to revert/reapply state      |
| Preview mode load               | < 1.5 seconds      | From click to interactive preview |
| Export JSON generation          | < 500ms            | Time to generate and display JSON |
| Template save                   | < 1 second         | From save click to confirmation   |
| Large form (100 components)     | < 3 seconds load   | Canvas rendering time             |
| Massive form (1000 components)  | < 5 seconds load   | With virtualization               |
+-------------------------------------------------------------------------------------------+
```

---

# ACCESSIBILITY CHECKLIST

- [✓] All interactive elements keyboard accessible
- [✓] Drag-drop operations have keyboard alternatives (Space + Arrow keys)
- [✓] ARIA labels on all form controls
- [✓] Focus indicators visible and clear
- [✓] Color contrast meets WCAG AA standards (4.5:1 text, 3:1 UI)
- [✓] Screen reader announcements for:
  - Component additions/deletions
  - Drag-drop operations
  - Validation errors
  - Row container creation/dissolution
- [✓] Skip links for main content areas
- [✓] No keyboard traps
- [✓] Logical tab order
- [✓] Error messages associated with form controls (aria-describedby)
- [✓] Modal dialogs properly trapped and escapable
- [✓] Status messages announced (aria-live regions)

---

**END OF WIREFRAMES & SCREEN FLOW DOCUMENT**

*Version: 1.0*  
*Last Updated: October 31, 2025*  
*Status: Ready for Development*