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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-card border-border"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button type="submit" size="sm">
          搜索
        </Button>
      </form>

      {/* Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-12 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">搜索历史</span>
            <button
              onClick={clearAllHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              清除
            </button>
          </div>
          <ul className="max-h-64 overflow-auto">
            {history.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleHistoryClick(item)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground",
                    "hover:bg-primary/5 transition-colors group"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {item}
                  </span>
                  <button
                    onClick={(e) => removeHistoryItem(e, item)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                  >
                    <X className="w-3 h-3" />
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
