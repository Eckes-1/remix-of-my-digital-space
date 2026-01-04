// Backup and restore utility functions
import { supabase } from '@/integrations/supabase/client';

export interface BackupData {
  version: string;
  timestamp: string;
  posts: unknown[];
  comments: unknown[];
  tags: unknown[];
  categories: unknown[];
  post_tags: unknown[];
  site_settings: unknown[];
}

export const createBackup = async (): Promise<BackupData> => {
  const [postsRes, commentsRes, tagsRes, categoriesRes, postTagsRes, settingsRes] = await Promise.all([
    supabase.from('posts').select('*'),
    supabase.from('comments').select('*'),
    supabase.from('tags').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('post_tags').select('*'),
    supabase.from('site_settings').select('*'),
  ]);

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    posts: postsRes.data || [],
    comments: commentsRes.data || [],
    tags: tagsRes.data || [],
    categories: categoriesRes.data || [],
    post_tags: postTagsRes.data || [],
    site_settings: settingsRes.data || [],
  };
};

export const downloadBackup = (backup: BackupData) => {
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const restoreBackup = async (backup: BackupData): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // Validate backup format
  if (!backup.version || !backup.timestamp) {
    return { success: false, errors: ['无效的备份文件格式'] };
  }

  try {
    // Restore in order: categories, tags, posts, post_tags, comments, site_settings
    
    // Categories
    if (backup.categories?.length) {
      const { error } = await supabase.from('categories').upsert(backup.categories as any[], { onConflict: 'id' });
      if (error) errors.push(`分类恢复失败: ${error.message}`);
    }

    // Tags
    if (backup.tags?.length) {
      const { error } = await supabase.from('tags').upsert(backup.tags as any[], { onConflict: 'id' });
      if (error) errors.push(`标签恢复失败: ${error.message}`);
    }

    // Posts
    if (backup.posts?.length) {
      const { error } = await supabase.from('posts').upsert(backup.posts as any[], { onConflict: 'id' });
      if (error) errors.push(`文章恢复失败: ${error.message}`);
    }

    // Post Tags
    if (backup.post_tags?.length) {
      const { error } = await supabase.from('post_tags').upsert(backup.post_tags as any[], { onConflict: 'id' });
      if (error) errors.push(`文章标签关联恢复失败: ${error.message}`);
    }

    // Comments
    if (backup.comments?.length) {
      const { error } = await supabase.from('comments').upsert(backup.comments as any[], { onConflict: 'id' });
      if (error) errors.push(`评论恢复失败: ${error.message}`);
    }

    // Site Settings
    if (backup.site_settings?.length) {
      const { error } = await supabase.from('site_settings').upsert(backup.site_settings as any[], { onConflict: 'id' });
      if (error) errors.push(`网站设置恢复失败: ${error.message}`);
    }

    return { success: errors.length === 0, errors };
  } catch (e: any) {
    return { success: false, errors: [e.message] };
  }
};

export const parseBackupFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('无法解析备份文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
};
