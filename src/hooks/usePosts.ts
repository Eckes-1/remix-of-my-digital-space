import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  read_time: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export const usePosts = (published: boolean = true) => {
  return useQuery({
    queryKey: ['posts', published],
    queryFn: async () => {
      let query = supabase.from('posts').select('*');
      
      if (published) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query.order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });
};

export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Post | null;
    },
    enabled: !!slug,
  });
};

export const useSearchPosts = (searchQuery: string) => {
  return useQuery({
    queryKey: ['posts', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    },
    enabled: searchQuery.trim().length > 0,
  });
};

export const usePopularPosts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['posts', 'popular', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Post[];
    },
  });
};

export const useIncrementViewCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.rpc('increment_view_count', { post_slug: slug });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...post }: Partial<Post> & { id: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useBulkUpdatePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Post> }) => {
      if (!ids.length) return;
      const { error } = await supabase.from('posts').update(updates).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useBulkDeletePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      if (!ids.length) return;
      const { error } = await supabase.from('posts').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
