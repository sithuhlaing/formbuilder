import Canvas from "../components/canvas";
import LeftPanel from "../components/left-panel";
import RightPanel from "../components/right-panel";

export default function FormBuilderPage() {
  return (
    <div className="flex flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <LeftPanel />
      <Canvas />
      <RightPanel />
    </div>
  );
}
