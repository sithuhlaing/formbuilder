"use client";
import { useState } from "react";
import Canvas from "../components/canvas";
import LeftPanel from "../components/left-panel";
import RightPanel from "../components/right-panel";

export default function FormBuilderPage() {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  return (
    <div className="flex flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <LeftPanel />
      <Canvas
        selectedComponent={selectedComponent}
        setSelectedComponent={setSelectedComponent}
      />
      <RightPanel
        selectedComponent={selectedComponent}
        setSelectedComponent={setSelectedComponent}
      />
    </div>
  );
}
