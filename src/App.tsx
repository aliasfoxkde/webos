import React from 'react';
import { useEffect } from 'react';
import { useKernelStore } from '@/stores/kernel-store';
import { Desktop } from '@/shell/Desktop';
import { Taskbar } from '@/shell/Taskbar';
import { WindowContainer } from '@/wm/WindowContainer';
import { ThemeProvider } from '@/themes/theme-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { FileManager } from '@/apps/file-manager';
import { Writer } from '@/apps/writer';
import { Calc } from '@/apps/calc';
import { Notes } from '@/apps/notes';
import { Draw } from '@/apps/draw';
import { Impress } from '@/apps/impress';
import { PdfViewer } from '@/apps/pdf-viewer';
import { Terminal } from '@/apps/terminal';
import { Calculator } from '@/apps/calculator';
import { TextEditor } from '@/apps/text-editor';
import { ImageViewer } from '@/apps/image-viewer';
import { TaskManager } from '@/apps/task-manager';
import { Settings } from '@/apps/settings';

function renderAppContent(_windowId: string, appId: string) {
  switch (appId) {
    case 'file-manager':
      return <FileManager />;
    case 'writer':
      return <Writer />;
    case 'calc':
      return <Calc />;
    case 'notes':
      return <Notes />;
    case 'draw':
      return <Draw />;
    case 'impress':
      return <Impress />;
    case 'pdf-viewer':
      return <PdfViewer />;
    case 'terminal':
      return <Terminal />;
    case 'calculator':
      return <Calculator />;
    case 'text-editor':
      return <TextEditor />;
    case 'image-viewer':
      return <ImageViewer />;
    case 'task-manager':
      return <TaskManager />;
    case 'settings':
      return <Settings />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-[var(--os-text-secondary)]">
          <p>{appId} — content placeholder</p>
        </div>
      );
  }
}

function AppContent() {
  const boot = useKernelStore((s) => s.boot);

  useKeyboardShortcuts();

  useEffect(() => {
    boot();
  }, [boot]);

  const booted = useKernelStore((s) => s.booted);

  if (!booted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--os-desktop-bg)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--os-accent-light)' }}>
            WebOS
          </h1>
          <p className="mt-2" style={{ color: 'var(--os-text-secondary)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Desktop />
      <WindowContainer renderContent={renderAppContent} />
      <Taskbar />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
