"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ButtonRenderer from "./renderers/ButtonRenderer";
import CardRenderer from "./renderers/CardRenderer";
import CheckboxRenderer from "./renderers/CheckboxRenderer";
import DatePickerRenderer from "./renderers/DatePickerRenderer";
import DefaultRenderer from "./renderers/DefaultRenderer";
import EmailInputRenderer from "./renderers/EmailInputRenderer";
import FileUploadRenderer from "./renderers/FileUploadRenderer";
import HeadingRenderer from "./renderers/HeadingRenderer";
import HorizontalLayoutRenderer from "./renderers/HorizontalLayoutRenderer";
import MultiSelectRenderer from "./renderers/MultiSelectRenderer";
import NumberInputRenderer from "./renderers/NumberInputRenderer";
import PasswordInputRenderer from "./renderers/PasswordInputRenderer";
import RadioGroupRenderer from "./renderers/RadioGroupRenderer";
import RichTextRenderer from "./renderers/RichTextRenderer";
import SectionDividerRenderer from "./renderers/SectionDividerRenderer";
import SelectRenderer from "./renderers/SelectRenderer";
import SignatureRenderer from "./renderers/SignatureRenderer";
import TextAreaRenderer from "./renderers/TextAreaRenderer";
import TextInputRenderer from "./renderers/TextInputRenderer";
import VerticalLayoutRenderer from "./renderers/VerticalLayoutRenderer";
import {
  ComponentKind,
  FormComponent,
  FormNode,
  RowContainer,
  isRowContainer,
} from "@/types/form";

const MAX_ROW_CHILDREN = 4;

type DragPayload =
  | { source: "palette"; component: any }
  | { source: "canvas"; nodeId: string };

type DropPosition = "before" | "after" | "left" | "right" | "center";

type DropIndicator =
  | { targetId: string; position: DropPosition; parentRowId?: string }
  | { targetRowId: string; position: "append" };

const componentRenderers: Record<ComponentKind, React.ComponentType<any>> = {
  text_input: TextInputRenderer,
  email_input: EmailInputRenderer,
  password_input: PasswordInputRenderer,
  number_input: NumberInputRenderer,
  textarea: TextAreaRenderer,
  rich_text: RichTextRenderer,
  select: SelectRenderer,
  multi_select: MultiSelectRenderer,
  checkbox: CheckboxRenderer,
  radio_group: RadioGroupRenderer,
  date_picker: DatePickerRenderer,
  file_upload: FileUploadRenderer,
  signature: SignatureRenderer,
  section_divider: SectionDividerRenderer,
  button: ButtonRenderer,
  heading: HeadingRenderer,
  card: CardRenderer,
  patient_id: TextInputRenderer,
  medical_record_number: TextInputRenderer,
  insurance_member_number: TextInputRenderer,
  nhs_number: TextInputRenderer,
};

interface CanvasProps {
  selectedComponent: FormComponent | null;
  setSelectedComponent: (component: FormComponent | null) => void;
}

const randomId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `node_${Math.random().toString(36).slice(2, 9)}`;

const normaliseLabel = (input: string) =>
  input
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const createComponentFromPalette = (paletteComponent: any): FormComponent => {
  const nodeId = randomId();
  const label =
    paletteComponent.properties?.label ??
    paletteComponent.label ??
    normaliseLabel(paletteComponent.type);

  return {
    nodeId,
    type: paletteComponent.type as ComponentKind,
    label,
    fieldId:
      paletteComponent.properties?.fieldId ??
      `${paletteComponent.type}_${nodeId.slice(0, 6)}`,
    required: paletteComponent.properties?.required ?? false,
    validation: paletteComponent.properties?.validation ?? [],
    properties: paletteComponent.properties ?? {},
  };
};

const cleanupRows = (nodes: FormNode[]): FormNode[] =>
  nodes.flatMap((node) => {
    if (isRowContainer(node)) {
      const cleanedChildren = cleanupRows(node.children);
      if (cleanedChildren.length <= 1) {
        return cleanedChildren;
      }
      return [
        {
          ...node,
          children: cleanedChildren,
        },
      ];
    }
    return [node];
  });

const removeNodeById = (
  nodes: FormNode[],
  nodeId: string,
): { nodes: FormNode[]; removed?: FormNode } => {
  let removed: FormNode | undefined;

  const filtered = nodes
    .map((node) => {
      if (node.nodeId === nodeId) {
        removed = node;
        return null;
      }

      if (isRowContainer(node)) {
        const result = removeNodeById(node.children, nodeId);
        if (result.removed) {
          removed = result.removed;
          return {
            ...node,
            children: result.nodes,
          } as FormNode;
        }
      }

      return node;
    })
    .filter(Boolean) as FormNode[];

  return { nodes: cleanupRows(filtered), removed };
};

const insertBeforeOrAfter = (
  nodes: FormNode[],
  targetId: string,
  newNode: FormNode,
  position: "before" | "after",
): { nodes: FormNode[]; inserted: boolean } => {
  let inserted = false;
  const next = nodes.flatMap<FormNode>((node) => {
    if (node.nodeId === targetId) {
      inserted = true;
      if (position === "before") {
        return [newNode, node];
      }
      return [node, newNode];
    }

    if (isRowContainer(node)) {
      const result = insertBeforeOrAfter(
        node.children,
        targetId,
        newNode,
        position,
      );
      if (result.inserted) {
        inserted = true;
        return [
          {
            ...node,
            children: result.nodes,
          },
        ];
      }
    }

    return [node];
  });

  return { nodes: cleanupRows(next), inserted };
};

const insertIntoRow = (
  nodes: FormNode[],
  rowId: string,
  referenceChildId: string | null,
  newNode: FormNode,
  position: "left" | "right" | "append",
): { nodes: FormNode[]; inserted: boolean; error?: string } => {
  let inserted = false;
  let error: string | undefined;

  const next = nodes.map<FormNode>((node) => {
    if (!isRowContainer(node)) {
      return node;
    }

    if (node.nodeId === rowId) {
      if (node.children.length >= MAX_ROW_CHILDREN) {
        inserted = true;
        error = "Rows support a maximum of four components.";
        return node;
      }

      const updatedChildren = [...node.children];

      if (position === "append") {
        updatedChildren.push(newNode);
      } else {
        const index = referenceChildId
          ? updatedChildren.findIndex((child) => child.nodeId === referenceChildId)
          : updatedChildren.length - 1;

        if (index === -1) {
          updatedChildren.push(newNode);
        } else {
          const insertIndex = position === "left" ? index : index + 1;
          updatedChildren.splice(insertIndex, 0, newNode);
        }
      }

      inserted = true;
      return {
        ...node,
        children: updatedChildren,
      };
    }

    const result = insertIntoRow(
      node.children,
      rowId,
      referenceChildId,
      newNode,
      position,
    );
    if (result.inserted) {
      inserted = true;
      error = result.error;
      return {
        ...node,
        children: result.nodes,
      };
    }
    return node;
  });

  return { nodes: cleanupRows(next), inserted, error };
};

const createRow = (
  targetNode: FormNode,
  newNode: FormNode,
  side: "left" | "right",
): RowContainer => {
  const children =
    side === "left" ? [newNode, targetNode] : [targetNode, newNode];

  return {
    nodeId: randomId(),
    type: "row",
    children,
  };
};

const findNodeById = (nodes: FormNode[], nodeId: string): FormNode | undefined => {
  for (const node of nodes) {
    if (node.nodeId === nodeId) {
      return node;
    }

    if (isRowContainer(node)) {
      const child = findNodeById(node.children, nodeId);
      if (child) {
        return child;
      }
    }
  }

  return undefined;
};

const replaceNode = (
  nodes: FormNode[],
  targetId: string,
  replacement: FormNode,
): FormNode[] =>
  nodes.map<FormNode>((node) => {
    if (node.nodeId === targetId) {
      return replacement;
    }
    if (isRowContainer(node)) {
      return {
        ...node,
        children: replaceNode(node.children, targetId, replacement),
      };
    }
    return node;
  });

const findParentRowId = (
  nodes: FormNode[],
  nodeId: string,
): string | undefined => {
  for (const node of nodes) {
    if (isRowContainer(node)) {
      if (node.children.some((child) => child.nodeId === nodeId)) {
        return node.nodeId;
      }
      const nested = findParentRowId(node.children, nodeId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
};

const getComponentRenderer = (component: FormComponent | RowContainer) => {
  if (isRowContainer(component)) {
    return HorizontalLayoutRenderer;
  }

  return componentRenderers[component.type] ?? DefaultRenderer;
};

const Canvas: React.FC<CanvasProps> = ({
  selectedComponent,
  setSelectedComponent,
}) => {
  const [nodes, setNodes] = useState<FormNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedComponent || !selectedNodeId) return;

    setNodes((current) =>
      current.map<FormNode>((node) => {
        if (node.nodeId === selectedNodeId && !isRowContainer(node)) {
          return {
            ...(node as FormComponent),
            ...selectedComponent,
          };
        }

        if (isRowContainer(node)) {
          return {
            ...node,
            children: (node.children as FormNode[]).map((child) => {
              if (child.nodeId === selectedNodeId && !isRowContainer(child)) {
                return {
                  ...(child as FormComponent),
                  ...selectedComponent,
                };
              }
              return child;
            }),
          };
        }

        return node;
      }),
    );
  }, [selectedComponent, selectedNodeId]);

  const handleSelection = useCallback(
    (component: FormComponent) => {
      setSelectedNodeId(component.nodeId);
      setSelectedComponent(component);
    },
    [setSelectedComponent],
  );

  const parseDragPayload = (data: string): DragPayload | null => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to parse drag data", error);
      return null;
    }
  };

  const computeDropPosition = (
    event: React.DragEvent<HTMLElement>,
  ): DropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const verticalFraction = offsetY / rect.height;
    const horizontalFraction = offsetX / rect.width;

    if (verticalFraction < 0.3) return "before";
    if (verticalFraction > 0.7) return "after";
    if (horizontalFraction < 0.25) return "left";
    if (horizontalFraction > 0.75) return "right";
    return "center";
  };

  const handleDragOverComponent = (
    event: React.DragEvent<HTMLDivElement>,
    node: FormNode,
  ) => {
    event.preventDefault();
    if (isRowContainer(node)) {
      setDropIndicator({ targetRowId: node.nodeId, position: "append" });
      return;
    }

    const position = computeDropPosition(event);
    const parentRowId = findParentRowId(nodes, node.nodeId);
    setDropIndicator({
      targetId: node.nodeId,
      position,
      parentRowId,
    });
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const payload = parseDragPayload(
      event.dataTransfer.getData("application/json"),
    );
    if (!payload) return;

    let workingNodes = [...nodes];
    let movingNode: FormNode | undefined;

    if (payload.source === "canvas") {
      const removalResult = removeNodeById(workingNodes, payload.nodeId);
      workingNodes = removalResult.nodes;
      movingNode = removalResult.removed;
      if (!movingNode) return;
    }

    if (payload.source === "palette") {
      const paletteComponent = payload.component;
      if (paletteComponent.type === "horizontal_layout") {
        setErrorMessage(
          "Horizontal layouts are created automatically. Drop a field to the left or right of another field.",
        );
        return;
      }
      if (paletteComponent.type === "vertical_layout") {
        setErrorMessage(
          "Vertical layouts are handled automatically. Drop components between other items to stack them.",
        );
        return;
      }
      movingNode = createComponentFromPalette(paletteComponent);
    }

    if (!movingNode) return;

    const indicator = dropIndicator;
    let resultNodes = workingNodes;
    let error: string | undefined;

    if (!indicator) {
      resultNodes = [...workingNodes, movingNode];
    } else if ("targetId" in indicator) {
      if (indicator.position === "before" || indicator.position === "after") {
        const insertResult = insertBeforeOrAfter(
          workingNodes,
          indicator.targetId,
          movingNode,
          indicator.position,
        );
        if (!insertResult.inserted) {
          resultNodes = [...workingNodes, movingNode];
        } else {
          resultNodes = insertResult.nodes;
        }
      } else if (indicator.position === "left" || indicator.position === "right") {
        if (indicator.parentRowId) {
          const insertResult = insertIntoRow(
            workingNodes,
            indicator.parentRowId,
            indicator.targetId,
            movingNode,
            indicator.position,
          );
          resultNodes = insertResult.nodes;
          error = insertResult.error;
        } else {
          const target = findNodeById(nodes, indicator.targetId);
          if (target && !isRowContainer(target)) {
            const row = createRow(target, movingNode, indicator.position);
            resultNodes = replaceNode(workingNodes, target.nodeId, row);
          } else {
            resultNodes = [...workingNodes, movingNode];
          }
        }
      } else {
        const insertResult = insertBeforeOrAfter(
          workingNodes,
          indicator.targetId,
          movingNode,
          "after",
        );
        resultNodes = insertResult.nodes;
      }
    } else if ("targetRowId" in indicator) {
      const insertResult = insertIntoRow(
        workingNodes,
        indicator.targetRowId,
        null,
        movingNode,
        "append",
      );
      resultNodes = insertResult.nodes;
      error = insertResult.error;
    }

    if (error) {
      setErrorMessage(error);
      return;
    }

    const cleaned = cleanupRows(resultNodes);
    setNodes(cleaned);
    setDropIndicator(null);
    setErrorMessage(null);

    const newlySelected =
      movingNode && !isRowContainer(movingNode)
        ? (movingNode as FormComponent)
        : null;

    if (newlySelected) {
      handleSelection(newlySelected);
    } else {
      setSelectedNodeId(null);
      setSelectedComponent(null);
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source: "canvas", nodeId }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDropIndicator(null);
    handleDrop(event);
  };

  const renderComponentNode = (node: FormNode) => {
    if (isRowContainer(node)) {
      const Renderer = HorizontalLayoutRenderer;
      const appendIndicator =
        dropIndicator &&
        "targetRowId" in dropIndicator &&
        dropIndicator.targetRowId === node.nodeId;

      return (
        <div
          key={node.nodeId}
          className={`mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 ${appendIndicator ? "ring-2 ring-blue-400" : ""}`}
          onDragOver={(event) => handleDragOverComponent(event, node)}
          onDragLeave={handleDragLeave}
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500">
            Row Layout
            <span>
              {node.children.length}/{MAX_ROW_CHILDREN}
            </span>
          </div>
          <Renderer component={{ columns: node.children }}>
            {node.children.map((child) =>
              renderRowChild(child, node.nodeId),
            )}
          </Renderer>
        </div>
      );
    }

    const Renderer = getComponentRenderer(node) ?? DefaultRenderer;
    const isSelected = selectedNodeId === node.nodeId;
    const dropBefore =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "before";
    const dropAfter =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "after";
    const dropLeft =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "left";
    const dropRight =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "right";

    return (
      <div
        key={node.nodeId}
        draggable
        onDragStart={(event) => handleDragStart(event, node.nodeId)}
        onDragOver={(event) => handleDragOverComponent(event, node)}
        onDragLeave={handleDragLeave}
        onClick={() => handleSelection(node as FormComponent)}
        className={`relative mb-3 rounded-lg border border-transparent bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        {dropBefore && (
          <div className="absolute inset-x-0 -top-2 h-1 rounded-full bg-blue-500" />
        )}
        {dropAfter && (
          <div className="absolute inset-x-0 -bottom-2 h-1 rounded-full bg-blue-500" />
        )}
        {dropLeft && (
          <div className="absolute -left-2 inset-y-0 w-1 rounded-full bg-blue-500" />
        )}
        {dropRight && (
          <div className="absolute -right-2 inset-y-0 w-1 rounded-full bg-blue-500" />
        )}
        <Renderer component={node} />
      </div>
    );
  };

  const renderRowChild = (node: FormNode, parentRowId: string) => {
    if (isRowContainer(node)) {
      return null;
    }

    const Renderer = getComponentRenderer(node);
    const isSelected = selectedNodeId === node.nodeId;
    const dropBefore =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "left";
    const dropAfter =
      dropIndicator &&
      "targetId" in dropIndicator &&
      dropIndicator.targetId === node.nodeId &&
      dropIndicator.position === "right";

    return (
      <div
        key={node.nodeId}
        draggable
        onDragStart={(event) => handleDragStart(event, node.nodeId)}
        onDragOver={(event) => handleDragOverComponent(event, node)}
        onDragLeave={handleDragLeave}
        onClick={() => handleSelection(node as FormComponent)}
        className={`relative w-full flex-1 rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg ${
          isSelected ? "ring-2 ring-cyan-400" : ""
        }`}
      >
        {dropBefore && (
          <div className="absolute inset-y-0 -left-2 w-1 rounded-full bg-cyan-400" />
        )}
        {dropAfter && (
          <div className="absolute inset-y-0 -right-2 w-1 rounded-full bg-cyan-400" />
        )}
        <Renderer component={node} />
      </div>
    );
  };

  const renderedNodes = useMemo(
    () => nodes.map((node) => renderComponentNode(node)),
    [nodes, dropIndicator, selectedNodeId],
  );

  return (
    <div
      className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-6"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <div className="min-h-full rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
            {errorMessage}
          </div>
        )}
        {renderedNodes.length > 0 ? (
          renderedNodes
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center text-sky-500">
            <div className="rounded-full bg-cyan-100 p-4 text-3xl text-cyan-600">🧩</div>
            <p className="text-lg font-semibold text-sky-800">Drop components to begin</p>
            <p className="max-w-md text-sm text-sky-600">
              Drag fields from the component library on the left. Drop near another field to build a responsive row automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
