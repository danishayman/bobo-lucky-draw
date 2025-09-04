'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ParticipantsPanel from './ParticipantsPanel';
import SlotMachine from './SlotMachine';
import DrawButton from './DrawButton';
import { useAudioManager } from '../hooks/useAudioManager';
import { useSlotMachine } from '../hooks/useSlotMachine';

export default function LuckyDraw() {
  const [names, setNames] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioManager = useAudioManager(isMuted);
  const {
    isSpinning,
    winner,
    showWinner,
    slotNames,
    slotOffset,
    startDraw,
    clearWinnerState
  } = useSlotMachine({ names, audioManager });


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
            <SlotMachine
              slotNames={slotNames}
              slotOffset={slotOffset}
              isSpinning={isSpinning}
              showWinner={showWinner}
              winner={winner}
            />

            {/* Draw Button */}
            <DrawButton
              onClick={startDraw}
              disabled={names.length === 0 || isSpinning || (audioManager?.isWinnerSoundPlaying?.() ?? false)}
              isSpinning={isSpinning}
              isWinnerSoundPlaying={audioManager?.isWinnerSoundPlaying?.() ?? false}
              namesCount={names.length}
            />
          </motion.div>
        </div>

        {/* Participants Panel */}
        <ParticipantsPanel
          names={names}
          setNames={setNames}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          audioRef={{ current: audioManager }}
          onClearAll={clearWinnerState}
        />
      </div>
    </div>
  );
}
