import React, { useState, useRef } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Type your text here...',
  disabled = false,
  className = '',
  height = '120px'
}) => {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.(newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    isActive?: boolean;
  }> = ({ onClick, title, children, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: '4px 8px',
        border: '1px solid #d1d5db',
        backgroundColor: isActive ? '#3b82f6' : '#ffffff',
        color: isActive ? '#ffffff' : '#374151',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        height: '24px',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}
    </button>
  );

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
        flexWrap: 'wrap'
      }}>
        <ToolbarButton
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>
        
        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '2px 4px' }} />
        
        <ToolbarButton
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
        >
          •
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
        >
          1.
        </ToolbarButton>
        
        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '2px 4px' }} />
        
        <ToolbarButton
          onClick={() => executeCommand('formatBlock', 'h3')}
          title="Heading"
        >
          H
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => executeCommand('formatBlock', 'p')}
          title="Paragraph"
        >
          P
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          minHeight: height,
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '0 0 6px 6px',
          backgroundColor: disabled ? '#f9fafb' : '#ffffff',
          color: '#374151',
          fontSize: '14px',
          lineHeight: '1.5',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          overflow: 'auto'
        }}
      />

      {!content && !disabled && (
        <div style={{
          position: 'absolute',
          top: '52px',
          left: '12px',
          color: '#9ca3af',
          fontSize: '14px',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;