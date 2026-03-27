import { lazy, Suspense, useEffect } from 'react';
import { useKernelStore } from '@/stores/kernel-store';
import { Desktop } from '@/shell/Desktop';
import { Taskbar } from '@/shell/Taskbar';
import { WindowContainer } from '@/wm/WindowContainer';
import { ThemeProvider } from '@/themes/theme-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { LoadingScreen } from '@/ui/LoadingScreen';
import { createLogger } from '@/lib/logger';

const log = createLogger('app');

// Code-split all apps for smaller initial bundle
const FileManager = lazy(() => import('@/apps/file-manager').then((m) => ({ default: m.FileManager })));
const Writer = lazy(() => import('@/apps/writer').then((m) => ({ default: m.Writer })));
const Calc = lazy(() => import('@/apps/calc').then((m) => ({ default: m.Calc })));
const Notes = lazy(() => import('@/apps/notes').then((m) => ({ default: m.Notes })));
const Draw = lazy(() => import('@/apps/draw').then((m) => ({ default: m.Draw })));
const Impress = lazy(() => import('@/apps/impress').then((m) => ({ default: m.Impress })));
const PdfViewer = lazy(() => import('@/apps/pdf-viewer').then((m) => ({ default: m.PdfViewer })));
const Terminal = lazy(() => import('@/apps/terminal').then((m) => ({ default: m.Terminal })));
const Calculator = lazy(() => import('@/apps/calculator').then((m) => ({ default: m.Calculator })));
const TextEditor = lazy(() => import('@/apps/text-editor').then((m) => ({ default: m.TextEditor })));
const ImageViewer = lazy(() => import('@/apps/image-viewer').then((m) => ({ default: m.ImageViewer })));
const TaskManager = lazy(() => import('@/apps/task-manager').then((m) => ({ default: m.TaskManager })));
const Settings = lazy(() => import('@/apps/settings').then((m) => ({ default: m.Settings })));

function renderAppContent(_windowId: string, appId: string) {
  const content = (
    <Suspense fallback={<LoadingScreen />}>
      {(() => {
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
      })()}
    </Suspense>
  );
  return content;
}

function AppContent() {
  const boot = useKernelStore((s) => s.boot);

  useKeyboardShortcuts();

  useEffect(() => {
    log.info('App mounting — booting kernel...');
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
