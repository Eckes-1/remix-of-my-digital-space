import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSchedulePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, scheduledAt }: { postId: string; scheduledAt: string | null }) => {
      const { error } = await supabase
        .from('posts')
        .update({ 
          scheduled_at: scheduledAt,
          // If scheduling, ensure it's not published yet
          ...(scheduledAt ? { published: false, published_at: null } : {})
        })
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useCancelSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .update({ scheduled_at: null })
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Helper to format date for datetime-local input
export const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Helper to check if a post is scheduled
export const isScheduled = (scheduledAt: string | null): boolean => {
  if (!scheduledAt) return false;
  return new Date(scheduledAt) > new Date();
};
