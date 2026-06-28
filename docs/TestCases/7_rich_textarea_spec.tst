TEST SUITE: Horizontal Linear Layout Sub-System Operations

TEST CASE 1: Top-Level Lockout Disabling Recursive Nesting
    GIVEN a horizontal_layout container holding active components
    WHEN a user drags another horizontal_layout component over the existing row container
    THEN the coordinate engine must evaluate the nested state (isTopLevel === false)
    AND mathematically suppress the root X-axis 30% thresholds
    AND reject any nested horizontal layout generation to prevent infinite recursion
END TEST CASE

TEST CASE 2: Fifty Percent Midpoint Column Index Splicing
    GIVEN a horizontal_layout wrapper containing a component in column index 0
    WHEN a user drags a second component and drops it over the container intersecting the right 50% midpoint boundary
    THEN the coordinate engine must return a COLUMN_BETWEEN swap command targeting index 1
    AND the mutation engine must execute an immutable splice appending the component into column index 1
    AND maintain a static row container parent schema
END TEST CASE

TEST CASE 3: Auto-Dissolution Circuit Breaker on Column Evacuation
    GIVEN a horizontal_layout container managing two sub-array columns
    WHEN a component is dragged out of column index 0 and dropped onto the root canvas
    THEN the parent horizontal container child count must evaluate to 1 or less post-mutation
    AND the horizontal_layout wrapper JSON object must automatically dissolve from the schema
    AND the remaining solitary child component JSON must promote directly to the root vertical canvas array index
END TEST CASE