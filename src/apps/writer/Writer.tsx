import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { writeFile, readFile } from '@/vfs/vfs';

interface WriterProps {
  filePath?: string;
  onTitleChange?: (title: string) => void;
}

export function Writer({ filePath, onTitleChange }: WriterProps) {
  const [currentPath, setCurrentPath] = React.useState(filePath ?? '');
  const [saved, setSaved] = React.useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    onUpdate: () => {
      setSaved(false);
    },
  });

  // Load file if path provided
  useEffect(() => {
    if (filePath && editor) {
      readFile(filePath).then((file) => {
        if (file && typeof file.content === 'string' && file.content) {
          editor.commands.setContent(file.content);
        }
      });
      setCurrentPath(filePath);
      setSaved(true);
    }
  }, [filePath, editor]);

  // Listen for file open events from File Manager
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === 'string' && editor) {
        setCurrentPath(path);
        setSaved(true);
        readFile(path).then((file) => {
          if (file && typeof file.content === 'string' && file.content) {
            editor.commands.setContent(file.content);
          }
        });
      }
    };
    window.addEventListener('webos:open-file', handler);
    return () => window.removeEventListener('webos:open-file', handler);
  }, [editor]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!editor || !currentPath) return;
    const timer = setInterval(() => {
      if (!saved && currentPath) {
        saveFile();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [editor, currentPath, saved]);

  const saveFile = useCallback(async () => {
    if (!editor || !currentPath) return;
    const html = editor.getHTML();
    await writeFile(currentPath, html, 'text/html');
    setSaved(true);
  }, [editor, currentPath]);

  const handleNew = () => {
    editor?.commands.setContent('');
    setCurrentPath('');
    setSaved(true);
  };

  const handleSave = () => {
    if (currentPath) {
      saveFile();
    } else {
      const name = prompt('Save as:', 'Untitled.html');
      if (name) {
        const path = `/home/Documents/${name}`;
        setCurrentPath(path);
        writeFile(path, editor?.getHTML() ?? '', 'text/html');
        setSaved(true);
        onTitleChange?.(name);
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)]">
      {/* Menu Bar */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)] text-[11px]">
        <button
          className="px-2 py-1 rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleNew}
        >
          New
        </button>
        <button
          className="px-2 py-1 rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)] flex-wrap">
        {/* Heading */}
        <select
          className="h-6 px-1 text-[11px] bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)] rounded border border-[var(--os-border)]"
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
          }}
          value={editor.isActive('heading') ? editor.getAttributes('heading').level : 0}
        >
          <option value={0}>Normal</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
        </select>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        {/* Text formatting */}
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        {/* Text alignment */}
        <ToolbarButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          ≡
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        {/* Lists */}
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          •≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          1≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
        >
          ☑
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        {/* Block */}
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          &lt;/&gt;
        </ToolbarButton>
        <button
          className="h-6 px-1.5 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm min-h-full">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-3 text-[10px] text-[var(--os-text-muted)] border-t border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        <span>
          {currentPath ? currentPath.split('/').pop() : 'Untitled'}
          {!saved && ' •'}
        </span>
        <span>{editor.storage.characterCount.characters()} chars</span>
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`h-6 w-6 flex items-center justify-center rounded text-xs transition-colors ${
        active
          ? 'bg-[var(--os-accent)]/20 text-[var(--os-accent)]'
          : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
