import React from "react";

export default function SectionDividerRenderer({ component }: { component: any }) {
  return (
    <div className="mb-4 p-4">
      <hr className="border-gray-300 dark:border-gray-600" />
    </div>
  );
}