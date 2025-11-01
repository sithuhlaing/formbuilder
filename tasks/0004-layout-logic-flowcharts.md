# Visual Form Builder - Layout Logic Flowcharts

## Document Purpose

This document contains **Mermaid flowcharts** that visually explain all the layout logic from `0003-layout-logic-implementation.md`. Use these diagrams to understand the complete drag-drop system.

**How to view:** Copy the Mermaid code blocks into:
- Mermaid Live Editor: https://mermaid.live
- GitHub (renders automatically)
- VS Code with Mermaid extension
- Any Markdown viewer with Mermaid support

---

## Table of Contents

1. [Master Drag-Drop Flow](#1-master-drag-drop-flow)
2. [Drop Position Detection](#2-drop-position-detection)
3. [Drag Source Detection](#3-drag-source-detection)
4. [Horizontal Layout Creation](#4-horizontal-layout-creation)
5. [Auto-Dissolution Logic](#5-auto-dissolution-logic)
6. [Row Layout Dragging](#6-row-layout-dragging)
7. [Element Count Transitions](#7-element-count-transitions)
8. [Validation System](#8-validation-system)
9. [Complex Mixed Layout Flow](#9-complex-mixed-layout-flow)
10. [Edge Case Handling](#10-edge-case-handling)

---

## 1. Master Drag-Drop Flow

### Complete End-to-End Process

```mermaid
graph TD
    Start([User Starts Dragging]) --> DetectSource{Drag Source?}
    
    DetectSource -->|Palette| NewItem[Create NEW Component]
    DetectSource -->|Canvas| ExistingItem[Move EXISTING Component]
    
    NewItem --> DragOver[Mouse Over Target Element]
    ExistingItem --> DragOver
    
    DragOver --> CalcPosition[Calculate Drop Position<br/>20% edges, 30% top/bottom]
    
    CalcPosition --> ValidatePos{Valid Position?}
    
    ValidatePos -->|No| ShowBlocked[Show Red Blocked Indicator]
    ShowBlocked --> DragOver
    
    ValidatePos -->|Yes| ShowIndicator[Show Blue Drop Line]
    ShowIndicator --> WaitDrop{User Action?}
    
    WaitDrop -->|Release Mouse| ProcessDrop[Process Drop]
    WaitDrop -->|Press ESC| Cancel[Cancel Drag]
    WaitDrop -->|Move Mouse| DragOver
    
    Cancel --> End([End - No Changes])
    
    ProcessDrop --> DetermineAction{Drop Position Type?}
    
    DetermineAction -->|TOP/BOTTOM| ColumnInsert[Insert in Column Layout]
    DetermineAction -->|LEFT/RIGHT| HorizAction{Target in Row?}
    
    HorizAction -->|No| CreateRow[Create New Horizontal Layout]
    HorizAction -->|Yes| AddToRow[Add to Existing Row]
    
    CreateRow --> CheckSource{Source Type?}
    AddToRow --> CheckSource
    ColumnInsert --> CheckSource
    
    CheckSource -->|Existing Item| RemoveOld[Remove from Old Position]
    CheckSource -->|New Item| SkipRemove[Skip - New Component]
    
    RemoveOld --> CheckDissolution{Old Position in Row?}
    SkipRemove --> UpdateState[Update Form State]
    
    CheckDissolution -->|Yes| CheckCount{Remaining in Row ≤1?}
    CheckDissolution -->|No| UpdateState
    
    CheckCount -->|Yes| AutoDissolve[Auto-Dissolve Row Container]
    CheckCount -->|No| UpdateState
    
    AutoDissolve --> UpdateState
    UpdateState --> AddHistory[Add to Undo History]
    AddHistory --> ReRender[Re-render Canvas]
    ReRender --> ShowSuccess[Show Success Notification]
    ShowSuccess --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style ShowError fill:#ffcccc
    style ShowBlocked fill:#ffcccc
    style AutoDissolve fill:#fff4cc
    style CreateRow fill:#cce5ff
    style AddToRow fill:#cce5ff
```

---

## 2. Drop Position Detection

### Position Calculation Algorithm

```mermaid
graph TD
    Start([Calculate Drop Position]) --> GetMouse[Get Mouse X, Y]
    GetMouse --> GetRect[Get Target Element Bounds]
    GetRect --> CalcPercent[Calculate Percentages<br/>xPercent = mouseX - left / width<br/>yPercent = mouseY - top / height]
    
    CalcPercent --> ValidBounds{0 ≤ x,y ≤ 1?}
    ValidBounds -->|No| ReturnNull[Return NULL<br/>Mouse Outside Element]
    ValidBounds -->|Yes| CheckHoriz[Check Horizontal Zones]
    
    CheckHoriz --> LeftEdge{xPercent < 0.2?}
    LeftEdge -->|Yes| ReturnLeft([Return: LEFT<br/>Create/Expand Row])
    LeftEdge -->|No| RightEdge{xPercent > 0.8?}
    
    RightEdge -->|Yes| ReturnRight([Return: RIGHT<br/>Create/Expand Row])
    RightEdge -->|No| CheckVert[Check Vertical Zones]
    
    CheckVert --> TopEdge{yPercent < 0.3?}
    TopEdge -->|Yes| ReturnBefore([Return: BEFORE<br/>Insert Above])
    TopEdge -->|No| BottomEdge{yPercent > 0.7?}
    
    BottomEdge -->|Yes| ReturnAfter([Return: AFTER<br/>Insert Below])
    BottomEdge -->|No| CheckTarget{Target Type?}
    
    CheckTarget -->|Row Layout| CenterBlocked([Return: NULL<br/>Center Blocked])
    CheckTarget -->|Regular Component| ReturnAfter2([Return: AFTER<br/>Default Insert])
    
    ReturnNull --> End([End])
    ReturnLeft --> End
    ReturnRight --> End
    ReturnBefore --> End
    ReturnAfter --> End
    ReturnAfter2 --> End
    CenterBlocked --> End

    style ReturnLeft fill:#cce5ff
    style ReturnRight fill:#cce5ff
    style ReturnBefore fill:#d4f1d4
    style ReturnAfter fill:#d4f1d4
    style CenterBlocked fill:#ffcccc
    style ReturnNull fill:#ffcccc
```

### Visual Zone Map

```mermaid
graph LR
    subgraph Element ["Target Element (100% width x 100% height)"]
        subgraph Top ["TOP ZONE (0-30%)"]
            T[BEFORE Position]
        end
        
        subgraph Middle ["MIDDLE ZONE (30-70%)"]
            subgraph Left ["LEFT (0-20%)"]
                L[LEFT Position]
            end
            subgraph Center ["CENTER (20-80%)"]
                C[Blocked/AFTER]
            end
            subgraph Right ["RIGHT (80-100%)"]
                R[RIGHT Position]
            end
        end
        
        subgraph Bottom ["BOTTOM ZONE (70-100%)"]
            B[AFTER Position]
        end
    end

    style T fill:#d4f1d4
    style B fill:#d4f1d4
    style L fill:#cce5ff
    style R fill:#cce5ff
    style C fill:#ffe6e6
```

---

## 3. Drag Source Detection

### Palette vs Canvas Logic

```mermaid
graph TD
    Start([Drag Started]) --> GetSource{Where did drag<br/>originate?}
    
    GetSource -->|Component Palette| Palette[Source: PALETTE]
    GetSource -->|Canvas| Canvas[Source: CANVAS]
    
    Palette --> CreateNew[Set dragType:<br/>'new-item']
    Canvas --> MoveExist[Set dragType:<br/>'existing-item']
    
    CreateNew --> PaletteData[Store:<br/>• componentType<br/>• No sourceId<br/>• item = null]
    MoveExist --> CanvasData[Store:<br/>• componentType<br/>• sourceId = component.id<br/>• item = full component]
    
    PaletteData --> PaletteAction{On Drop?}
    CanvasData --> CanvasAction{On Drop?}
    
    PaletteAction --> CreateAction[CREATE new component<br/>from ComponentEngine]
    CanvasAction --> MoveAction[MOVE existing component<br/>Remove from old position]
    
    CreateAction --> PaletteResult[Result:<br/>• New component added<br/>• Palette unchanged<br/>• Can create infinite]
    
    MoveAction --> CanvasResult[Result:<br/>• Same component moved<br/>• Removed from old spot<br/>• No duplication]
    
    PaletteResult --> End([End])
    CanvasResult --> End

    style Palette fill:#e1f5e1
    style Canvas fill:#fff4cc
    style CreateAction fill:#cce5ff
    style MoveAction fill:#ffebcc
```

### Comparison Table

```mermaid
graph TD
    subgraph Comparison ["Drag Source Comparison"]
        direction TB
        
        subgraph PaletteCol ["FROM PALETTE (new-item)"]
            P1[✓ Creates NEW component]
            P2[✓ Palette item stays]
            P3[✓ No sourceId]
            P4[✓ Infinite creates allowed]
            P5[✗ No old position cleanup]
        end
        
        subgraph CanvasCol ["FROM CANVAS (existing-item)"]
            C1[✓ Moves EXISTING component]
            C2[✓ Has sourceId]
            C3[✓ Same component reference]
            C4[✓ Old position removed]
            C5[✓ May trigger dissolution]
        end
    end

    style PaletteCol fill:#e1f5e1
    style CanvasCol fill:#fff4cc
```

---

## 4. Horizontal Layout Creation

### Main Decision Flow

```mermaid
graph TD
    Start([Drop LEFT or RIGHT]) --> CheckTarget{Is target already<br/>in a row?}
    
    CheckTarget -->|No| CreateNew[CREATE NEW ROW]
    CheckTarget -->|Yes| AddExist[ADD TO EXISTING ROW]
    
    CreateNew --> GetComponents[Get Components:<br/>• Dragged component<br/>• Target component]
    
    GetComponents --> CheckOrder{Drop position?}
    
    CheckOrder -->|LEFT| OrderLeft[Children:<br/>[dragged, target]]
    CheckOrder -->|RIGHT| OrderRight[Children:<br/>[target, dragged]]
    
    OrderLeft --> CreateContainer[Create Row Container]
    OrderRight --> CreateContainer
    
    CreateContainer --> SetProps[Set Properties:<br/>• type: horizontal_layout<br/>• id: row-xxx<br/>• children: 2 components<br/>• capacity: 2/4]
    
    SetProps --> ReplaceTarget[Replace target component<br/>with row container]
    
    ReplaceTarget --> CheckDragType{Drag Type?}
    
    CheckDragType -->|existing-item| RemoveOld[Remove from old position]
    CheckDragType -->|new-item| SkipRemove[Skip removal]
    
    RemoveOld --> Success
    SkipRemove --> Success
    
    AddExist --> FindPos[Find target position<br/>within row children]
    FindPos --> InsertPos{Insert position?}
    
    InsertPos -->|LEFT| InsertBefore[Insert at targetIndex]
    InsertPos -->|RIGHT| InsertAfter[Insert at targetIndex + 1]
    
    InsertBefore --> UpdateRow[Update row.children array]
    InsertAfter --> UpdateRow
    
    UpdateRow --> Success[Add to History<br/>Show notification<br/>Re-render]
    
    Success --> End([End])

    style CreateNew fill:#cce5ff
    style AddExist fill:#b3d9ff
    style Error fill:#ffcccc
    style Success fill:#d4f1d4
```

### Row Creation Example

```mermaid
graph LR
    subgraph Before ["BEFORE: Two Standalone Components"]
        direction TB
        A1[Component A<br/>First Name]
        A2[Component B<br/>Last Name]
    end
    
    subgraph Action ["ACTION: Drop B to RIGHT of A"]
        direction LR
        D1[Drag B] -->|Drop RIGHT| D2[Target: A]
    end
    
    subgraph After ["AFTER: Row Container Created"]
        direction TB
        R[Row Layout<br/>2 components]
        R --> R1[Component A<br/>First Name]
        R --> R2[Component B<br/>Last Name]
    end
    
    Before --> Action
    Action --> After

    style Before fill:#fff4cc
    style Action fill:#ffe6cc
    style After fill:#cce5ff
```

---

## 5. Auto-Dissolution Logic

### Main Dissolution Flow

```mermaid
graph TD
    Start([Component Removed from Row]) --> Count{Count remaining<br/>children in row}
    
    Count -->|0 children| Zero[Empty Row]
    Count -->|1 child| One[Single Child]
    Count -->|2+ children| Keep[≥2 Children]
    
    Keep --> NoAction[NO ACTION<br/>Row Preserved]
    NoAction --> End([End - Row Intact])
    
    Zero --> Dissolve1[DISSOLVE ROW]
    One --> Dissolve2[DISSOLVE ROW]
    
    Dissolve1 --> Extract0[Extract: 0 children]
    Dissolve2 --> Extract1[Extract: 1 child]
    
    Extract0 --> Remove[Remove row container<br/>from parent]
    Extract1 --> Remove
    
    Remove --> Insert{Remaining children?}
    
    Insert -->|0 children| EmptyResult[Result: Row deleted<br/>Nothing added to column]
    Insert -->|1 child| PromoteResult[Result: Child promoted<br/>to column level]
    
    EmptyResult --> Notify[Show Notification:<br/>'Row dissolved - empty']
    PromoteResult --> Notify2[Show Notification:<br/>'Row dissolved - child promoted']
    
    Notify --> AddHistory[Add to Undo History:<br/>DISSOLVE_HORIZONTAL_LAYOUT]
    Notify2 --> AddHistory
    
    AddHistory --> FinalEnd([End - Row Dissolved])

    style Dissolve1 fill:#fff4cc
    style Dissolve2 fill:#fff4cc
    style NoAction fill:#d4f1d4
    style EmptyResult fill:#cce5ff
    style PromoteResult fill:#cce5ff
```

### Dissolution Scenarios

```mermaid
graph TD
    subgraph S1 ["Scenario 1: Delete from 2-Element Row"]
        direction LR
        S1B["BEFORE<br/>Row[A, B]"] -->|Delete B| S1A["AFTER<br/>A (standalone)"]
    end
    
    subgraph S2 ["Scenario 2: Drag Out from 2-Element Row"]
        direction LR
        S2B["BEFORE<br/>Row[A, B]"] -->|Drag B out| S2A["AFTER<br/>A, B (both standalone)"]
    end
    
    subgraph S3 ["Scenario 3: Drag Out from 3-Element Row"]
        direction LR
        S3B["BEFORE<br/>Row[A, B, C]"] -->|Drag C out| S3A["AFTER<br/>Row[A, B] + C (standalone)"]
    end
    
    subgraph S4 ["Scenario 4: Delete from 4-Element Row"]
        direction LR
        S4B["BEFORE<br/>Row[A, B, C, D]"] -->|Delete D| S4A["AFTER<br/>Row[A, B, C] (preserved)"]
    end

    style S1 fill:#ffcccc
    style S2 fill:#ffcccc
    style S3 fill:#d4f1d4
    style S4 fill:#d4f1d4
```

### Dissolution Decision Tree

```mermaid
graph TD
    Start([Component Removed]) --> InRow{Was component<br/>in a row?}
    
    InRow -->|No| Regular[Remove from column<br/>No dissolution]
    InRow -->|Yes| CountRow[Count remaining<br/>in row]
    
    Regular --> End1([End])
    
    CountRow --> Zero{Count = 0?}
    Zero -->|Yes| D0[DISSOLVE<br/>Delete empty row]
    Zero -->|No| One{Count = 1?}
    
    One -->|Yes| D1[DISSOLVE<br/>Promote 1 child to column]
    One -->|No| Two{Count = 2?}
    
    Two -->|Yes| Keep2[KEEP ROW<br/>Still valid 2/4]
    Two -->|No| Keep3[KEEP ROW<br/>Still valid 3/4 or 4/4]
    
    D0 --> Notify0[Notify: Row dissolved]
    D1 --> Notify1[Notify: Child promoted]
    Keep2 --> End2([End - Row Preserved])
    Keep3 --> End2
    
    Notify0 --> End3([End - Row Dissolved])
    Notify1 --> End3

    style D0 fill:#ffcccc
    style D1 fill:#ffcccc
    style Keep2 fill:#d4f1d4
    style Keep3 fill:#d4f1d4
```

---

## 6. Row Layout Dragging

### Row Drag Validation Flow

```mermaid
graph TD
    Start([User Drags Row Layout]) --> Detect[Detect: Row as single unit<br/>dragType: existing-item<br/>isRowLayout: true]
    
    Detect --> DragOver[Mouse over target element]
    
    DragOver --> CalcPos[Calculate drop position]
    
    CalcPos --> ValidatePos{Position type?}
    
    ValidatePos -->|TOP/BOTTOM| AllowVert[ALLOWED<br/>Vertical repositioning]
    ValidatePos -->|LEFT/RIGHT| BlockHoriz[BLOCKED<br/>No horizontal positioning]
    ValidatePos -->|INSIDE| CheckInside{Target type?}
    
    BlockHoriz --> ShowError1[Show Error:<br/>'Rows can only move up/down']
    ShowError1 --> DragOver
    
    CheckInside -->|Another Row| BlockNest[BLOCKED<br/>No nested rows]
    CheckInside -->|Regular Comp| BlockInComp[BLOCKED<br/>Cannot drop inside component]
    
    BlockNest --> ShowError2[Show Error:<br/>'Cannot nest rows']
    BlockInComp --> ShowError3[Show Error:<br/>'Drop above/below instead']
    
    ShowError2 --> DragOver
    ShowError3 --> DragOver
    
    AllowVert --> CheckCircular{Is target a child<br/>of this row?}
    
    CheckCircular -->|Yes| BlockCircular[BLOCKED<br/>Circular reference]
    CheckCircular -->|No| ValidDrop[VALID DROP]
    
    BlockCircular --> ShowError4[Show Error:<br/>'Cannot drop in own children']
    ShowError4 --> DragOver
    
    ValidDrop --> OnDrop{User releases?}
    
    OnDrop -->|Drop| Execute[Execute Move]
    OnDrop -->|ESC| Cancel[Cancel Drag]
    
    Cancel --> End([End - No Changes])
    
    Execute --> RemoveCurrent[Remove row from current position]
    RemoveCurrent --> InsertNew[Insert at target position<br/>BEFORE or AFTER]
    InsertNew --> PreserveChildren[All children move together<br/>Integrity preserved]
    PreserveChildren --> Success[Add to History<br/>Show notification]
    Success --> End

    style ValidDrop fill:#d4f1d4
    style BlockHoriz fill:#ffcccc
    style BlockNest fill:#ffcccc
    style BlockCircular fill:#ffcccc
    style PreserveChildren fill:#cce5ff
```

### Row Dragging Constraints

```mermaid
graph LR
    subgraph Allowed ["✅ ALLOWED Operations"]
        direction TB
        A1[Drop ABOVE another component]
        A2[Drop BELOW another component]
        A3[Drop ABOVE another row]
        A4[Drop BELOW another row]
        A5[All children move together]
    end
    
    subgraph Blocked ["❌ BLOCKED Operations"]
        direction TB
        B1[Drop LEFT of component]
        B2[Drop RIGHT of component]
        B3[Drop INSIDE another row]
        B4[Drop INSIDE component]
        B5[Separate children]
    end

    style Allowed fill:#d4f1d4
    style Blocked fill:#ffcccc
```

### Row Movement Example

```mermaid
graph TD
    subgraph Before ["BEFORE"]
        direction TB
        B1[Email Component]
        B2[Row: First Name, Last Name]
        B3[Phone Component]
    end
    
    subgraph Action ["ACTION: Drag Row Down"]
        direction TB
        A1[User grabs row drag handle]
        A2[Drags to BELOW Phone]
        A3[Blue line shows drop position]
    end
    
    subgraph After ["AFTER"]
        direction TB
        AF1[Email Component]
        AF2[Phone Component]
        AF3[Row: First Name, Last Name]
    end
    
    Before --> Action
    Action --> After

    style Before fill:#fff4cc
    style Action fill:#ffe6cc
    style After fill:#cce5ff
```

---

## 7. Element Count Transitions

### Complete Transition Map

```mermaid
graph TD
    Empty([0 Elements<br/>EMPTY CANVAS]) -->|Add Component| One[1 Element<br/>COLUMN LAYOUT]
    
    One -->|Drop TOP/BOTTOM| TwoCol[2 Elements<br/>COLUMN LAYOUT]
    One -->|Drop LEFT/RIGHT| TwoRow[Row with 2 components<br/>ROW CREATED]
    
    TwoCol -->|Drop TOP/BOTTOM| ThreeCol[3 Elements<br/>COLUMN LAYOUT]
    TwoCol -->|Drop LEFT/RIGHT<br/>on any element| Mixed1[MIXED LAYOUT<br/>1 Row + 1 Standalone]
    
    TwoRow -->|Drop TOP/BOTTOM<br/>on row| Mixed2[MIXED LAYOUT<br/>1 Row + 1 Standalone]
    TwoRow -->|Drop LEFT/RIGHT<br/>on row child| ThreeRow[Row with 3 components<br/>ROW EXPANDED]
    
    ThreeCol -->|Drop LEFT/RIGHT| Mixed3[MIXED LAYOUT<br/>1 Row + 1 Standalone]
    ThreeRow -->|Drop LEFT/RIGHT| FourRow[Row with 4 components<br/>ROW EXPANDED]
    
    FourRow -->|Drop TOP/BOTTOM| Mixed4[MIXED LAYOUT<br/>1 Row + 1+ Standalone]
    FourRow -->|Drop LEFT/RIGHT| FivePlusRow[Row with 5+ components<br/>ROW EXPANDED]
    
    ThreeRow -->|Delete 1| TwoRowBack[Row with 2 components]
    FourRow -->|Delete 1| ThreeRowBack[Row with 3 components]
    FivePlusRow -->|Delete 1| FourRow
    
    TwoRowBack -->|Delete 1| AutoDiss1[AUTO-DISSOLVE<br/>→ 1 Standalone]
    TwoRow -->|Delete 1| AutoDiss2[AUTO-DISSOLVE<br/>→ 1 Standalone]
    
    AutoDiss1 --> One
    AutoDiss2 --> One

    style Empty fill:#f0f0f0
    style One fill:#e1f5e1
    style TwoCol fill:#d4f1d4
    style TwoRow fill:#cce5ff
    style ThreeRow fill:#b3d9ff
    style FourRow fill:#99ccff
    style Mixed1 fill:#fff4cc
    style Mixed2 fill:#fff4cc
    style Mixed3 fill:#fff4cc
    style Mixed4 fill:#fff4cc
    style AutoDiss1 fill:#ffcccc
    style AutoDiss2 fill:#ffcccc
```

### Detailed 1→2 Elements Decision

```mermaid
graph TD
    Start([1 Component on Canvas]) --> AddSecond[Add 2nd Component]
    
    AddSecond --> WhereDropped{Where dropped<br/>relative to first?}
    
    WhereDropped -->|TOP 30%| Above[Insert ABOVE<br/>Column Layout]
    WhereDropped -->|BOTTOM 30%| Below[Insert BELOW<br/>Column Layout]
    WhereDropped -->|LEFT 20%| Left[Create Row<br/>[new, target]]
    WhereDropped -->|RIGHT 20%| Right[Create Row<br/>[target, new]]
    
    Above --> Result1[Canvas Column<br/>├── Component 2<br/>└── Component 1]
    Below --> Result2[Canvas Column<br/>├── Component 1<br/>└── Component 2]
    Left --> Result3[Canvas Column<br/>└── Row 2/4<br/>    ├── Component 2<br/>    └── Component 1]
    Right --> Result4[Canvas Column<br/>└── Row 2/4<br/>    ├── Component 1<br/>    └── Component 2]
    
    Result1 --> End([2 Components])
    Result2 --> End
    Result3 --> End
    Result4 --> End

    style Above fill:#d4f1d4
    style Below fill:#d4f1d4
    style Left fill:#cce5ff
    style Right fill:#cce5ff
```

### Growth Path Example

```mermaid
graph LR
    subgraph Stage1 ["Stage 1: Empty → 1"]
        S1[Empty Canvas] -->|Add First| S1R[Component A]
    end
    
    subgraph Stage2 ["Stage 2: 1 → 2 (Row)"]
        S2[Component A] -->|Add Right| S2R[Row: A, B]
    end
    
    subgraph Stage3 ["Stage 3: 2 → 3 (Expand Row)"]
        S3[Row: A, B] -->|Add Right| S3R[Row: A, B, C]
    end
    
    subgraph Stage4 ["Stage 4: 3 → 4 (Max Row)"]
        S4[Row: A, B, C] -->|Add Right| S4R[Row: A, B, C, D]
    end
    
    subgraph Stage5 ["Stage 5: Add to Column"]
        S5[Row: A, B, C, D] -->|Add Below| S5R[Row: A, B, C, D<br/>+ Component E]
    end
    
    Stage1 --> Stage2
    Stage2 --> Stage3
    Stage3 --> Stage4
    Stage4 --> Stage5

    style S1R fill:#e1f5e1
    style S2R fill:#cce5ff
    style S3R fill:#b3d9ff
    style S4R fill:#99ccff
    style S5R fill:#fff4cc
```

---

## 8. Validation System

### Main Validation Flow

```mermaid
graph TD
    Start([Layout Operation Initiated]) --> Identify{Operation Type?}
    
    Identify -->|Create Row| V1[Validate Row Creation]
    Identify -->|Add to Row| V2[Validate Row Addition]
    Identify -->|Move Component| V3[Validate Component Move]
    Identify -->|Move Row| V4[Validate Row Move]
    Identify -->|Delete Component| V5[Validate Delete]
    
    V1 --> Rule1[Check: Min 2 components]
    V2 --> Rule2[Check: Row capacity < 4]
    V3 --> Rule3[Check: Valid position]
    V4 --> Rule4[Check: No nesting]
    V5 --> Rule5[Check: Safe to delete]
    
    Rule1 --> Pass1{Valid?}
    Rule2 --> Pass2{Valid?}
    Rule3 --> Pass3{Valid?}
    Rule4 --> Pass4{Valid?}
    Rule5 --> Pass5{Valid?}
    
    Pass1 -->|No| Error1[Error: Row needs 2+]
    Pass1 -->|Yes| Domain1[Check domain compatibility]
    
    Pass2 -->|No| Error2[Error: Row at capacity]
    Pass2 -->|Yes| Nested2[Check no nesting]
    
    Pass3 -->|No| Error3[Error: Invalid position]
    Pass3 -->|Yes| Circular3[Check circular ref]
    
    Pass4 -->|No| Error4[Error: Cannot nest rows]
    Pass4 -->|Yes| Position4[Check vertical only]
    
    Pass5 -->|Yes| Success[All Validations Passed]
    
    Error1 --> ShowError[Show Error to User]
    Error2 --> ShowError
    Error3 --> ShowError
    Error4 --> ShowError
    
    Domain1 --> DomainOk{Compatible?}
    DomainOk -->|No| ErrorDomain[Error: Not in domain]
    DomainOk -->|Yes| Success
    
    Nested2 --> NestedOk{No nesting?}
    NestedOk -->|No| ErrorNested[Error: Nested rows]
    NestedOk -->|Yes| Success
    
    Circular3 --> CircOk{No circular?}
    CircOk -->|No| ErrorCirc[Error: Circular ref]
    CircOk -->|Yes| Success
    
    Position4 --> PosOk{Vertical only?}
    PosOk -->|No| ErrorPos[Error: Horizontal blocked]
    PosOk -->|Yes| Success
    
    ErrorDomain --> ShowError
    ErrorNested --> ShowError
    ErrorCirc --> ShowError
    ErrorPos --> ShowError
    
    ShowError --> Reject([Operation Rejected])
    Success --> Execute[Execute Operation]
    Execute --> End([Operation Complete])

    style Success fill:#d4f1d4
    style ShowError fill:#ffcccc
    style Reject fill:#ffcccc
    style Execute fill:#cce5ff
```

### Constraint Enforcement

```mermaid
graph TD
    subgraph RowConstraints ["Row Layout Constraints"]
        direction TB
        R1[Min: 2 components]
        R2[Max: 4 components]
        R3[Drop zones: LEFT, RIGHT only]
        R4[No nested rows]
        R5[Auto-dissolve if ≤1 child]
    end
    
    subgraph ColumnConstraints ["Column Layout Constraints"]
        direction TB
        C1[Unlimited components]
        C2[Drop zones: TOP, BOTTOM]
        C3[Always the canvas base]
        C4[Contains rows + standalone]
    end
    
    subgraph ComponentConstraints ["Component Constraints"]
        direction TB
        CO1[Unique field IDs]
        CO2[Required: type, id, label]
        CO3[Domain compatibility]
        CO4[No circular references]
    end
    
    subgraph DomainConstraints ["Domain Constraints"]
        direction TB
        D1[Forms: All components]
        D2[Surveys: Limited set]
        D3[Workflows: Action-focused]
        D4[Enforce filters]
    end

    style RowConstraints fill:#cce5ff
    style ColumnConstraints fill:#d4f1d4
    style ComponentConstraints fill:#fff4cc
    style DomainConstraints fill:#ffe6cc
```

---

## 9. Complex Mixed Layout Flow

### Building a Complex Form

```mermaid
graph TD
    Start([Empty Canvas]) --> Add1[Add Component:<br/>Heading]
    
    Add1 --> State1[Canvas<br/>└── Heading]
    
    State1 --> Add2[Add RIGHT of Heading:<br/>First Name]
    
    Add2 --> State2[Canvas<br/>└── Row: Heading, First Name]
    
    State2 --> Problem{Wait - Problem!<br/>Heading shouldn't<br/>be in row}
    
    Problem --> Undo[Undo last action]
    
    Undo --> State1b[Back to:<br/>Canvas<br/>└── Heading]
    
    State1b --> Add2b[Add BELOW Heading:<br/>First Name]
    
    Add2b --> State2b[Canvas<br/>├── Heading<br/>└── First Name]
    
    State2b --> Add3[Add RIGHT of First Name:<br/>Last Name]
    
    Add3 --> State3[Canvas<br/>├── Heading<br/>└── Row: First Name, Last Name]
    
    State3 --> Add4[Add BELOW Row:<br/>Email]
    
    Add4 --> State4[Canvas<br/>├── Heading<br/>├── Row: First Name, Last Name<br/>└── Email]
    
    State4 --> Add5[Add BELOW Email:<br/>Phone]
    
    Add5 --> State5[Canvas<br/>├── Heading<br/>├── Row: First Name, Last Name<br/>├── Email<br/>└── Phone]
    
    State5 --> Add6[Add RIGHT of Phone:<br/>City]
    
    Add6 --> State6[Canvas<br/>├── Heading<br/>├── Row: First Name, Last Name<br/>├── Email<br/>└── Row: Phone, City]
    
    State6 --> Final([Complex Mixed Layout Complete])

    style Problem fill:#ffcccc
    style Undo fill:#fff4cc
    style Final fill:#d4f1d4
```

### Rearrangement in Mixed Layout

```mermaid
graph TD
    Start([Complex Layout Exists]) --> Before[Canvas<br/>├── Row1: A, B, C<br/>├── D<br/>└── E]
    
    Before --> Action{User Action?}
    
    Action -->|Drag C out of Row1| Move1[Remove C from Row1]
    Move1 --> Check1{Row1 now has 2?}
    Check1 -->|Yes| Keep1[Keep Row1: A, B]
    Keep1 --> Insert1[Insert C in column]
    Insert1 --> Result1[Canvas<br/>├── Row1: A, B<br/>├── D<br/>├── E<br/>└── C]
    
    Action -->|Drag B out of Row1| Move2[Remove B from Row1]
    Move2 --> Check2{Row1 now has 1?}
    Check2 -->|Yes| Dissolve[AUTO-DISSOLVE Row1]
    Dissolve --> Result2[Canvas<br/>├── A<br/>├── C<br/>├── D<br/>├── E<br/>└── B]
    
    Action -->|Drag D to Row1| Move3[Add D to Row1]
    Move3 --> Check3{Row1 capacity?}
    Check3 -->|3 < 4| AddOk[Add D to Row1]
    AddOk --> Result3[Canvas<br/>├── Row1: A, B, C, D<br/>└── E]
    Check3 -->|4 = 4| Error[Error: Row Full]
    Error --> Before
    
    Result1 --> End([End])
    Result2 --> End
    Result3 --> End

    style Dissolve fill:#ffcccc
    style Error fill:#ffcccc
    style AddOk fill:#d4f1d4
```

---

## 10. Edge Case Handling

### Corner Drop Resolution

```mermaid
graph TD
    Start([Mouse in Corner Zone]) --> Detect[Detect:<br/>Both horizontal AND<br/>vertical zones active]
    
    Detect --> Example[Example:<br/>xPercent = 0.15 LEFT<br/>yPercent = 0.25 TOP]
    
    Example --> Priority{Priority Rule}
    
    Priority -->|Rule 1| Horiz[HORIZONTAL wins<br/>over vertical]
    
    Horiz --> Result[Return: LEFT]
    Result --> Why[Why?<br/>Horizontal creates rows<br/>which is more specific<br/>than column insert]
    
    Why --> AllCorners[All Corner Cases:]
    
    AllCorners --> TL[Top-Left → LEFT]
    AllCorners --> TR[Top-Right → RIGHT]
    AllCorners --> BL[Bottom-Left → LEFT]
    AllCorners --> BR[Bottom-Right → RIGHT]
    
    TL --> End([End])
    TR --> End
    BL --> End
    BR --> End

    style Horiz fill:#cce5ff
    style Result fill:#d4f1d4
```

### Row Interior Blocked Drop

```mermaid
graph TD
    Start([Drop on Row Layout]) --> CalcY[Calculate yPercent<br/>relative to row]
    
    CalcY --> TopZone{yPercent < 0.15?}
    
    TopZone -->|Yes| AboveRow[Drop ABOVE row<br/>Insert in column]
    TopZone -->|No| BottomZone{yPercent > 0.85?}
    
    BottomZone -->|Yes| BelowRow[Drop BELOW row<br/>Insert in column]
    BottomZone -->|No| Interior[In row interior<br/>15% < y < 85%]
    
    Interior --> FindChild[Find which child<br/>mouse is over]
    
    FindChild --> HasChild{Found child?}
    
    HasChild -->|Yes| ChildZones[Apply standard detection<br/>to child component]
    HasChild -->|No| Gap[In gap between children]
    
    ChildZones --> ChildResult[Return child's zones:<br/>LEFT, RIGHT, BEFORE, AFTER]
    
    Gap --> Blocked[BLOCKED<br/>Return NULL]
    
    AboveRow --> End([End])
    BelowRow --> End
    ChildResult --> End
    Blocked --> End

    style AboveRow fill:#d4f1d4
    style BelowRow fill:#d4f1d4
    style ChildResult fill:#cce5ff
    style Blocked fill:#ffcccc
```

### Circular Reference Prevention

```mermaid
graph TD
    Start([Dragging Row Layout]) --> Over[Mouse over target]
    
    Over --> Check{Is target a child<br/>of dragged row?}
    
    Check -->|No| Safe[Safe to drop]
    Check -->|Yes| Circular[CIRCULAR REFERENCE<br/>DETECTED]
    
    Safe --> Allow[Show blue indicator<br/>Allow drop]
    
    Circular --> Block[Show red indicator<br/>Block drop]
    Block --> Error[Show Error:<br/>'Cannot drop row<br/>inside its own children']
    
    Error --> Example[Example:<br/>Row contains: A, B, C<br/>User tries to drop<br/>row on component B<br/>→ BLOCKED]
    
    Allow --> End1([End - Valid])
    Example --> End2([End - Blocked])

    style Safe fill:#d4f1d4
    style Circular fill:#ffcccc
    style Block fill:#ffcccc
```

### Same-Row Rearrangement

```mermaid
graph TD
    Start([Drag Component Within Same Row]) --> Before[Row: A, B, C, D<br/>sourceIndex: 1 B<br/>targetIndex: 3 D]
    
    Before --> Remove[Remove from sourceIndex<br/>Row: A, C, D<br/>B removed]
    
    Remove --> Adjust[Adjust targetIndex<br/>sourceIndex 1 < targetIndex 3<br/>→ targetIndex--<br/>→ New targetIndex: 2]
    
    Adjust --> Position{Drop position?}
    
    Position -->|LEFT| InsertLeft[Insert at adjusted index<br/>Row: A, C, B, D]
    Position -->|RIGHT| InsertRight[Insert at adjusted index + 1<br/>Row: A, C, D, B]
    
    InsertLeft --> Result1[Final: A, C, B, D]
    InsertRight --> Result2[Final: A, C, D, B]
    
    Result1 --> End([End])
    Result2 --> End

    style Before fill:#fff4cc
    style Remove fill:#ffe6cc
    style Adjust fill:#cce5ff
    style Result1 fill:#d4f1d4
    style Result2 fill:#d4f1d4
```

---

## Quick Reference Diagram

### Complete Layout Decision Tree

```mermaid
graph TD
    Start([Drag & Drop Initiated]) --> Source{Drag Source?}
    
    Source -->|Palette| New[Create New Component]
    Source -->|Canvas| Move[Move Existing Component]
    
    New --> Position{Drop Position?}
    Move --> Position
    
    Position -->|TOP/BOTTOM<br/>30%| Column[Column Layout Logic]
    Position -->|LEFT/RIGHT<br/>20%| Row[Row Layout Logic]
    Position -->|CENTER<br/>50%| Check{Target Type?}
    
    Check -->|Row Layout| Blocked[BLOCKED]
    Check -->|Component| Column
    
    Column --> Insert[Insert in Column<br/>BEFORE or AFTER]
    
    Row --> InRow{Target in Row?}
    
    InRow -->|No| CreateRow[Create New Row<br/>2 components]
    InRow -->|Yes| Capacity{Capacity < 4?}
    
    Capacity -->|No| Error[Error: Row Full]
    Capacity -->|Yes| AddRow[Add to Row]
    
    Insert --> Cleanup{Source was<br/>in Row?}
    CreateRow --> Cleanup
    AddRow --> Cleanup
    
    Cleanup -->|Yes| Count{Remaining ≤1?}
    Cleanup -->|No| Success
    
    Count -->|Yes| Dissolve[Auto-Dissolve<br/>Old Row]
    Count -->|No| Success
    
    Dissolve --> Success[Update State<br/>Add to History<br/>Re-render]
    
    Error --> End1([Reject])
    Blocked --> End1
    Success --> End2([Complete])

    style CreateRow fill:#cce5ff
    style Dissolve fill:#ffcccc
    style Error fill:#ffcccc
    style Blocked fill:#ffcccc
    style Success fill:#d4f1d4
```

---

## How to Use These Diagrams

### For Developers:
1. **Start with Master Flow** (Diagram 1) - Understand the complete process
2. **Deep-dive specific areas** - Follow diagrams 2-10 for details
3. **Reference during coding** - Keep Quick Reference visible
4. **Debug with diagrams** - Trace your code path through flowcharts

### For QA/Testing:
1. **Extract test cases** - Each decision point = test scenario
2. **Cover all paths** - Ensure every arrow is tested
3. **Validate edge cases** - Diagrams 10 shows all edge cases
4. **State validation** - Use transition diagrams for state testing

### For Product/Design:
1. **Understand complexity** - See how intricate the system is
2. **Explain to stakeholders** - Visual representation of logic
3. **Plan enhancements** - See where features fit in flow
4. **Document decisions** - Use diagrams in specification docs

---

## Legend

```mermaid
graph LR
    subgraph Shapes ["Shape Meanings"]
        Start([Start/End - Rounded])
        Process[Process - Rectangle]
        Decision{Decision - Diamond}
        Result([Result - Double Rounded])
    end
    
    subgraph Colors ["Color Meanings"]
        Success[Success - Green]
        Warning[Warning - Yellow]
        Error[Error - Red]
        Info[Info - Blue]
        Neutral[Neutral - Gray]
    end

    style Success fill:#d4f1d4
    style Warning fill:#fff4cc
    style Error fill:#ffcccc
    style Info fill:#cce5ff
    style Neutral fill:#f0f0f0
```

---

**END OF LAYOUT LOGIC FLOWCHARTS**

*Version: 1.0*  
*Last Updated: October 31, 2025*

**View these diagrams at:** https://mermaid.live  
**Paste the code blocks** from this document to see interactive flowcharts.