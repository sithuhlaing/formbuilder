TEST SUITE: Canvas Internal Arrangement and Mutation Logic

TEST CASE 1: Canvas Origin Vertical Reordering via Between Command
    GIVEN an active canvas schema with an ordered array of vertical components [CompA, CompB, CompC]
    WHEN a user drags CompA and drops it over the vertical center zone (central 40%) of CompC
    THEN the calculation engine must return a BETWEEN command targeting the index of CompC plus one
    AND the mutation engine must extract CompA from its initial index
    AND insert it immutably at the target index
    AND maintain a static total array length preventing data destruction
END TEST CASE

TEST CASE 2: Canvas Origin Horizontal Row Creation via Side Command
    GIVEN an active canvas schema with a vertical component CompA
    WHEN a user drags an existing CompB and drops it intersecting the outer 30% horizontal bounds of CompA
    THEN the calculation engine must return a SIDE insert command
    AND the mutation engine must inject a new horizontal_layout wrapper object into the schema array
    AND create nested sub-arrays (columns) inside the wrapper schema
    AND place the JSON objects of CompA and CompB within those sub-arrays
END TEST CASE

TEST CASE 3: Top-Level Lockout in Nested Rows during Column Swap
    GIVEN a horizontal_layout container holding CompX and CompY in nested sub-arrays
    WHEN a user drags CompX and drops it over CompY intersecting the 50% midpoint of the column
    THEN the calculation engine must evaluate the nested state (isTopLevel === false)
    AND mathematically bypass horizontal SIDE row creation to prevent infinite recursion
    AND return a COLUMN_BETWEEN array swap command
    AND execute the sub-array index swap immutably
END TEST CASE

TEST CASE 4: Garbage Collection Circuit Breaker for Auto-Dissolution
    GIVEN a horizontal_layout wrapper schema containing two nested child components
    WHEN a user drags one child component out of the container and drops it onto the neutral root canvas
    THEN the container sub-array length must be evaluated post-mutation
    AND if the surviving child count evaluates to 1 or less
    THEN the horizontal_layout wrapper JSON object must be automatically destroyed from the schema
    AND the solitary surviving child component JSON must be promoted directly to the root canvas array index
END TEST CASE

TEST CASE 5: Mutation Isolation on Invalid Coordinates
    GIVEN a stable JSON schema canvas state array
    WHEN a user initiates a canvas drag arrangement but drops the component outside any valid calculated boundary zones
    THEN the drop command must abort the state mutation
    AND return the exact pre-interaction sequence array unmodified
    AND guarantee zero implicit component disappearance or data corruption
END TEST CASE