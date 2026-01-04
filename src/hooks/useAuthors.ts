import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Author {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  created_at: string;
}

export const useAuthors = () => {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Author[];
    },
  });
};

export const useAuthor = (id: string | null) => {
  return useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Author;
    },
    enabled: !!id,
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (author: Omit<Author, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('authors')
        .insert(author)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...author }: Partial<Author> & { id: string }) => {
      const { data, error } = await supabase
        .from('authors')
        .update(author)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};
