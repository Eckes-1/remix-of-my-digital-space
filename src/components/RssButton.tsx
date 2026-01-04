import { Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RssButtonProps {
  variant?: "icon" | "button" | "link";
  className?: string;
}

const RssButton = ({ variant = "icon", className = "" }: RssButtonProps) => {
  const rssUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rss-feed`;

  const handleClick = () => {
    window.open(rssUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl);
      // Using a simple alert since we don't want to add toast here
    } catch (err) {
      console.error('Failed to copy RSS URL');
    }
  };

  if (variant === "link") {
    return (
      <a
        href={rssUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ${className}`}
      >
        <Rss className="w-4 h-4" />
        <span>RSS 订阅</span>
      </a>
    );
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`gap-2 ${className}`}
      >
        <Rss className="w-4 h-4" />
        <span>订阅 RSS</span>
      </Button>
    );
  }

  // Default icon variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onContextMenu={(e) => {
              e.preventDefault();
              copyToClipboard();
            }}
            className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors ${className}`}
            aria-label="RSS 订阅"
          >
            <Rss className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>点击订阅 RSS Feed</p>
          <p className="text-xs text-muted-foreground">右键复制链接</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RssButton;
