import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DraftData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  coverImage: string | null;
}

const AUTOSAVE_DELAY = 30000; // 30 seconds
const STORAGE_KEY = 'blog_draft_autosave';

export const useAutoSave = (postId: string | null, data: DraftData) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Save to localStorage for new posts
  const saveToLocalStorage = useCallback((data: DraftData) => {
    const dataString = JSON.stringify(data);
    if (dataString !== lastSavedRef.current) {
      localStorage.setItem(STORAGE_KEY, dataString);
      lastSavedRef.current = dataString;
    }
  }, []);

  // Save to database for existing posts
  const saveToDatabaseMutation = useMutation({
    mutationFn: async ({ id, draftContent }: { id: string; draftContent: string }) => {
      const { error } = await supabase
        .from('posts')
        .update({ draft_content: draftContent })
        .eq('id', id);
      
      if (error) throw error;
    },
  });

  // Auto-save effect
  useEffect(() => {
    const dataString = JSON.stringify(data);
    
    // Don't save if data is empty or unchanged
    if (!data.title && !data.content) return;
    if (dataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (postId) {
        // Save to database for existing posts
        saveToDatabaseMutation.mutate(
          { id: postId, draftContent: dataString },
          {
            onSuccess: () => {
              toast.success('草稿已自动保存', { duration: 2000 });
              lastSavedRef.current = dataString;
            },
          }
        );
      } else {
        // Save to localStorage for new posts
        saveToLocalStorage(data);
        toast.success('草稿已自动保存到本地', { duration: 2000 });
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, postId, saveToLocalStorage, saveToDatabaseMutation]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const dataString = JSON.stringify(data);
    
    if (postId) {
      saveToDatabaseMutation.mutate(
        { id: postId, draftContent: dataString },
        {
          onSuccess: () => {
            toast.success('草稿已保存');
            lastSavedRef.current = dataString;
          },
        }
      );
    } else {
      saveToLocalStorage(data);
      toast.success('草稿已保存到本地');
    }
  }, [data, postId, saveToLocalStorage, saveToDatabaseMutation]);

  // Load draft from localStorage
  const loadDraft = useCallback((): DraftData | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    lastSavedRef.current = '';
  }, []);

  return {
    saveNow,
    loadDraft,
    clearDraft,
    isSaving: saveToDatabaseMutation.isPending,
  };
};
