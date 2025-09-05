import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Custom render with DnD provider
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Helper functions
export const mockComponent = (name: string) => {
  const MockComponent = (props: any) => (
    <div data-testid={`mock-${name}`} {...props} />
  );
  MockComponent.displayName = name;
  return MockComponent;
};

// Mock form builder state
export const createMockFormState = (overrides = {}) => ({
  components: [],
  pages: [{
    id: 'page1',
    title: 'Page 1',
    components: [],
    layout: { type: 'vertical', direction: 'column' },
    order: 0
  }],
  currentPageId: 'page1',
  selectedComponent: null,
  selectedComponentId: null,
  templateName: 'Test Template',
  templateId: null,
  setTemplateName: vi.fn(),
  addComponent: vi.fn(),
  selectComponent: vi.fn(),
  updateComponent: vi.fn(),
  deleteComponent: vi.fn(),
  moveComponent: vi.fn(),
  clearAll: vi.fn(),
  loadFromJSON: vi.fn(),
  loadTemplate: vi.fn(),
  exportJSON: vi.fn(() => JSON.stringify({ templateName: 'Test Template', pages: [] })),
  getCurrentPageIndex: vi.fn(() => 0),
  navigateToNextPage: vi.fn(),
  navigateToPreviousPage: vi.fn(),
  addNewPage: vi.fn(),
  updatePageTitle: vi.fn(),
  addComponentToContainerWithPosition: vi.fn(),
  rearrangeWithinContainer: vi.fn(),
  removeFromContainer: vi.fn(),
  moveFromContainerToCanvas: vi.fn(),
  ...overrides
});
