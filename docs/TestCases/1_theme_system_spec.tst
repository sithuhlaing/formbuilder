TEST SUITE: Layout Engine and Mutation Engine Tests

TEST CASE 1: Top-Level Canvas - X-Axis Precedence for Row Creation
    GIVEN an empty vertical linear layout canvas
    AND a target bounding box of an existing component
    WHEN a user drags a new component and the cursor intersects the outer 30% horizontal bounds (X-axis)
    THEN the calculation engine must evaluate X-axis bounds before Y-axis bounds
    AND return a drop command of type "SIDE"
    AND the state machine must generate a new "horizontal_layout" container upon drop
END TEST CASE

TEST CASE 2: Nested Rows - Top-Level Lockout
    GIVEN a horizontal row container containing components
    WHEN a user drags a component over an existing nested component
    THEN the calculation engine must mathematically bypass outer X-axis thresholds to prevent infinite nesting
    AND return a drop command of type "COLUMN_BETWEEN"
    AND the drop execution must restrict movement to horizontal column swapping within the existing row
END TEST CASE

TEST CASE 3: Dynamic Row Lifecycle - Auto-Dissolution
    GIVEN a horizontal row container holding exactly two components
    WHEN a user drags one component out of the row container and drops it onto the main canvas
    THEN the row container's child array length must be evaluated
    AND if the child count evaluates to 1 or less
    THEN the row wrapper must be automatically destroyed
    AND the surviving child node must be promoted directly to the root vertical layout index
END TEST CASE

TEST CASE 4: State Integrity - Mutation Isolation Data Safety
    GIVEN an active canvas array containing ordered components
    WHEN a user drags a component but drops it outside valid calculated boundary zones
    THEN the mutation engine must return the exact unmodified state array
    AND the total array length must remain static
    AND implicit data creation or component disappearance must be mathematically prevented
END TEST CASE