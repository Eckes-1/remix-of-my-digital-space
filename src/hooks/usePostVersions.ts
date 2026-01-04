import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PostVersion {
  id: string;
  post_id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  read_time: string;
  created_at: string;
  created_by: string | null;
}

export const usePostVersions = (postId: string | null) => {
  return useQuery({
    queryKey: ['post-versions', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('post_versions')
        .select('*')
        .eq('post_id', postId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as PostVersion[];
    },
    enabled: !!postId,
  });
};

export const useCreatePostVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      title, 
      content, 
      excerpt, 
      category, 
      cover_image, 
      read_time 
    }: {
      postId: string;
      title: string;
      content: string;
      excerpt: string;
      category: string;
      cover_image: string | null;
      read_time: string;
    }) => {
      // Get the latest version number
      const { data: versions } = await supabase
        .from('post_versions')
        .select('version_number')
        .eq('post_id', postId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersionNumber = versions && versions.length > 0 
        ? (versions[0].version_number + 1) 
        : 1;

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('post_versions')
        .insert({
          post_id: postId,
          version_number: nextVersionNumber,
          title,
          content,
          excerpt,
          category,
          cover_image,
          read_time,
          created_by: user?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-versions', variables.postId] });
    },
  });
};

export const useRestorePostVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, version }: { postId: string; version: PostVersion }) => {
      const { error } = await supabase
        .from('posts')
        .update({
          title: version.title,
          content: version.content,
          excerpt: version.excerpt,
          category: version.category,
          cover_image: version.cover_image,
          read_time: version.read_time,
        })
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-versions'] });
    },
  });
};
