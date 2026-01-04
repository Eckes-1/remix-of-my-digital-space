import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, Post } from '@/hooks/usePosts';
import { useAllComments, useApproveComment, useDeleteComment, Comment } from '@/hooks/useComments';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
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
  Image,
  Upload,
  Loader2
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

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts(false);
  const { data: comments, isLoading: commentsLoading } = useAllComments();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const approveComment = useApproveComment();
  const deleteComment = useDeleteComment();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

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

  const generateSlug = (title: string) => {
    return title
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">返回首页</span>
              </Link>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h1 className="font-serif text-lg font-semibold text-foreground">后台管理</h1>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">{user.email}</span>
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
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {!isAdmin ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">您没有管理员权限</p>
            <Link to="/" className="text-primary hover:underline">返回首页</Link>
          </div>
        ) : (
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                文章管理
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                评论管理
                {pendingComments.length > 0 && (
                  <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {pendingComments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  文章管理 ({posts?.length || 0})
                </h2>
                <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建文章
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : posts?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无文章，点击上方按钮创建第一篇文章
                </div>
              ) : (
                <div className="space-y-4">
                  {posts?.map((post) => (
                    <div
                      key={post.id}
                      className="blog-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {post.cover_image ? (
                          <img 
                            src={post.cover_image} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletePostId(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                评论管理 ({comments?.length || 0})
              </h2>

              {commentsLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : comments?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">暂无评论</div>
              ) : (
                <div className="space-y-6">
                  {pendingComments.length > 0 && (
                    <div className="space-y-4">
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
                    <div className="space-y-4">
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
          </Tabs>
        )}
      </main>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

            <div className="grid md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
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
                <Label htmlFor="readTime">阅读时间</Label>
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
                placeholder="文章正文（支持 Markdown）..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published">发布</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditorOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
                <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createPost.isPending || updatePost.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，文章将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除评论</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，评论将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

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
  <div className="blog-card">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{comment.author_name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground text-xs">{comment.author_email}</span>
        </div>
        <p className="text-foreground mt-2">{comment.content}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>评论于：</span>
          <Link to={`/blog/${comment.posts.slug}`} className="text-primary hover:underline">
            {comment.posts.title}
          </Link>
          <span>·</span>
          <span>{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onApprove}
          className={isApproved ? "text-amber-600" : "text-green-600"}
        >
          {isApproved ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default Admin;
