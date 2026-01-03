import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost, Post } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  X
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
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('技术');
  const [readTime, setReadTime] = useState('5分钟');
  const [published, setPublished] = useState(false);

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
          cover_image: null,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-xl font-semibold text-foreground">后台管理</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            {isAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">管理员</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
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
          <>
            {/* Actions */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                文章管理 ({posts?.length || 0})
              </h2>
              <Button onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                新建文章
              </Button>
            </div>

            {/* Posts List */}
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
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
          </>
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

      {/* Delete Confirmation */}
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
    </div>
  );
};

export default Admin;
