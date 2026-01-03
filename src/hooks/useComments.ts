import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'approved' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.post_id] });
    },
  });
};
