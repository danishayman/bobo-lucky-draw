'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface WinnerOverlayProps {
  showWinner: boolean;
  winner: string | null;
}

export default function WinnerOverlay({ showWinner, winner }: WinnerOverlayProps) {
  return (
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
  );
}
