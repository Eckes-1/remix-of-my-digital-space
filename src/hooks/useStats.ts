import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch posts stats
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, published, view_count, like_count');
      
      if (postsError) throw postsError;

      // Fetch comments stats
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, approved');
      
      if (commentsError) throw commentsError;

      // Fetch tags count
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
  });
};
