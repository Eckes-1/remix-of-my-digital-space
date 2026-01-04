import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, ListMusic, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicTracks } from '@/hooks/useMusicTracks';
import LyricsDisplay from './LyricsDisplay';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string | null;
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
  const [showLyrics, setShowLyrics] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use custom tracks if available, otherwise use defaults
  const tracks: Track[] = customTracks && customTracks.length > 0 
    ? customTracks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        artist: t.artist, 
        url: t.url,
        lyrics: (t as any).lyrics || null,
      }))
    : defaultTracks;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
          /* Collapsed - Vinyl style button */
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              "group relative w-14 h-14 rounded-full",
              "bg-gradient-to-br from-slate-800 via-slate-900 to-black",
              "shadow-xl shadow-black/50 border border-white/10",
              "flex items-center justify-center",
              "transition-all duration-500 hover:scale-110",
              isPlaying && "animate-spin-slow"
            )}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-1 rounded-full border border-white/5" />
            <div className="absolute inset-2 rounded-full border border-white/5" />
            <div className="absolute inset-3 rounded-full border border-white/5" />
            
            {/* Center label */}
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500"
            )}>
              {isPlaying ? (
                <div className="flex gap-0.5 items-end h-2.5">
                  <span className="w-0.5 bg-white rounded-full animate-eq-1" />
                  <span className="w-0.5 bg-white rounded-full animate-eq-2" />
                  <span className="w-0.5 bg-white rounded-full animate-eq-3" />
                </div>
              ) : (
                <Music2 className="w-2.5 h-2.5 text-white" />
              )}
            </div>
            
            {/* Glow effect when playing */}
            {isPlaying && (
              <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
            )}
          </button>
        ) : (
          /* Expanded - Glassmorphism player */
          <div className={cn(
            "w-72 rounded-2xl overflow-hidden",
            "bg-black/80 backdrop-blur-xl",
            "border border-white/10",
            "shadow-2xl shadow-black/60"
          )}>
            {/* Header with cover art simulation */}
            <div className="relative h-16 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-blue-500/20">
              {/* Animated gradient background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-blue-500/30",
                "animate-gradient-x"
              )} />
              
              {/* Controls overlay */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all text-xs",
                    showLyrics 
                      ? "bg-white/20 text-white" 
                      : "bg-black/30 text-white/60 hover:text-white"
                  )}
                >
                  词
                </button>
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    showPlaylist 
                      ? "bg-white/20 text-white" 
                      : "bg-black/30 text-white/60 hover:text-white"
                  )}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg bg-black/30 text-white/60 hover:text-white transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Mini vinyl disc */}
              <div className="absolute bottom-0 left-4 translate-y-1/2">
                <div className={cn(
                  "w-14 h-14 rounded-full",
                  "bg-gradient-to-br from-zinc-800 to-black",
                  "border-2 border-zinc-700 shadow-lg",
                  "flex items-center justify-center",
                  isPlaying && "animate-spin-slow"
                )}>
                  <div className="absolute inset-2 rounded-full border border-zinc-600/30" />
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-purple-500" />
                </div>
              </div>
            </div>
            
            {/* Track info */}
            <div className="pt-10 pb-2 px-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{currentTrack.title}</h3>
                  <p className="text-white/50 text-xs truncate">{currentTrack.artist}</p>
                </div>
                <span className="text-white/30 text-xs ml-2">
                  {currentTrackIndex + 1}/{tracks.length}
                </span>
              </div>
            </div>

            {/* Lyrics section */}
            {showLyrics && currentTrack.lyrics && (
              <div className="border-t border-white/5 bg-zinc-900/50">
                <LyricsDisplay 
                  lyrics={currentTrack.lyrics} 
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                />
              </div>
            )}

            {/* Playlist */}
            {showPlaylist && (
              <div className="border-t border-white/5 max-h-32 overflow-y-auto">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "w-full px-4 py-2 text-left transition-all flex items-center gap-2",
                      currentTrackIndex === index 
                        ? "bg-white/10" 
                        : "hover:bg-white/5"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium",
                      currentTrackIndex === index 
                        ? "bg-gradient-to-r from-rose-500 to-purple-500 text-white" 
                        : "bg-white/10 text-white/50"
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-xs truncate",
                        currentTrackIndex === index ? "text-white font-medium" : "text-white/70"
                      )}>
                        {track.title}
                      </div>
                    </div>
                    {currentTrackIndex === index && isPlaying && (
                      <div className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-1" />
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-2" />
                        <span className="w-0.5 bg-rose-400 rounded-full animate-eq-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="px-4 pt-2">
              <div 
                className="relative h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
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
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 5px)` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3">
              {/* Volume */}
              <div className="flex items-center gap-1.5 w-20">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
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
                  className="w-12 h-0.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
              
              {/* Playback */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevTrack}
                  className="p-1.5 text-white/50 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-rose-500 to-purple-500",
                    "hover:scale-105 active:scale-95 transition-transform",
                    "shadow-lg shadow-rose-500/25"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-1.5 text-white/50 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              
              {/* Spacer */}
              <div className="w-20" />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes eq-1 {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        @keyframes eq-2 {
          0%, 100% { height: 6px; }
          50% { height: 10px; }
        }
        @keyframes eq-3 {
          0%, 100% { height: 5px; }
          50% { height: 11px; }
        }
        .animate-eq-1 { animation: eq-1 0.4s ease-in-out infinite; }
        .animate-eq-2 { animation: eq-2 0.4s ease-in-out infinite 0.1s; }
        .animate-eq-3 { animation: eq-3 0.4s ease-in-out infinite 0.2s; }
        @keyframes gradient-x {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
