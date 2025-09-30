import Link from "next/link";

export default function FormBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded w-36 text-center">
              Back
            </button>
          </Link>
          <h1 className="text-xl font-semibold">Form Builder</h1>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Form Title"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded w-36 text-center">
            Export JSON
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded w-36 text-center">
            Upload JSON
          </button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-36 text-center">
            Save
          </button>
        </div>
      </nav>
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}