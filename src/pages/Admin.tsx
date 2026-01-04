import { useState, useEffect, useRef, useMemo, forwardRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, useBulkUpdatePosts, useBulkDeletePosts, useUpdatePostOrder, Post } from '@/hooks/usePosts';
import { useAllComments, useApproveComment, useDeleteComment, useBulkApproveComments, useBulkDeleteComments, Comment } from '@/hooks/useComments';
import { useReplyComment, useDeleteCommentReply } from '@/hooks/useReplyComment';
import { useTagsManagement, useCreateTag, useUpdateTag, useDeleteTag, Tag } from '@/hooks/useTagsManagement';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategories';
import { useDashboardStats } from '@/hooks/useStats';
import { useHeroSettings, useTypewriterSettings, useUpdateHeroSettings, useUpdateTypewriterSettings, useSiteSettings, useUpdateSiteSettings, HeroSettings, TypewriterSettings, SiteSettings } from '@/hooks/useSiteSettings';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useThemeStyles, THEME_STYLES } from '@/hooks/useThemeStyles';
import { usePostVersions, useCreatePostVersion, useRestorePostVersion, PostVersion } from '@/hooks/usePostVersions';
import { useSchedulePost, useCancelSchedule, formatDateTimeLocal, isScheduled } from '@/hooks/useScheduledPublish';
import { useAdminLogs, useActionLogger, getActionLabel, getEntityLabel, AdminLog, ActionType, EntityType } from '@/hooks/useAdminLogs';
import { usePostTags, useUpdatePostTags } from '@/hooks/usePostTags';
import { supabase } from '@/integrations/supabase/client';
import { exportToJSON, exportToCSV } from '@/utils/exportData';
import { createBackup, downloadBackup, restoreBackup, parseBackupFile } from '@/utils/backupRestore';
import { parseImportFile, ImportPost } from '@/utils/importPosts';
import ArticlePreview from '@/components/ArticlePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  ArrowLeft, 
  FileText,
  Eye,
  EyeOff,
  Save,
  X,
  MessageSquare,
  Check,
  XCircle,
  Upload,
  Loader2,
  LayoutDashboard,
  Tag as TagIcon,
  Settings,
  Heart,
  TrendingUp,
  FolderOpen,
  Palette,
  Filter,
  Calendar,
  Download,
  GripVertical,
  ArrowUp,
  ArrowDown,
  DatabaseBackup,
  FileUp,
  RotateCcw,
  Clock,
  History,
  RotateCw,
  Rss,
  ClipboardList,
  BookOpen,
  Reply,
  Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts(false);
  const { data: comments, isLoading: commentsLoading } = useAllComments();
  const { data: tags, isLoading: tagsLoading } = useTagsManagement();
  const { data: stats } = useDashboardStats();
  const { data: heroSettings } = useHeroSettings();
  const { data: typewriterSettings } = useTypewriterSettings();
  const { data: siteSettings } = useSiteSettings();
  const { data: categories } = useCategories();
  
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const bulkUpdatePosts = useBulkUpdatePosts();
  const bulkDeletePosts = useBulkDeletePosts();
  const updatePostOrder = useUpdatePostOrder();
  const approveComment = useApproveComment();
  const replyComment = useReplyComment();
  const deleteCommentReply = useDeleteCommentReply();
  const deleteComment = useDeleteComment();
  const bulkApproveComments = useBulkApproveComments();
  const bulkDeleteComments = useBulkDeleteComments();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const updateHeroSettings = useUpdateHeroSettings();
  const updateTypewriterSettings = useUpdateTypewriterSettings();
  const updateSiteSettings = useUpdateSiteSettings();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Comment selection state
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [bulkDeleteCommentsOpen, setBulkDeleteCommentsOpen] = useState(false);

  // Filter state for posts
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Bulk edit dialog state
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState<string>('');
  const [bulkEditReadTime, setBulkEditReadTime] = useState<string>('');

  // Bulk operation progress
  const [bulkOperating, setBulkOperating] = useState(false);

  // Sort order dialog
  const [sortOrderDialogOpen, setSortOrderDialogOpen] = useState(false);
  const [editingSortOrder, setEditingSortOrder] = useState<{ id: string; order: number } | null>(null);

  // Post form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('技术');
  const [readTime, setReadTime] = useState('5分钟');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tag form state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');

  // Category form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Settings form state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string | null>(null);
  const [heroBackgroundType, setHeroBackgroundType] = useState<'gradient' | 'image'>('gradient');
  const [heroBlur, setHeroBlur] = useState(70);
  const [typewriterEnabled, setTypewriterEnabled] = useState(true);
  const [typewriterTitleSpeed, setTypewriterTitleSpeed] = useState(200);
  const [typewriterDescSpeed, setTypewriterDescSpeed] = useState(80);
  const [typewriterLoop, setTypewriterLoop] = useState(true);
  const [typewriterLoopDelay, setTypewriterLoopDelay] = useState(3000);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

  // Site settings state
  const [siteName, setSiteName] = useState('寒冬随笔');

  // Backup and restore state
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Import posts state
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPost[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Theme styles
  const { currentTheme, setTheme, resetToDefault, defaultTheme, themes } = useThemeStyles();

  // Admin logs
  const { data: adminLogs, isLoading: logsLoading } = useAdminLogs(100);
  const { log: logAction } = useActionLogger();

  // Preview state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Scheduled publish state
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const schedulePost = useSchedulePost();
  const cancelSchedule = useCancelSchedule();

  // Version history state
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedPostForVersions, setSelectedPostForVersions] = useState<Post | null>(null);
  const { data: postVersions, isLoading: versionsLoading } = usePostVersions(selectedPostForVersions?.id || null);
  const createVersion = useCreatePostVersion();
  const restoreVersion = useRestorePostVersion();
  const [compareVersions, setCompareVersions] = useState<{ v1: PostVersion | null; v2: PostVersion | null }>({ v1: null, v2: null });

  // Post tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const updatePostTags = useUpdatePostTags();
  const { data: currentPostTags } = usePostTags(editingPost?.id || null);

  // Comment reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Log filter state
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [logFilterEntity, setLogFilterEntity] = useState<string>('all');
  const [logFilterDateStart, setLogFilterDateStart] = useState<string>('');
  const [logFilterDateEnd, setLogFilterDateEnd] = useState<string>('');

  // Auto-save
  const draftData = useMemo(() => ({
    title,
    slug,
    excerpt,
    content,
    category,
    readTime,
    coverImage,
  }), [title, slug, excerpt, content, category, readTime, coverImage]);
  
  const { loadDraft, clearDraft, saveNow, isSaving, lastSaveTime, hasUnsavedChanges } = useAutoSave(editingPost?.id || null, draftData);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      if (filterCategory !== 'all' && post.category !== filterCategory) return false;
      if (filterStatus === 'published' && !post.published) return false;
      if (filterStatus === 'draft' && post.published) return false;
      return true;
    });
  }, [posts, filterCategory, filterStatus]);

  // Unique categories from posts
  const postCategories = useMemo(() => {
    if (!posts) return [];
    return [...new Set(posts.map(p => p.category))];
  }, [posts]);

  // Filtered admin logs
  const filteredLogs = useMemo(() => {
    if (!adminLogs) return [];
    return adminLogs.filter(log => {
      if (logFilterAction !== 'all' && log.action !== logFilterAction) return false;
      if (logFilterEntity !== 'all' && log.entity_type !== logFilterEntity) return false;
      if (logFilterDateStart) {
        const logDate = new Date(log.created_at);
        const startDate = new Date(logFilterDateStart);
        if (logDate < startDate) return false;
      }
      if (logFilterDateEnd) {
        const logDate = new Date(log.created_at);
        const endDate = new Date(logFilterDateEnd);
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) return false;
      }
      return true;
    });
  }, [adminLogs, logFilterAction, logFilterEntity, logFilterDateStart, logFilterDateEnd]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setSlug(editingPost.slug);
      setExcerpt(editingPost.excerpt);
      setContent(editingPost.content);
      setCategory(editingPost.category);
      setReadTime(editingPost.read_time);
      setPublished(editingPost.published);
      setCoverImage(editingPost.cover_image);
    } else {
      resetForm();
      setSelectedTagIds([]);
    }
  }, [editingPost]);

  // Load current post tags when editing
  useEffect(() => {
    if (currentPostTags && editingPost) {
      setSelectedTagIds(currentPostTags.map((pt: any) => pt.tag_id));
    }
  }, [currentPostTags, editingPost]);

  useEffect(() => {
    if (heroSettings) {
      setHeroTitle(heroSettings.title);
      setHeroDescription(heroSettings.description);
      setHeroBadge(heroSettings.badge);
      setHeroBackgroundImage(heroSettings.backgroundImage);
      setHeroBackgroundType(heroSettings.backgroundType);
      setHeroBlur(heroSettings.blur ?? 70);
    }
  }, [heroSettings]);

  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.name);
    }
  }, [siteSettings]);

  useEffect(() => {
    if (typewriterSettings) {
      setTypewriterEnabled(typewriterSettings.enabled);
      setTypewriterTitleSpeed(typewriterSettings.titleSpeed);
      setTypewriterDescSpeed(typewriterSettings.descSpeed);
      setTypewriterLoop(typewriterSettings.loop);
      setTypewriterLoopDelay(typewriterSettings.loopDelay);
    }
  }, [typewriterSettings]);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory('技术');
    setReadTime('5分钟');
    setPublished(false);
    setCoverImage(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPost) {
      setSlug(generateSlug(value) + '-' + Date.now().toString(36));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      setCoverImage(publicUrl);
      toast.success('封面上传成功');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploadingHeroBg(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-bg-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      setHeroBackgroundImage(publicUrl);
      setHeroBackgroundType('image');
      toast.success('背景图片上传成功');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('上传失败: ' + error.message);
    } finally {
      setUploadingHeroBg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !excerpt || !content) {
      toast.error("请填写所有必填字段");
      return;
    }

    try {
      if (editingPost) {
        // Create a version before saving
        await createVersion.mutateAsync({
          postId: editingPost.id,
          title: editingPost.title,
          content: editingPost.content,
          excerpt: editingPost.excerpt,
          category: editingPost.category,
          cover_image: editingPost.cover_image,
          read_time: editingPost.read_time,
        });

        await updatePost.mutateAsync({
          id: editingPost.id,
          title,
          slug,
          excerpt,
          content,
          category,
          read_time: readTime,
          published,
          published_at: published ? new Date().toISOString() : null,
          cover_image: coverImage,
        });
        
        // Update post tags
        if (selectedTagIds.length > 0) {
          await updatePostTags.mutateAsync({ postId: editingPost.id, tagIds: selectedTagIds });
        }
        
        // Log update action with details
        logAction('update', 'post', title, editingPost.id, {
          changes: {
            title: title !== editingPost.title ? { from: editingPost.title, to: title } : undefined,
            category: category !== editingPost.category ? { from: editingPost.category, to: category } : undefined,
            published: published !== editingPost.published ? { from: editingPost.published, to: published } : undefined,
            tags: selectedTagIds,
          },
          timestamp: new Date().toISOString(),
        });
        
        toast.success("文章已更新（历史版本已保存）");
      } else {
        const result = await createPost.mutateAsync({
          title,
          slug,
          excerpt,
          content,
          category,
          read_time: readTime,
          published,
          published_at: published ? new Date().toISOString() : null,
          cover_image: coverImage,
          view_count: 0,
        });
        
        // Update post tags for new post
        if (result && selectedTagIds.length > 0) {
          await updatePostTags.mutateAsync({ postId: result.id, tagIds: selectedTagIds });
        }
        
        // Log create action
        logAction('create', 'post', title, result?.id, {
          category,
          published,
          tags: selectedTagIds,
          timestamp: new Date().toISOString(),
        });
        
        toast.success("文章已创建");
      }
      
      clearDraft();
      setIsEditorOpen(false);
      setEditingPost(null);
      resetForm();
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error("文章链接已存在，请修改");
      } else {
        toast.error("保存失败，请重试");
      }
    }
  };

  // Handle scheduled publish
  const handleSchedulePost = async (postId: string) => {
    if (!scheduledAt) {
      toast.error('请选择定时发布时间');
      return;
    }
    
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      toast.error('定时发布时间必须是未来时间');
      return;
    }

    try {
      await schedulePost.mutateAsync({ postId, scheduledAt: scheduleDate.toISOString() });
      const postTitle = posts?.find(p => p.id === postId)?.title || '未知文章';
      logAction('schedule', 'post', postTitle, postId, {
        scheduledAt: scheduleDate.toISOString(),
        timestamp: new Date().toISOString(),
      });
      toast.success(`文章已设定在 ${scheduleDate.toLocaleString('zh-CN')} 自动发布`);
      setScheduledAt('');
    } catch (error) {
      toast.error('设置定时发布失败');
    }
  };

  const handleCancelSchedule = async (postId: string) => {
    try {
      await cancelSchedule.mutateAsync(postId);
      const postTitle = posts?.find(p => p.id === postId)?.title || '未知文章';
      logAction('update', 'post', postTitle, postId, {
        action: '取消定时发布',
        timestamp: new Date().toISOString(),
      });
      toast.success('已取消定时发布');
    } catch (error) {
      toast.error('取消定时发布失败');
    }
  };

  // Handle version restore
  const handleRestoreVersion = async (version: PostVersion) => {
    if (!selectedPostForVersions) return;
    
    try {
      await restoreVersion.mutateAsync({ postId: selectedPostForVersions.id, version });
      logAction('restore', 'version', selectedPostForVersions.title, selectedPostForVersions.id, {
        restoredToVersion: version.version_number,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已恢复到版本 ${version.version_number}`);
      setVersionDialogOpen(false);
      setSelectedPostForVersions(null);
    } catch (error) {
      toast.error('恢复版本失败');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    
    const postToDelete = posts?.find(p => p.id === deletePostId);
    try {
      await deletePost.mutateAsync(deletePostId);
      logAction('delete', 'post', postToDelete?.title || '未知文章', deletePostId, {
        deletedPost: {
          title: postToDelete?.title,
          category: postToDelete?.category,
          published: postToDelete?.published,
        },
        timestamp: new Date().toISOString(),
      });
      toast.success("文章已删除");
      setDeletePostId(null);
    } catch (error) {
      toast.error("删除失败，请重试");
    }
  };

  const togglePostSelected = (postId: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (!filteredPosts?.length) return;
    const allFilteredIds = filteredPosts.map((p) => p.id);
    const allSelected = allFilteredIds.every((id) => selectedPostIds.includes(id));
    if (allSelected) {
      setSelectedPostIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedPostIds((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const selectAllPosts = () => {
    if (!posts?.length) return;
    setSelectedPostIds(posts.map((p) => p.id));
  };

  const clearSelection = () => {
    setSelectedPostIds([]);
  };

  const handleBulkPublish = async () => {
    if (!selectedPostIds.length) return;
    setBulkOperating(true);

    const now = new Date().toISOString();
    const selectedTitles = posts?.filter(p => selectedPostIds.includes(p.id)).map(p => p.title) || [];
    try {
      await bulkUpdatePosts.mutateAsync({
        ids: selectedPostIds,
        updates: { published: true, published_at: now },
      });
      logAction('publish', 'post', `批量发布 ${selectedPostIds.length} 篇文章`, undefined, {
        postIds: selectedPostIds,
        postTitles: selectedTitles,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已批量发布 ${selectedPostIds.length} 篇文章`);
      setSelectedPostIds([]);
    } catch (error) {
      toast.error("批量发布失败");
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (!selectedPostIds.length) return;
    setBulkOperating(true);
    const selectedTitles = posts?.filter(p => selectedPostIds.includes(p.id)).map(p => p.title) || [];
    try {
      await bulkUpdatePosts.mutateAsync({
        ids: selectedPostIds,
        updates: { published: false, published_at: null },
      });
      logAction('unpublish', 'post', `批量取消发布 ${selectedPostIds.length} 篇文章`, undefined, {
        postIds: selectedPostIds,
        postTitles: selectedTitles,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已将 ${selectedPostIds.length} 篇文章转为草稿`);
      setSelectedPostIds([]);
    } catch (error) {
      toast.error("批量修改失败");
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedPostIds.length) return;
    setBulkOperating(true);
    const selectedTitles = posts?.filter(p => selectedPostIds.includes(p.id)).map(p => p.title) || [];
    try {
      await bulkDeletePosts.mutateAsync({ ids: selectedPostIds });
      logAction('delete', 'post', `批量删除 ${selectedPostIds.length} 篇文章`, undefined, {
        postIds: selectedPostIds,
        postTitles: selectedTitles,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已删除 ${selectedPostIds.length} 篇文章`);
      setSelectedPostIds([]);
      setBulkDeleteOpen(false);
    } catch (error) {
      toast.error("批量删除失败");
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkEdit = async () => {
    if (!selectedPostIds.length) return;
    setBulkOperating(true);
    
    const updates: Partial<Post> = {};
    if (bulkEditCategory) updates.category = bulkEditCategory;
    if (bulkEditReadTime) updates.read_time = bulkEditReadTime;

    if (Object.keys(updates).length === 0) {
      toast.error("请选择要修改的内容");
      setBulkOperating(false);
      return;
    }

    const selectedTitles = posts?.filter(p => selectedPostIds.includes(p.id)).map(p => p.title) || [];
    try {
      await bulkUpdatePosts.mutateAsync({ ids: selectedPostIds, updates });
      logAction('update', 'post', `批量修改 ${selectedPostIds.length} 篇文章`, undefined, {
        postIds: selectedPostIds,
        postTitles: selectedTitles,
        updates,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已批量修改 ${selectedPostIds.length} 篇文章`);
      setSelectedPostIds([]);
      setBulkEditOpen(false);
      setBulkEditCategory('');
      setBulkEditReadTime('');
    } catch (error) {
      toast.error("批量修改失败");
    } finally {
      setBulkOperating(false);
    }
  };

  // Move post up/down in sort order
  const handleMovePost = useCallback(async (postId: string, direction: 'up' | 'down') => {
    if (!posts) return;
    const currentIndex = posts.findIndex(p => p.id === postId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const currentPost = posts[currentIndex];
    const targetPost = posts[targetIndex];
    
    try {
      await updatePostOrder.mutateAsync([
        { id: currentPost.id, sort_order: targetPost.sort_order ?? 0 },
        { id: targetPost.id, sort_order: currentPost.sort_order ?? 0 },
      ]);
      toast.success('排序已更新');
    } catch (error) {
      toast.error('排序更新失败');
    }
  }, [posts, updatePostOrder]);

  // Update specific post sort order
  const handleUpdateSortOrder = async () => {
    if (!editingSortOrder) return;
    try {
      await updatePostOrder.mutateAsync([{ id: editingSortOrder.id, sort_order: editingSortOrder.order }]);
      toast.success('排序权重已更新');
      setSortOrderDialogOpen(false);
      setEditingSortOrder(null);
    } catch (error) {
      toast.error('更新失败');
    }
  };

  // Comment handlers
  const handleApproveComment = async (id: string, approved: boolean) => {
    const comment = comments?.find(c => c.id === id);
    try {
      await approveComment.mutateAsync({ id, approved });
      logAction(approved ? 'approve' : 'reject', 'comment', comment?.author_name || '未知评论者', id, {
        action: approved ? '审核通过' : '取消通过',
        postTitle: comment?.posts.title,
        timestamp: new Date().toISOString(),
      });
      toast.success(approved ? "评论已通过" : "评论已取消通过");
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    const comment = comments?.find(c => c.id === deleteCommentId);
    try {
      await deleteComment.mutateAsync(deleteCommentId);
      logAction('delete', 'comment', comment?.author_name || '未知评论者', deleteCommentId, {
        content: comment?.content?.substring(0, 100),
        postTitle: comment?.posts.title,
        timestamp: new Date().toISOString(),
      });
      toast.success("评论已删除");
      setDeleteCommentId(null);
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // Comment reply handlers
  const handleReplyComment = async () => {
    if (!replyingCommentId || !replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }
    const comment = comments?.find(c => c.id === replyingCommentId);
    try {
      await replyComment.mutateAsync({ commentId: replyingCommentId, reply: replyContent.trim() });
      logAction('update', 'comment', `回复评论: ${comment?.author_name}`, replyingCommentId, {
        replyContent: replyContent.substring(0, 100),
        postTitle: comment?.posts.title,
        timestamp: new Date().toISOString(),
      });
      toast.success('回复成功');
      setReplyingCommentId(null);
      setReplyContent('');
    } catch (error) {
      toast.error('回复失败');
    }
  };

  const handleDeleteReply = async (commentId: string) => {
    const comment = comments?.find(c => c.id === commentId);
    try {
      await deleteCommentReply.mutateAsync(commentId);
      logAction('delete', 'comment', `删除回复: ${comment?.author_name}`, commentId, {
        timestamp: new Date().toISOString(),
      });
      toast.success('回复已删除');
    } catch (error) {
      toast.error('删除回复失败');
    }
  };

  // Comment bulk actions
  const toggleCommentSelected = (commentId: string) => {
    setSelectedCommentIds((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
  };

  const toggleSelectAllComments = (commentList: (Comment & { posts: { title: string; slug: string } })[]) => {
    const allIds = commentList.map(c => c.id);
    const allSelected = allIds.every(id => selectedCommentIds.includes(id));
    if (allSelected) {
      setSelectedCommentIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedCommentIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleBulkApproveComments = async (approved: boolean) => {
    if (!selectedCommentIds.length) return;
    setBulkOperating(true);
    try {
      await bulkApproveComments.mutateAsync({ ids: selectedCommentIds, approved });
      logAction(approved ? 'approve' : 'reject', 'comment', `批量${approved ? '通过' : '取消通过'} ${selectedCommentIds.length} 条评论`, undefined, {
        commentIds: selectedCommentIds,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已${approved ? '通过' : '取消通过'} ${selectedCommentIds.length} 条评论`);
      setSelectedCommentIds([]);
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkDeleteComments = async () => {
    if (!selectedCommentIds.length) return;
    setBulkOperating(true);
    try {
      await bulkDeleteComments.mutateAsync(selectedCommentIds);
      logAction('delete', 'comment', `批量删除 ${selectedCommentIds.length} 条评论`, undefined, {
        commentIds: selectedCommentIds,
        timestamp: new Date().toISOString(),
      });
      toast.success(`已删除 ${selectedCommentIds.length} 条评论`);
      setSelectedCommentIds([]);
      setBulkDeleteCommentsOpen(false);
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setBulkOperating(false);
    }
  };

  // Export handlers
  const handleExportPosts = (format: 'json' | 'csv') => {
    if (!posts?.length) {
      toast.error('没有可导出的文章');
      return;
    }
    const data = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      read_time: p.read_time,
      published: p.published,
      published_at: p.published_at,
      view_count: p.view_count,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
    if (format === 'json') {
      exportToJSON(data, `posts-${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(data, `posts-${new Date().toISOString().slice(0, 10)}`);
    }
    logAction('export', 'post', `导出 ${posts.length} 篇文章`, undefined, {
      format,
      count: posts.length,
      timestamp: new Date().toISOString(),
    });
    toast.success('导出成功');
  };

  const handleExportComments = (format: 'json' | 'csv') => {
    if (!comments?.length) {
      toast.error('没有可导出的评论');
      return;
    }
    const data = comments.map(c => ({
      id: c.id,
      author_name: c.author_name,
      author_email: c.author_email,
      content: c.content,
      approved: c.approved,
      post_title: c.posts.title,
      post_slug: c.posts.slug,
      created_at: c.created_at,
    }));
    if (format === 'json') {
      exportToJSON(data, `comments-${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(data, `comments-${new Date().toISOString().slice(0, 10)}`);
    }
    logAction('export', 'comment', `导出 ${comments.length} 条评论`, undefined, {
      format,
      count: comments.length,
      timestamp: new Date().toISOString(),
    });
    toast.success('导出成功');
  };

  const handleExportTags = (format: 'json' | 'csv') => {
    if (!tags?.length) {
      toast.error('没有可导出的标签');
      return;
    }
    const data = tags.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      created_at: t.created_at,
    }));
    if (format === 'json') {
      exportToJSON(data, `tags-${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(data, `tags-${new Date().toISOString().slice(0, 10)}`);
    }
    logAction('export', 'tag', `导出 ${tags.length} 个标签`, undefined, {
      format,
      count: tags.length,
      timestamp: new Date().toISOString(),
    });
    toast.success('导出成功');
  };

  const handleExportCategories = (format: 'json' | 'csv') => {
    if (!categories?.length) {
      toast.error('没有可导出的分类');
      return;
    }
    const data = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      created_at: c.created_at,
    }));
    if (format === 'json') {
      exportToJSON(data, `categories-${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToCSV(data, `categories-${new Date().toISOString().slice(0, 10)}`);
    }
    logAction('export', 'category', `导出 ${categories.length} 个分类`, undefined, {
      format,
      count: categories.length,
      timestamp: new Date().toISOString(),
    });
    toast.success('导出成功');
  };

  // Tag handlers
  const handleTagNameChange = (value: string) => {
    setTagName(value);
    if (!editingTag) {
      setTagSlug(generateSlug(value));
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName || !tagSlug) {
      toast.error("请填写所有字段");
      return;
    }

    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.id, name: tagName, slug: tagSlug });
        logAction('update', 'tag', tagName, editingTag.id, {
          changes: {
            name: tagName !== editingTag.name ? { from: editingTag.name, to: tagName } : undefined,
            slug: tagSlug !== editingTag.slug ? { from: editingTag.slug, to: tagSlug } : undefined,
          },
          timestamp: new Date().toISOString(),
        });
        toast.success("标签已更新");
      } else {
        await createTag.mutateAsync({ name: tagName, slug: tagSlug });
        logAction('create', 'tag', tagName, undefined, {
          slug: tagSlug,
          timestamp: new Date().toISOString(),
        });
        toast.success("标签已创建");
      }
      setIsTagDialogOpen(false);
      setEditingTag(null);
      setTagName('');
      setTagSlug('');
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error("标签已存在");
      } else {
        toast.error("保存失败");
      }
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTagId) return;
    const tagToDelete = tags?.find(t => t.id === deleteTagId);
    try {
      await deleteTagMutation.mutateAsync(deleteTagId);
      logAction('delete', 'tag', tagToDelete?.name || '未知标签', deleteTagId, {
        timestamp: new Date().toISOString(),
      });
      toast.success("标签已删除");
      setDeleteTagId(null);
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // Settings handlers
  const handleSaveHeroSettings = async () => {
    try {
      await updateHeroSettings.mutateAsync({
        title: heroTitle,
        description: heroDescription,
        badge: heroBadge,
        backgroundImage: heroBackgroundImage,
        backgroundType: heroBackgroundType,
        blur: heroBlur,
      });
      logAction('update', 'settings', 'Hero区域设置', undefined, {
        title: heroTitle,
        backgroundType: heroBackgroundType,
        timestamp: new Date().toISOString(),
      });
      toast.success("Hero设置已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  // Category handlers
  const handleCategoryNameChange = (value: string) => {
    setCategoryName(value);
    if (!editingCategory) {
      setCategorySlug(generateSlug(value));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !categorySlug) {
      toast.error("请填写所有字段");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, name: categoryName, slug: categorySlug, description: categoryDescription });
        logAction('update', 'category', categoryName, editingCategory.id, {
          changes: {
            name: categoryName !== editingCategory.name ? { from: editingCategory.name, to: categoryName } : undefined,
          },
          timestamp: new Date().toISOString(),
        });
        toast.success("分类已更新");
      } else {
        await createCategory.mutateAsync({ name: categoryName, slug: categorySlug, description: categoryDescription });
        logAction('create', 'category', categoryName, undefined, {
          slug: categorySlug,
          description: categoryDescription,
          timestamp: new Date().toISOString(),
        });
        toast.success("分类已创建");
      }
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName('');
      setCategorySlug('');
      setCategoryDescription('');
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error("分类已存在");
      } else {
        toast.error("保存失败");
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    const categoryToDelete = categories?.find(c => c.id === deleteCategoryId);
    try {
      await deleteCategoryMutation.mutateAsync(deleteCategoryId);
      logAction('delete', 'category', categoryToDelete?.name || '未知分类', deleteCategoryId, {
        timestamp: new Date().toISOString(),
      });
      toast.success("分类已删除");
      setDeleteCategoryId(null);
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleSaveSiteSettings = async () => {
    try {
      await updateSiteSettings.mutateAsync({
        name: siteName,
      });
      logAction('update', 'settings', '网站设置', undefined, {
        siteName,
        timestamp: new Date().toISOString(),
      });
      toast.success("网站设置已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleSaveTypewriterSettings = async () => {
    try {
      await updateTypewriterSettings.mutateAsync({
        enabled: typewriterEnabled,
        titleSpeed: typewriterTitleSpeed,
        descSpeed: typewriterDescSpeed,
        loop: typewriterLoop,
        loopDelay: typewriterLoopDelay,
      });
      logAction('update', 'settings', '打字机设置', undefined, {
        enabled: typewriterEnabled,
        titleSpeed: typewriterTitleSpeed,
        timestamp: new Date().toISOString(),
      });
      toast.success("打字机设置已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  // Backup handlers
  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      const backup = await createBackup();
      downloadBackup(backup);
      logAction('backup', 'settings', '创建数据备份', undefined, {
        postsCount: backup.posts?.length || 0,
        commentsCount: backup.comments?.length || 0,
        tagsCount: backup.tags?.length || 0,
        categoriesCount: backup.categories?.length || 0,
        timestamp: new Date().toISOString(),
      });
      toast.success('备份已创建并下载');
    } catch (error: any) {
      toast.error('备份失败: ' + error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    try {
      const backup = await parseBackupFile(file);
      const result = await restoreBackup(backup);
      
      if (result.success) {
        logAction('restore_backup', 'settings', '恢复数据备份', undefined, {
          fileName: file.name,
          timestamp: new Date().toISOString(),
        });
        toast.success('数据恢复成功');
      } else {
        logAction('restore_backup', 'settings', '恢复数据备份(有错误)', undefined, {
          fileName: file.name,
          errors: result.errors,
          timestamp: new Date().toISOString(),
        });
        toast.error(`恢复完成但有错误: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      toast.error('恢复失败: ' + error.message);
    } finally {
      setRestoreLoading(false);
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
  };

  // Import posts handlers
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const posts = await parseImportFile(file);
      if (posts.length === 0) {
        toast.error('未找到可导入的文章');
        return;
      }
      setImportPreview(posts);
      setImportDialogOpen(true);
    } catch (error: any) {
      toast.error('解析文件失败: ' + error.message);
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview.length) return;
    
    setImportLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const post of importPreview) {
      try {
        await createPost.mutateAsync({
          title: post.title,
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content,
          category: post.category || '技术',
          read_time: post.read_time || '5分钟',
          published: post.published || false,
          published_at: post.published ? new Date().toISOString() : null,
          cover_image: post.cover_image || null,
          view_count: 0,
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    logAction('import', 'post', `导入 ${successCount} 篇文章`, undefined, {
      totalAttempted: importPreview.length,
      successCount,
      errorCount,
      postTitles: importPreview.map(p => p.title),
      timestamp: new Date().toISOString(),
    });

    setImportLoading(false);
    setImportDialogOpen(false);
    setImportPreview([]);

    if (errorCount === 0) {
      toast.success(`成功导入 ${successCount} 篇文章`);
    } else {
      toast.warning(`导入完成: ${successCount} 篇成功, ${errorCount} 篇失败`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingComments = comments?.filter(c => !c.approved) || [];
  const approvedComments = comments?.filter(c => c.approved) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">返回首页</span>
              </Link>
              <div className="h-5 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h1 className="font-serif text-base sm:text-lg font-semibold text-foreground">后台管理</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</span>
                {isAdmin && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    管理员
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">退出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {!isAdmin ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">您没有管理员权限</p>
            <Link to="/" className="text-primary hover:underline">返回首页</Link>
          </div>
        ) : (
          <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
            {/* Scrollable TabsList for mobile */}
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-7 sm:w-full sm:max-w-4xl">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 px-3 sm:px-4">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">仪表盘</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2 px-3 sm:px-4">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">文章</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2 px-3 sm:px-4">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">评论</span>
                  {pendingComments.length > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                      {pendingComments.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center gap-2 px-3 sm:px-4">
                  <TagIcon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">标签</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2 px-3 sm:px-4">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">分类</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2 px-3 sm:px-4">
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">日志</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 px-3 sm:px-4">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">设置</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">仪表盘</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  label="文章总数"
                  value={stats?.totalPosts || 0}
                  subLabel={`已发布 ${stats?.publishedPosts || 0} / 草稿 ${stats?.draftPosts || 0}`}
                  icon={<FileText className="w-5 h-5" />}
                />
                <StatCard
                  label="评论总数"
                  value={stats?.totalComments || 0}
                  subLabel={`待审核 ${stats?.pendingComments || 0}`}
                  icon={<MessageSquare className="w-5 h-5" />}
                />
                <StatCard
                  label="总访问量"
                  value={stats?.totalViews || 0}
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                  label="总点赞"
                  value={stats?.totalLikes || 0}
                  icon={<Heart className="w-5 h-5" />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="blog-card">
                  <h3 className="font-semibold mb-4">标签统计</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.totalTags || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">个标签</p>
                </div>
                <div className="blog-card">
                  <h3 className="font-semibold mb-4">快速操作</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}>
                      <Plus className="w-4 h-4 mr-1" />
                      新建文章
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingTag(null); setTagName(''); setTagSlug(''); setIsTagDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-1" />
                      新建标签
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  文章管理 ({filteredPosts?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    新建
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportPosts('json')}>
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportPosts('csv')}>
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="blog-card">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">筛选：</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="published">已发布</SelectItem>
                        <SelectItem value="draft">草稿</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        {postCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : filteredPosts?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无文章，点击上方按钮创建第一篇文章
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Bulk actions bar */}
                  <div className="blog-card">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          checked={filteredPosts.length > 0 && filteredPosts.every(p => selectedPostIds.includes(p.id))}
                          onChange={toggleSelectAllFiltered}
                          className="h-4 w-4 rounded border-border"
                          aria-label="全选当前筛选结果"
                        />
                        <span className="text-sm text-muted-foreground">
                          已选 {selectedPostIds.length} / {posts?.length || 0}
                        </span>
                        <Button variant="ghost" size="sm" onClick={selectAllPosts} className="text-xs h-7 px-2">
                          全选所有
                        </Button>
                        {selectedPostIds.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-7 px-2">
                            清除选择
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={handleBulkPublish}
                          disabled={!selectedPostIds.length || bulkOperating}
                          className="h-8 text-xs sm:text-sm"
                        >
                          {bulkOperating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          批量发布
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBulkUnpublish}
                          disabled={!selectedPostIds.length || bulkOperating}
                          className="h-8 text-xs sm:text-sm"
                        >
                          转为草稿
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBulkEditOpen(true)}
                          disabled={!selectedPostIds.length || bulkOperating}
                          className="h-8 text-xs sm:text-sm"
                        >
                          批量修改
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBulkDeleteOpen(true)}
                          disabled={!selectedPostIds.length || bulkOperating}
                          className="h-8 text-xs sm:text-sm text-destructive hover:text-destructive"
                        >
                          批量删除
                        </Button>
                      </div>
                    </div>
                  </div>

                  {filteredPosts?.map((post, index) => (
                    <div key={post.id} className="blog-card p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(post.id)}
                          onChange={() => togglePostSelected(post.id)}
                          className="h-4 w-4 rounded border-border mt-1 flex-shrink-0"
                        />
                        
                        {/* Sort controls */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={index === 0}
                            onClick={() => handleMovePost(post.id, 'up')}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={index === filteredPosts.length - 1}
                            onClick={() => handleMovePost(post.id, 'down')}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>

                        {post.cover_image && (
                          <img 
                            src={post.cover_image} 
                            alt="" 
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 relative">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{post.title}</h3>
                            {post.published ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                <Eye className="w-3 h-3" />
                                已发布
                              </span>
                            ) : (post as any).scheduled_at && isScheduled((post as any).scheduled_at) ? (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                定时 {new Date((post as any).scheduled_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                <EyeOff className="w-3 h-3" />
                                草稿
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-secondary px-2 py-0.5 rounded">{post.category}</span>
                            <span>{post.read_time}</span>
                            <span>·</span>
                            <span>👁 {post.view_count}</span>
                            <span
                              className="cursor-pointer hover:text-primary"
                              onClick={() => {
                                setEditingSortOrder({ id: post.id, order: post.sort_order ?? 0 });
                                setSortOrderDialogOpen(true);
                              }}
                            >
                              权重: {post.sort_order ?? 0}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                              className="h-8 w-8 p-0"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedPostForVersions(post); setVersionDialogOpen(true); }}
                              className="h-8 w-8 p-0"
                              title="版本历史"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            {!post.published && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const defaultTime = new Date();
                                  defaultTime.setHours(defaultTime.getHours() + 1);
                                  setScheduledAt(formatDateTimeLocal(defaultTime));
                                  setEditingPost(post);
                                }}
                                className="h-8 w-8 p-0"
                                title="定时发布"
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletePostId(post.id)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  评论管理 ({comments?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportComments('json')}>
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportComments('csv')}>
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Bulk actions for comments */}
              {comments && comments.length > 0 && (
                <div className="blog-card">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <input
                        type="checkbox"
                        checked={comments.length > 0 && comments.every(c => selectedCommentIds.includes(c.id))}
                        onChange={() => toggleSelectAllComments(comments)}
                        className="h-4 w-4 rounded border-border"
                        aria-label="全选评论"
                      />
                      <span className="text-sm text-muted-foreground">
                        已选 {selectedCommentIds.length} / {comments.length}
                      </span>
                      {selectedCommentIds.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCommentIds([])} className="text-xs h-7 px-2">
                          清除选择
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBulkApproveComments(true)}
                        disabled={!selectedCommentIds.length || bulkOperating}
                        className="h-8 text-xs sm:text-sm"
                      >
                        批量通过
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkApproveComments(false)}
                        disabled={!selectedCommentIds.length || bulkOperating}
                        className="h-8 text-xs sm:text-sm"
                      >
                        批量取消通过
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBulkDeleteCommentsOpen(true)}
                        disabled={!selectedCommentIds.length || bulkOperating}
                        className="h-8 text-xs sm:text-sm text-destructive hover:text-destructive"
                      >
                        批量删除
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {commentsLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : comments?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">暂无评论</div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {pendingComments.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        待审核 ({pendingComments.length})
                      </h3>
                      {pendingComments.map((comment) => (
                        <CommentCard 
                          key={comment.id}
                          comment={comment}
                          selected={selectedCommentIds.includes(comment.id)}
                          onSelect={() => toggleCommentSelected(comment.id)}
                          onApprove={() => handleApproveComment(comment.id, true)}
                          onDelete={() => setDeleteCommentId(comment.id)}
                          onReply={() => {
                            setReplyingCommentId(comment.id);
                            setReplyContent((comment as any).admin_reply || '');
                          }}
                          onDeleteReply={() => handleDeleteReply(comment.id)}
                          isReplying={replyingCommentId === comment.id}
                          replyContent={replyingCommentId === comment.id ? replyContent : ''}
                          onReplyContentChange={(v) => setReplyContent(v)}
                          onSubmitReply={handleReplyComment}
                          onCancelReply={() => { setReplyingCommentId(null); setReplyContent(''); }}
                          isReplyLoading={replyComment.isPending}
                        />
                      ))}
                    </div>
                  )}

                  {approvedComments.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        已通过 ({approvedComments.length})
                      </h3>
                      {approvedComments.map((comment) => (
                        <CommentCard 
                          key={comment.id}
                          comment={comment}
                          selected={selectedCommentIds.includes(comment.id)}
                          onSelect={() => toggleCommentSelected(comment.id)}
                          onApprove={() => handleApproveComment(comment.id, false)}
                          onDelete={() => setDeleteCommentId(comment.id)}
                          onReply={() => {
                            setReplyingCommentId(comment.id);
                            setReplyContent((comment as any).admin_reply || '');
                          }}
                          onDeleteReply={() => handleDeleteReply(comment.id)}
                          isReplying={replyingCommentId === comment.id}
                          replyContent={replyingCommentId === comment.id ? replyContent : ''}
                          onReplyContentChange={(v) => setReplyContent(v)}
                          onSubmitReply={handleReplyComment}
                          onCancelReply={() => { setReplyingCommentId(null); setReplyContent(''); }}
                          isReplyLoading={replyComment.isPending}
                          isApproved
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  标签管理 ({tags?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { setEditingTag(null); setTagName(''); setTagSlug(''); setIsTagDialogOpen(true); }} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    新建
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportTags('json')}>
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportTags('csv')}>
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              {tagsLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : tags?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无标签，点击上方按钮创建
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {tags?.map((tag) => (
                    <div key={tag.id} className="blog-card flex items-center justify-between p-3 sm:p-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{tag.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">/{tag.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingTag(tag); setTagName(tag.name); setTagSlug(tag.slug); setIsTagDialogOpen(true); }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTagId(tag.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  分类管理 ({categories?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { setEditingCategory(null); setCategoryName(''); setCategorySlug(''); setCategoryDescription(''); setIsCategoryDialogOpen(true); }} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    新建
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportCategories('json')}>
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportCategories('csv')}>
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              {!categories?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无分类，点击上方按钮创建
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="blog-card p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{cat.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">/{cat.slug}</p>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { 
                              setEditingCategory(cat); 
                              setCategoryName(cat.name); 
                              setCategorySlug(cat.slug); 
                              setCategoryDescription(cat.description || ''); 
                              setIsCategoryDialogOpen(true); 
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteCategoryId(cat.id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 sm:space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">网站设置</h2>
              
              <div className="grid gap-4 sm:gap-6">
                {/* Hero Settings */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg">Hero区域设置</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>标题</Label>
                      <Input
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        placeholder="寒冬随笔"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>徽章文字</Label>
                      <Input
                        value={heroBadge}
                        onChange={(e) => setHeroBadge(e.target.value)}
                        placeholder="欢迎来到我的博客"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Textarea
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      placeholder="在这里，我分享关于技术、生活与思考的点滴..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>背景类型</Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={heroBackgroundType === 'gradient'}
                          onChange={() => setHeroBackgroundType('gradient')}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">渐变背景</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={heroBackgroundType === 'image'}
                          onChange={() => setHeroBackgroundType('image')}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">图片背景</span>
                      </label>
                    </div>
                  </div>

                  {heroBackgroundType === 'image' && (
                    <>
                      <div className="space-y-2">
                        <Label>背景图片</Label>
                        <div className="flex items-start gap-4">
                          {heroBackgroundImage ? (
                            <div className="relative group">
                              <img 
                                src={heroBackgroundImage} 
                                alt="Background" 
                                className="w-40 h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => setHeroBackgroundImage(null)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => heroBgInputRef.current?.click()}
                              disabled={uploadingHeroBg}
                              className="w-40 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                              {uploadingHeroBg ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  <span className="text-xs">上传背景</span>
                                </>
                              )}
                            </button>
                          )}
                          <input
                            ref={heroBgInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleHeroBgUpload}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>背景模糊度: {heroBlur}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={heroBlur}
                          onChange={(e) => setHeroBlur(Number(e.target.value))}
                          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-muted-foreground">0% = 完全透明，100% = 完全不透明</p>
                      </div>
                    </>
                  )}

                  <Button onClick={handleSaveHeroSettings} disabled={updateHeroSettings.isPending} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    保存Hero设置
                  </Button>
                </div>

                {/* Typewriter Settings */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg">打字机效果设置</h3>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="typewriter-enabled"
                      checked={typewriterEnabled}
                      onCheckedChange={setTypewriterEnabled}
                    />
                    <Label htmlFor="typewriter-enabled">启用打字机效果</Label>
                  </div>

                  {typewriterEnabled && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>标题打字速度 (ms)</Label>
                          <Input
                            type="number"
                            value={typewriterTitleSpeed}
                            onChange={(e) => setTypewriterTitleSpeed(Number(e.target.value))}
                            min={50}
                            max={500}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>描述打字速度 (ms)</Label>
                          <Input
                            type="number"
                            value={typewriterDescSpeed}
                            onChange={(e) => setTypewriterDescSpeed(Number(e.target.value))}
                            min={20}
                            max={200}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="typewriter-loop"
                          checked={typewriterLoop}
                          onCheckedChange={setTypewriterLoop}
                        />
                        <Label htmlFor="typewriter-loop">循环播放</Label>
                      </div>

                      {typewriterLoop && (
                        <div className="space-y-2">
                          <Label>循环延迟 (ms)</Label>
                          <Input
                            type="number"
                            value={typewriterLoopDelay}
                            onChange={(e) => setTypewriterLoopDelay(Number(e.target.value))}
                            min={1000}
                            max={10000}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <Button onClick={handleSaveTypewriterSettings} disabled={updateTypewriterSettings.isPending} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    保存打字机设置
                  </Button>
                </div>

                {/* Site Settings */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    网站基本设置
                  </h3>
                  
                  <div className="space-y-2">
                    <Label>网站名称</Label>
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="寒冬随笔"
                    />
                  </div>

                  <Button onClick={handleSaveSiteSettings} disabled={updateSiteSettings.isPending} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    保存网站设置
                  </Button>
                </div>

                {/* Theme Styles */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    网站风格
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    选择一种风格应用到整个网站，每种风格都有独特的字体、圆角、间距、阴影和动画效果
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          const previousTheme = currentTheme;
                          setTheme(theme.id);
                          logAction('update', 'theme', theme.name, undefined, {
                            from: previousTheme,
                            to: theme.id,
                            themeName: theme.name,
                            timestamp: new Date().toISOString(),
                          });
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left group ${
                          currentTheme === theme.id 
                            ? 'border-primary bg-primary/10 shadow-lg' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full shadow-inner" 
                              style={{ backgroundColor: `hsl(${theme.colors.light['--primary']})` }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full opacity-60" 
                              style={{ backgroundColor: `hsl(${theme.colors.light['--accent']})` }}
                            />
                          </div>
                          {currentTheme === theme.id && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              当前
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium mb-1">{theme.name}</div>
                        <div className="text-xs text-muted-foreground mb-3">{theme.description}</div>
                        
                        {/* Style attributes */}
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                            {theme.spacing === 'compact' ? '紧凑' : theme.spacing === 'spacious' ? '宽松' : '标准'}间距
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                            {theme.shadows === 'none' ? '无' : theme.shadows === 'subtle' ? '微弱' : theme.shadows === 'medium' ? '中等' : '强烈'}阴影
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                            {theme.cardStyle === 'flat' ? '扁平' : theme.cardStyle === 'elevated' ? '浮动' : theme.cardStyle === 'bordered' ? '边框' : '玻璃'}卡片
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                            {theme.animations === 'none' ? '无' : theme.animations === 'minimal' ? '极简' : theme.animations === 'smooth' ? '流畅' : '活泼'}动画
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Reset to default */}
                  {currentTheme !== defaultTheme && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const previousTheme = currentTheme;
                        resetToDefault();
                        logAction('update', 'theme', '恢复默认风格', undefined, {
                          from: previousTheme,
                          to: defaultTheme,
                          timestamp: new Date().toISOString(),
                        });
                        toast.success('已恢复默认风格');
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      恢复默认风格
                    </Button>
                  )}
                </div>

                {/* Backup & Restore */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <DatabaseBackup className="w-5 h-5" />
                    数据备份与恢复
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    备份所有文章、评论、标签、分类和设置数据。恢复时会合并现有数据。
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCreateBackup}
                      disabled={backupLoading}
                    >
                      {backupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      一键备份
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => backupInputRef.current?.click()}
                      disabled={restoreLoading}
                    >
                      {restoreLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                      恢复数据
                    </Button>
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleRestoreBackup}
                    />
                  </div>
                </div>

                {/* Import Posts */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    导入文章
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    支持从 JSON 或 CSV 文件批量导入文章。文件应包含 title, content 字段，可选 slug, excerpt, category, read_time, published 等字段。
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => importInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      选择文件
                    </Button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json,.csv"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </div>
                </div>

                {/* RSS Feed */}
                <div className="blog-card space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Rss className="w-5 h-5" />
                    RSS 订阅
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    提供 RSS feed 让读者可以订阅您的博客更新。
                  </p>
                  
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <code className="text-sm break-all">
                      {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rss-feed`}
                    </code>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rss-feed`, '_blank');
                    }}
                  >
                    <Rss className="w-4 h-4 mr-2" />
                    查看 RSS Feed
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  操作日志 ({filteredLogs.length})
                </h2>
              </div>

              {/* Log Filters */}
              <div className="blog-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">筛选条件</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">操作类型</Label>
                    <Select value={logFilterAction} onValueChange={setLogFilterAction}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="全部操作" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部操作</SelectItem>
                        <SelectItem value="create">创建</SelectItem>
                        <SelectItem value="update">更新</SelectItem>
                        <SelectItem value="delete">删除</SelectItem>
                        <SelectItem value="publish">发布</SelectItem>
                        <SelectItem value="unpublish">取消发布</SelectItem>
                        <SelectItem value="approve">审核通过</SelectItem>
                        <SelectItem value="reject">审核拒绝</SelectItem>
                        <SelectItem value="backup">备份</SelectItem>
                        <SelectItem value="restore_backup">恢复备份</SelectItem>
                        <SelectItem value="import">导入</SelectItem>
                        <SelectItem value="export">导出</SelectItem>
                        <SelectItem value="schedule">定时发布</SelectItem>
                        <SelectItem value="restore">恢复版本</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">实体类型</Label>
                    <Select value={logFilterEntity} onValueChange={setLogFilterEntity}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="全部实体" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部实体</SelectItem>
                        <SelectItem value="post">文章</SelectItem>
                        <SelectItem value="comment">评论</SelectItem>
                        <SelectItem value="tag">标签</SelectItem>
                        <SelectItem value="category">分类</SelectItem>
                        <SelectItem value="settings">设置</SelectItem>
                        <SelectItem value="theme">主题</SelectItem>
                        <SelectItem value="version">版本</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">开始日期</Label>
                    <Input
                      type="date"
                      value={logFilterDateStart}
                      onChange={(e) => setLogFilterDateStart(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">结束日期</Label>
                    <Input
                      type="date"
                      value={logFilterDateEnd}
                      onChange={(e) => setLogFilterDateEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                {(logFilterAction !== 'all' || logFilterEntity !== 'all' || logFilterDateStart || logFilterDateEnd) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      setLogFilterAction('all');
                      setLogFilterEntity('all');
                      setLogFilterDateStart('');
                      setLogFilterDateEnd('');
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除筛选
                  </Button>
                )}
              </div>

              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无匹配的操作日志</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <details key={log.id} className="blog-card p-3 sm:p-4 group">
                      <summary className="flex items-start gap-3 cursor-pointer list-none">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          log.action === 'delete' ? 'bg-destructive/10 text-destructive' :
                          log.action === 'create' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          log.action === 'publish' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          log.action === 'approve' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          log.action === 'reject' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          log.action === 'backup' || log.action === 'restore_backup' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          log.action === 'import' || log.action === 'export' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                          log.action === 'schedule' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {log.action === 'delete' ? <Trash2 className="w-4 h-4" /> :
                           log.action === 'create' ? <Plus className="w-4 h-4" /> :
                           log.action === 'publish' ? <Eye className="w-4 h-4" /> :
                           log.action === 'update' ? <Edit className="w-4 h-4" /> :
                           log.action === 'approve' ? <Check className="w-4 h-4" /> :
                           log.action === 'reject' ? <XCircle className="w-4 h-4" /> :
                           log.action === 'backup' ? <DatabaseBackup className="w-4 h-4" /> :
                           log.action === 'restore_backup' ? <RotateCcw className="w-4 h-4" /> :
                           log.action === 'import' ? <FileUp className="w-4 h-4" /> :
                           log.action === 'export' ? <Download className="w-4 h-4" /> :
                           log.action === 'schedule' ? <Clock className="w-4 h-4" /> :
                           log.action === 'restore' ? <History className="w-4 h-4" /> :
                           <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">
                              {getActionLabel(log.action)}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {getEntityLabel(log.entity_type)}
                            </span>
                            {log.entity_name && (
                              <>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-primary truncate max-w-[200px]">
                                  {log.entity_name}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(log.created_at).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <div className="text-muted-foreground group-open:rotate-180 transition-transform">
                          <ArrowDown className="w-4 h-4" />
                        </div>
                      </summary>
                      {/* Detailed info */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs space-y-1">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-muted-foreground font-medium min-w-[80px]">{key}:</span>
                                <span className="text-foreground break-all">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Post Editor Dialog - Fixed overflow */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{editingPost ? "编辑文章" : "新建文章"}</DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isSaving && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    保存中...
                  </span>
                )}
                {!isSaving && hasUnsavedChanges && (
                  <span className="text-amber-600 dark:text-amber-400">● 未保存</span>
                )}
                {!isSaving && !hasUnsavedChanges && lastSaveTime && (
                  <span className="text-green-600 dark:text-green-400">✓ 已保存</span>
                )}
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="文章标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">链接 *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                      <SelectItem value="技术">技术</SelectItem>
                      <SelectItem value="生活">生活</SelectItem>
                      <SelectItem value="阅读">阅读</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readTime">阅读时长</Label>
                  <Input
                    id="readTime"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="5分钟"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>封面图片</Label>
                <div className="flex items-start gap-4">
                  {coverImage ? (
                    <div className="relative group">
                      <img 
                        src={coverImage} 
                        alt="Cover" 
                        className="w-32 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-32 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span className="text-xs">上传封面</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要 *</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="文章摘要..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">正文 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="使用 ## 添加标题，使用 - 添加列表项..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {/* Tags selection */}
              <div className="space-y-2">
                <Label>关联标签</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-secondary/20 min-h-[48px]">
                  {tags && tags.length > 0 ? (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedTagIds(prev => 
                            prev.includes(tag.id) 
                              ? prev.filter(id => id !== tag.id) 
                              : [...prev, tag.id]
                          );
                        }}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">暂无标签，请先在标签管理中创建</span>
                  )}
                </div>
                {selectedTagIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">已选择 {selectedTagIds.length} 个标签</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published">发布文章</Label>
              </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="w-full sm:w-auto">
                  取消
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={saveNow}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  保存草稿
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPreviewDialogOpen(true)}
                  disabled={!title && !content}
                  className="w-full sm:w-auto"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  预览
                </Button>
                <Button type="submit" disabled={createPost.isPending || updatePost.isPending} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {createPost.isPending || updatePost.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Article Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              文章预览
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <ArticlePreview
              title={title}
              excerpt={excerpt}
              content={content}
              category={category}
              readTime={readTime}
              coverImage={coverImage}
              published={published}
            />
          </ScrollArea>
          <div className="flex-shrink-0 flex justify-end p-4 border-t">
            <Button variant="ghost" onClick={() => setPreviewDialogOpen(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog - Fixed overflow */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingTag ? "编辑标签" : "新建标签"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTagSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">标签名称</Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => handleTagNameChange(e.target.value)}
                placeholder="标签名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagSlug">标签链接</Label>
              <Input
                id="tagSlug"
                value={tagSlug}
                onChange={(e) => setTagSlug(e.target.value)}
                placeholder="tag-slug"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsTagDialogOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button type="submit" disabled={createTag.isPending || updateTag.isPending} className="w-full sm:w-auto">
                {createTag.isPending || updateTag.isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog - Fixed overflow */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "编辑分类" : "新建分类"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">分类名称</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => handleCategoryNameChange(e.target.value)}
                placeholder="分类名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorySlug">分类链接</Label>
              <Input
                id="categorySlug"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">分类描述（可选）</Label>
              <Textarea
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="分类描述..."
                rows={2}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCategoryDialogOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="w-full sm:w-auto">
                {createCategory.isPending || updateCategory.isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog - Fixed overflow */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>批量修改 ({selectedPostIds.length} 篇文章)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>修改分类</Label>
              <Select value={bulkEditCategory} onValueChange={setBulkEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不修改</SelectItem>
                  {postCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>修改阅读时长</Label>
              <Input
                value={bulkEditReadTime}
                onChange={(e) => setBulkEditReadTime(e.target.value)}
                placeholder="如：5分钟（可选）"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setBulkEditOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button onClick={handleBulkEdit} disabled={bulkOperating} className="w-full sm:w-auto">
                {bulkOperating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                确认修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sort Order Dialog */}
      <Dialog open={sortOrderDialogOpen} onOpenChange={setSortOrderDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>设置排序权重</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>权重值（越大越靠前）</Label>
              <Input
                type="number"
                value={editingSortOrder?.order ?? 0}
                onChange={(e) => setEditingSortOrder(prev => prev ? { ...prev, order: Number(e.target.value) } : null)}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setSortOrderDialogOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button onClick={handleUpdateSortOrder} disabled={updatePostOrder.isPending} className="w-full sm:w-auto">
                {updatePostOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation - Fixed overflow */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，文章将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground w-full sm:w-auto">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Posts Confirmation - Fixed overflow */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，将永久删除所选 {selectedPostIds.length} 篇文章。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground w-full sm:w-auto" disabled={bulkOperating}>
              {bulkOperating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Comments Confirmation */}
      <AlertDialog open={bulkDeleteCommentsOpen} onOpenChange={setBulkDeleteCommentsOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除评论</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，将永久删除所选 {selectedCommentIds.length} 条评论。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteComments} className="bg-destructive text-destructive-foreground w-full sm:w-auto" disabled={bulkOperating}>
              {bulkOperating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation - Fixed overflow */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除评论</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，评论将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground w-full sm:w-auto">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tag Confirmation - Fixed overflow */}
      <AlertDialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除标签</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，标签将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive text-destructive-foreground w-full sm:w-auto">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation - Fixed overflow */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，分类将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground w-full sm:w-auto">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>导入预览 ({importPreview.length} 篇文章)</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 pb-4">
              {importPreview.map((post, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{post.title || '(无标题)'}</span>
                    {post.published && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">已发布</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-x-2">
                    <span>分类: {post.category || '技术'}</span>
                    <span>·</span>
                    <span>阅读时长: {post.read_time || '5分钟'}</span>
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={() => { setImportDialogOpen(false); setImportPreview([]); }}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={importLoading}
              className="w-full sm:w-auto"
            >
              {importLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              确认导入
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Post Dialog */}
      <Dialog open={!!editingPost && !!scheduledAt} onOpenChange={(open) => { if (!open) { setScheduledAt(''); setEditingPost(null); } }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              定时发布
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              为文章 <span className="font-medium text-foreground">"{editingPost?.title}"</span> 设置定时发布时间
            </p>
            <div className="space-y-2">
              <Label>发布时间</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={formatDateTimeLocal(new Date())}
              />
            </div>
            {(editingPost as any)?.scheduled_at && isScheduled((editingPost as any).scheduled_at) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  当前已设定: {new Date((editingPost as any).scheduled_at).toLocaleString('zh-CN')}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editingPost && handleCancelSchedule(editingPost.id)}
                  className="mt-2 text-blue-700 dark:text-blue-300"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  取消定时发布
                </Button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => { setScheduledAt(''); setEditingPost(null); }} className="w-full sm:w-auto">
                取消
              </Button>
              <Button 
                onClick={() => editingPost && handleSchedulePost(editingPost.id)}
                disabled={schedulePost.isPending || !scheduledAt}
                className="w-full sm:w-auto"
              >
                {schedulePost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                确认定时
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              版本历史 - {selectedPostForVersions?.title}
            </DialogTitle>
          </DialogHeader>
          
          {versionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !postVersions || postVersions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无历史版本</p>
              <p className="text-sm mt-1">编辑文章后会自动保存版本</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {postVersions.map((version) => (
                  <div key={version.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            v{version.version_number}
                          </span>
                          <span className="font-medium truncate">{version.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{version.excerpt}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="bg-secondary px-2 py-0.5 rounded">{version.category}</span>
                          <span>{version.read_time}</span>
                          <span>·</span>
                          <span>{new Date(version.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompareVersions({ v1: version, v2: null })}
                          className="h-8"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version)}
                          disabled={restoreVersion.isPending}
                          className="h-8"
                        >
                          {restoreVersion.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4 mr-1" />}
                          恢复
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <div className="flex-shrink-0 flex justify-end pt-4 border-t">
            <Button variant="ghost" onClick={() => { setVersionDialogOpen(false); setSelectedPostForVersions(null); }}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Preview Dialog */}
      <Dialog open={!!compareVersions.v1} onOpenChange={(open) => { if (!open) setCompareVersions({ v1: null, v2: null }); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              版本 {compareVersions.v1?.version_number} 内容预览
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {compareVersions.v1 && (
              <div className="space-y-4 pb-4">
                <div>
                  <Label className="text-muted-foreground">标题</Label>
                  <p className="mt-1 font-medium">{compareVersions.v1.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">摘要</Label>
                  <p className="mt-1 text-sm">{compareVersions.v1.excerpt}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">正文</Label>
                  <pre className="mt-1 p-4 bg-secondary rounded-lg text-sm whitespace-pre-wrap font-mono max-h-96 overflow-auto">
                    {compareVersions.v1.content}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>分类: {compareVersions.v1.category}</span>
                  <span>阅读时长: {compareVersions.v1.read_time}</span>
                  <span>保存时间: {new Date(compareVersions.v1.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setCompareVersions({ v1: null, v2: null })} className="w-full sm:w-auto">
              关闭
            </Button>
            {compareVersions.v1 && (
              <Button 
                onClick={() => handleRestoreVersion(compareVersions.v1!)}
                disabled={restoreVersion.isPending}
                className="w-full sm:w-auto"
              >
                {restoreVersion.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCw className="w-4 h-4 mr-2" />}
                恢复此版本
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Stat Card Component
const StatCard = forwardRef<
  HTMLDivElement,
  { label: string; value: number; subLabel?: string; icon: React.ReactNode }
>(({ label, value, subLabel, icon }, ref) => (
  <div ref={ref} className="blog-card p-3 sm:p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <div className="text-primary">{icon}</div>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
    {subLabel && <p className="text-xs text-muted-foreground mt-1 truncate">{subLabel}</p>}
  </div>
));
StatCard.displayName = 'StatCard';

// Comment Card Component with selection and reply
const CommentCard = ({ 
  comment, 
  selected,
  onSelect,
  onApprove, 
  onDelete,
  onReply,
  onDeleteReply,
  isReplying,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  isReplyLoading,
  isApproved = false 
}: { 
  comment: Comment & { posts: { title: string; slug: string }; admin_reply?: string | null; replied_at?: string | null };
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onReply: () => void;
  onDeleteReply: () => void;
  isReplying: boolean;
  replyContent: string;
  onReplyContentChange: (value: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  isReplyLoading: boolean;
  isApproved?: boolean;
}) => (
  <div className="blog-card p-3 sm:p-4">
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 rounded border-border mt-1 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{comment.author_name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground text-xs truncate">{comment.author_email}</span>
        </div>
        <p className="text-foreground mt-2 text-sm sm:text-base">{comment.content}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>评论于：</span>
          <Link to={`/blog/${comment.posts.slug}`} className="text-primary hover:underline truncate max-w-[150px]">
            {comment.posts.title}
          </Link>
          <span>·</span>
          <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
        </div>

        {/* Admin reply display */}
        {comment.admin_reply && !isReplying && (
          <div className="mt-3 p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Reply className="w-3 h-3" />
              <span>管理员回复</span>
              {comment.replied_at && (
                <>
                  <span>·</span>
                  <span>{new Date(comment.replied_at).toLocaleString('zh-CN')}</span>
                </>
              )}
            </div>
            <p className="text-sm text-foreground">{comment.admin_reply}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteReply}
              className="mt-2 h-6 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              删除回复
            </Button>
          </div>
        )}

        {/* Reply input */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              placeholder="输入回复内容..."
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSubmitReply}
                disabled={isReplyLoading || !replyContent.trim()}
              >
                {isReplyLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                发送回复
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelReply}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onApprove}
          className={`h-8 w-8 p-0 ${isApproved ? "text-amber-600" : "text-green-600"}`}
          title={isApproved ? "取消通过" : "审核通过"}
        >
          {isApproved ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReply}
          className="h-8 w-8 p-0 text-primary"
          title="回复"
        >
          <Reply className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive h-8 w-8 p-0"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default Admin;
