import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { usePosts } from '@/hooks/usePosts';
import { TrendingUp, Eye, Heart, FileText, Calendar, Filter } from 'lucide-react';
import { format, subDays, startOfDay, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type DateRange = '7d' | '30d' | '90d' | 'custom';

const StatsCharts = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  
  const { startDate, endDate, daysCount } = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '7d':
        return { startDate: subDays(now, 6), endDate: now, daysCount: 7 };
      case '30d':
        return { startDate: subDays(now, 29), endDate: now, daysCount: 30 };
      case '90d':
        return { startDate: subDays(now, 89), endDate: now, daysCount: 90 };
      case 'custom':
        if (customStartDate && customEndDate) {
          const days = Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return { startDate: customStartDate, endDate: customEndDate, daysCount: days };
        }
        return { startDate: subDays(now, 29), endDate: now, daysCount: 30 };
      default:
        return { startDate: subDays(now, 29), endDate: now, daysCount: 30 };
    }
  }, [dateRange, customStartDate, customEndDate]);
  const { data: posts } = usePosts(false); // Get all posts including drafts for admin

  // Top 10 popular posts by views
  const topViewedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts]
      .filter(p => p.published)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
        fullName: p.title,
        views: p.view_count || 0,
        likes: p.like_count || 0,
      }));
  }, [posts]);

  // Top 10 posts by likes
  const topLikedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts]
      .filter(p => p.published)
      .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
        fullName: p.title,
        likes: p.like_count || 0,
        views: p.view_count || 0,
      }));
  }, [posts]);

  // Posts by category (pie chart)
  const categoryData = useMemo(() => {
    if (!posts) return [];
    const categoryMap = new Map<string, number>();
    posts.filter(p => p.published).forEach(p => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [posts]);

  // Publishing trend based on selected date range
  const publishTrend = useMemo(() => {
    if (!posts) return [];
    const days = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = startOfDay(subDays(endDate, i));
      days.push({
        date,
        dateStr: format(date, daysCount > 31 ? 'M/d' : 'M/d', { locale: zhCN }),
        count: 0,
        views: 0,
      });
    }
    
    posts.filter(p => p.published && p.published_at).forEach(p => {
      const publishDate = startOfDay(parseISO(p.published_at!));
      const dayData = days.find(d => d.date.getTime() === publishDate.getTime());
      if (dayData) {
        dayData.count++;
      }
    });
    
    return days.map(d => ({ date: d.dateStr, 发布数: d.count }));
  }, [posts, startDate, endDate, daysCount]);

  // Filtered stats based on date range
  const filteredStats = useMemo(() => {
    if (!posts) return { posts: [], views: 0, likes: 0 };
    
    const filteredPosts = posts.filter(p => {
      if (!p.published || !p.published_at) return false;
      const pubDate = parseISO(p.published_at);
      return !isBefore(pubDate, startOfDay(startDate)) && !isAfter(pubDate, addDays(endDate, 1));
    });

    return {
      posts: filteredPosts,
      views: filteredPosts.reduce((sum, p) => sum + (p.view_count || 0), 0),
      likes: filteredPosts.reduce((sum, p) => sum + (p.like_count || 0), 0),
    };
  }, [posts, startDate, endDate]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!posts) return { totalViews: 0, totalLikes: 0, totalPosts: 0, avgViews: 0 };
    const publishedPosts = posts.filter(p => p.published);
    const totalViews = publishedPosts.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    return {
      totalViews,
      totalLikes,
      totalPosts: publishedPosts.length,
      avgViews: publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0,
    };
  }, [posts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{payload[0].payload.fullName || label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {item.name}: <span className="font-medium text-foreground">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const dateRangeLabel = useMemo(() => {
    switch (dateRange) {
      case '7d': return '近7天';
      case '30d': return '近30天';
      case '90d': return '近90天';
      case 'custom': 
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'M/d')} - ${format(customEndDate, 'M/d')}`;
        }
        return '自定义';
      default: return '近30天';
    }
  }, [dateRange, customStartDate, customEndDate]);

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">时间范围:</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('7d')}
          >
            近7天
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('30d')}
          >
            近30天
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('90d')}
          >
            近90天
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateRange === 'custom' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
              >
                <Calendar className="w-3 h-3" />
                自定义
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium">选择日期范围</p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">开始日期</p>
                  <CalendarComponent
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      if (date) setDateRange('custom');
                    }}
                    disabled={(date) => date > new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">结束日期</p>
                  <CalendarComponent
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      if (date) setDateRange('custom');
                    }}
                    disabled={(date) => date > new Date() || (customStartDate && date < customStartDate)}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Show filtered period stats */}
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {dateRangeLabel}: <span className="text-foreground font-medium">{filteredStats.posts.length}</span> 篇文章
          </span>
          <span className="text-muted-foreground">
            <Eye className="w-3 h-3 inline mr-1" />
            <span className="text-foreground font-medium">{filteredStats.views.toLocaleString()}</span>
          </span>
          <span className="text-muted-foreground">
            <Heart className="w-3 h-3 inline mr-1" />
            <span className="text-foreground font-medium">{filteredStats.likes.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">总阅读量</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-xl p-4 border border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.totalLikes.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">总点赞数</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">已发布文章</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaryStats.avgViews}</p>
              <p className="text-sm text-muted-foreground">平均阅读量</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Viewed Posts */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            热门文章排行 (阅读量)
          </h3>
          {topViewedPosts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topViewedPosts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="阅读量" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>

        {/* Top Liked Posts */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            热门文章排行 (点赞数)
          </h3>
          {topLikedPosts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topLikedPosts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="likes" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="点赞数" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            分类分布
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>

        {/* Publishing Trend */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            发布趋势 ({dateRangeLabel})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publishTrend} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="发布数" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;