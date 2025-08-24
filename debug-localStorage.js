// Debug script to check localStorage templates
// Run this in browser console

console.log('=== Form Templates in localStorage ===');
const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
console.log('Number of templates:', templates.length);

templates.forEach((template, index) => {
  console.log(`\n--- Template ${index + 1} ---`);
  console.log('ID:', template.templateId);
  console.log('Name:', template.name);
  console.log('Type:', template.type);
  console.log('Created:', template.createdDate);
  console.log('Fields count:', template.fields?.length || 0);
  console.log('Pages count:', template.pages?.length || 0);
  
  if (template.fields) {
    console.log('Field types:', template.fields.map(f => f.type));
  }
  
  if (template.pages) {
    template.pages.forEach((page, pageIndex) => {
      console.log(`Page ${pageIndex + 1} (${page.id}): "${page.title}" - ${page.components?.length || 0} components`);
      if (page.components) {
        console.log('  Component types:', page.components.map(c => c.type));
      }
    });
  }
});

console.log('\n=== To clear all templates (if needed) ===');
console.log('localStorage.removeItem("formTemplates");');