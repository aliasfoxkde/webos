import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'webos-browser-history';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  url: string;
  title: string;
}

function loadPersisted(): HistoryEntry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return null;
  }
}

function persist(history: HistoryEntry[]) {
  const filtered = history.filter((e) => e.url !== 'about:blank').slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function useBrowserHistory(initialUrl: string = 'about:blank') {
  const persisted = useRef(loadPersisted());
  const [history, setHistory] = useState<HistoryEntry[]>(
    persisted.current ?? [{ url: initialUrl, title: 'New Tab' }],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync currentIndex when history loads from storage
  useEffect(() => {
    if (persisted.current && persisted.current.length > 0) {
      setCurrentIndex(persisted.current.length - 1);
      persisted.current = null;
    }
  }, []);

  // Persist on history change
  useEffect(() => {
    persist(history);
  }, [history]);

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

  const clearHistory = useCallback(() => {
    setHistory([{ url: 'about:blank', title: 'New Tab' }]);
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return { current, history, currentIndex, navigate, back, forward, canGoBack, canGoForward, clearHistory };
}
