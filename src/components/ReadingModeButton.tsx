import { BookOpen, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface ReadingModeButtonProps {
  isActive: boolean;
  onToggle: () => void;
  fontSize?: number;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
  onResetFontSize?: () => void;
  minFontSize?: number;
  maxFontSize?: number;
}

const ReadingModeButton = ({ 
  isActive, 
  onToggle,
  fontSize = 18,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onResetFontSize,
  minFontSize = 14,
  maxFontSize = 24,
}: ReadingModeButtonProps) => {
  if (!isActive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="gap-1.5 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
      >
        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">阅读模式</span>
        <span className="sm:hidden">阅读</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:gap-2 bg-primary/10 border-primary/20 text-xs sm:text-sm px-2 sm:px-3"
          >
            <span className="font-mono">{fontSize}px</span>
            <span className="hidden sm:inline">字体大小</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 sm:w-64 p-3 sm:p-4" align="end">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">字体大小</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-mono">{fontSize}px</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={onDecreaseFontSize}
                disabled={fontSize <= minFontSize}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">A</span>
                <Slider
                  value={[fontSize]}
                  min={minFontSize}
                  max={maxFontSize}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    const diff = value[0] - fontSize;
                    if (diff > 0 && onIncreaseFontSize) {
                      for (let i = 0; i < diff; i++) onIncreaseFontSize();
                    } else if (diff < 0 && onDecreaseFontSize) {
                      for (let i = 0; i < Math.abs(diff); i++) onDecreaseFontSize();
                    }
                  }}
                />
                <span className="text-sm sm:text-base text-muted-foreground">A</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={onIncreaseFontSize}
                disabled={fontSize >= maxFontSize}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs sm:text-sm"
              onClick={onResetFontSize}
            >
              <RotateCcw className="w-3 h-3 mr-1.5 sm:mr-2" />
              重置默认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          "gap-1.5 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">退出阅读</span>
        <span className="sm:hidden">退出</span>
      </Button>
    </div>
  );
};

export default ReadingModeButton;
