import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReadingModeButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const ReadingModeButton = ({ isActive, onToggle }: ReadingModeButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        "gap-2 transition-all duration-300",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {isActive ? (
        <>
          <X className="w-4 h-4" />
          退出阅读
        </>
      ) : (
        <>
          <BookOpen className="w-4 h-4" />
          阅读模式
        </>
      )}
    </Button>
  );
};

export default ReadingModeButton;
