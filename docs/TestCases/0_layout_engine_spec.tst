FUNCTION calculateDropPosition(boundingBox, cursorX, cursorY, isTopLevel, currentIndex):
    // Top-Level Lockout Rule for nested components
    IF NOT isTopLevel THEN
        // Evaluate 50% midpoint for reordering inside a row
        isLeftHalf = cursorX < (boundingBox.width / 2)
        IF isLeftHalf THEN
            RETURN { type: "COLUMN_BETWEEN", direction: "left", targetColumnIndex: currentIndex }
        ELSE
            RETURN { type: "COLUMN_BETWEEN", direction: "right", targetColumnIndex: currentIndex }
        END IF
    END IF

    // Top-Level Canvas Rule: Check outer 30% horizontal bounds first (Precedence)
    leftThreshold = boundingBox.width * 0.30
    rightThreshold = boundingBox.width * 0.70

    IF cursorX < leftThreshold THEN
        RETURN { type: "SIDE", position: "left", targetIndex: currentIndex }
    END IF
    
    IF cursorX > rightThreshold THEN
        RETURN { type: "SIDE", position: "right", targetIndex: currentIndex }
    END IF

    // Vertical Y-Axis Fallback for vertical linear layout
    verticalMidpoint = boundingBox.height / 2
    isTopHalf = cursorY < verticalMidpoint

    IF isTopHalf THEN
        RETURN { type: "BETWEEN", targetIndex: currentIndex }
    ELSE
        RETURN { type: "BETWEEN", targetIndex: currentIndex + 1 }
    END IF
ENDFUNCTION

FUNCTION executeLayoutMutation(activeCanvas, draggedComponent, dropCommand):
    // Abort mutation if drop is invalid or coordinates do not match operational zones
    IF dropCommand.type == "INVALID_DROP_ZONE" THEN
        RETURN activeCanvas
    END IF

    // Canvas-to-Canvas Repositions (Reorder)
    IF dropCommand.type == "BETWEEN" THEN
        EXTRACT draggedComponent FROM activeCanvas
        INSERT draggedComponent INTO activeCanvas AT index = dropCommand.targetIndex
        RETURN activeCanvas
    END IF

    // Dynamic Row Creation (SIDE drop)
    IF dropCommand.type == "SIDE" THEN
        EXTRACT targetComponent FROM activeCanvas AT index = dropCommand.targetIndex
        CREATE NEW container OF TYPE "horizontal_layout"
        INSERT targetComponent AND draggedComponent INTO container SUB_ARRAYS
        REPLACE targetComponent IN activeCanvas WITH container
        RETURN activeCanvas
    END IF

    // Nested Column Repositioning
    IF dropCommand.type == "COLUMN_BETWEEN" THEN
        EXTRACT draggedComponent FROM CURRENT row
        INSERT draggedComponent INTO target column SUBSYSTEM AT index = dropCommand.targetColumnIndex
        RETURN activeCanvas
    END IF
ENDFUNCTION

FUNCTION evaluateRowDissolution(columnSubArrays):
    totalFieldsCount = 0
    survivingField = NULL

    FOR EACH column IN columnSubArrays DO
        totalFieldsCount = totalFieldsCount + LENGTH(column.fields)
        IF LENGTH(column.fields) == 1 AND survivingField IS NULL THEN
            survivingField = column.fields[0]
        END IF
    END FOR

    // Garbage Collection Circuit Breaker
    IF totalFieldsCount <= 1 THEN
        RETURN { dissolve: TRUE, promote: survivingField }
    ELSE
        RETURN { dissolve: FALSE }
    END IF
ENDFUNCTION