import { Link } from 'react-router-dom';
import { useTags } from '@/hooks/useTags';
import { Tag } from 'lucide-react';

const TagCloud = () => {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return <div className="text-muted-foreground">加载标签中...</div>;
  }

  return (
    <div className="blog-card">
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        标签
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Link
            key={tag.id}
            to={`/tags/${tag.slug}`}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;
