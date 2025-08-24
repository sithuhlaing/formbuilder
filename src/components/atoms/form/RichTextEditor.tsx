import React from 'react';
import { $getRoot } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';

const theme = {
  // Theme styling
  text: {
    bold: 'editor-textBold',
    italic: 'editor-textItalic',
    underline: 'editor-textUnderline',
    strikethrough: 'editor-textStrikethrough',
    underlineStrikethrough: 'editor-textUnderlineStrikethrough',
    code: 'editor-textCode',
  },
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  link: 'editor-link',
};

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  height = '200px',
  className = '',
}) => {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError(error: Error) {
      throw error;
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
    ],
    editable: !disabled,
  };

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange?.(textContent);
    });
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container" style={{ border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)' }}>
          <ToolbarPlugin disabled={disabled} />
          <div className="editor-inner" style={{ position: 'relative', minHeight: height, padding: 'var(--space-3)' }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                  style={{
                    minHeight: height,
                    outline: 'none',
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                />
              }
              placeholder={
                <div
                  className="editor-placeholder"
                  style={{
                    position: 'absolute',
                    top: 'var(--space-3)',
                    left: 'calc(var(--space-3) + var(--space-2))',
                    color: 'var(--color-gray-400)',
                    fontSize: 'var(--text-sm)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {placeholder}
                </div>
              }
              ErrorBoundary={({ children }: any) => children}
            />
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};

// Simple toolbar component
const ToolbarPlugin: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  if (disabled) return null;

  return (
    <div
      className="editor-toolbar"
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        padding: 'var(--space-2)',
        borderBottom: '1px solid var(--color-gray-200)',
        backgroundColor: 'var(--color-gray-50)',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      }}
    >
      <ToolbarButton label="B" title="Bold" />
      <ToolbarButton label="I" title="Italic" />
      <ToolbarButton label="U" title="Underline" />
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-gray-300)', margin: '0 var(--space-1)' }} />
      <ToolbarButton label="H1" title="Heading 1" />
      <ToolbarButton label="H2" title="Heading 2" />
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-gray-300)', margin: '0 var(--space-1)' }} />
      <ToolbarButton label="•" title="Bullet List" />
      <ToolbarButton label="1." title="Numbered List" />
    </div>
  );
};

const ToolbarButton: React.FC<{ label: string; title: string; active?: boolean; onClick?: () => void }> = ({
  label,
  title,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        padding: 'var(--space-1) var(--space-2)',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: active ? 'var(--color-blue-100)' : 'white',
        color: active ? 'var(--color-blue-700)' : 'var(--color-gray-700)',
        fontSize: 'var(--text-xs)',
        fontWeight: active ? 'var(--font-weight-medium)' : 'normal',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'white';
        }
      }}
    >
      {label}
    </button>
  );
};

export default RichTextEditor;