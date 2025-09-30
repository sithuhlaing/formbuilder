
export type Template = {
  id: string;
  name: string;
  // description: string;
  // version: string;
};

type TemplateCardProps = {
  template: Template;
};

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold">{template.name}</h3>
      {/* <p className="text-gray-600 dark:text-gray-400 mt-2">{template.description}</p>
      <div className="mt-4 text-sm text-gray-500">
        <span>Version: {template.version}</span>
      </div> */}
    </div>
  );
}
