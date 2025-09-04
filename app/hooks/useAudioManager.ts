'use client';

import { useEffect, useRef } from 'react';

interface AudioManager {
  playSpinSound: () => void;
  playWinnerSound: () => void;
  playClickSound: () => void;
  stopSpinSound: () => void;
  isWinnerSoundPlaying: () => boolean;
  toggleMute: () => void;
  isMuted: boolean;
}

export function useAudioManager(isMuted: boolean): AudioManager | null {
  const audioRef = useRef<AudioManager | null>(null);

  useEffect(() => {
    const initAudio = () => {
      // Audio elements for custom sounds
      let clickAudio: HTMLAudioElement | null = null;
      let spinAudio: HTMLAudioElement | null = null;
      let winnerAudio: HTMLAudioElement | null = null;
      
      // Web Audio API context for fallback sounds
      let audioContext: AudioContext | null = null;
      
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }

      // Try to load custom sound files
      const loadCustomAudio = () => {
        try {
          // Button click sound
          clickAudio = new Audio('/sounds/button-click.mp3');
          clickAudio.volume = 0.5;
          clickAudio.preload = 'auto';
          
          // Spinning sound (looping)
          spinAudio = new Audio('/sounds/spinning.mp3');
          spinAudio.volume = 0.3;
          spinAudio.loop = true;
          spinAudio.preload = 'auto';
          
          // Winner sound
          winnerAudio = new Audio('/sounds/winner.mp3');
          winnerAudio.volume = 0.6;
          winnerAudio.preload = 'auto';
          
        } catch (e) {
          console.log('Custom audio files not found, using fallback sounds');
        }
      };

      loadCustomAudio();

      // Fallback sound generators using Web Audio API
      const createFallbackSpinSound = () => {
        if (!audioContext || isMuted) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      };

      const createFallbackWinnerSound = () => {
        if (!audioContext || isMuted) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
      };

      const createFallbackClickSound = () => {
        if (!audioContext || isMuted) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
      };

      // Audio manager functions
      const playClickSound = () => {
        if (isMuted) return;
        
        if (clickAudio) {
          clickAudio.currentTime = 0;
          clickAudio.play().catch(() => createFallbackClickSound());
        } else {
          createFallbackClickSound();
        }
      };

      const playSpinSound = () => {
        if (isMuted) return;
        
        if (spinAudio && !spinAudio.currentTime) {
          spinAudio.play().catch(() => createFallbackSpinSound());
        } else if (!spinAudio) {
          createFallbackSpinSound();
        }
      };

      const stopSpinSound = () => {
        if (spinAudio) {
          spinAudio.pause();
          spinAudio.currentTime = 0;
        }
      };

      const playWinnerSound = () => {
        if (isMuted) return;
        
        if (winnerAudio) {
          winnerAudio.currentTime = 0;
          winnerAudio.play().catch(() => createFallbackWinnerSound());
        } else {
          createFallbackWinnerSound();
        }
      };

      const isWinnerSoundPlaying = () => {
        if (winnerAudio) {
          return !winnerAudio.paused && !winnerAudio.ended;
        }
        return false;
      };

      audioRef.current = {
        playSpinSound,
        playWinnerSound,
        playClickSound,
        stopSpinSound,
        isWinnerSoundPlaying,
        toggleMute: () => {}, // This will be handled by parent component
        isMuted
      };
    };

    initAudio();
  }, [isMuted]);

  return audioRef.current;
}
