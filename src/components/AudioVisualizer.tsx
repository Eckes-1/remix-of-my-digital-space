import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  className?: string;
  barCount?: number;
}

const AudioVisualizer = ({ audioRef, isPlaying, className, barCount = 16 }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioRef.current || isInitialized) return;

    const initAudio = () => {
      if (audioContextRef.current) return;
      
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaElementSource(audioRef.current!);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    // Initialize on first play
    const handlePlay = () => {
      initAudio();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    audioRef.current.addEventListener('play', handlePlay);
    
    return () => {
      audioRef.current?.removeEventListener('play', handlePlay);
    };
  }, [audioRef, isInitialized]);

  // Draw visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width / barCount;
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, 'hsl(var(--primary))');
    gradient.addColorStop(0.5, '#ec4899');
    gradient.addColorStop(1, '#f97316');

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        // Map to frequency bins, emphasizing mid-range
        const index = Math.floor((i / barCount) * bufferLength * 0.8);
        const value = dataArray[index];
        const barHeight = (value / 255) * canvas.height * 0.9;
        const x = i * barWidth + barWidth * 0.15;
        const y = canvas.height - barHeight;
        const width = barWidth * 0.7;

        // Add glow effect
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 10;

        // Draw rounded bar
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
      // Draw idle state - subtle bars
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth + barWidth * 0.15;
        const width = barWidth * 0.7;
        const idleHeight = 2 + Math.sin(i * 0.5) * 2;
        ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.3)';
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - idleHeight, width, idleHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className={cn("rounded", className)}
    />
  );
};

export default AudioVisualizer;
