/**
 * Rich Text Editor Component using Lexical
 * Provides WYSIWYG editing capabilities for form fields
 */

import React, { useCallback } from 'react';
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import {
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
  ListNode,
  ListItemNode
} from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import './../../styles/RichTextEditor.css';

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
  const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const formats = new Set<string>();
          if (selection.hasFormat('bold')) formats.add('bold');
          if (selection.hasFormat('italic')) formats.add('italic');
          if (selection.hasFormat('underline')) formats.add('underline');
          setActiveFormats(formats);
        }
      });
    });
  }, [editor]);

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

  const removeList = useCallback(() => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="rich-text-toolbar">
      {/* Text formatting */}
      <button
        type="button"
        onClick={() => formatText('bold')}
        className={`toolbar-btn ${activeFormats.has('bold') ? 'active' : ''}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className={`toolbar-btn ${activeFormats.has('italic') ? 'active' : ''}`}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className={`toolbar-btn ${activeFormats.has('underline') ? 'active' : ''}`}
        title="Underline"
      >
        <u>U</u>
      </button>

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => insertList('bullet')}
        className="toolbar-btn"
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() => insertList('number')}
        className="toolbar-btn"
        title="Numbered List"
      >
        1.
      </button>
      <button
        type="button"
        onClick={removeList}
        className="toolbar-btn"
        title="Remove List"
      >
        ❌
      </button>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => formatElement('left')}
        className="toolbar-btn"
        title="Align Left"
      >
        ⬅
      </button>
      <button
        type="button"
        onClick={() => formatElement('center')}
        className="toolbar-btn"
        title="Align Center"
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => formatElement('right')}
        className="toolbar-btn"
        title="Align Right"
      >
        ➡
      </button>

      <div className="toolbar-divider" />

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={undo}
        className="toolbar-btn"
        title="Undo"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={redo}
        className="toolbar-btn"
        title="Redo"
      >
        ↷
      </button>
    </div>
  );
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
    <div className={`rich-text-editor ${className}`}>
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
        
        <div className="rich-text-content-container" style={{ height }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-text-content"
                readOnly={readOnly}
                style={{ minHeight: height }}
              />
            }
            placeholder={
              <div
                className="rich-text-placeholder"
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <ListPlugin hasStrictIndent={true} />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>
    </div>
  );
};
