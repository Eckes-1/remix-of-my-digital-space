import { useState, useEffect, useRef } from 'react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, User, Mail, Send, Reply, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { z } from 'zod';
import { cn } from '@/lib/utils';

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
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevCommentsRef = useRef<number>(0);

  // Detect new comments for animation
  useEffect(() => {
    if (comments && comments.length > prevCommentsRef.current) {
      const newIds = comments
        .slice(0, comments.length - prevCommentsRef.current)
        .map(c => c.id);
      setNewCommentIds(new Set(newIds));
      
      // Clear animation after delay
      setTimeout(() => setNewCommentIds(new Set()), 1000);
    }
    prevCommentsRef.current = comments?.length || 0;
  }, [comments]);

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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedComments = comments?.filter(c => c.approved) || [];

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-primary" />
          {approvedComments.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {approvedComments.length > 9 ? '9+' : approvedComments.length}
            </span>
          )}
        </div>
        <span>评论讨论</span>
      </h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-2xl p-6 mb-10 shadow-lg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">发表评论</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="您的名字"
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="您的邮箱（不会公开）"
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下您的想法..."
            rows={4}
            className="mb-4 resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
          />
          
          <Button 
            type="submit" 
            disabled={createComment.isPending || isSubmitting}
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
              "shadow-lg shadow-primary/25 hover:shadow-primary/40",
              isSubmitting && "animate-pulse"
            )}
          >
            <Send className={cn(
              "w-4 h-4 mr-2 transition-transform",
              isSubmitting && "animate-bounce"
            )} />
            {createComment.isPending ? "提交中..." : "发表评论"}
          </Button>
        </div>
      </form>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : approvedComments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">暂无评论，来做第一个评论的人吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedComments.map((comment: any, index: number) => (
            <div 
              key={comment.id} 
              className={cn(
                "group relative bg-card border border-border/50 rounded-2xl p-5 transition-all duration-500",
                "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
                newCommentIds.has(comment.id) && "animate-slide-in-left"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-background">
                        <span className="font-bold text-primary text-lg">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-foreground/80 leading-relaxed pl-14">{comment.content}</p>
                
                {/* Admin reply */}
                {comment.admin_reply && (
                  <div className="mt-4 ml-14 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary rounded-r-xl animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <div className="p-1 rounded-full bg-primary/20">
                        <Reply className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-semibold text-primary">博主回复</span>
                      {comment.replied_at && (
                        <>
                          <span className="text-border">·</span>
                          <span>{format(new Date(comment.replied_at), 'M月d日 HH:mm', { locale: zhCN })}</span>
                        </>
                      )}
                    </div>
                    <p className="text-foreground/80 leading-relaxed">{comment.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;