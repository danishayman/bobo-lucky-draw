'use client';

import { motion, AnimatePresence } from 'framer-motion';
import WinnerOverlay from './WinnerOverlay';

interface SlotMachineProps {
  slotNames: string[];
  slotOffset: number;
  isSpinning: boolean;
  showWinner: boolean;
  winner: string | null;
}

export default function SlotMachine({ 
  slotNames, 
  slotOffset, 
  isSpinning, 
  showWinner, 
  winner 
}: SlotMachineProps) {
  return (
    <div className="w-full h-80 sm:h-96 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Slot Machine Frame */}
        <div 
          className={`relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-3xl shadow-2xl transition-all duration-300 ${
            isSpinning ? 'scale-[1.02] shadow-3xl' : 'scale-100'
          }`}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            boxShadow: isSpinning 
              ? '0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 30px rgba(251, 191, 36, 0.3)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
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
              className={`absolute left-0 right-0 bg-red-500/20 border-2 border-red-500 rounded-lg z-10 transition-all duration-200 ${
                isSpinning ? 'animate-pulse border-red-400' : 'border-red-500'
              }`}
              style={{
                top: '50%',
                height: '80px',
                transform: 'translateY(-50%)',
                boxShadow: isSpinning 
                  ? '0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(239, 68, 68, 0.1)' 
                  : '0 0 20px rgba(239, 68, 68, 0.4)'
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
                        transition: isSpinning ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isSpinning ? 'blur(0.5px)' : 'none'
                      }}
                    >
                      {slotNames.map((name, index) => (
                        <div
                          key={`${name}-${index}`}
                          className={`flex items-center justify-center font-bold text-gray-800 transition-all duration-200 ${
                            isSpinning ? 'opacity-90' : 'opacity-100'
                          }`}
                          style={{
                            height: '80px',
                            fontSize: slotNames.length <= 5 ? '24px' : '20px',
                            textShadow: isSpinning ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
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
        <WinnerOverlay showWinner={showWinner} winner={winner} />
      </div>
    </div>
  );
}
