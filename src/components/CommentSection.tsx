import { useState } from 'react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, User, Mail, Send, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { z } from 'zod';

const commentSchema = z.object({
  author_name: z.string().trim().min(1, "请输入您的名字").max(50, "名字太长了"),
  author_email: z.string().trim().email("请输入有效的邮箱地址"),
  content: z.string().trim().min(1, "请输入评论内容").max(1000, "评论内容太长了"),
});

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = commentSchema.safeParse({
      author_name: name,
      author_email: email,
      content: content,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      await createComment.mutateAsync({
        post_id: postId,
        author_name: result.data.author_name,
        author_email: result.data.author_email,
        content: result.data.content,
      });
      
      toast.success("评论已提交，待审核后显示");
      setName('');
      setEmail('');
      setContent('');
    } catch (error) {
      toast.error("提交失败，请稍后重试");
    }
  };

  const approvedComments = comments?.filter(c => c.approved) || [];

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-8 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary" />
        评论 ({approvedComments.length})
      </h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="blog-card mb-10">
        <h3 className="font-medium text-foreground mb-4">发表评论</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的名字"
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="您的邮箱（不会公开）"
              className="pl-10"
            />
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下您的想法..."
          rows={4}
          className="mb-4 resize-none"
        />
        <Button type="submit" disabled={createComment.isPending}>
          <Send className="w-4 h-4 mr-2" />
          {createComment.isPending ? "提交中..." : "发表评论"}
        </Button>
      </form>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载评论中...</div>
      ) : approvedComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无评论，来做第一个评论的人吧！
        </div>
      ) : (
        <div className="space-y-6">
          {approvedComments.map((comment: any) => (
            <div key={comment.id} className="blog-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{comment.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed">{comment.content}</p>
              
              {/* Admin reply */}
              {comment.admin_reply && (
                <div className="mt-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Reply className="w-4 h-4" />
                    <span className="font-medium text-primary">博主回复</span>
                    {comment.replied_at && (
                      <>
                        <span>·</span>
                        <span>{format(new Date(comment.replied_at), 'yyyy年M月d日 HH:mm', { locale: zhCN })}</span>
                      </>
                    )}
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{comment.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
