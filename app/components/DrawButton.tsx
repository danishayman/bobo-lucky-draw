'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface DrawButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
  isWinnerSoundPlaying: boolean;
  namesCount: number;
}

export default function DrawButton({ onClick, disabled, isSpinning, isWinnerSoundPlaying, namesCount }: DrawButtonProps) {
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full py-4 sm:py-6 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-2xl transition-all duration-300
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:from-yellow-500 hover:to-yellow-700'
          }
          flex items-center justify-center gap-2 sm:gap-3
        `}
        style={!disabled ? {
          boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4)'
        } : {}}
      >
        <Play size={20} className="sm:w-7 sm:h-7" />
        {isSpinning ? 'Spinning...' : isWinnerSoundPlaying ? '🎵 Playing Winner Sound...' : '🎰 Pull the Lever!'}
      </motion.button>

      {namesCount === 0 && (
        <p className="text-center text-xs sm:text-sm px-4" style={{color: 'var(--secondary)'}}>
          Add some participants to start the draw
        </p>
      )}
    </>
  );
}
