TEST SUITE: Form Builder Verification Suite

// 1. Workspace Initialization & Palette Operations
TEST CASE 1: Initialize Pristine Canvas Workspace
    GIVEN an empty form builder workspace
    WHEN the system initializes the create form state
    THEN the canvas array must be empty
    AND the operational mode must be set to "create"
    AND the UI must display the pristine four-column layout workspace
END TEST CASE

TEST CASE 2: Palette Origin Structural Insert of Component
    GIVEN a pristine empty canvas array
    WHEN a user drags a component from the left palette and drops it onto the canvas
    THEN the state machine must generate a unique UUID
    AND instantiate default properties for the component type
    AND append the new component object to the canvas data array
    AND bind the properties panel focus to the new UUID
END TEST CASE

// 2. Spatial Coordinate Engine & Nesting Rules
TEST CASE 3: Root Canvas Vertical Array Appending via Between Command
    GIVEN an active canvas array with an ordered list of components
    WHEN a user drags a component and drops it over the central vertical zone of another component
    THEN the calculation engine must return a BETWEEN drop command
    AND the mutation engine must splice the component into the calculated array index
    AND maintain a static total array length preventing data destruction
END TEST CASE

TEST CASE 4: Dynamic Container Wrapper Injection via Side Command
    GIVEN an active canvas array with a vertical component
    WHEN a user drops a component intersecting the outer 30% horizontal bounds of the existing component
    THEN the calculation engine must return a SIDE insert command
    THEN the mutation engine must generate a new horizontal_layout wrapper object
    AND create nested sub-arrays (columns) inside the wrapper
    AND place the component objects within those sub-arrays
END TEST CASE

TEST CASE 5: Top-Level Lockout Disabling Recursive Nesting
    GIVEN a horizontal_layout container holding active components
    WHEN a user drags another horizontal_layout component over the existing row container
    THEN the coordinate engine must evaluate the nested state (isTopLevel === false)
    AND mathematically suppress the root X-axis 30% thresholds
    AND reject any nested horizontal layout generation to prevent infinite recursion
END TEST CASE

// 3. Horizontal Layout Mechanics
TEST CASE 6: Fifty Percent Midpoint Column Index Splicing
    GIVEN a horizontal_layout wrapper containing a component in column index 0
    WHEN a user drops a second component over the container intersecting the opposite 50% midpoint boundary
    THEN the coordinate engine must return a COLUMN_BETWEEN swap command targeting the open column index
    AND the mutation engine must execute an immutable splice appending the component into that sub-array column
END TEST CASE

// 4. Garbage Collection & Mutation Safety
TEST CASE 7: Auto-Dissolution Circuit Breaker on Component Evacuation
    GIVEN a horizontal_layout wrapper containing exactly two child components
    WHEN a user drags one child component out of the container and drops it onto the root canvas
    THEN the container sub-array length must be evaluated post-mutation
    AND if the surviving child count evaluates to 1 or less
    THEN the horizontal_layout wrapper object must automatically dissolve
    AND the solitary surviving child component must promote directly to the root vertical canvas index
END TEST CASE

TEST CASE 8: Mutation Isolation on Invalid Coordinates
    GIVEN a stable canvas state array
    WHEN a user initiates a drag arrangement but drops the component outside any valid calculated boundary zones
    THEN the drop command must abort state mutation
    AND return the exact pre-interaction sequence array unmodified
    AND guarantee zero implicit component disappearance or data corruption
END TEST CASE

// 5. Scrollable Container Overflow Boundary Mapping
TEST CASE 9: Dynamic Coordinate Recalculation under Scroll Offsets
    GIVEN a scrollable canvas container with an overflow-y: auto declaration
    AND an aggregate content height exceeding the visible viewport boundary
    WHEN a user drags a component and scrolls the container during the drag_over phase
    THEN the coordinate calculation engine must adjust client bounding rectangles
    AND factor in current scrollTop and scrollLeft offsets
    AND guarantee calculated drop intersections align with the visible cursor position
END TEST CASE

TEST CASE 10: Visual Drag Indicators for External Toolbox Drops
    GIVEN a toolbox component being dragged from the left panel
    WHEN the drag cursor enters the canvas dropzone area
    THEN the styling engine must apply an active highlight class to the dropzone container
    AND display the insertion preview guide at the closest valid drop coordinate
END TEST CASE

TEST CASE 11: Configure Placeholder and Required properties via Right Panel
    GIVEN a selected component in the canvas builder workspace
    WHEN the user enters a custom placeholder in the properties panel
    AND toggles the required field switch to active
    THEN the properties panel must show the placeholder field and required switch (and hide the Field Type field)
    AND the preview mode forms must render the inputs with the configured placeholder text
    AND the form label must render the red asterisk indicating the required state
END TEST CASE

TEST CASE 12: Deselect selected item on canvas background click
    GIVEN a selected component in the canvas builder workspace
    WHEN the user clicks on the empty space of the canvas dropzone background
    THEN the component selection state must clear (selectedComponentId becomes null)
    AND the properties panel must close (rendering the Live Preview form instead)
END TEST CASE

TEST CASE 13: Hover-to-appear Remove Button on Canvas Item
    GIVEN a component in the canvas builder workspace
    WHEN the user hovers or interacts with the canvas item card
    THEN the remove button must become visible at the top right corner of the card
    AND clicking the remove button must trigger component removal from the state machine
    AND stop click propagation to prevent component selection or canvas clicks
END TEST CASE