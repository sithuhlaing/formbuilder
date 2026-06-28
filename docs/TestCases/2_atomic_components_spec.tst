TEST SUITE: Patient Information Dynamic Form Assembly

TEST CASE 1: Initialize Pristine Canvas Workspace
    GIVEN an empty form builder workspace
    WHEN the system initializes the create form state
    THEN the canvas array must be empty
    AND the operational mode must be set to "create"
    AND the UI must display the pristine four-column layout workspace
END TEST CASE

TEST CASE 2: Structural Insert of First Component via Palette Drag
    GIVEN an active empty canvas workspace
    AND a "Text Field" component located in the left palette input components category
    WHEN the user drags and drops the text field onto the canvas
    THEN the drop event must trigger a structural insert routine
    AND a unique UUID must be generated for the component
    AND the component object must be appended to the canvas data array
    AND the properties panel must bind to the newly created component
END TEST CASE

TEST CASE 3: Property Configuration via Properties Panel
    GIVEN a text field component present on the canvas
    AND the properties panel actively displaying its attributes
    WHEN the user updates the label field from "Text Field" to "Patient Name"
    THEN the single-source-of-truth state array must update the label property immutably
    AND the canvas view must instantly re-render the updated string
END TEST CASE

TEST CASE 4: Dynamic Row Generation via Side Threshold Drop
    GIVEN a canvas containing the "Patient Name" text field component
    AND the user dragging a "Date of Birth" text field component
    WHEN the user drops the "Date of Birth" component onto the outer 30% horizontal boundary of the "Patient Name" component
    THEN the layout engine must evaluate X-axis bounds first
    AND return a drop command of type "SIDE"
    THEN the mutation engine must generate a new "horizontal_layout" container wrapper
    AND push both text field components into the container sub-arrays
    AND update the state array immutably
END TEST CASE

TEST CASE 5: Iterative Form Assembly Completion
    GIVEN an active form builder workspace with partially assembled components
    WHEN the user continuously executes palette inserts and canvas arrangements
    THEN the state machine must maintain structural integrity and static array lengths during failed boundary drops
    AND persist the exact component sequences until schema export is explicitly triggered
END TEST CASE