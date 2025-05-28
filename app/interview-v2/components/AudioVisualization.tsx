'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizationProps {
  isActive: boolean;
  audioLevel: number; // Added audioLevel prop
  className?: string;
}

export default function AudioVisualization({ isActive, className }: AudioVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Cleanup when not active
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Initialize audio context and analyser
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();
        
        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        // Create Uint8Array directly without intermediate ArrayBuffer
        const data = new Uint8Array(bufferLength);
        
        source.connect(analyserNode);
        
        setAudioContext(context);
        setAnalyser(analyserNode);
        setDataArray(data);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive, audioContext]);

  useEffect(() => {
    if (!isActive || !analyser || !dataArray || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(17, 24, 39)'; // bg-gray-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Create gradient effect
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgb(99, 102, 241)'); // indigo-500
        gradient.addColorStop(1, 'rgb(79, 70, 229)'); // indigo-600

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, analyser, dataArray]);

  if (!isActive) {
    return (
      <div className={cn('w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <p className="text-sm text-gray-500">Audio visualization inactive</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={100}
      className={cn('w-full h-24 bg-gray-900 rounded-lg', className)}
    />
  );
}
