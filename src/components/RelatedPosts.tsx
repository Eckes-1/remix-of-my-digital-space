import { Link } from "react-router-dom";
import { usePosts, Post } from "@/hooks/usePosts";
import { ArrowRight } from "lucide-react";
import coverProgramming from '@/assets/cover-programming.jpg';
import coverReading from '@/assets/cover-reading.jpg';
import coverLife from '@/assets/cover-life.jpg';
import coverTech from '@/assets/cover-tech.jpg';

const categoryCovers: Record<string, string> = {
  '编程': coverProgramming,
  '阅读': coverReading,
  '生活': coverLife,
  '技术': coverTech,
};

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
  limit?: number;
}

const RelatedPosts = ({ currentPostId, category, limit = 3 }: RelatedPostsProps) => {
  const { data: allPosts } = usePosts();

  // Find related posts (same category, excluding current)
  const relatedPosts = allPosts
    ?.filter(post => post.id !== currentPostId && post.category === category)
    .slice(0, limit) || [];

  // If not enough posts in same category, add from other categories
  if (relatedPosts.length < limit && allPosts) {
    const otherPosts = allPosts
      .filter(post => post.id !== currentPostId && !relatedPosts.find(p => p.id === post.id))
      .slice(0, limit - relatedPosts.length);
    relatedPosts.push(...otherPosts);
  }

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="font-serif text-xl font-semibold text-foreground mb-6">相关推荐</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPosts.map((post) => {
          const cover = post.cover_image || categoryCovers[post.category] || coverProgramming;
          return (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={cover}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                  {post.category}
                </span>
                <h4 className="font-serif font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  阅读更多
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedPosts;
