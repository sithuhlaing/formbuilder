export interface TemplateUpdatePayload {
  name: string;
  pages: Array<{
    title: string;
    components: any[];
  }>;
}

export const templateService = {
  updateTemplate(id: string, payload: TemplateUpdatePayload) {
    // Simple mock template storage update
    const saved = localStorage.getItem('fb.local_forms_db');
    if (saved) {
      try {
        const forms = JSON.parse(saved);
        const index = forms.findIndex((f: any) => f.id === id);
        if (index !== -1) {
          forms[index] = {
            ...forms[index],
            title: payload.name,
            pages: payload.pages.map((p, idx) => ({
              id: forms[index].pages[idx]?.id || `p-${Date.now()}-${idx}`,
              name: p.title,
              items: p.components
            })),
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('fb.local_forms_db', JSON.stringify(forms));
          return forms[index];
        }
      } catch (e) {
        console.error('Error in templateService local store update:', e);
      }
    }
    return { id, title: payload.name, pages: payload.pages };
  },
  saveTemplate(payload: any) {
    const saved = localStorage.getItem('fb.local_forms_db');
    let forms = [];
    if (saved) {
      try { forms = JSON.parse(saved); } catch (e) {}
    }
    const templateId = `temp-${Date.now()}`;
    const newForm = {
      id: templateId,
      title: payload.name || 'Untitled Form',
      pages: payload.pages.map((p: any, idx: number) => ({
        id: p.id || `p-${Date.now()}-${idx}`,
        name: p.title || p.name || `Page ${idx + 1}`,
        items: p.components || []
      })),
      updatedAt: new Date().toISOString()
    };
    forms.push(newForm);
    localStorage.setItem('fb.local_forms_db', JSON.stringify(forms));
    return {
      templateId,
      name: newForm.title,
      pages: newForm.pages
    };
  },
  loadTemplate(id: string) {
    const saved = localStorage.getItem('fb.local_forms_db');
    if (saved) {
      try {
        const forms = JSON.parse(saved);
        const form = forms.find((f: any) => f.id === id);
        if (form) {
          return {
            templateId: form.id,
            name: form.title,
            pages: form.pages.map((p: any) => ({
              id: p.id,
              title: p.name || p.title || 'Page',
              components: p.items || p.components || []
            }))
          };
        }
      } catch (e) {}
    }
    return null;
  }
};

