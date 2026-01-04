import { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, useBulkUpdatePosts, useBulkDeletePosts, Post } from '@/hooks/usePosts';
import { useAllComments, useApproveComment, useDeleteComment, Comment } from '@/hooks/useComments';
import { useTagsManagement, useCreateTag, useUpdateTag, useDeleteTag, Tag } from '@/hooks/useTagsManagement';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategories';
import { useDashboardStats } from '@/hooks/useStats';
import { useHeroSettings, useTypewriterSettings, useUpdateHeroSettings, useUpdateTypewriterSettings, useSiteSettings, useUpdateSiteSettings, HeroSettings, TypewriterSettings, SiteSettings } from '@/hooks/useSiteSettings';
import { useAutoSave } from '@/hooks/useAutoSave';
import { supabase } from '@/integrations/supabase/client';
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
  Calendar
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
  const approveComment = useApproveComment();
  const deleteComment = useDeleteComment();
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

  // Filter state for posts
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Bulk edit dialog state
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState<string>('');
  const [bulkEditReadTime, setBulkEditReadTime] = useState<string>('');

  // Bulk operation progress
  const [bulkOperating, setBulkOperating] = useState(false);

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
  
  const { loadDraft, clearDraft } = useAutoSave(editingPost?.id || null, draftData);

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
    }
  }, [editingPost]);

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
        toast.success("文章已更新");
      } else {
        await createPost.mutateAsync({
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
        toast.success("文章已创建");
      }
      
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

  const handleDelete = async () => {
    if (!deletePostId) return;
    
    try {
      await deletePost.mutateAsync(deletePostId);
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
    try {
      await bulkUpdatePosts.mutateAsync({
        ids: selectedPostIds,
        updates: { published: true, published_at: now },
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
    try {
      await bulkUpdatePosts.mutateAsync({
        ids: selectedPostIds,
        updates: { published: false, published_at: null },
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
    try {
      await bulkDeletePosts.mutateAsync({ ids: selectedPostIds });
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

    try {
      await bulkUpdatePosts.mutateAsync({ ids: selectedPostIds, updates });
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

  const handleApproveComment = async (id: string, approved: boolean) => {
    try {
      await approveComment.mutateAsync({ id, approved });
      toast.success(approved ? "评论已通过" : "评论已取消通过");
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    try {
      await deleteComment.mutateAsync(deleteCommentId);
      toast.success("评论已删除");
      setDeleteCommentId(null);
    } catch (error) {
      toast.error("删除失败");
    }
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
        toast.success("标签已更新");
      } else {
        await createTag.mutateAsync({ name: tagName, slug: tagSlug });
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
    try {
      await deleteTagMutation.mutateAsync(deleteTagId);
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
        toast.success("分类已更新");
      } else {
        await createCategory.mutateAsync({ name: categoryName, slug: categorySlug, description: categoryDescription });
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
    try {
      await deleteCategoryMutation.mutateAsync(deleteCategoryId);
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
      toast.success("打字机设置已保存");
    } catch (error) {
      toast.error("保存失败");
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
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6 sm:w-full sm:max-w-3xl">
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
                <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  新建文章
                </Button>
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
                          variant="destructive"
                          onClick={() => setBulkDeleteOpen(true)}
                          disabled={!selectedPostIds.length || bulkOperating}
                          className="h-8 text-xs sm:text-sm"
                        >
                          批量删除
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Post list - mobile optimized */}
                  {filteredPosts?.map((post) => (
                    <div
                      key={post.id}
                      className="blog-card"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(post.id)}
                          onChange={() => togglePostSelected(post.id)}
                          className="h-4 w-4 rounded border-border mt-1 flex-shrink-0"
                          aria-label={`选择文章 ${post.title}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            {post.cover_image ? (
                              <img 
                                src={post.cover_image} 
                                alt="" 
                                className="w-full sm:w-16 h-24 sm:h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="hidden sm:flex w-16 h-12 rounded-lg bg-secondary items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground line-clamp-2 sm:truncate">{post.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-1">
                                <span className="px-2 py-0.5 bg-secondary rounded">{post.category}</span>
                                <span>{post.read_time}</span>
                                <span className="flex items-center gap-1">
                                  {post.published ? (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      已发布
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      草稿
                                    </>
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {post.view_count}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                              className="flex-1 sm:flex-none h-8"
                            >
                              <Edit className="w-4 h-4 sm:mr-0 mr-1" />
                              <span className="sm:hidden">编辑</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletePostId(post.id)}
                              className="text-destructive hover:text-destructive flex-1 sm:flex-none h-8"
                            >
                              <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
                              <span className="sm:hidden">删除</span>
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
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                评论管理 ({comments?.length || 0})
              </h2>

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
                          onApprove={() => handleApproveComment(comment.id, true)}
                          onDelete={() => setDeleteCommentId(comment.id)}
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
                          onApprove={() => handleApproveComment(comment.id, false)}
                          onDelete={() => setDeleteCommentId(comment.id)}
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
                <Button onClick={() => { setEditingTag(null); setTagName(''); setTagSlug(''); setIsTagDialogOpen(true); }} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  新建标签
                </Button>
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
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  分类管理 ({categories?.length || 0})
                </h2>
                <Button onClick={() => { setEditingCategory(null); setCategoryName(''); setCategorySlug(''); setCategoryDescription(''); setIsCategoryDialogOpen(true); }} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  新建分类
                </Button>
              </div>

              {!categories?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无分类，点击上方按钮创建
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="blog-card flex items-center justify-between p-3 sm:p-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setCategorySlug(cat.slug); setCategoryDescription(cat.description || ''); setIsCategoryDialogOpen(true); }}
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
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Post Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingPost ? "编辑文章" : "新建文章"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cover Image Upload */}
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
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="技术"
                />
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
                rows={12}
                className="font-mono text-sm"
              />
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
              <Button type="submit" disabled={createPost.isPending || updatePost.isPending} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {createPost.isPending || updatePost.isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
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

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
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

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
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

      {/* Bulk Delete Posts Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
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

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
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

      {/* Delete Tag Confirmation */}
      <AlertDialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
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

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
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

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
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

// Comment Card Component
const CommentCard = ({ 
  comment, 
  onApprove, 
  onDelete, 
  isApproved = false 
}: { 
  comment: Comment & { posts: { title: string; slug: string } };
  onApprove: () => void;
  onDelete: () => void;
  isApproved?: boolean;
}) => (
  <div className="blog-card p-3 sm:p-4">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
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
      </div>
      <div className="flex items-center gap-2 sm:gap-1 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onApprove}
          className={`flex-1 sm:flex-none h-8 ${isApproved ? "text-amber-600" : "text-green-600"}`}
        >
          {isApproved ? <XCircle className="w-4 h-4 sm:mr-0 mr-1" /> : <Check className="w-4 h-4 sm:mr-0 mr-1" />}
          <span className="sm:hidden">{isApproved ? "取消" : "通过"}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive flex-1 sm:flex-none h-8"
        >
          <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
          <span className="sm:hidden">删除</span>
        </Button>
      </div>
    </div>
  </div>
);

export default Admin;
