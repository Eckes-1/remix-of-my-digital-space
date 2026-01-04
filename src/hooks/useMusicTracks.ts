import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMusicTracks = (activeOnly = true) => {
  return useQuery({
    queryKey: ['music-tracks', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('music_tracks')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MusicTrack[];
    },
  });
};

export const useCreateMusicTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (track: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('music_tracks')
        .insert([track])
        .select()
        .single();
      
      if (error) throw error;
      return data as MusicTrack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-tracks'] });
    },
  });
};

export const useUpdateMusicTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MusicTrack> & { id: string }) => {
      const { data, error } = await supabase
        .from('music_tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as MusicTrack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-tracks'] });
    },
  });
};

export const useDeleteMusicTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-tracks'] });
    },
  });
};