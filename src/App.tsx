import { lazy, Suspense, useEffect, useState } from 'react';
import { useKernelStore } from '@/stores/kernel-store';
import { useWindowStore } from '@/wm/window-store';
import { kernel } from '@/kernel/kernel';
import { Desktop } from '@/shell/Desktop';
import { Taskbar } from '@/shell/Taskbar';
import { WindowContainer } from '@/wm/WindowContainer';
import { ThemeProvider } from '@/themes/theme-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { NotificationContainer } from '@/shell/notifications';
import { LoadingScreen, BootScreen } from '@/ui/LoadingScreen';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { LockScreen } from '@/shell/LockScreen';
import { Screensaver } from '@/shell/Screensaver';
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
const Browser = lazy(() => import('@/apps/browser').then((m) => ({ default: m.Browser })));
const Weather = lazy(() => import('@/apps/weather').then((m) => ({ default: m.Weather })));
const Calendar = lazy(() => import('@/apps/calendar').then((m) => ({ default: m.Calendar })));
const Clock = lazy(() => import('@/apps/clock').then((m) => ({ default: m.Clock })));
const Tasks = lazy(() => import('@/apps/tasks').then((m) => ({ default: m.Tasks })));
const Photos = lazy(() => import('@/apps/photos').then((m) => ({ default: m.Photos })));
const MusicPlayer = lazy(() => import('@/apps/music-player').then((m) => ({ default: m.MusicPlayer })));
const Trash = lazy(() => import('@/apps/trash').then((m) => ({ default: m.Trash })));
const Welcome = lazy(() => import('@/apps/welcome').then((m) => ({ default: m.Welcome })));
const VoiceRecorder = lazy(() => import('@/apps/voice-recorder').then((m) => ({ default: m.VoiceRecorder })));
const Camera = lazy(() => import('@/apps/camera').then((m) => ({ default: m.Camera })));
const SystemMonitor = lazy(() => import('@/apps/system-monitor').then((m) => ({ default: m.SystemMonitor })));

function renderAppContent(_windowId: string, appId: string) {
  return (
    <ErrorBoundary appName={appId}>
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
          case 'browser':
            return <Browser />;
          case 'weather':
            return <Weather />;
          case 'calendar':
            return <Calendar />;
          case 'clock':
            return <Clock />;
          case 'tasks':
            return <Tasks />;
          case 'photos':
            return <Photos />;
          case 'music-player':
            return <MusicPlayer />;
          case 'trash':
            return <Trash />;
          case 'welcome':
            return <Welcome />;
          case 'voice-recorder':
            return <VoiceRecorder />;
          case 'camera':
            return <Camera />;
          case 'system-monitor':
            return <SystemMonitor />;
          default:
            return (
              <div className="flex items-center justify-center h-full text-[var(--os-text-secondary)]">
                <p>{appId} — content placeholder</p>
              </div>
            );
        }
      })()}
      </Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  const boot = useKernelStore((s) => s.boot);
  const booted = useKernelStore((s) => s.booted);
  const [isLocked, setIsLocked] = useState(false);

  useKeyboardShortcuts([
    {
      key: 'l',
      meta: true,
      action: () => setIsLocked(true),
      description: 'Lock screen',
    },
  ]);

  useEffect(() => {
    log.info('App mounting — booting kernel...');
    boot();
  }, [boot]);

  // Auto-launch Welcome on first boot
  useEffect(() => {
    if (!booted) return;
    if (localStorage.getItem('webos-welcome-seen')) return;
    const timer = setTimeout(() => {
      const appDef = kernel.apps.get('welcome');
      if (!appDef) return;
      const win = useWindowStore.getState().open({
        processId: '',
        appId: 'welcome',
        title: appDef.title ?? 'Welcome',
        icon: appDef.icon,
        bounds: appDef.defaultWindow
          ? { width: appDef.defaultWindow.width, height: appDef.defaultWindow.height }
          : undefined,
      });
      useKernelStore.getState().launchApp('welcome', win.id);
    }, 500);
    return () => clearTimeout(timer);
  }, [booted]);

  if (!booted) {
    return <BootScreen />;
  }

  if (isLocked) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <Desktop />
        <WindowContainer renderContent={renderAppContent} />
        <LockScreen onUnlock={() => setIsLocked(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Desktop />
      <WindowContainer renderContent={renderAppContent} />
      <Taskbar onLock={() => setIsLocked(true)} />
      <NotificationContainer />
      <Screensaver />
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
