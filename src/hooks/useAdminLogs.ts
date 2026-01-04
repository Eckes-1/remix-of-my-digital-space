import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, any>;
  created_at: string;
}

export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'publish' 
  | 'unpublish' 
  | 'approve' 
  | 'reject'
  | 'restore'
  | 'schedule'
  | 'import'
  | 'export'
  | 'backup'
  | 'restore_backup';

export type EntityType = 
  | 'post' 
  | 'comment' 
  | 'tag' 
  | 'category' 
  | 'settings' 
  | 'theme'
  | 'version';

export const useAdminLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ['admin-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AdminLog[];
    },
  });
};

export const useLogAction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      entityName,
      details = {},
    }: {
      action: ActionType;
      entityType: EntityType;
      entityId?: string;
      entityName?: string;
      details?: Record<string, any>;
    }) => {
      const { error } = await supabase.from('admin_logs').insert({
        user_id: user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        entity_name: entityName || null,
        details,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });
};

// Helper hook to log actions easily
export const useActionLogger = () => {
  const logAction = useLogAction();

  return {
    log: (
      action: ActionType,
      entityType: EntityType,
      entityName?: string,
      entityId?: string,
      details?: Record<string, any>
    ) => {
      logAction.mutate({ action, entityType, entityId, entityName, details });
    },
    logAsync: async (
      action: ActionType,
      entityType: EntityType,
      entityName?: string,
      entityId?: string,
      details?: Record<string, any>
    ) => {
      await logAction.mutateAsync({ action, entityType, entityId, entityName, details });
    },
  };
};

// Translate action to Chinese
export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    publish: '发布',
    unpublish: '取消发布',
    approve: '审核通过',
    reject: '审核拒绝',
    restore: '恢复',
    schedule: '定时发布',
    import: '导入',
    export: '导出',
    backup: '备份',
    restore_backup: '恢复备份',
  };
  return labels[action] || action;
};

// Translate entity type to Chinese
export const getEntityLabel = (entityType: string): string => {
  const labels: Record<string, string> = {
    post: '文章',
    comment: '评论',
    tag: '标签',
    category: '分类',
    settings: '设置',
    theme: '主题',
    version: '版本',
  };
  return labels[entityType] || entityType;
};
