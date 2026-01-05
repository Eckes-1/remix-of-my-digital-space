import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const STORAGE_KEY = 'blog_search_history';
const MAX_HISTORY = 10;

const SearchBar = ({ onSearch, placeholder = "搜索文章..." }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [
      searchQuery,
      ...history.filter(h => h !== searchQuery)
    ].slice(0, MAX_HISTORY);
    
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      onSearch(query);
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    onSearch(historyItem);
    setShowHistory(false);
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder={placeholder}
              className="pl-11 pr-10 py-5 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <Button type="submit" size="lg" className="rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Search className="w-4 h-4 mr-2" />
          搜索
        </Button>
      </form>

      {/* Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">搜索历史</span>
            <button
              onClick={clearAllHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3" />
              清除全部
            </button>
          </div>
          <ul className="max-h-72 overflow-auto py-2">
            {history.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleHistoryClick(item)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-3 text-sm text-foreground",
                    "hover:bg-primary/5 transition-all group"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </span>
                    <span className="group-hover:text-primary transition-colors">{item}</span>
                  </span>
                  <button
                    onClick={(e) => removeHistoryItem(e, item)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
