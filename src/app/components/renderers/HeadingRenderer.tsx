import type { JSX } from "react";

export default function HeadingRenderer({ component }: { component: any }) {
  const level = component.properties.level || "h2";
  const text = component.properties.text || "Heading";

  const getHeadingClasses = (level: string) => {
    switch (level) {
      case "h1":
        return "text-3xl font-bold text-gray-900 dark:text-white";
      case "h2":
        return "text-2xl font-bold text-gray-900 dark:text-white";
      case "h3":
        return "text-xl font-bold text-gray-900 dark:text-white";
      case "h4":
        return "text-lg font-bold text-gray-900 dark:text-white";
      case "h5":
        return "text-base font-bold text-gray-900 dark:text-white";
      case "h6":
        return "text-sm font-bold text-gray-900 dark:text-white";
      default:
        return "text-2xl font-bold text-gray-900 dark:text-white";
    }
  };

  const HeadingTag = level as keyof JSX.IntrinsicElements;

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <HeadingTag className={getHeadingClasses(level)}>{text}</HeadingTag>
    </div>
  );
}
