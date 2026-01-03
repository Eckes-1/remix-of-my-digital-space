import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a simple fingerprint for anonymous users
const getUserFingerprint = (): string => {
  let fingerprint = localStorage.getItem('user_fingerprint');
  if (!fingerprint) {
    fingerprint = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('user_fingerprint', fingerprint);
  }
  return fingerprint;
};

export const useLikePost = (postId: string) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      const fingerprint = getUserFingerprint();
      
      // Check if user has liked
      const { data: liked } = await supabase.rpc('has_liked_post', {
        p_post_id: postId,
        p_user_ip: fingerprint
      });
      setHasLiked(liked || false);
      
      // Get current like count
      const { data: post } = await supabase
        .from('posts')
        .select('like_count')
        .eq('id', postId)
        .single();
      setLikeCount(post?.like_count || 0);
    };

    if (postId) {
      checkLikeStatus();
    }
  }, [postId]);

  const toggleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const fingerprint = getUserFingerprint();
    
    try {
      const { data: isNowLiked } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_ip: fingerprint
      });
      
      setHasLiked(isNowLiked);
      setLikeCount(prev => isNowLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasLiked, likeCount, toggleLike, isLoading };
};
