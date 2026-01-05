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
        className="gap-2 transition-all duration-300"
      >
        <BookOpen className="w-4 h-4" />
        阅读模式
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-primary/10 border-primary/20"
          >
            <span className="text-xs font-mono">{fontSize}px</span>
            字体大小
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="center">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">字体大小</span>
              <span className="text-sm text-muted-foreground font-mono">{fontSize}px</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onDecreaseFontSize}
                disabled={fontSize <= minFontSize}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">A</span>
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
                <span className="text-base text-muted-foreground">A</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onIncreaseFontSize}
                disabled={fontSize >= maxFontSize}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onResetFontSize}
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              重置为默认 (18px)
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          "gap-2 transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <X className="w-4 h-4" />
        退出阅读
      </Button>
    </div>
  );
};

export default ReadingModeButton;
