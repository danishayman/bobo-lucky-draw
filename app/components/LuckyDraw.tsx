'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantsPanel from './ParticipantsPanel';

interface AudioManager {
  playSpinSound: () => void;
  playWinnerSound: () => void;
  playClickSound: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export default function LuckyDraw() {
  const [names, setNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [showWinner, setShowWinner] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<AudioManager | null>(null);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio system
  useEffect(() => {
    const initAudio = () => {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate spinning sound using Web Audio API
      const createSpinSound = () => {
        if (isMuted) return;
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

      // Generate winner sound
      const createWinnerSound = () => {
        if (isMuted) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
      };

      // Generate click sound
      const createClickSound = () => {
        if (isMuted) return;
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

      audioRef.current = {
        playSpinSound: createSpinSound,
        playWinnerSound: createWinnerSound,
        playClickSound: createClickSound,
        toggleMute: () => setIsMuted(!isMuted),
        isMuted
      };
    };

    initAudio();
  }, [isMuted]);

  const clearWinnerState = () => {
    setWinner(null);
    setShowWinner(false);
  };

  const triggerConfetti = () => {
    const colors = ['#dc2626', '#ef4444', '#b91c1c', '#fca5a5', '#fecaca'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });

    // Additional confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.25, y: 0.7 },
        colors: colors
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.75, y: 0.7 },
        colors: colors
      });
    }, 400);
  };

  const startDraw = () => {
    if (names.length === 0) return;
    
    audioRef.current?.playClickSound();
    setIsSpinning(true);
    setWinner(null);
    setShowWinner(false);
    
    let spinCount = 0;
    const maxSpins = 30;
    const spinDuration = 2500; // 2.5 seconds
    
    spinIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * names.length);
      setDisplayName(names[randomIndex]);
      audioRef.current?.playSpinSound();
      
      spinCount++;
      
      // Gradually slow down the spinning
      if (spinCount > maxSpins * 0.7) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
          spinIntervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * names.length);
            setDisplayName(names[randomIndex]);
            spinCount++;
          }, 150); // Slower interval
        }
      }
    }, 80);

    // Stop spinning and show winner
    setTimeout(() => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      
      const finalWinner = names[Math.floor(Math.random() * names.length)];
      setWinner(finalWinner);
      setDisplayName(finalWinner);
      setIsSpinning(false);
      
      setTimeout(() => {
        setShowWinner(true);
        audioRef.current?.playWinnerSound();
        triggerConfetti();
      }, 300);
      
    }, spinDuration);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{background: 'var(--background)'}}>

      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
            Lucky Draw
          </h1>
          <p className="text-base sm:text-lg px-4 sm:px-0" style={{color: 'var(--secondary)'}}>Enter names and let fate decide the winner!</p>
        </motion.div>

        {/* Main Draw Area - Now centered and full width */}
        <div className="flex justify-center">
          {/* Draw Area */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated rounded-2xl lg:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 sm:space-y-8 w-full max-w-2xl"
          >
            {/* Result Display */}
            <div className="w-full h-48 sm:h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!winner && !isSpinning && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🎲</div>
                    <p className="text-base sm:text-lg" style={{color: 'var(--secondary)'}}>Ready to draw?</p>
                  </motion.div>
                )}

                {isSpinning && (
                  <motion.div
                    key="spinning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-4xl sm:text-6xl mb-2 sm:mb-4"
                    >
                      🎯
                    </motion.div>
                    <div className="text-xl sm:text-3xl font-bold spinning-text mb-2" style={{color: 'var(--foreground)'}}>
                      {displayName}
                    </div>
                    <p className="text-base sm:text-lg" style={{color: 'var(--primary)'}}>Spinning...</p>
                  </motion.div>
                )}

                {showWinner && winner && (
                  <motion.div
                    key="winner"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                      className="text-4xl sm:text-6xl mb-2 sm:mb-4"
                    >
                      🏆
                    </motion.div>
                    <div className="text-2xl sm:text-4xl font-bold mb-2 px-2 text-center break-words" style={{color: '#fbbf24'}}>
                      {winner}
                    </div>
                    <p className="text-lg sm:text-xl font-semibold" style={{color: '#10b981'}}>Winner!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Draw Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startDraw}
              disabled={names.length === 0 || isSpinning}
              className={`
                w-full py-4 sm:py-6 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-2xl transition-all duration-300
                ${names.length === 0 || isSpinning 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'btn-primary'
                }
                flex items-center justify-center gap-2 sm:gap-3
              `}
            >
              <Play size={20} className="sm:w-7 sm:h-7" />
              {isSpinning ? 'Drawing...' : 'Start Draw'}
            </motion.button>

            {names.length === 0 && (
              <p className="text-center text-xs sm:text-sm px-4" style={{color: 'var(--secondary)'}}>
                Add some participants to start the draw
              </p>
            )}
          </motion.div>
        </div>

        {/* Participants Panel */}
        <ParticipantsPanel
          names={names}
          setNames={setNames}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          audioRef={audioRef}
          onClearAll={clearWinnerState}
        />
      </div>
    </div>
  );
}
