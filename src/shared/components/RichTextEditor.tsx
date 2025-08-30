/**
 * Rich Text Editor Component using Lexical
 * Provides WYSIWYG editing capabilities for form fields
 */

import React, { useCallback } from 'react';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $createTextNode
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
  ListItemNode
} from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

// Toolbar component for formatting controls
const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const formatText = useCallback((format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const formatElement = useCallback((format: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }, [editor]);

  const insertList = useCallback((listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="rich-text-toolbar" style={{
      display: 'flex',
      gap: '4px',
      padding: '8px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px 4px 0 0'
    }}>
      {/* Text formatting */}
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="toolbar-btn"
        title="Bold"
        style={toolbarButtonStyle}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="toolbar-btn"
        title="Italic"
        style={toolbarButtonStyle}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="toolbar-btn"
        title="Underline"
        style={toolbarButtonStyle}
      >
        <u>U</u>
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd', margin: '0 4px' }} />

      {/* Lists */}
      <button
        type="button"
        onClick={() => insertList('bullet')}
        className="toolbar-btn"
        title="Bullet List"
        style={toolbarButtonStyle}
      >
        •
      </button>
      <button
        type="button"
        onClick={() => insertList('number')}
        className="toolbar-btn"
        title="Numbered List"
        style={toolbarButtonStyle}
      >
        1.
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd', margin: '0 4px' }} />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => formatElement('left')}
        className="toolbar-btn"
        title="Align Left"
        style={toolbarButtonStyle}
      >
        ⬅
      </button>
      <button
        type="button"
        onClick={() => formatElement('center')}
        className="toolbar-btn"
        title="Align Center"
        style={toolbarButtonStyle}
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => formatElement('right')}
        className="toolbar-btn"
        title="Align Right"
        style={toolbarButtonStyle}
      >
        ➡
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd', margin: '0 4px' }} />

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={undo}
        className="toolbar-btn"
        title="Undo"
        style={toolbarButtonStyle}
      >
        ↶
      </button>
      <button
        type="button"
        onClick={redo}
        className="toolbar-btn"
        title="Redo"
        style={toolbarButtonStyle}
      >
        ↷
      </button>
    </div>
  );
};

const toolbarButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid transparent',
  borderRadius: '3px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '14px',
  minWidth: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

// Initial editor configuration
const initialConfig = {
  namespace: 'RichTextEditor',
  theme: {
    text: {
      bold: 'rich-text-bold',
      italic: 'rich-text-italic',
      underline: 'rich-text-underline',
    },
    paragraph: 'rich-text-paragraph',
    list: {
      nested: {
        listitem: 'rich-text-nested-listitem',
      },
      ol: 'rich-text-list-ol',
      ul: 'rich-text-list-ul',
      listitem: 'rich-text-listitem',
    },
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    LinkNode,
    AutoLinkNode,
  ],
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter rich text...',
  readOnly = false,
  height = '200px',
  className = ''
}) => {
  const handleChange = useCallback((editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange?.(textContent);
    });
  }, [onChange]);

  return (
    <div className={`rich-text-editor ${className}`} style={{
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: '#fff',
      overflow: 'hidden'
    }}>
      <LexicalComposer initialConfig={{
        ...initialConfig,
        editable: !readOnly,
        editorState: value ? () => {
          const root = $getRoot();
          const paragraph = $createParagraphNode();
          const text = $createTextNode(value);
          paragraph.append(text);
          root.append(paragraph);
        } : undefined
      }}>
        {!readOnly && <ToolbarPlugin />}
        
        <div style={{ 
          position: 'relative',
          minHeight: height,
          maxHeight: readOnly ? 'auto' : '400px',
          overflow: 'auto'
        }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-text-content"
                style={{
                  padding: '12px',
                  minHeight: height,
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#374151',
                  backgroundColor: readOnly ? '#f9fafb' : '#fff'
                }}
                readOnly={readOnly}
              />
            }
            placeholder={
              <div
                className="rich-text-placeholder"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  color: '#9ca3af',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>

      <style jsx>{`
        .rich-text-editor .toolbar-btn:hover {
          background-color: #e5e7eb;
          border-color: #d1d5db;
        }
        
        .rich-text-bold {
          font-weight: bold;
        }
        
        .rich-text-italic {
          font-style: italic;
        }
        
        .rich-text-underline {
          text-decoration: underline;
        }
        
        .rich-text-paragraph {
          margin: 0 0 8px 0;
        }
        
        .rich-text-list-ol,
        .rich-text-list-ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        
        .rich-text-listitem {
          margin: 4px 0;
        }
        
        .rich-text-nested-listitem {
          list-style-type: none;
        }
      `}</style>
    </div>
  );
};
