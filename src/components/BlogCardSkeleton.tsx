import { Skeleton } from "@/components/ui/skeleton";

const BlogCardSkeleton = () => {
  return (
    <div className="blog-card h-full flex flex-col animate-pulse">
      {/* 封面图骨架 */}
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* 分类标签骨架 */}
        <Skeleton className="h-6 w-16 rounded-full mb-3" />
        
        {/* 标题骨架 */}
        <Skeleton className="h-7 w-full mb-2" />
        <Skeleton className="h-7 w-3/4 mb-2" />
        
        {/* 摘要骨架 */}
        <div className="space-y-2 mb-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* 底部信息骨架 */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;
