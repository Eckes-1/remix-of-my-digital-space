import { useState } from 'react';
import { useMusicTracks, useCreateMusicTrack, useUpdateMusicTrack, useDeleteMusicTrack, MusicTrack } from '@/hooks/useMusicTracks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Music, X, Check, GripVertical } from 'lucide-react';
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

const MusicTrackManager = () => {
  const { data: tracks, isLoading } = useMusicTracks(false);
  const createTrack = useCreateMusicTrack();
  const updateTrack = useUpdateMusicTrack();
  const deleteTrack = useDeleteMusicTrack();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setUrl('');
    setSortOrder(0);
    setIsActive(true);
    setEditingTrack(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (track: MusicTrack) => {
    setEditingTrack(track);
    setTitle(track.title);
    setArtist(track.artist);
    setUrl(track.url);
    setSortOrder(track.sort_order);
    setIsActive(track.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('请填写曲目名称和URL');
      return;
    }

    try {
      if (editingTrack) {
        await updateTrack.mutateAsync({
          id: editingTrack.id,
          title: title.trim(),
          artist: artist.trim() || '未知艺术家',
          url: url.trim(),
          sort_order: sortOrder,
          is_active: isActive,
        });
        toast.success('曲目已更新');
      } else {
        await createTrack.mutateAsync({
          title: title.trim(),
          artist: artist.trim() || '未知艺术家',
          url: url.trim(),
          sort_order: sortOrder,
          is_active: isActive,
        });
        toast.success('曲目已添加');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTrack.mutateAsync(deleteId);
      toast.success('曲目已删除');
      setDeleteId(null);
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleActive = async (track: MusicTrack) => {
    try {
      await updateTrack.mutateAsync({
        id: track.id,
        is_active: !track.is_active,
      });
      toast.success(track.is_active ? '曲目已禁用' : '曲目已启用');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Music className="w-4 h-4" />
          音乐播放列表管理
        </h3>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          添加曲目
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        管理悬浮音乐播放器的播放列表，支持自定义曲目URL。
      </p>

      {tracks && tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border"
            >
              <div className="text-muted-foreground">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{track.title}</div>
                <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={track.is_active}
                  onCheckedChange={() => handleToggleActive(track)}
                />
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(track)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(track.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
          暂无曲目，点击上方按钮添加
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrack ? '编辑曲目' : '添加曲目'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">曲目名称 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入曲目名称"
              />
            </div>
            <div>
              <Label htmlFor="artist">艺术家</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="输入艺术家名称"
              />
            </div>
            <div>
              <Label htmlFor="url">音频URL *</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入音频文件URL (mp3, m4a等)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                支持 mp3, m4a, wav 等格式的在线音频链接
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">排序权重</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">启用</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                <Check className="w-4 h-4 mr-1" />
                {editingTrack ? '保存' : '添加'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个曲目吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MusicTrackManager;