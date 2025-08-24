// 🔍 Data Inspector Tool - Run in browser console
// This helps debug template storage and loading issues

console.log('🔍 Form Builder Data Inspector');
console.log('=====================================');

// 1. Check current view state
console.log('\n📱 CURRENT VIEW STATE:');
const app = document.querySelector('.app');
if (app) {
  const hasTemplateList = app.querySelector('.template-list-view');
  const hasFormBuilder = app.querySelector('.header');
  console.log('Template List View:', hasTemplateList ? '✅ Active' : '❌ Not rendered');
  console.log('Form Builder View:', hasFormBuilder ? '✅ Active' : '❌ Not rendered');
} else {
  console.log('❌ App container not found');
}

// 2. Check localStorage data
console.log('\n🗄️ LOCALSTORAGE DATA:');
const templatesData = localStorage.getItem('formTemplates');
if (templatesData) {
  const templates = JSON.parse(templatesData);
  console.log(`Found ${templates.length} templates:`);
  
  templates.forEach((template, index) => {
    console.log(`\n📋 Template ${index + 1}:`);
    console.log(`  Name: "${template.name}"`);
    console.log(`  ID: ${template.templateId}`);
    console.log(`  Type: ${template.type}`);
    console.log(`  Fields: ${template.fields?.length || 0}`);
    console.log(`  Pages: ${template.pages?.length || 0}`);
    
    if (template.pages && template.pages.length > 0) {
      template.pages.forEach((page, pageIndex) => {
        console.log(`    Page ${pageIndex + 1}: "${page.title}" (${page.components?.length || 0} components)`);
      });
    }
    
    // Check for invalid components
    const invalidComponents = template.fields?.filter(f => !f.id || !f.type) || [];
    if (invalidComponents.length > 0) {
      console.log(`  ⚠️ Invalid components: ${invalidComponents.length}`);
    }
  });
} else {
  console.log('❌ No templates found in localStorage');
}

// 3. Check React DevTools
console.log('\n⚛️ REACT STATE (if React DevTools available):');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ React DevTools detected');
  console.log('💡 Check the App component state for currentView, pages, components');
} else {
  console.log('❌ React DevTools not available');
}

// 4. Helper functions
console.log('\n🛠️ HELPER FUNCTIONS:');
console.log('Clear all templates: clearAllTemplates()');
console.log('Create test template: createTestTemplate()');
console.log('Force view switch: forceViewSwitch("builder" | "list")');

window.clearAllTemplates = () => {
  localStorage.removeItem('formTemplates');
  console.log('✅ All templates cleared. Refresh page.');
};

window.createTestTemplate = () => {
  const testTemplate = {
    templateId: Date.now().toString(),
    name: "Test Template",
    type: "assessment",
    createdDate: new Date().toISOString(),
    fields: [
      { id: "1", type: "text_input", label: "Test Field", required: false }
    ],
    pages: [
      { id: "1", title: "Page 1", components: [
        { id: "1", type: "text_input", label: "Test Field", required: false }
      ]}
    ]
  };
  
  const templates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
  templates.push(testTemplate);
  localStorage.setItem('formTemplates', JSON.stringify(templates));
  console.log('✅ Test template created. Refresh page.');
};

window.forceViewSwitch = (view) => {
  console.log(`🔄 To switch to ${view} view, look for setCurrentView in React DevTools`);
  console.log('Or refresh page to go back to template list');
};

console.log('\n🎉 Data Inspector loaded! Use the helper functions above.');