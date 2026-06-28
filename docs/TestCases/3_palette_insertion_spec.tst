TEST SUITE: Component Palette Insertion and Layout Operations

TEST CASE 1: Palette Origin Structural Insert of Input Component
    GIVEN a pristine empty canvas array
    WHEN a user drags a "Text Field" from the left palette and drops it onto the canvas
    THEN the state machine must generate a unique UUID
    AND instantiate default properties for the text field
    AND append the new component object to the canvas data array
    AND bind the properties panel focus to the new UUID
END TEST CASE

TEST CASE 2: Palette Origin Ingestion of Selection Component
    GIVEN a pristine empty canvas array
    WHEN a user drags a "Select" dropdown from the left palette and drops it onto the canvas
    THEN the state machine must generate a unique UUID
    AND inject a default key-value options array into the component data structure
    AND append the select component object to the canvas data array
END TEST CASE

TEST CASE 3: Canvas Origin Mutation Isolation for Reordering
    GIVEN a canvas containing an ordered array of three components
    WHEN a user drags an existing component and drops it between two other components
    THEN the mutation engine must execute an array reorder on the drop event
    AND maintain a static array length
    AND prevent implicit data creation or destruction
END TEST CASE

TEST CASE 4: Spatial Threshold Trigger for Horizontal Layout
    GIVEN a canvas containing an active component
    WHEN a user drags a new component over the outer 30% horizontal bounds of the existing component
    THEN the coordinate engine must return a SIDE drop command
    AND the mutation engine must generate a horizontal_layout wrapper upon drop
    AND encapsulate both components into sub-array columns
END TEST CASE

TEST CASE 5: Garbage Collection Circuit Breaker for Auto-Dissolution
    GIVEN a horizontal_layout container holding exactly two components
    WHEN a component is explicitly dragged out of the row container onto the root canvas
    THEN the row container child array must evaluate to a count of 1 or less
    AND the row wrapper must automatically dissolve
    AND the surviving child node must promote back to the root canvas array index
END TEST CASE