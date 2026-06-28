import React, { useState, useRef, useEffect } from "react";
import Canvas from "../../../app/components/canvas";
import LeftPanel from "../../../app/components/left-panel";
import RightPanel from "../../../app/components/right-panel";
import ConfirmationModal from "../../../app/components/ConfirmationModal";
import NotificationModal from "../../../app/components/NotificationModal";
import { FormNode, FormComponent } from "../../../types/form";

export interface FormPage {
  id: string;
  name: string;
  items: FormNode[];
}

export interface FormBuilderProps {
  initialTitle?: string;
  initialPages?: FormPage[];
  onSave?: (data: { title: string; pages: FormPage[] }) => void;
  onBack?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialTitle = "My Questionnaire Form",
  initialPages = [{ id: "page-1", name: "Page 1", items: [] }],
  onSave,
  onBack,
}) => {
  const [formTitle, setFormTitle] = useState<string>(initialTitle);
  const [pages, setPages] = useState<FormPage[]>(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const requestConfirm = React.useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "info" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showNotification = React.useCallback(
    (title: string, message: string, type: "success" | "info" | "error" = "success") => {
      setNotification({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    []
  );

  const setNodesForCurrentPage = (
    newNodes: FormNode[] | ((prev: FormNode[]) => FormNode[])
  ) => {
    setPages((prev) => {
      const updated = prev.map((p, idx) => {
        if (idx === currentPageIndex) {
          const resolved = typeof newNodes === "function" ? newNodes(p.items) : newNodes;
          return { ...p, items: resolved };
        }
        return p;
      });

      // Multi-Page Auto-Deletion Garbage Collection
      const currentPage = updated[currentPageIndex];
      if (currentPage && currentPage.items.length === 0 && updated.length > 1) {
        const filtered = updated.filter((_, idx) => idx !== currentPageIndex);
        const reindexed = filtered.map((page, idx) => ({
          ...page,
          name: `Page ${idx + 1}`,
        }));
        const newIndex = Math.max(0, currentPageIndex - 1);
        setCurrentPageIndex(newIndex);
        return reindexed;
      }

      return updated;
    });
  };

  const handleAddPage = () => {
    const currentPage = pages[currentPageIndex];
    if (currentPage && currentPage.items.length === 0) {
      showNotification("Cannot Add Page", "Cannot add a new page while the current page is empty.", "info");
      return;
    }

    const newPage: FormPage = {
      id: `p-${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      items: [],
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      showNotification("Cannot Delete Page", "A form must contain at least one page layout.", "info");
      return;
    }

    requestConfirm(
      "Delete Page",
      "Are you sure you want to delete this page and all components inside it? This action cannot be undone.",
      () => {
        const filtered = pages.filter((_, idx) => idx !== index);
        const reindexed = filtered.map((page, idx) => ({
          ...page,
          name: `Page ${idx + 1}`,
        }));
        setPages(reindexed);

        if (currentPageIndex >= reindexed.length) {
          setCurrentPageIndex(reindexed.length - 1);
        }
        setSelectedComponent(null);
      }
    );
  };

  const handleRenamePage = (index: number, newName: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newName || `Page ${idx + 1}` } : p))
    );
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && typeof parsed === "object") {
          if (parsed.title) setFormTitle(parsed.title);
          const schemaPages = parsed.pages || [
            { id: "p-imported", name: "Page 1", items: parsed.schema || parsed },
          ];
          if (Array.isArray(schemaPages)) {
            setPages(schemaPages);
            setCurrentPageIndex(0);
            setSelectedComponent(null);
          } else {
            showNotification("Import Failed", "Invalid page schemas array structure.", "error");
          }
        }
      } catch (err) {
        showNotification("Import Failed", "Failed to parse JSON file: invalid format.", "error");
      }
    };
    fileReader.readAsText(file);
    event.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            title: formTitle,
            pages,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${formTitle.toLowerCase().replace(/\s+/g, "_")}_schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveForm = () => {
    if (onSave) {
      onSave({
        title: formTitle,
        pages,
      });
      showNotification("Form Saved", `Form "${formTitle}" has been saved successfully.`, "success");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        className="hidden"
        accept=".json"
      />

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
            >
              ← Back
            </button>
          )}
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            disabled={previewMode}
            className="text-lg font-bold text-gray-900 focus:outline-none border-b-2 border-transparent focus:border-[#005eb8] pb-0.5 px-1 rounded-sm transition-colors w-64 md:w-80"
            placeholder="Form Title"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <button
            onClick={() => {
              setPreviewMode(!previewMode);
              setSelectedComponent(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border transition-all shadow-sm ${
              previewMode
                ? "bg-[#212b32] text-white border-[#212b32]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {previewMode ? "✏️ Edit Mode" : "👁️ Preview Mode"}
          </button>

          <button
            onClick={triggerFileInput}
            disabled={previewMode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#005eb8] bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors shadow-sm disabled:opacity-50"
          >
            📥 Import JSON
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors shadow-sm"
          >
            📤 Export JSON
          </button>
          <button
            onClick={handleSaveForm}
            disabled={previewMode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#005eb8] hover:bg-[#003087] rounded-md transition-all shadow-sm disabled:opacity-50"
          >
            💾 Save Form
          </button>
        </div>
      </header>

      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`group flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                index === currentPageIndex
                  ? "bg-blue-50 text-[#005eb8] ring-1 ring-blue-100"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <button
                onClick={() => {
                  setCurrentPageIndex(index);
                  setSelectedComponent(null);
                }}
                className="focus:outline-none"
              >
                {index === currentPageIndex && !previewMode ? (
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => handleRenamePage(index, e.target.value)}
                    className="bg-transparent font-bold border-b border-blue-400 focus:outline-none w-20 text-center"
                  />
                ) : (
                  <span>{page.name}</span>
                )}
              </button>
              {pages.length > 1 && !previewMode && (
                <button
                  onClick={() => handleDeletePage(index)}
                  className="text-gray-400 hover:text-red-500 rounded p-0.5 hover:bg-red-50 transition-colors"
                  title="Delete Page"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!previewMode && (
            <button
              onClick={handleAddPage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md border border-dashed border-gray-300 transition-colors"
            >
              ➕ Add Page
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-medium hidden md:block">
          Currently Editing: {pages[currentPageIndex]?.name} • {pages[currentPageIndex]?.items.length || 0} fields
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <LeftPanel />}

        <Canvas
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
          nodes={pages[currentPageIndex]?.items || []}
          setNodes={setNodesForCurrentPage}
          previewMode={previewMode}
          requestConfirm={requestConfirm}
        />

        {!previewMode && (
          <RightPanel
            selectedComponent={selectedComponent}
            setSelectedComponent={setSelectedComponent}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
