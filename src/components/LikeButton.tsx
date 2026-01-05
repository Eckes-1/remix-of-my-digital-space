import { Heart } from "lucide-react";
import { useLikePost } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  className?: string;
}

const LikeButton = ({ postId, className }: LikeButtonProps) => {
  const { hasLiked, likeCount, toggleLike, isLoading } = useLikePost(postId);

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300",
        "border border-border hover:border-primary/50",
        "text-sm sm:text-base",
        hasLiked 
          ? "bg-primary/10 text-primary" 
          : "bg-card text-muted-foreground hover:text-primary",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300",
          hasLiked && "fill-primary scale-110",
          !isLoading && "hover:scale-125"
        )} 
      />
      <span className="font-medium">{likeCount}</span>
    </button>
  );
};

export default LikeButton;
