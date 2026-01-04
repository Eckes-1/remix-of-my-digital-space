import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'blog-bookmarks';

export interface BookmarkItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  addedAt: string;
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setBookmarks(JSON.parse(data));
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Save bookmarks to localStorage
  const saveToStorage = useCallback((items: BookmarkItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silent fail
    }
  }, []);

  // Add bookmark
  const addBookmark = useCallback((item: Omit<BookmarkItem, 'addedAt'>) => {
    setBookmarks(prev => {
      // Don't add if already exists
      if (prev.some(b => b.slug === item.slug)) {
        return prev;
      }
      const newBookmarks = [
        { ...item, addedAt: new Date().toISOString() },
        ...prev,
      ];
      saveToStorage(newBookmarks);
      return newBookmarks;
    });
  }, [saveToStorage]);

  // Remove bookmark
  const removeBookmark = useCallback((slug: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.filter(b => b.slug !== slug);
      saveToStorage(newBookmarks);
      return newBookmarks;
    });
  }, [saveToStorage]);

  // Toggle bookmark
  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'addedAt'>) => {
    const isBookmarked = bookmarks.some(b => b.slug === item.slug);
    if (isBookmarked) {
      removeBookmark(item.slug);
    } else {
      addBookmark(item);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  // Check if bookmarked
  const isBookmarked = useCallback((slug: string) => {
    return bookmarks.some(b => b.slug === slug);
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  };
};
