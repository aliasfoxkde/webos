import React from 'react';
import { useWindowStore } from './window-store';
import { WindowFrame } from './WindowFrame';

interface WindowContainerProps {
  renderContent: (windowId: string, appId: string) => React.ReactNode;
}

export function WindowContainer({ renderContent }: WindowContainerProps) {
  const windows = useWindowStore((s) => s.windows);

  // Render in z-order (lowest first so highest is on top)
  const sorted = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {sorted.map((win) => (
        <div key={win.id} className="pointer-events-auto">
          <WindowFrame window={win}>
            {renderContent(win.id, win.appId)}
          </WindowFrame>
        </div>
      ))}
    </div>
  );
}
