import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Post } from './usePosts';

export interface SearchFilters {
  query?: string;
  category?: string;
  tagId?: string;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const useAdvancedSearch = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['posts', 'advanced-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('published', true);
      
      // Text search
      if (filters.query?.trim()) {
        query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%,excerpt.ilike.%${filters.query}%`);
      }
      
      // Category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      // Date range filter
      if (filters.dateFrom) {
        query = query.gte('published_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('published_at', endOfDay.toISOString());
      }
      
      const { data, error } = await query.order('published_at', { ascending: false });
      
      if (error) throw error;
      
      let posts = data as Post[];
      
      // Author filter
      if (filters.authorId) {
        posts = posts.filter(post => (post as any).author_id === filters.authorId);
      }
      
      // Tag filter - need to filter in JS since it requires a join
      if (filters.tagId) {
        const { data: postTagData } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', filters.tagId);
        
        const postIds = postTagData?.map(pt => pt.post_id) || [];
        posts = posts.filter(post => postIds.includes(post.id));
      }
      
      return posts;
    },
  });
};
