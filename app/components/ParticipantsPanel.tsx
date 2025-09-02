'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Volume2, VolumeX, Trash2, Users, ChevronRight, ChevronLeft } from 'lucide-react';

interface AudioManager {
  playClickSound: () => void;
  isMuted: boolean;
}

interface ParticipantsPanelProps {
  names: string[];
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  audioRef: React.MutableRefObject<AudioManager | null>;
  onClearAll?: () => void;
}

export default function ParticipantsPanel({ 
  names, 
  setNames, 
  isMuted, 
  setIsMuted, 
  audioRef,
  onClearAll 
}: ParticipantsPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(true);

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
    onClearAll?.();
  };

  const togglePanel = () => {
    audioRef.current?.playClickSound();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePanel}
        className="fixed top-4 right-4 z-50 btn-primary p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
      >
        <Users size={20} />
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        <span className="hidden sm:inline text-sm font-medium">
          {names.length} participant{names.length !== 1 ? 's' : ''}
        </span>
      </motion.button>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 z-40 overflow-hidden shadow-xl"
            style={{background: 'var(--card)', borderLeft: '1px solid var(--border)'}}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 sm:p-6" style={{borderBottom: '1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2" style={{color: 'var(--foreground)'}}>
                    <Users size={24} />
                    Participants
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        audioRef.current?.playClickSound();
                      }}
                      className="p-2 rounded-full transition-all duration-300 hover:opacity-80"
                      style={{background: 'var(--card-elevated)', color: 'var(--foreground)'}}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                      onClick={clearAllNames}
                      className="p-2 rounded-full transition-all duration-300 hover:opacity-80"
                      style={{background: 'var(--card-elevated)', color: 'var(--foreground)'}}
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
                    className="w-full h-24 sm:h-32 p-3 sm:p-4 rounded-xl sm:rounded-2xl resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    style={{background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)'}} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} 
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
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
                    className="w-full btn-primary font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    disabled={!inputValue.trim()}
                  >
                    <Plus size={20} />
                    Add Names
                  </motion.button>
                </div>
              </div>

              {/* Names List */}
              <div className="flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 h-full">
                  <div className="space-y-2 h-full overflow-y-auto">
                    <AnimatePresence>
                      {names.map((name, index) => (
                        <motion.div
                          key={`${name}-${index}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between rounded-lg sm:rounded-xl p-2.5 sm:p-3 transition-all duration-200 hover:opacity-80"
                          style={{background: 'var(--card-elevated)', border: '1px solid var(--border)'}}
                        >
                          <span className="font-medium text-sm sm:text-base truncate pr-2" style={{color: 'var(--foreground)'}}>{name}</span>
                          <button
                            onClick={() => removeName(index)}
                            className="p-1 rounded-full transition-all duration-200 flex-shrink-0 hover:opacity-80"
                            style={{color: 'var(--primary)'}}
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {names.length === 0 && (
                      <div className="text-center py-8" style={{color: 'var(--secondary)'}}>
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No participants added yet</p>
                        <p className="text-sm mt-2">Add some names to get started!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6" style={{borderTop: '1px solid var(--border)'}}>
                <div className="text-sm text-center" style={{color: 'var(--secondary)'}}>
                  {names.length} participant{names.length !== 1 ? 's' : ''} added
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={togglePanel}
            className="fixed inset-0 bg-black/60 z-30 sm:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
