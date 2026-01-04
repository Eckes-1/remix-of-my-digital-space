import { useState } from 'react';
import { useAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor, Author } from '@/hooks/useAuthors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
import { Plus, Edit, Trash2, User, Loader2, Globe, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuthorManagerProps {
  onLog?: (action: string, entityType: string, entityName: string, entityId?: string, details?: Record<string, any>) => void;
}

const AuthorManager = ({ onLog }: AuthorManagerProps) => {
  const { data: authors, isLoading } = useAuthors();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteAuthorId, setDeleteAuthorId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setBio('');
    setAvatarUrl('');
    setWebsite('');
    setEditingAuthor(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setEmail(author.email || '');
    setBio(author.bio || '');
    setAvatarUrl(author.avatar_url || '');
    setWebsite(author.website || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请填写作者名称');
      return;
    }

    try {
      if (editingAuthor) {
        await updateAuthor.mutateAsync({
          id: editingAuthor.id,
          name: name.trim(),
          email: email.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          website: website.trim() || null,
        });
        onLog?.('update', 'author', name, editingAuthor.id, {
          changes: {
            name: name !== editingAuthor.name ? { from: editingAuthor.name, to: name } : undefined,
          },
          timestamp: new Date().toISOString(),
        });
        toast.success('作者已更新');
      } else {
        await createAuthor.mutateAsync({
          name: name.trim(),
          email: email.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          website: website.trim() || null,
        });
        onLog?.('create', 'author', name, undefined, {
          email,
          timestamp: new Date().toISOString(),
        });
        toast.success('作者已创建');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('保存失败: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteAuthorId) return;
    const author = authors?.find(a => a.id === deleteAuthorId);
    try {
      await deleteAuthor.mutateAsync(deleteAuthorId);
      onLog?.('delete', 'author', author?.name || '未知作者', deleteAuthorId, {
        timestamp: new Date().toISOString(),
      });
      toast.success('作者已删除');
      setDeleteAuthorId(null);
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">作者管理</h3>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-1" />
          新增作者
        </Button>
      </div>

      {!authors?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无作者</p>
          <Button variant="link" onClick={openCreateDialog}>
            添加第一个作者
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <div key={author.id} className="blog-card p-4 flex items-start gap-3">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {author.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{author.name}</h4>
                {author.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{author.email}</span>
                  </p>
                )}
                {author.website && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3" />
                    <a href={author.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary">
                      {author.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                )}
                {author.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{author.bio}</p>
                )}
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(author)}
                    className="h-7 px-2"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteAuthorId(author.id)}
                    className="h-7 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Author Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? '编辑作者' : '新增作者'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">名称 *</Label>
              <Input
                id="authorName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="作者名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorEmail">邮箱</Label>
              <Input
                id="authorEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorAvatar">头像URL</Label>
              <Input
                id="authorAvatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorWebsite">网站</Label>
              <Input
                id="authorWebsite"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorBio">简介</Label>
              <Textarea
                id="authorBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="作者简介..."
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button type="submit" disabled={createAuthor.isPending || updateAuthor.isPending} className="w-full sm:w-auto">
                {createAuthor.isPending || updateAuthor.isPending ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAuthorId} onOpenChange={() => setDeleteAuthorId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除作者</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，作者将被永久删除。关联该作者的文章将变为无作者状态。
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
    </div>
  );
};

export default AuthorManager;
