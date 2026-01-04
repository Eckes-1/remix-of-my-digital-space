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
  admin_reply?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
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
    refetchInterval: 5000,
    staleTime: 2000,
  });
};

// Get all comments for admin
export const useAllComments = () => {
  return useQuery({
    queryKey: ['all-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, posts!inner(title, slug)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Comment & { posts: { title: string; slug: string } })[];
    },
    refetchInterval: 5000,
    staleTime: 2000,
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

export const useApproveComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ approved })
        .eq('id', id)
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

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useBulkApproveComments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, approved }: { ids: string[]; approved: boolean }) => {
      if (!ids.length) return;
      const { error } = await supabase
        .from('comments')
        .update({ approved })
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useBulkDeleteComments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      const { error } = await supabase
        .from('comments')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};
