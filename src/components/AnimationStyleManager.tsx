import { useState, useEffect } from 'react';
import { useAnimationSettings, useUpdateAnimationSettings, AnimationSettings, AnimationStyle } from '@/hooks/useAnimationStyle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Sparkles, 
  Zap, 
  Cpu, 
  Minimize2, 
  Loader2,
  Play,
  MousePointer2,
  ArrowDownUp,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const animationStyleOptions: { value: AnimationStyle; label: string; description: string; icon: typeof Sparkles }[] = [
  {
    value: 'elegant',
    label: '优雅流畅',
    description: '平滑过渡，专业高端',
    icon: Sparkles,
  },
  {
    value: 'playful',
    label: '活泼有趣',
    description: '弹跳摇晃，轻松活泼',
    icon: Zap,
  },
  {
    value: 'tech',
    label: '科技感',
    description: '炫酷效果，现代科技',
    icon: Cpu,
  },
  {
    value: 'minimal',
    label: '极简微动效',
    description: '细微变化，专注内容',
    icon: Minimize2,
  },
];

const speedOptions = [
  { value: 'slow', label: '慢速' },
  { value: 'normal', label: '正常' },
  { value: 'fast', label: '快速' },
];

const AnimationStyleManager = () => {
  const { data: settings, isLoading } = useAnimationSettings();
  const updateSettings = useUpdateAnimationSettings();
  
  const [localSettings, setLocalSettings] = useState<AnimationSettings>({
    style: 'elegant',
    enableScrollAnimations: true,
    enablePageTransitions: true,
    enableHoverEffects: true,
    animationSpeed: 'normal',
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(localSettings);
      toast.success('动画设置已保存');
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleStyleChange = (style: AnimationStyle) => {
    setLocalSettings(prev => ({ ...prev, style }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Style Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">动画风格</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          选择全站动画风格，影响卡片悬浮、按钮点击、页面过渡等所有交互效果
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animationStyleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = localSettings.style === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStyleChange(option.value)}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{option.description}</div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Animation Toggles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">动画开关</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">滚动触发动画</div>
                <div className="text-sm text-muted-foreground">元素进入视图时播放动画</div>
              </div>
            </div>
            <Switch
              checked={localSettings.enableScrollAnimations}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, enableScrollAnimations: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">页面过渡动画</div>
                <div className="text-sm text-muted-foreground">页面切换时的过渡效果</div>
              </div>
            </div>
            <Switch
              checked={localSettings.enablePageTransitions}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, enablePageTransitions: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <MousePointer2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">悬浮效果</div>
                <div className="text-sm text-muted-foreground">鼠标悬浮时的交互效果</div>
              </div>
            </div>
            <Switch
              checked={localSettings.enableHoverEffects}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, enableHoverEffects: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Animation Speed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">动画速度</h3>
        </div>
        
        <RadioGroup
          value={localSettings.animationSpeed}
          onValueChange={(value: 'slow' | 'normal' | 'fast') => 
            setLocalSettings(prev => ({ ...prev, animationSpeed: value }))
          }
          className="flex gap-4"
        >
          {speedOptions.map((option) => (
            <Label
              key={option.value}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                localSettings.animationSpeed === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <span className={cn(
                "font-medium",
                localSettings.animationSpeed === option.value ? "text-primary" : "text-foreground"
              )}>
                {option.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Preview Area */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">效果预览</h3>
        <div className="p-6 rounded-xl bg-muted/50 border border-border">
          <div className="flex flex-wrap gap-4">
            <div className={cn(
              "w-32 h-32 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer",
              localSettings.style === 'elegant' && "card-hover-elegant",
              localSettings.style === 'playful' && "card-hover-playful",
              localSettings.style === 'tech' && "card-hover-tech",
              localSettings.style === 'minimal' && "card-hover-minimal"
            )}>
              <span className="text-sm text-muted-foreground">悬浮试试</span>
            </div>
            <Button 
              variant="default"
              className={cn(
                localSettings.style === 'playful' && "hover:scale-105 active:scale-95",
                localSettings.style === 'tech' && "hover:shadow-cyan-500/30"
              )}
            >
              按钮效果
            </Button>
            <Button variant="outline">
              描边按钮
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="min-w-[120px]"
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            '保存设置'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnimationStyleManager;
