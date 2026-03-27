import { useState, useCallback } from 'react';

export interface HistoryEntry {
  url: string;
  title: string;
}

export function useBrowserHistory(initialUrl: string = 'about:blank') {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { url: initialUrl, title: 'New Tab' },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = history[currentIndex];

  const navigate = useCallback((url: string, title?: string) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ url, title: title ?? url });
      return newHistory;
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const back = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const forward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return { current, history, currentIndex, navigate, back, forward, canGoBack, canGoForward };
}
