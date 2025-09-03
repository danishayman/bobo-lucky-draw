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
  const [slotNames, setSlotNames] = useState<string[]>([]);
  const [slotOffset, setSlotOffset] = useState(0);
  
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

  // Create slot machine data when names change
  useEffect(() => {
    if (names.length > 0) {
      // Create a repeating array for slot machine effect
      const repeatedNames = [];
      const repeats = Math.max(10, Math.ceil(50 / names.length)); // Ensure enough names for smooth scrolling
      
      for (let i = 0; i < repeats; i++) {
        repeatedNames.push(...names);
      }
      
      setSlotNames(repeatedNames);
      setSlotOffset(0);
    } else {
      setSlotNames([]);
      setSlotOffset(0);
    }
  }, [names]);

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
    if (names.length === 0 || slotNames.length === 0) return;
    
    audioRef.current?.playClickSound();
    setIsSpinning(true);
    setWinner(null);
    setShowWinner(false);
    
    let currentOffset = 0;
    let speed = 12; // Initial speed (pixels per frame)
    const minSpeed = 0.8;
    const deceleration = 0.985; // Deceleration factor
    const spinDuration = 3500; // 3.5 seconds
    const itemHeight = 80; // Height of each slot item
    
    let soundCounter = 0;
    const animate = () => {
      currentOffset += speed;
      
      // Wrap around when we've scrolled past the repeated names
      if (currentOffset >= slotNames.length * itemHeight / 3) {
        currentOffset = 0;
      }
      
      setSlotOffset(currentOffset);
      
      // Play sound less frequently to avoid overwhelming
      soundCounter++;
      if (soundCounter % 8 === 0) {
        audioRef.current?.playSpinSound();
      }
      
      // Gradually slow down
      if (speed > minSpeed) {
        speed *= deceleration;
      }
    };
    
    // Start animation loop
    spinIntervalRef.current = setInterval(animate, 16); // ~60fps
    
    // Stop spinning and show winner
    setTimeout(() => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      
      // Calculate final position to land on a name
      const finalWinner = names[Math.floor(Math.random() * names.length)];
      const winnerIndex = slotNames.findIndex(name => name === finalWinner);
      const finalOffset = winnerIndex * itemHeight;
      
      // Smooth final positioning
      let currentFinalOffset = currentOffset;
      const targetOffset = finalOffset;
      const smoothingSpeed = 0.15;
      
      const smoothFinish = () => {
        const diff = targetOffset - currentFinalOffset;
        if (Math.abs(diff) > 1) {
          currentFinalOffset += diff * smoothingSpeed;
          setSlotOffset(currentFinalOffset);
          requestAnimationFrame(smoothFinish);
        } else {
          setSlotOffset(targetOffset);
          setWinner(finalWinner);
          setDisplayName(finalWinner);
          setIsSpinning(false);
          
          setTimeout(() => {
            setShowWinner(true);
            audioRef.current?.playWinnerSound();
            triggerConfetti();
          }, 300);
        }
      };
      
      smoothFinish();
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
            {/* Slot Machine Display */}
            <div className="w-full h-80 sm:h-96 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Slot Machine Frame */}
                <div 
                  className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-3xl shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Decorative dots around the frame */}
                  <div className="absolute inset-4 rounded-2xl border-4 border-white/20">
                    {/* Top dots */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`top-${i}`}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          top: '-6px',
                          left: `${8 + (i * (100 - 16) / 11)}%`,
                          transform: 'translateX(-50%)',
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    ))}
                    {/* Bottom dots */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`bottom-${i}`}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          bottom: '-6px',
                          left: `${8 + (i * (100 - 16) / 11)}%`,
                          transform: 'translateX(-50%)',
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    ))}
                    {/* Left dots */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`left-${i}`}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          left: '-6px',
                          top: `${12 + (i * (100 - 24) / 7)}%`,
                          transform: 'translateY(-50%)',
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    ))}
                    {/* Right dots */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`right-${i}`}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          right: '-6px',
                          top: `${12 + (i * (100 - 24) / 7)}%`,
                          transform: 'translateY(-50%)',
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Slot Machine Window */}
                  <div 
                    className="relative bg-white rounded-2xl p-4 overflow-hidden"
                    style={{
                      height: '240px',
                      boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {/* Selection Indicator */}
                    <div 
                      className="absolute left-0 right-0 bg-red-500/20 border-2 border-red-500 rounded-lg z-10"
                      style={{
                        top: '50%',
                        height: '80px',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                      }}
                    />

                    {/* Names Display */}
                    <div className="relative h-full">
                      <AnimatePresence mode="wait">
                        {!isSpinning && slotNames.length === 0 && (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-full text-center"
                          >
                            <div>
                              <div className="text-4xl mb-4">🎰</div>
                              <p className="text-gray-500 font-medium">Add participants to start!</p>
                            </div>
                          </motion.div>
                        )}

                        {slotNames.length > 0 && (
                          <motion.div
                            key="slot-machine"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                          >
                            <div 
                              className="absolute w-full"
                              style={{
                                transform: `translateY(-${slotOffset}px)`,
                                transition: isSpinning ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              {slotNames.map((name, index) => (
                                <div
                                  key={`${name}-${index}`}
                                  className="flex items-center justify-center font-bold text-gray-800"
                                  style={{
                                    height: '80px',
                                    fontSize: slotNames.length <= 5 ? '24px' : '20px'
                                  }}
                                >
                                  {name}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Winner Celebration Overlay */}
                <AnimatePresence>
                  {showWinner && winner && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border-4 border-yellow-400">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                          className="text-6xl mb-4"
                        >
                          🏆
                        </motion.div>
                        <div className="text-3xl font-bold mb-2 text-yellow-600">
                          {winner}
                        </div>
                        <p className="text-xl font-semibold text-green-600">Winner!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:from-yellow-500 hover:to-yellow-700'
                }
                flex items-center justify-center gap-2 sm:gap-3
              `}
              style={names.length > 0 && !isSpinning ? {
                boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4)'
              } : {}}
            >
              <Play size={20} className="sm:w-7 sm:h-7" />
              {isSpinning ? 'Spinning...' : '🎰 Pull the Lever!'}
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
