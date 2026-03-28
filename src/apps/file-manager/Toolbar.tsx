
interface ToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onRefresh: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
  hasClipboard?: boolean;
  onPaste?: () => void;
}

export function Toolbar({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onUp,
  onRefresh,
  onNewFolder,
  onNewFile,
  hasClipboard,
  onPaste,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] disabled:opacity-30 text-xs"
        onClick={onBack}
        disabled={!canGoBack}
        title="Back"
      >
        ←
      </button>
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] disabled:opacity-30 text-xs"
        onClick={onForward}
        disabled={!canGoForward}
        title="Forward"
      >
        →
      </button>
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-xs"
        onClick={onUp}
        title="Up"
      >
        ↑
      </button>

      <div className="flex-1" />

      {hasClipboard && onPaste && (
        <button
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-sm"
          onClick={onPaste}
          title="Paste"
        >
          📋
        </button>
      )}
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-sm"
        onClick={onNewFolder}
        title="New Folder"
      >
        📁+
      </button>
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-sm"
        onClick={onNewFile}
        title="New File"
      >
        📄+
      </button>
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-sm"
        onClick={onRefresh}
        title="Refresh"
      >
        🔄
      </button>
    </div>
  );
}
