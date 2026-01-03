import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Tag[];
    },
  });
};
