// Emergency fix: Run this in browser console if templates still won't load

console.log('🔧 Running emergency template repair...');

// Get current templates
let templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
console.log('Found', templates.length, 'templates');

// Check each template
templates.forEach((template, index) => {
  console.log(`Checking template ${index + 1}: ${template.name}`);
  
  // Ensure fields array exists
  if (!template.fields) {
    template.fields = [];
    console.log('  ⚠️  Fixed missing fields array');
  }
  
  // Ensure pages array exists
  if (!template.pages) {
    template.pages = [{ 
      id: '1', 
      title: 'Page 1', 
      components: template.fields || [] 
    }];
    console.log('  ⚠️  Fixed missing pages array');
  }
  
  // Check page components
  template.pages.forEach((page, pageIndex) => {
    if (!page.components) {
      page.components = [];
      console.log(`  ⚠️  Fixed missing components in page ${pageIndex + 1}`);
    }
  });
  
  // Check for valid component types
  const validTypes = ['text_input', 'number_input', 'textarea', 'select', 'multi_select', 'checkbox', 'radio_group', 'date_picker', 'file_upload', 'section_divider', 'signature', 'horizontal_layout', 'vertical_layout'];
  
  template.fields = template.fields.filter(comp => {
    if (!comp.id || !comp.type) {
      console.log('  🗑️  Removed invalid component:', comp);
      return false;
    }
    if (!validTypes.includes(comp.type)) {
      console.log('  🗑️  Removed unsupported component type:', comp.type);
      return false;
    }
    return true;
  });
  
  // Fix pages too
  template.pages.forEach(page => {
    page.components = page.components.filter(comp => {
      if (!comp.id || !comp.type || !validTypes.includes(comp.type)) {
        return false;
      }
      return true;
    });
  });
  
  console.log('  ✅ Template repaired');
});

// Save repaired templates
localStorage.setItem('formTemplates', JSON.stringify(templates));
console.log('🎉 All templates repaired and saved!');
console.log('Please refresh the page and try editing templates again.');