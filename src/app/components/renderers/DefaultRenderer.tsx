export default function DefaultRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <p className="font-semibold text-gray-900 dark:text-white">
        {component.label}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {component.description}
      </p>
    </div>
  );
}
