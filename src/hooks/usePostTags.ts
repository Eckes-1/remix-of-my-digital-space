import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PostTag {
  id: string;
  post_id: string;
  tag_id: string;
}

export const usePostTags = (postId: string | null) => {
  return useQuery({
    queryKey: ['post-tags', postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from('post_tags')
        .select('*, tags(*)')
        .eq('post_id', postId);

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
};

export const useUpdatePostTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, tagIds }: { postId: string; tagIds: string[] }) => {
      // First, delete all existing post_tags for this post
      const { error: deleteError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId);

      if (deleteError) throw deleteError;

      // Then, insert new post_tags
      if (tagIds.length > 0) {
        const { error: insertError } = await supabase
          .from('post_tags')
          .insert(tagIds.map(tagId => ({ post_id: postId, tag_id: tagId })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-tags', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post-tags'] });
    },
  });
};

export const useAllPostTags = () => {
  return useQuery({
    queryKey: ['all-post-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_tags')
        .select('*, tags(*)');

      if (error) throw error;
      return data;
    },
  });
};