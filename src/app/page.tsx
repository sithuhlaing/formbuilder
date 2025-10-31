import Link from "next/link";
import TemplateCard from "@/components/template-card";
import { mockTemplates } from "./datas/mock_tempates";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-2">Template Management</h1>
              <p className="text-sky-600">
                Start with a proven template or jump straight into the builder
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/templates/my">
                <button className="px-6 py-3 text-sm border border-blue-100 rounded-lg bg-white text-sky-700 transition-colors hover:border-cyan-200 hover:text-cyan-600 font-medium shadow-sm">
                  My Templates
                </button>
              </Link>
              <Link href="/templates">
                <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-sm">
                  Browse Templates
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </main>
    </div>
  );
}
