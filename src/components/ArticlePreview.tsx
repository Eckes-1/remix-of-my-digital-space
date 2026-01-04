import { useMemo } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Clock, Calendar } from 'lucide-react';

// Import cover images for categories
import coverTech from '@/assets/cover-tech.jpg';
import coverLife from '@/assets/cover-life.jpg';
import coverReading from '@/assets/cover-reading.jpg';
import coverProgramming from '@/assets/cover-programming.jpg';

const categoryCovers: Record<string, string> = {
  '技术': coverTech,
  '生活': coverLife,
  '阅读': coverReading,
  '编程': coverProgramming,
};

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  coverImage: string | null;
  published: boolean;
}

interface ParsedContent {
  type: 'paragraph' | 'heading' | 'list';
  content: string;
  id?: string;
}

const ArticlePreview = ({
  title,
  excerpt,
  content,
  category,
  readTime,
  coverImage,
  published,
}: ArticlePreviewProps) => {
  const coverUrl = coverImage || categoryCovers[category] || coverTech;

  const parsedContent = useMemo(() => {
    const lines = content.split('\n').filter(line => line.trim());
    const result: ParsedContent[] = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        const heading = line.replace('## ', '');
        result.push({
          type: 'heading',
          content: heading,
          id: `preview-heading-${index}`,
        });
      } else if (line.startsWith('- ')) {
        result.push({
          type: 'list',
          content: line.replace('- ', ''),
        });
      } else {
        result.push({
          type: 'paragraph',
          content: line,
        });
      }
    });
    
    return result;
  }, [content]);

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={coverUrl}
          alt={title || '文章封面'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
              {category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 line-clamp-2">
              {title || '无标题'}
            </h1>
            {excerpt && (
              <p className="text-muted-foreground line-clamp-2">{excerpt}</p>
            )}
          </div>
        </div>
      </div>

      {/* Article Meta */}
      <div className="max-w-3xl mx-auto px-6 py-4 border-b">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>预览模式</span>
          </div>
          {!published && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
              草稿
            </span>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {parsedContent.length === 0 ? (
            <p className="text-muted-foreground italic">暂无内容...</p>
          ) : (
            parsedContent.map((item, index) => {
              if (item.type === 'heading') {
                return (
                  <h2 key={index} id={item.id} className="text-xl font-bold mt-8 mb-4 text-foreground">
                    {item.content}
                  </h2>
                );
              } else if (item.type === 'list') {
                return (
                  <li key={index} className="ml-4 text-foreground">
                    {item.content}
                  </li>
                );
              } else {
                return (
                  <p key={index} className="mb-4 text-foreground leading-relaxed">
                    {item.content}
                  </p>
                );
              }
            })
          )}
        </article>
      </div>
    </div>
  );
};

export default ArticlePreview;
