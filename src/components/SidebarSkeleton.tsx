import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 标签云骨架 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Skeleton className="h-6 w-20 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-7 rounded-full" 
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>

      {/* 热门文章骨架 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
