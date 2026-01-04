import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, ListMusic, X, Disc3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicTracks } from '@/hooks/useMusicTracks';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const defaultTracks: Track[] = [
  {
    id: '1',
    title: '轻音乐背景',
    artist: '未知艺术家',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: '放松旋律',
    artist: '未知艺术家', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: '钢琴曲',
    artist: '未知艺术家',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

const MusicPlayer = () => {
  const { data: customTracks } = useMusicTracks(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(12).fill(4));
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
  // Use custom tracks if available, otherwise use defaults
  const tracks: Track[] = customTracks && customTracks.length > 0 
    ? customTracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, url: t.url }))
    : defaultTracks;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Animated equalizer bars
  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        setBars(prev => prev.map(() => Math.random() * 24 + 4));
      } else {
        setBars(Array(12).fill(4));
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        setCurrentTrackIndex(0);
      }
    };
    const handleError = () => {
      console.log('Audio error, trying next track');
      if (tracks.length > 1) {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex, tracks.length]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(prev => prev === 0 ? tracks.length - 1 : prev - 1);
  };

  const nextTrack = () => {
    setCurrentTrackIndex(prev => prev === tracks.length - 1 ? 0 : prev + 1);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />
      
      <div className="fixed bottom-24 right-6 z-40">
        {!isExpanded ? (
          /* Collapsed - Floating disc */
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              "relative w-16 h-16 rounded-full",
              "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600",
              "shadow-lg shadow-purple-500/30",
              "flex items-center justify-center group",
              "transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40",
              isPlaying && "animate-pulse-glow"
            )}
          >
            {/* Spinning ring */}
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-white/20",
              isPlaying && "animate-spin-slow"
            )}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            
            {/* Center icon */}
            <div className="relative">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-6">
                  {[0, 1, 2, 3].map(i => (
                    <span
                      key={i}
                      className="w-1 bg-white rounded-full transition-all duration-150"
                      style={{ height: `${8 + Math.sin(Date.now() / 200 + i) * 8}px` }}
                    />
                  ))}
                </div>
              ) : (
                <Music2 className="w-6 h-6 text-white" />
              )}
            </div>
          </button>
        ) : (
          /* Expanded - Full player */
          <div className={cn(
            "w-80 rounded-3xl overflow-hidden",
            "bg-gradient-to-b from-zinc-900 to-zinc-950",
            "border border-white/10",
            "shadow-2xl shadow-black/50"
          )}>
            {/* Visualizer header */}
            <div className="relative h-24 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 overflow-hidden">
              {/* Animated bars */}
              <div className="absolute inset-x-4 bottom-0 flex items-end justify-center gap-1">
                {bars.map((height, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 rounded-t-full transition-all duration-100",
                      isPlaying 
                        ? "bg-gradient-to-t from-violet-500 to-fuchsia-400" 
                        : "bg-zinc-700"
                    )}
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
              
              {/* Controls overlay */}
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    showPlaylist ? "bg-white/20 text-white" : "bg-black/20 text-white/70 hover:text-white"
                  )}
                >
                  <ListMusic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full bg-black/20 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Spinning disc */}
              <div className="absolute bottom-0 left-4 translate-y-1/2">
                <div className={cn(
                  "w-20 h-20 rounded-full",
                  "bg-gradient-to-br from-zinc-800 to-zinc-900",
                  "border-4 border-zinc-700",
                  "shadow-lg flex items-center justify-center",
                  isPlaying && "animate-spin-slow"
                )}>
                  <div className="absolute inset-3 rounded-full border border-zinc-600/50" />
                  <div className="absolute inset-5 rounded-full border border-zinc-600/30" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Disc3 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Track info */}
            <div className="pt-12 pb-3 px-5">
              <h3 className="text-white font-semibold truncate">{currentTrack.title}</h3>
              <p className="text-zinc-500 text-sm truncate">{currentTrack.artist}</p>
            </div>

            {/* Playlist */}
            {showPlaylist && (
              <div className="border-t border-white/5 max-h-40 overflow-y-auto">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "w-full px-5 py-3 text-left transition-all flex items-center gap-3",
                      currentTrackIndex === index 
                        ? "bg-gradient-to-r from-violet-600/20 to-transparent" 
                        : "hover:bg-white/5"
                    )}
                  >
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      currentTrackIndex === index 
                        ? "bg-violet-500 text-white" 
                        : "bg-zinc-800 text-zinc-500"
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm truncate",
                        currentTrackIndex === index ? "text-violet-400 font-medium" : "text-zinc-300"
                      )}>
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-600 truncate">{track.artist}</div>
                    </div>
                    {currentTrackIndex === index && isPlaying && (
                      <div className="flex gap-0.5 items-end h-4">
                        <span className="w-0.5 bg-violet-400 rounded-full animate-eq-1" />
                        <span className="w-0.5 bg-violet-400 rounded-full animate-eq-2" />
                        <span className="w-0.5 bg-violet-400 rounded-full animate-eq-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Progress */}
            <div className="px-5 pt-2">
              <div 
                className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  if (audioRef.current) {
                    audioRef.current.currentTime = percentage * duration;
                  }
                }}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-5 py-4">
              {/* Volume */}
              <div className="flex items-center gap-2 w-24">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-14 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
              
              {/* Playback */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTrack}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={togglePlay}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-violet-500 to-fuchsia-500",
                    "hover:scale-105 active:scale-95 transition-transform",
                    "shadow-lg shadow-violet-500/30"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-current" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              {/* Track number */}
              <div className="w-24 text-right text-xs text-zinc-600">
                {currentTrackIndex + 1} / {tracks.length}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes eq-1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes eq-2 {
          0%, 100% { height: 8px; }
          50% { height: 12px; }
        }
        @keyframes eq-3 {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }
        .animate-eq-1 { animation: eq-1 0.4s ease-in-out infinite; }
        .animate-eq-2 { animation: eq-2 0.4s ease-in-out infinite 0.1s; }
        .animate-eq-3 { animation: eq-3 0.4s ease-in-out infinite 0.2s; }
      `}</style>
    </>
  );
};

export default MusicPlayer;
