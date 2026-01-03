-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  read_time TEXT NOT NULL DEFAULT '3分钟',
  category TEXT NOT NULL DEFAULT '技术',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tags policies (public read)
CREATE POLICY "Anyone can read tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Posts policies (public read published, admins full access)
CREATE POLICY "Anyone can read published posts" ON public.posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can read all posts" ON public.posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can insert posts" ON public.posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete posts" ON public.posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Post tags policies
CREATE POLICY "Anyone can read post tags" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage post tags" ON public.post_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Comments policies
CREATE POLICY "Anyone can read approved comments" ON public.comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can submit comments" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read all comments" ON public.comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage comments" ON public.comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tags
INSERT INTO public.tags (name, slug) VALUES
  ('技术', 'tech'),
  ('生活', 'life'),
  ('阅读', 'reading'),
  ('编程', 'programming'),
  ('思考', 'thinking');

-- Insert sample posts
INSERT INTO public.posts (title, slug, excerpt, content, category, read_time, published, published_at) VALUES
  ('如何培养良好的编程习惯', 'good-programming-habits', '编程不仅仅是写代码，更是一种思维方式。在这篇文章中，我将分享一些帮助我提升代码质量和开发效率的习惯。', '编程不仅仅是写代码，更是一种思维方式。在多年的开发经历中，我逐渐总结出一些帮助我提升代码质量和开发效率的习惯。

## 1. 先思考，后动手

在开始编码之前，花时间理解问题的本质。很多时候，我们急于动手写代码，却忽略了对问题的深入思考。

## 2. 保持代码整洁

整洁的代码不仅便于他人阅读，也便于未来的自己维护。使用有意义的变量名，保持函数简短，遵循单一职责原则。

## 3. 持续学习

技术在不断发展，保持学习的热情是程序员最重要的品质之一。每天花一点时间学习新知识，长期来看会有巨大的收获。', '编程', '5分钟', true, now()),
  
  ('我的阅读清单：2024年必读书籍', 'reading-list-2024', '新的一年，新的阅读计划。这里是我精心挑选的书籍清单，涵盖技术、哲学和文学多个领域。', '新的一年，新的阅读计划。阅读是我获取知识和灵感的重要来源，每年我都会制定阅读目标。

## 技术类

- 《设计数据密集型应用》
- 《重构：改善既有代码的设计》

## 哲学与思考

- 《思考，快与慢》
- 《反脆弱》

## 文学作品

- 《百年孤独》
- 《追风筝的人》

希望这份清单也能给你一些启发！', '阅读', '3分钟', true, now() - interval '5 days'),
  
  ('极简主义生活的实践心得', 'minimalist-life', '生活中真正重要的东西其实很少。这篇文章分享我践行极简主义的心得体会，以及它如何改变了我的生活方式。', '极简主义不是关于拥有更少，而是关于为真正重要的事物腾出空间。

## 从物品开始

我首先清理了家中多年未使用的物品。当你真正审视每一件物品时，会发现很多东西并不是必需的。

## 数字极简

减少社交媒体的使用时间，取消不必要的订阅，清理邮箱。数字空间的整理同样重要。

## 时间管理

学会说"不"，把时间花在真正有价值的事情上。极简主义最终是关于生活优先级的选择。', '生活', '4分钟', true, now() - interval '10 days'),
  
  ('React 性能优化实战指南', 'react-performance', 'React 应用的性能优化是一个持续的过程。本文将介绍几个实用的优化技巧，帮助你构建更流畅的用户界面。', 'React 性能优化是每个前端开发者都需要掌握的技能。

## 使用 React.memo

对于纯展示组件，使用 React.memo 可以避免不必要的重新渲染。

## 合理使用 useCallback 和 useMemo

这两个 Hook 可以帮助我们缓存函数和计算结果，但也要注意不要过度使用。

## 虚拟列表

对于长列表，使用虚拟列表技术只渲染可见区域的元素，可以大幅提升性能。', '技术', '6分钟', true, now() - interval '15 days');