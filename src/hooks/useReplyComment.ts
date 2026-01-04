import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useReplyComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, reply }: { commentId: string; reply: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          admin_reply: reply,
          replied_at: new Date().toISOString(),
          replied_by: user?.id || null,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useDeleteCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          admin_reply: null,
          replied_at: null,
          replied_by: null,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};