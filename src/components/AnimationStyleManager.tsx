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
  Gauge,
  Flame,
  Waves,
  SunMoon,
  PenTool
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const animationStyleOptions: { value: AnimationStyle; label: string; description: string; icon: typeof Sparkles; color?: string }[] = [
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
    color: 'from-cyan-500 to-purple-500',
  },
  {
    value: 'minimal',
    label: '极简微动效',
    description: '细微变化，专注内容',
    icon: Minimize2,
  },
  {
    value: 'neon',
    label: '霓虹赛博',
    description: '炫彩霓虹，赛博朋克风格',
    icon: Flame,
    color: 'from-pink-500 via-purple-500 to-cyan-500',
  },
  {
    value: 'retro',
    label: '复古蒸汽波',
    description: '80年代复古，蒸汽波美学',
    icon: SunMoon,
    color: 'from-fuchsia-500 to-cyan-400',
  },
  {
    value: 'aurora',
    label: '极光幻彩',
    description: '北极光效果，梦幻流动',
    icon: Waves,
    color: 'from-emerald-400 via-teal-400 to-cyan-400',
  },
  {
    value: 'ink',
    label: '水墨丹青',
    description: '中国风水墨，书法韵味',
    icon: PenTool,
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {animationStyleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = localSettings.style === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStyleChange(option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 text-center transition-all duration-300",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                  // Special hover effects for each style
                  option.value === 'neon' && !isSelected && "hover:shadow-pink-500/20 hover:shadow-lg",
                  option.value === 'retro' && !isSelected && "hover:shadow-fuchsia-500/20 hover:shadow-lg",
                  option.value === 'aurora' && !isSelected && "hover:shadow-emerald-500/20 hover:shadow-lg",
                  option.value === 'tech' && !isSelected && "hover:shadow-cyan-500/20 hover:shadow-lg"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  isSelected 
                    ? option.color 
                      ? `bg-gradient-to-br ${option.color} text-white` 
                      : "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  option.value === 'neon' && isSelected && "animate-neon-flicker",
                  option.value === 'aurora' && isSelected && "animate-aurora-fade"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium text-foreground",
                    option.value === 'neon' && isSelected && "text-pink-400",
                    option.value === 'retro' && isSelected && "text-fuchsia-400",
                    option.value === 'aurora' && isSelected && "text-emerald-400",
                    option.value === 'tech' && isSelected && "text-cyan-400"
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{option.description}</div>
                </div>
                {isSelected && (
                  <div className={cn(
                    "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center",
                    option.color ? `bg-gradient-to-br ${option.color}` : "bg-primary"
                  )}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className={cn(
          "p-6 rounded-xl border border-border",
          localSettings.style === 'neon' && "bg-gradient-to-br from-slate-900 to-purple-950",
          localSettings.style === 'retro' && "bg-gradient-to-br from-indigo-950 to-purple-900",
          localSettings.style === 'aurora' && "bg-gradient-to-br from-slate-900 to-teal-950",
          localSettings.style === 'ink' && "bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800",
          !['neon', 'retro', 'aurora', 'ink'].includes(localSettings.style) && "bg-muted/50"
        )}>
          <div className="flex flex-wrap gap-4">
            <div className={cn(
              "w-32 h-32 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer",
              localSettings.style === 'elegant' && "card-hover-elegant",
              localSettings.style === 'playful' && "card-hover-playful",
              localSettings.style === 'tech' && "card-hover-tech",
              localSettings.style === 'minimal' && "card-hover-minimal",
              localSettings.style === 'neon' && "card-hover-neon",
              localSettings.style === 'retro' && "card-hover-retro",
              localSettings.style === 'aurora' && "card-hover-aurora",
              localSettings.style === 'ink' && "card-hover-ink"
            )}>
              <span className={cn(
                "text-sm",
                ['neon', 'retro', 'aurora'].includes(localSettings.style) ? "text-white" : "text-muted-foreground"
              )}>
                悬浮试试
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                variant="default"
                className={cn(
                  localSettings.style === 'playful' && "hover:scale-105 active:scale-95",
                  localSettings.style === 'tech' && "hover:shadow-cyan-500/30",
                  localSettings.style === 'neon' && "button-hover-neon bg-gradient-to-r from-pink-500 to-purple-500",
                  localSettings.style === 'retro' && "button-hover-retro bg-gradient-to-r from-fuchsia-500 to-cyan-400",
                  localSettings.style === 'aurora' && "button-hover-aurora bg-gradient-to-r from-emerald-500 to-teal-500",
                  localSettings.style === 'ink' && "button-hover-ink"
                )}
              >
                主要按钮
              </Button>
              <Button 
                variant="outline"
                className={cn(
                  ['neon', 'retro', 'aurora'].includes(localSettings.style) && "text-white border-white/30 hover:bg-white/10"
                )}
              >
                描边按钮
              </Button>
            </div>
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
