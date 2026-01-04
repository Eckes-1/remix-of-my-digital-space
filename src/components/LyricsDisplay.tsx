import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: string | null;
  currentTime: number;
  isPlaying: boolean;
}

const parseLRC = (lrc: string): LyricLine[] => {
  const lines = lrc.split('\n');
  const lyrics: LyricLine[] = [];
  
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;
  
  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue;
    
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;
    
    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      const time = minutes * 60 + seconds + ms / 1000;
      
      lyrics.push({ time, text });
    }
  }
  
  return lyrics.sort((a, b) => a.time - b.time);
};

const LyricsDisplay = ({ lyrics, currentTime, isPlaying }: LyricsDisplayProps) => {
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (lyrics) {
      setParsedLyrics(parseLRC(lyrics));
    } else {
      setParsedLyrics([]);
    }
  }, [lyrics]);

  useEffect(() => {
    if (parsedLyrics.length === 0) return;
    
    let newIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
      
      // Scroll to current line
      if (newIndex >= 0 && lineRefs.current[newIndex] && containerRef.current) {
        const line = lineRefs.current[newIndex];
        const container = containerRef.current;
        
        line?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentTime, parsedLyrics, currentLineIndex]);

  if (!lyrics || parsedLyrics.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-zinc-500 text-sm">
        暂无歌词
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-24 overflow-hidden relative"
    >
      {/* Gradient mask */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-zinc-900 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>
      
      <div className="py-8 space-y-2 transition-all duration-300">
        {parsedLyrics.map((line, index) => (
          <div
            key={`${line.time}-${index}`}
            ref={(el) => (lineRefs.current[index] = el)}
            className={cn(
              "text-center text-sm transition-all duration-300 px-4",
              index === currentLineIndex
                ? "text-white font-medium scale-105"
                : index === currentLineIndex - 1 || index === currentLineIndex + 1
                  ? "text-zinc-400"
                  : "text-zinc-600"
            )}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LyricsDisplay;
