import React, { useState, useRef } from 'react';
import Canvas from './app/components/canvas';
import LeftPanel from './app/components/left-panel';
import RightPanel from './app/components/right-panel';
import { FormNode, FormComponent } from './types/form';

function App() {
  const [nodes, setNodes] = useState<FormNode[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null);
  const [formTitle, setFormTitle] = useState<string>('My Interactive Form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      title: formTitle,
      schema: nodes,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${formTitle.toLowerCase().replace(/\s+/g, '-') || 'form'}-schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
          if (parsed.title) {
            setFormTitle(parsed.title);
          }
          const schema = parsed.schema || parsed;
          if (Array.isArray(schema)) {
            setNodes(schema);
            setSelectedComponent(null);
          } else {
            alert('Invalid file format. Expected a form schema array.');
          }
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    fileReader.readAsText(file);
    // Reset file input value so same file can be loaded again
    event.target.value = '';
  };

  const handleSave = () => {
    localStorage.setItem(`fb.form.${formTitle.toLowerCase().replace(/\s+/g, '-')}`, JSON.stringify({
      title: formTitle,
      schema: nodes,
      savedAt: new Date().toISOString()
    }));
    alert(`Form "${formTitle}" saved successfully to browser storage!`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Hidden file input for import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
      />

      {/* Premium Header */}
      <header className="bg-white border-b border-blue-100 px-6 py-4 shadow-sm z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-blue-200">
            F
          </div>
          <div className="flex-1 md:flex-none">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Untitled Form"
              className="text-lg font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full md:w-64 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={triggerFileInput}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
          >
            📥 Import JSON
          </button>
          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors shadow-sm"
          >
            📤 Export JSON
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            💾 Save Form
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Component Palette */}
        <LeftPanel />

        {/* Central Drag & Drop Canvas */}
        <Canvas
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
          nodes={nodes}
          setNodes={setNodes}
        />

        {/* Right Side Properties Panel */}
        <RightPanel
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
        />
      </div>
    </div>
  );
}

export default App;
