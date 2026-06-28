TEST SUITE: JSON Schema Generation and Nesting Verification

TEST CASE 1: Root Canvas Vertical Array Appending
    GIVEN an empty root form schema array
    WHEN a user drags an input component from the left panel and drops it onto the center canvas
    THEN the data factory must instantiate a new JSON object with a unique UUID
    AND append the object directly to the root schema array
    AND render the component vertically on screen
END TEST CASE

TEST CASE 2: Dynamic Container Wrapper Injection
    GIVEN a root schema array
    WHEN a user drops a component onto the outer 30% horizontal threshold of an existing component
    THEN the state engine must inject a "horizontal_layout" object into the schema
    AND create nested sub-arrays (columns) inside the container schema
    AND place the target and dragged component JSON objects within those sub-arrays
END TEST CASE