import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  approvedComments: number;
  totalViews: number;
  totalLikes: number;
  totalTags: number;
}

export const useDashboardStats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const postsChannel = supabase
      .channel('dashboard-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('dashboard-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    const tagsChannel = supabase
      .channel('dashboard-tags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(tagsChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, published, view_count, like_count');
      
      if (postsError) throw postsError;

      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, approved');
      
      if (commentsError) throw commentsError;

      const { count: tagsCount, error: tagsError } = await supabase
        .from('tags')
        .select('*', { count: 'exact', head: true });
      
      if (tagsError) throw tagsError;

      const publishedPosts = posts?.filter(p => p.published) || [];
      const draftPosts = posts?.filter(p => !p.published) || [];
      const pendingComments = comments?.filter(c => !c.approved) || [];
      const approvedComments = comments?.filter(c => c.approved) || [];
      const totalViews = posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const totalLikes = posts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;

      return {
        totalPosts: posts?.length || 0,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalComments: comments?.length || 0,
        pendingComments: pendingComments.length,
        approvedComments: approvedComments.length,
        totalViews,
        totalLikes,
        totalTags: tagsCount || 0,
      };
    },
    staleTime: 30000,
  });
};
