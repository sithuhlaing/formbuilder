import React, { useState, useEffect } from "react";
import { FormBuilder, FormPage } from "./features/form-builder";

interface SavedForm {
  id: string;
  title: string;
  pages: FormPage[];
  updatedAt: string;
}

const STORAGE_KEY = "fb.local_forms_db";

const defaultMockForms: SavedForm[] = [
  {
    id: "mock-1",
    title: "NHS Clinical Patient Intake",
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: "page-1",
        name: "Page 1",
        items: [
          {
            nodeId: "node-1",
            type: "heading",
            label: "Patient Intake Form",
            fieldId: "heading_intake",
            required: false,
            validation: [],
            properties: { text: "Patient Intake Form", level: "h2" },
          },
          {
            nodeId: "node-2",
            type: "text_input",
            label: "Full Name",
            fieldId: "text_name",
            required: true,
            validation: [],
            properties: { label: "Full Name", placeholder: "e.g. John Doe" },
          },
          {
            nodeId: "node-3",
            type: "email_input",
            label: "Email Address",
            fieldId: "email_address",
            required: true,
            validation: [],
            properties: { label: "Email Address", placeholder: "e.g. john@example.com" },
          },
          {
            nodeId: "node-4",
            type: "nhs_number",
            label: "NHS Number",
            fieldId: "nhs_num",
            required: false,
            validation: [],
            properties: { label: "NHS Number", placeholder: "000 000 0000" },
          },
        ],
      },
    ],
  },
  {
    id: "mock-2",
    title: "Clinic Experience Feedback",
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: "page-f-1",
        name: "Feedback Page",
        items: [
          {
            nodeId: "node-f-1",
            type: "heading",
            label: "Clinic Experience Feedback",
            fieldId: "heading_feedback",
            required: false,
            validation: [],
            properties: { text: "Clinic Experience Feedback", level: "h2" },
          },
          {
            nodeId: "node-f-2",
            type: "radio_group",
            label: "Rate your experience",
            fieldId: "experience_rating",
            required: true,
            validation: [],
            properties: {
              label: "Overall Experience Rating",
              options: ["Excellent", "Good", "Satisfactory", "Poor"],
            },
          },
        ],
      },
    ],
  },
];

function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "builder">("dashboard");
  const [formsList, setFormsList] = useState<SavedForm[]>([]);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("My Questionnaire Form");
  const [pages, setPages] = useState<FormPage[]>([{ id: "page-1", name: "Page 1", items: [] }]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setFormsList(JSON.parse(raw));
      } catch (e) {
        setFormsList(defaultMockForms);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockForms));
      setFormsList(defaultMockForms);
    }
  }, []);

  const handleCreateNewForm = () => {
    setCurrentFormId(`form-${Date.now()}`);
    setFormTitle("New Patient Intake Form");
    setPages([{ id: `p-${Date.now()}`, name: "Page 1", items: [] }]);
    setCurrentView("builder");
  };

  const handleOpenForm = (form: SavedForm) => {
    setCurrentFormId(form.id);
    setFormTitle(form.title);
    setPages(JSON.parse(JSON.stringify(form.pages)));
    setCurrentView("builder");
  };

  const handleDeleteForm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template form permanently?")) return;

    const updated = formsList.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFormsList(updated);
  };

  const handleSaveFromBuilder = ({ title, pages: updatedPages }: { title: string; pages: FormPage[] }) => {
    if (!currentFormId) return;

    const savedItem: SavedForm = {
      id: currentFormId,
      title: title || "Untitled Form",
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    const index = formsList.findIndex((f) => f.id === currentFormId);
    let updated: SavedForm[] = [];
    if (index === -1) {
      updated = [savedItem, ...formsList];
    } else {
      updated = [...formsList];
      updated[index] = savedItem;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFormsList(updated);
    setFormTitle(title);
    setPages(updatedPages);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {currentView === "dashboard" ? (
        <div className="flex-1 overflow-y-auto bg-[#f0f4f5] flex flex-col">
          <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-16 bg-[#005eb8] text-white font-bold text-lg tracking-wider">
                NHS
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#212b32]">Visual Form Builder</h1>
                <p className="text-sm text-gray-600">Draft NHS standard visual questionnaire templates instantly</p>
              </div>
            </div>
            <button
              onClick={handleCreateNewForm}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#005eb8] hover:bg-[#003087] rounded-md transition-all shadow-sm hover:shadow"
            >
              ➕ Create New Form
            </button>
          </header>

          <main className="max-w-7xl mx-auto w-full px-8 py-10 flex-1 flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-[#212b32] uppercase tracking-wide">
              My Saved Templates ({formsList.length})
            </h2>

            {formsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formsList.map((form) => {
                  const totalFields = form.pages.reduce((acc, p) => acc + p.items.length, 0);
                  return (
                    <div
                      key={form.id}
                      onClick={() => handleOpenForm(form)}
                      className="group bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-[#005eb8] transition-all duration-200 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-md bg-blue-50 text-[#005eb8] flex items-center justify-center text-xl font-bold group-hover:bg-[#005eb8] group-hover:text-white transition-all">
                          📋
                        </div>
                        <button
                          onClick={(e) => handleDeleteForm(e, form.id)}
                          className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete template"
                        >
                          🗑️
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#212b32] group-hover:text-[#005eb8] transition-colors line-clamp-1">
                          {form.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Modified: {new Date(form.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-4 pt-3 border-t border-gray-100 text-xs text-[#212b32] font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>📄</span> {form.pages.length} {form.pages.length === 1 ? "Page" : "Pages"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>⚙️</span> {totalFields} {totalFields === 1 ? "Field" : "Fields"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 bg-white rounded-lg border border-dashed border-gray-300 text-center gap-4">
                <span className="text-5xl">📁</span>
                <div>
                  <h3 className="text-lg font-bold text-[#212b32]">No Saved Forms Found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a form template or upload a layout schema JSON to get started.
                  </p>
                </div>
                <button
                  onClick={handleCreateNewForm}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#005eb8] hover:bg-[#003087] rounded-md shadow-sm transition-colors"
                >
                  Create Your First Form
                </button>
              </div>
            )}
          </main>
        </div>
      ) : (
        <FormBuilder
          initialTitle={formTitle}
          initialPages={pages}
          onBack={() => setCurrentView("dashboard")}
          onSave={handleSaveFromBuilder}
        />
      )}
    </div>
  );
}

export default App;
