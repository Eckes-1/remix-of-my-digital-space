import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, List } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const tracks = defaultTracks;
  const currentTrack = tracks[currentTrackIndex];

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

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
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
      
      {/* Floating player - positioned at bottom-left to avoid back-to-top button */}
      <div className="fixed bottom-4 left-4 z-40">
        {!isExpanded ? (
          /* Collapsed state - vinyl disc style */
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              "relative w-14 h-14 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-xl",
              "flex items-center justify-center group transition-transform hover:scale-110",
              "border-2 border-zinc-600",
              isPlaying && "animate-spin-slow"
            )}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-zinc-500/30" />
            <div className="absolute inset-3 rounded-full border border-zinc-500/20" />
            <div className="absolute inset-4 rounded-full border border-zinc-500/10" />
            {/* Center label */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Music className="w-3 h-3 text-primary-foreground" />
            </div>
            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </button>
        ) : (
          /* Expanded state - modern compact player */
          <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden w-72 border border-zinc-700/50">
            {/* Header with album art simulation */}
            <div className="relative h-20 bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/30 overflow-hidden">
              {/* Animated background */}
              <div className={cn(
                "absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]",
                isPlaying && "animate-pulse"
              )} />
              
              {/* Close & playlist buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                >
                  <List className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              
              {/* Floating disc */}
              <div className={cn(
                "absolute -bottom-6 left-4 w-16 h-16 rounded-full",
                "bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg",
                "flex items-center justify-center border-2 border-zinc-600",
                isPlaying && "animate-spin-slow"
              )}>
                <div className="absolute inset-2 rounded-full border border-zinc-500/30" />
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
            
            {/* Track info */}
            <div className="pt-4 pb-3 px-4 pl-24">
              <div className="text-white font-medium text-sm truncate">{currentTrack.title}</div>
              <div className="text-zinc-400 text-xs truncate">{currentTrack.artist}</div>
            </div>

            {/* Playlist dropdown */}
            {showPlaylist && (
              <div className="border-t border-zinc-700/50 max-h-32 overflow-y-auto">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "w-full px-4 py-2 text-left hover:bg-zinc-800/50 transition-colors flex items-center gap-3",
                      currentTrackIndex === index && "bg-primary/20"
                    )}
                  >
                    <span className="text-xs text-zinc-500 w-4">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm truncate", currentTrackIndex === index ? "text-primary" : "text-zinc-300")}>
                        {track.title}
                      </div>
                    </div>
                    {currentTrackIndex === index && isPlaying && (
                      <div className="flex gap-0.5">
                        <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="px-4">
              <div className="relative h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3">
              {/* Volume */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              
              {/* Playback controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTrack}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-zinc-900" />
                  ) : (
                    <Play className="w-5 h-5 text-zinc-900 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              
              {/* Volume slider */}
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
                className="w-12 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MusicPlayer;
