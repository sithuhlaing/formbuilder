import Link from "next/link";
import TemplateCard from "@/components/template-card";
import { mockTemplates } from "./datas/mock_tempates";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Template Management</h1>
            <p className="text-gray-600 mt-2">
              Start with a proven template or jump straight into the builder.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/templates">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Browse Templates
              </button>
            </Link>
            <Link href="/templates/my">
              <button className="border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">
                My Templates
              </button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </main>
  );
}
