import { Template } from "@/types/template";
import { templateLibrary } from "./template-definitions";
import { sample_template } from "./template_1";

// Aggregate library templates with a sample blueprint used across demos
export const mockTemplates: Template[] = Array.from(
  new Map(
    [...templateLibrary, sample_template].map((template) => [template.id, template]),
  ).values(),
);

export const getTemplateById = (id: string): Template | undefined => {
  return mockTemplates.find((template) => template.id === id);
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return mockTemplates.filter((template) => template.category === category);
};

export const getHipaaCompliantTemplates = (): Template[] => {
  return mockTemplates.filter((template) => template.isHipaaCompliant);
};

export const searchTemplates = (query: string): Template[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};
