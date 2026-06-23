import React, { useState, useEffect, useRef } from 'react';
import Canvas from './app/components/canvas';
import LeftPanel from './app/components/left-panel';
import RightPanel from './app/components/right-panel';
import { FormNode, FormComponent } from './types/form';

interface FormPage {
  id: string;
  name: string;
  items: FormNode[];
}

interface SavedForm {
  id: string;
  title: string;
  pages: FormPage[];
  updatedAt: string;
}

const STORAGE_KEY = 'fb.local_forms_db';

const defaultMockForms: SavedForm[] = [
  {
    id: 'mock-1',
    title: 'NHS Clinical Patient Intake',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pages: [
      {
        id: 'p-1',
        name: 'Patient Info',
        items: [
          {
            nodeId: 'node-1',
            type: 'heading',
            label: 'Patient Demographics',
            fieldId: 'heading_1',
            required: false,
            validation: [],
            properties: { text: 'Patient Intake Registration', level: 'h2' }
          },
          {
            nodeId: 'node-2',
            type: 'text_input',
            label: 'Full Name',
            fieldId: 'patient_name',
            required: true,
            validation: [{ type: 'required', message: 'Name is required' }],
            properties: { label: 'Full Name', placeholder: 'Enter patient full name' }
          },
          {
            nodeId: 'node-3',
            type: 'email_input',
            label: 'Email Address',
            fieldId: 'patient_email',
            required: true,
            validation: [{ type: 'required', message: 'Email is required' }],
            properties: { label: 'Email Address', placeholder: 'name@example.nhs.uk' }
          }
        ]
      },
      {
        id: 'p-2',
        name: 'Medical Details',
        items: [
          {
            nodeId: 'node-4',
            type: 'nhs_number',
            label: 'NHS Number',
            fieldId: 'nhs_number',
            required: true,
            validation: [],
            properties: { label: 'NHS Identifier Number', placeholder: '000 000 0000' }
          },
          {
            nodeId: 'node-5',
            type: 'textarea',
            label: 'Known Allergies',
            fieldId: 'allergies_list',
            required: false,
            validation: [],
            properties: { label: 'Known Allergies & Medical Contraindications', placeholder: 'None' }
          }
        ]
      }
    ]
  },
  {
    id: 'mock-2',
    title: 'General Health & Feedback Survey',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    pages: [
      {
        id: 'p-feedback-1',
        name: 'Feedback',
        items: [
          {
            nodeId: 'node-f-1',
            type: 'heading',
            label: 'Clinic Experience Feedback',
            fieldId: 'heading_feedback',
            required: false,
            validation: [],
            properties: { text: 'Clinic Experience Feedback', level: 'h2' }
          },
          {
            nodeId: 'node-f-2',
            type: 'radio_group',
            label: 'Rate your experience',
            fieldId: 'experience_rating',
            required: true,
            validation: [],
            properties: {
              label: 'Overall Experience Rating',
              options: ['Excellent', 'Good', 'Satisfactory', 'Poor']
            }
          }
        ]
      }
    ]
  }
];

function App() {
  // Navigation & Core States
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');
  const [formsList, setFormsList] = useState<SavedForm[]>([]);
  
  // Editor Session States
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('My Questionnaire Form');
  const [pages, setPages] = useState<FormPage[]>([{ id: 'page-1', name: 'Page 1', items: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  // Workspace UI States
  const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Forms List on Startup
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

  // Update specific page nodes inside the page array
  const setNodesForCurrentPage = (newNodes: FormNode[] | ((prev: FormNode[]) => FormNode[])) => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx === currentPageIndex) {
          const resolved = typeof newNodes === 'function' ? newNodes(p.items) : newNodes;
          return { ...p, items: resolved };
        }
        return p;
      })
    );
  };

  // Create clean blank form session
  const handleCreateNewForm = () => {
    setCurrentFormId(`form-${Date.now()}`);
    setFormTitle('New Patient Intake Form');
    setPages([{ id: `p-${Date.now()}`, name: 'Page 1', items: [] }]);
    setCurrentPageIndex(0);
    setSelectedComponent(null);
    setPreviewMode(false);
    setCurrentView('builder');
  };

  // Open an existing form in the editor
  const handleOpenForm = (form: SavedForm) => {
    setCurrentFormId(form.id);
    setFormTitle(form.title);
    setPages(JSON.parse(JSON.stringify(form.pages)));
    setCurrentPageIndex(0);
    setSelectedComponent(null);
    setPreviewMode(false);
    setCurrentView('builder');
  };

  // Delete a form from local storage
  const handleDeleteForm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this template form permanently?')) return;
    
    const updated = formsList.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFormsList(updated);
  };

  // Save the current active editor session
  const handleSaveForm = () => {
    if (!currentFormId) return;

    const savedItem: SavedForm = {
      id: currentFormId,
      title: formTitle || 'Untitled Form',
      pages,
      updatedAt: new Date().toISOString()
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
    alert(`Form "${formTitle}" saved successfully to Local Storage!`);
  };

  // Export JSON Schema
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            id: currentFormId,
            title: formTitle,
            pages,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${formTitle.toLowerCase().replace(/\s+/g, '-') || 'form'}-schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Schema
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (parsed.title) setFormTitle(parsed.title);
          const schemaPages = parsed.pages || [{ id: 'p-imported', name: 'Page 1', items: parsed.schema || parsed }];
          if (Array.isArray(schemaPages)) {
            setPages(schemaPages);
            setCurrentPageIndex(0);
            setSelectedComponent(null);
          } else {
            alert('Invalid page schemas array structure.');
          }
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    fileReader.readAsText(file);
    event.target.value = '';
  };

  // Multi-page manipulations
  const handleAddPage = () => {
    const newPage: FormPage = {
      id: `p-${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      items: []
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('A form must contain at least one page layout.');
      return;
    }
    if (!confirm('Are you sure you want to delete this page and all components inside it?')) return;

    const filtered = pages.filter((_, idx) => idx !== index);
    setPages(filtered);
    
    // Adjust active index
    if (currentPageIndex >= filtered.length) {
      setCurrentPageIndex(filtered.length - 1);
    }
    setSelectedComponent(null);
  };

  const handleRenamePage = (index: number, newName: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newName || `Page ${idx + 1}` } : p))
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="flex-1 overflow-y-auto bg-[#f0f4f5] flex flex-col">
          {/* Header */}
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

          {/* Main List */}
          <main className="max-w-7xl mx-auto w-full px-8 py-10 flex-1 flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-[#212b32] uppercase tracking-wide">My Saved Templates ({formsList.length})</h2>
            
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
                          <span>📄</span> {form.pages.length} {form.pages.length === 1 ? 'Page' : 'Pages'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>⚙️</span> {totalFields} {totalFields === 1 ? 'Field' : 'Fields'}
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
                  <p className="text-sm text-gray-500 mt-1">Create a form template or upload a layout schema JSON to get started.</p>
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
      )}

      {/* EDITOR & BUILDER VIEW */}
      {currentView === 'builder' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center justify-center h-10 w-10 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors shadow-sm"
                title="Back to Dashboard"
              >
                🏠
              </button>
              <div className="flex-1 md:flex-none">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Untitled Form"
                  disabled={previewMode}
                  className="text-lg font-bold text-[#212b32] border-b border-transparent hover:border-gray-300 focus:border-[#005eb8] focus:outline-none px-1 py-0.5 w-full md:w-64 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Preview Toggle */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border transition-all shadow-sm ${
                  previewMode
                    ? 'bg-[#212b32] text-white border-[#212b32]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {previewMode ? '✏️ Edit Mode' : '👁️ Preview Mode'}
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

          {/* Page Selector Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between gap-4 z-10">
            <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-1 md:pb-0">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                    index === currentPageIndex
                      ? 'bg-blue-50 border-blue-300 text-[#005eb8]'
                      : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
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
                        className="bg-transparent border-b border-[#005eb8] focus:outline-none w-20 text-[#005eb8] font-bold"
                      />
                    ) : (
                      <span>{page.name}</span>
                    )}
                  </button>
                  {pages.length > 1 && !previewMode && (
                    <button
                      onClick={() => handleDeletePage(index)}
                      className="text-gray-400 hover:text-red-500 text-xs px-1 rounded hover:bg-gray-100"
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
                  className="px-3 py-1.5 text-xs font-semibold text-[#005eb8] hover:text-[#003087] bg-white hover:bg-blue-50 border border-dashed border-blue-200 rounded-md transition-colors"
                >
                  ➕ Add Page
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500 font-medium hidden md:block">
              Currently Editing: {pages[currentPageIndex]?.name} • {pages[currentPageIndex]?.items.length || 0} fields
            </div>
          </div>

          {/* Main Workspace */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Side Palette (Hidden in Preview) */}
            {!previewMode && <LeftPanel />}

            {/* Central Canvas */}
            <Canvas
              selectedComponent={selectedComponent}
              setSelectedComponent={setSelectedComponent}
              nodes={pages[currentPageIndex]?.items || []}
              setNodes={setNodesForCurrentPage}
              previewMode={previewMode}
            />

            {/* Right Side Panel (Hidden in Preview) */}
            {!previewMode && (
              <RightPanel
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
