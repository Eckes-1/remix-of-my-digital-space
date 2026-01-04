import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicTracks } from '@/hooks/useMusicTracks';
import AudioVisualizer from '@/components/AudioVisualizer';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" crossOrigin="anonymous" />
      
      {/* Floating player - positioned at bottom-right but above back-to-top button */}
      <div className="fixed bottom-24 right-6 z-40">
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
          /* Expanded state - modern compact player with visualizer */
          <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden w-80 border border-zinc-700/50">
            {/* Header */}
            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500",
                  "flex items-center justify-center",
                  isPlaying && "animate-spin-slow"
                )}>
                  <Music className="w-4 h-4 text-white" />
                </div>
                <span className="text-zinc-400 text-xs font-medium">音乐播放器</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    showPlaylist ? "bg-primary/20 text-primary" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visualizer */}
            <div className="px-4 py-3 bg-zinc-950/50">
              <AudioVisualizer 
                audioRef={audioRef} 
                isPlaying={isPlaying} 
                className="w-full h-10"
                barCount={24}
              />
            </div>
            
            {/* Track info */}
            <div className="px-4 py-2">
              <div className="text-white font-medium text-sm truncate">{currentTrack.title}</div>
              <div className="text-zinc-500 text-xs truncate">{currentTrack.artist}</div>
            </div>

            {/* Playlist dropdown */}
            {showPlaylist && (
              <div className="border-t border-zinc-800 max-h-36 overflow-y-auto">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3",
                      currentTrackIndex === index 
                        ? "bg-primary/10 border-l-2 border-primary" 
                        : "hover:bg-zinc-800/50"
                    )}
                  >
                    <span className="text-xs text-zinc-600 w-5">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm truncate",
                        currentTrackIndex === index ? "text-primary font-medium" : "text-zinc-300"
                      )}>
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-600 truncate">{track.artist}</div>
                    </div>
                    {currentTrackIndex === index && isPlaying && (
                      <div className="flex gap-0.5 items-end h-4">
                        <span className="w-1 bg-primary rounded-full animate-equalizer-1" />
                        <span className="w-1 bg-primary rounded-full animate-equalizer-2" />
                        <span className="w-1 bg-primary rounded-full animate-equalizer-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="px-4 pt-2">
              <div 
                className="relative h-1 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
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
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
                {/* Hover indicator */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors"
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
                  className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              {/* Playback controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevTrack}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-pink-500",
                    "hover:scale-105 active:scale-95 transition-transform",
                    "shadow-lg shadow-primary/30"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              
              {/* Track indicator */}
              <div className="text-[10px] text-zinc-600 w-16 text-right">
                {currentTrackIndex + 1} / {tracks.length}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes equalizer-1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes equalizer-2 {
          0%, 100% { height: 8px; }
          50% { height: 12px; }
        }
        @keyframes equalizer-3 {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }
        .animate-equalizer-1 {
          animation: equalizer-1 0.4s ease-in-out infinite;
        }
        .animate-equalizer-2 {
          animation: equalizer-2 0.4s ease-in-out infinite 0.1s;
        }
        .animate-equalizer-3 {
          animation: equalizer-3 0.4s ease-in-out infinite 0.2s;
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
