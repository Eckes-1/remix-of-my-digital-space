import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, User } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, "名字至少2个字符").max(50, "名字太长了"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          toast.error(result.error.errors[0].message);
          setLoading(false);
          return;
        }
        
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error("邮箱或密码错误");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("登录成功");
          navigate('/admin');
        }
      } else {
        const result = signupSchema.safeParse({ email, password, displayName });
        if (!result.success) {
          toast.error(result.error.errors[0].message);
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error("该邮箱已注册");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("注册成功！");
          navigate('/');
        }
      }
    } catch (err) {
      toast.error("操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {isLogin ? "欢迎回来" : "创建账户"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isLogin ? "登录以管理您的博客" : "注册以开始使用"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="blog-card space-y-3 sm:space-y-4 p-4 sm:p-6">
          {!isLogin && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="displayName" className="text-sm">显示名称</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="您的名字"
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? "处理中..." : isLogin ? "登录" : "注册"}
          </Button>
          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "没有账户？立即注册" : "已有账户？立即登录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
