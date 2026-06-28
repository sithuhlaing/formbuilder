TEST SUITE: Scrollable Container Overflow Boundary Mapping

TEST CASE 1: Dynamic Coordinate Recalculation under Scroll Offsets
    GIVEN a scrollable canvas container with an overflow-y: auto declaration
    AND an aggregate content height exceeding the visible viewport boundary
    WHEN a user drags a component and scrolls the container during the drag_over phase
    THEN the coordinate calculation engine must dynamically adjust client bounding rectangles
    AND factor in the current scrollTop and scrollLeft offsets
    AND guarantee calculated drop intersections align perfectly with the visible cursor position
END TEST CASE