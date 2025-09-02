'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Volume2, VolumeX, Trash2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AudioManager {
  playSpinSound: () => void;
  playWinnerSound: () => void;
  playClickSound: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export default function LuckyDraw() {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
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

  const addName = () => {
    if (inputValue.trim()) {
      audioRef.current?.playClickSound();
      const newNames = inputValue
        .split(/[,\n]/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      setNames(prev => [...prev, ...newNames]);
      setInputValue('');
    }
  };

  const removeName = (index: number) => {
    audioRef.current?.playClickSound();
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllNames = () => {
    audioRef.current?.playClickSound();
    setNames([]);
    setWinner(null);
    setShowWinner(false);
  };

  const triggerConfetti = () => {
    const colors = ['#DC2626', '#EF4444', '#B91C1C', '#FCA5A5', '#FECACA'];
    
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent mb-4">
            Lucky Draw
          </h1>
          <p className="text-gray-400 text-base sm:text-lg px-4 sm:px-0">Enter names and let fate decide the winner!</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl lg:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Participants</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    audioRef.current?.playClickSound();
                  }}
                  className="p-2 rounded-full glass-red hover:glow-red transition-all duration-300"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button
                  onClick={clearAllNames}
                  className="p-2 rounded-full glass-red hover:glow-red transition-all duration-300"
                  disabled={names.length === 0}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter names (one per line or comma-separated)..."
                className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-black/30 border border-gray-700 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none text-sm sm:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    addName();
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addName}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 glow-red text-sm sm:text-base"
                disabled={!inputValue.trim()}
              >
                <Plus size={20} />
                Add Names
              </motion.button>
            </div>

            {/* Names List */}
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              <AnimatePresence>
                {names.map((name, index) => (
                  <motion.div
                    key={`${name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between bg-black/20 border border-gray-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3"
                  >
                    <span className="text-white font-medium text-sm sm:text-base truncate pr-2">{name}</span>
                    <button
                      onClick={() => removeName(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 rounded-full transition-all duration-200"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {names.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No participants added yet
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400 text-center">
              {names.length} participant{names.length !== 1 ? 's' : ''} added
            </div>
          </motion.div>

          {/* Right Panel - Draw Area */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl lg:rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8"
          >
            {/* Result Display */}
            <div className="w-full h-36 sm:h-48 flex items-center justify-center">
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
                    <p className="text-gray-400 text-base sm:text-lg">Ready to draw?</p>
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
                    <div className="text-xl sm:text-3xl font-bold text-white spinning-text mb-2">
                      {displayName}
                    </div>
                    <p className="text-red-400 text-base sm:text-lg">Spinning...</p>
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
                    <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-2 px-2 text-center break-words">
                      {winner}
                    </div>
                    <p className="text-green-400 text-lg sm:text-xl font-semibold">Winner!</p>
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
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white hover:glow-red-intense'
                }
                flex items-center justify-center gap-2 sm:gap-3
              `}
            >
              <Play size={20} className="sm:w-7 sm:h-7" />
              {isSpinning ? 'Drawing...' : 'Start Draw'}
            </motion.button>

            {names.length === 0 && (
              <p className="text-gray-500 text-center text-xs sm:text-sm px-4">
                Add some participants to start the draw
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
