import { useState, useRef } from 'react';
import { useMusicTracks, useCreateMusicTrack, useUpdateMusicTrack, useDeleteMusicTrack, MusicTrack } from '@/hooks/useMusicTracks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Music, X, Check, GripVertical, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setUrl('');
    setSortOrder(0);
    setIsActive(true);
    setEditingTrack(null);
    setUploadMode('url');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      toast.error('请上传有效的音频文件 (mp3, wav, m4a)');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('文件大小不能超过 20MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('music')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('music')
        .getPublicUrl(data.path);

      setUrl(urlData.publicUrl);
      
      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
      
      toast.success('音频文件上传成功');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('上传失败: ' + (error.message || '未知错误'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            
            {/* Audio source: URL or Upload */}
            <div>
              <Label>音频来源 *</Label>
              <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'url' | 'upload')} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">输入URL</TabsTrigger>
                  <TabsTrigger value="upload">上传文件</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-3">
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="输入音频文件URL (mp3, m4a等)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 mp3, m4a, wav 等格式的在线音频链接
                  </p>
                </TabsContent>
                <TabsContent value="upload" className="mt-3">
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          上传中...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">点击上传音频文件</span>
                          <span className="text-xs text-muted-foreground">支持 mp3, wav, m4a (最大20MB)</span>
                        </div>
                      )}
                    </Button>
                    {url && uploadMode === 'upload' && (
                      <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded text-sm">
                        <Music className="w-4 h-4 text-primary" />
                        <span className="truncate flex-1">{url.split('/').pop()}</span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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