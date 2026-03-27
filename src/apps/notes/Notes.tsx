import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { writeFile, readFile, readdir, mkdir, rm } from '@/vfs/vfs';

interface NoteMeta {
  path: string;
  title: string;
  updatedAt: number;
}

const NOTES_DIR = '/home/Documents/Notes';

export function Notes() {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Type / for commands...' }),
      Highlight.configure({ multicolor: true }),
    ],
    content: '',
    onUpdate: () => {
      // Mark as unsaved
    },
  });

  // Load notes list
  const loadNotes = useCallback(async () => {
    await mkdir(NOTES_DIR);
    const files = await readdir(NOTES_DIR);
    const noteList = files
      .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
      .map((f) => ({
        path: `${NOTES_DIR}/${f.name}`,
        title: f.name.replace(/\.md$/, ''),
        updatedAt: f.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(noteList);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Load note content
  useEffect(() => {
    if (selectedNote && editor) {
      readFile(selectedNote).then((file) => {
        if (file && typeof file.content === 'string') {
          editor.commands.setContent(file.content);
        } else {
          editor.commands.setContent('');
        }
        setCurrentPath(selectedNote);
      });
    }
  }, [selectedNote, editor]);

  // Auto-save on change
  useEffect(() => {
    if (!editor || !currentPath) return;
    const timer = setInterval(() => {
      const html = editor.getHTML();
      writeFile(currentPath, html, 'text/markdown');
    }, 3000);
    return () => clearInterval(timer);
  }, [editor, currentPath]);

  const handleNewNote = async () => {
    const title = prompt('Note title:');
    if (!title) return;
    const path = `${NOTES_DIR}/${title}.md`;
    await writeFile(path, '', 'text/markdown');
    await loadNotes();
    setSelectedNote(path);
  };

  const handleDeleteNote = async (path: string) => {
    if (!confirm('Delete this note?')) return;
    await rm(path);
    await loadNotes();
    if (selectedNote === path) {
      setSelectedNote(null);
      setCurrentPath(null);
      editor?.commands.setContent('');
    }
  };

  const handleSave = async () => {
    if (!editor || !currentPath) return;
    const html = editor.getHTML();
    await writeFile(currentPath, html, 'text/markdown');
    await loadNotes();
  };

  return (
    <div className="flex h-full bg-[var(--os-bg-primary)]">
      {/* Sidebar */}
      <div className="w-56 border-r border-[var(--os-border)] flex flex-col bg-[var(--os-bg-secondary)] shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--os-border)]">
          <span className="text-xs font-semibold text-[var(--os-text-primary)]">Notes</span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-sm"
            onClick={handleNewNote}
            title="New Note"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.path}
              className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                selectedNote === note.path
                  ? 'bg-[var(--os-accent)]/20 text-[var(--os-text-primary)]'
                  : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
              }`}
              onClick={() => setSelectedNote(note.path)}
            >
              <span className="text-xs truncate flex-1">{note.title}</span>
              <button
                className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--os-error)]/20 text-[var(--os-error)] text-[10px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.path);
                }}
              >
                x
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-[var(--os-text-muted)] text-center py-4">
              No notes yet
            </p>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {currentPath ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
              <ToolbarBtn
                active={editor?.isActive('bold') ?? false}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <strong>B</strong>
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive('italic') ?? false}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <em>I</em>
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive('underline') ?? false}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <u>U</u>
              </ToolbarBtn>
              <div className="w-px h-5 bg-[var(--os-border)] mx-1" />
              <select
                className="h-6 px-1 text-[11px] bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)] rounded border border-[var(--os-border)]"
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  if (level === 0) editor?.chain().focus().setParagraph().run();
                  else editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                }}
              >
                <option value={0}>Normal</option>
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <div className="w-px h-5 bg-[var(--os-border)] mx-1" />
              <ToolbarBtn
                active={editor?.isActive('bulletList') ?? false}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                •≡
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive('orderedList') ?? false}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                1≡
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive('taskList') ?? false}
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
              >
                ☑
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive('blockquote') ?? false}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              >
                ❝
              </ToolbarBtn>
              <div className="flex-1" />
              <button
                className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
                onClick={handleSave}
              >
                Save
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto prose prose-invert prose-sm min-h-full">
                <EditorContent editor={editor} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[var(--os-text-muted)]">
            <div className="text-center">
              <p className="text-4xl mb-2">📋</p>
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`h-6 w-6 flex items-center justify-center rounded text-xs transition-colors ${
        active ? 'bg-[var(--os-accent)]/20 text-[var(--os-accent)]' : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
