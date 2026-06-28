TEST SUITE: Corrected Canvas Arrangement and Boundary Engine

TEST CASE 1: Unified Splicing Indicator Between Adjacent Components
    GIVEN an active canvas containing Component A and Component B vertically stacked
    WHEN a user drags an existing component between A and B
    THEN the calculation engine must compute a single absolute midpoint between A.bottom and B.top
    AND render exactly one unified insertion line
    AND suppress independent top/bottom lines on adjacent nodes
    AND execute a single BETWEEN array mutation on drop
END TEST CASE

TEST CASE 2: Topmost and Bottommost Edge Boundary Dropping
    GIVEN a scrollable canvas with existing components
    WHEN a user drags a component to the absolute top margin or absolute bottom margin of the canvas
    THEN the coordinate engine must detect boundary intersections within the padding zones
    AND render an insertion line at the extreme top or extreme bottom edge
    AND process a BETWEEN command mapping to index 0 (top) or array.length (bottom) upon native drop
END TEST CASE

TEST CASE 3: Palette Drag Targeted Proximity Highlighting
    GIVEN an active canvas with pre-existing elements and a dragged component originating from the left palette
    WHEN the component enters the canvas boundary
    THEN the system must suppress generic whole-canvas highlighting
    AND evaluate cursor client coordinates relative to the nearest canvas component's bounding box
    AND render localized directional indicators (SIDE or BETWEEN split lines) based on spatial thresholds
    AND mutate the single-source-of-truth schema directly at the targeted localized index
END TEST CASE