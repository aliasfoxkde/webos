import { useState, useCallback, useEffect } from 'react';

interface Bookmark {
  url: string;
  title: string;
  addedAt: number;
}

const STORAGE_KEY = 'webos-browser-bookmarks';

function loadPersisted(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Bookmark[];
  } catch {
    // ignore
  }
  return [];
}

function persist(bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
}

export function useBrowserBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadPersisted);

  useEffect(() => {
    persist(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((url: string, title: string) => {
    setBookmarks((prev) => {
      const filtered = prev.filter((b) => b.url !== url);
      return [...filtered, { url, title, addedAt: Date.now() }];
    });
  }, []);

  const removeBookmark = useCallback((url: string) => {
    setBookmarks((prev) => prev.filter((b) => b.url !== url));
  }, []);

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.url === url),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (url: string, title: string) => {
      if (isBookmarked(url)) {
        removeBookmark(url);
      } else {
        addBookmark(url, title);
      }
    },
    [isBookmarked, removeBookmark, addBookmark],
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
