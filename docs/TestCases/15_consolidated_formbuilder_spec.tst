TEST SUITE: Consolidated Form Builder Business Logic Verification

// ---------------------------------------------------------
// SECTION 1: Root Canvas Vertical Operations
// ---------------------------------------------------------

TEST CASE 1: Unified Splicing Indicator Between Vertical Nodes
    GIVEN an active canvas containing vertically stacked components A and B
    WHEN a user drags a component between A and B
    THEN the coordinate engine must compute a single absolute midpoint between A.bottom and B.top
    AND render exactly one unified horizontal insertion line
    AND execute a single BETWEEN array mutation splicing at the index of B upon drop
END TEST CASE

TEST CASE 2: Topmost and Bottommost Canvas Margin Dropping
    GIVEN a scrollable vertical canvas with existing components
    WHEN a user drags a component to the extreme top margin or extreme bottom margin
    THEN the canvas container must detect boundary intersections within padding zones
    AND process a BETWEEN command mapping precisely to index 0 (top) or array.length (bottom)
END TEST CASE

// ---------------------------------------------------------
// SECTION 2: Horizontal Layout Row Operations
// ---------------------------------------------------------

TEST CASE 3: Flat Internal Structure Non-Recursive and Event Isolation Enforcement
    GIVEN an active horizontal_layout container row managing real base component items
    WHEN a user attempts to drag a layout container (horizontal or vertical) into the row
    THEN child nodes must invoke e.stopPropagation to isolate event bubbling
    AND the coordinate calculation engine must evaluate the target zone as non-nestable
    AND suppress all localized drop splitting lines to prevent multi-layer indicator overlap
    AND reject the native drop event to strictly prevent container nesting
END TEST CASE

TEST CASE 4: Dynamic N Plus One Fractional Column Splicing with COLUMN_BETWEEN Guard
    GIVEN a horizontal_layout container holding three real component columns
    AND a type guard blocking draggedItem.type equal to 'row' in the COLUMN_BETWEEN handler
    WHEN a user drags a base component over the row container
    THEN the coordinate engine must divide the container X-axis into four equal fractional segments (N+1)
    AND render exactly one localized vertical splitting line
    AND execute an immutable splice appending the component payload into the targeted sub-array column index upon drop
END TEST CASE

TEST CASE 5: Real Component List Integrity Without Empty Placeholders
    GIVEN a horizontal_layout container with a populated real component list
    WHEN a column item is rearranged or spliced via drag and drop
    THEN the state machine must strictly maintain an array of instantiated component objects
    AND forbid the insertion, rendering, or persistence of empty placeholders or null slots
    AND guarantee array density matches active visible columns
END TEST CASE

TEST CASE 6: Horizontal Overflow and Minimum Width Clamping
    GIVEN a horizontal_layout container populated with multiple base components
    WHEN columns are iteratively added exceeding the visible parent viewport width
    THEN the layout engine must apply explicit minimum width constraints to each child column
    AND trigger an overflow-x: auto declaration rendering a horizontal scrollbar
    AND maintain drag-and-drop pointer coordinate accuracy relative to scrollLeft offsets
END TEST CASE

TEST CASE 7: Twelve Column Maximum Capacity Hard Stop
    GIVEN a horizontal_layout container populated with the maximum limit of twelve real components
    WHEN a user attempts to drop an additional component into the horizontal row
    THEN the calculation engine must evaluate the sub-array length as equal to 12
    AND suppress all localized insertion indicators
    AND reject the drop command to strictly enforce the maximum capacity constraint
END TEST CASE

TEST CASE 8: Row Auto-Dissolution Circuit Breaker
    GIVEN a horizontal_layout container managing two sub-array columns
    WHEN a component is explicitly dragged out of a column onto the root canvas
    THEN the parent horizontal container child count must evaluate to 1 or less post-mutation
    AND the row wrapper JSON object must automatically dissolve from the schema
    AND the remaining solitary child component JSON must promote directly to the root vertical canvas array index
END TEST CASE

// ---------------------------------------------------------
// SECTION 3: System Mutation Safety
// ---------------------------------------------------------

TEST CASE 9: Mutation Isolation on Invalid Coordinates
    GIVEN a stable schema state array
    WHEN a user initiates a drag sequence but drops the component outside any valid calculated boundaries
    THEN the drop command must abort state mutation
    AND return the exact pre-interaction sequence array unmodified
    AND guarantee zero implicit component disappearance or data corruption
END TEST CASE
