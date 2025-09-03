'use client';

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface SlotMachineHookProps {
  names: string[];
  audioManager: any;
}

export function useSlotMachine({ names, audioManager }: SlotMachineHookProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [slotNames, setSlotNames] = useState<string[]>([]);
  const [slotOffset, setSlotOffset] = useState(0);
  
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    
    audioManager?.playClickSound();
    setIsSpinning(true);
    setWinner(null);
    setShowWinner(false);
    
    const itemHeight = 80; // Height of each slot item
    const centerOffset = 80; // Offset to center the selection (half of window height - half of item height)
    
    // Pre-determine the winner and calculate target position
    const finalWinner = names[Math.floor(Math.random() * names.length)];
    
    // Find a good position for the winner in our slot array (avoid edges for smooth animation)
    const middleSection = slotNames.slice(names.length, slotNames.length - names.length);
    const winnerIndexInMiddle = middleSection.findIndex(name => name === finalWinner);
    const targetIndex = names.length + winnerIndexInMiddle;
    const finalTargetOffset = (targetIndex * itemHeight) - centerOffset;
    
    // Calculate total distance to travel (multiple full rotations + final position)
    const minRotations = 5; // Minimum number of full rotations
    const fullRotationDistance = names.length * itemHeight;
    const totalDistance = (minRotations * fullRotationDistance) + finalTargetOffset;
    
    const spinDuration = 19000; // 19 seconds
    const startTime = Date.now();
    let currentDistance = 0;
    let speed = 15; // Initial speed
    const minSpeed = 0.8;
    
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      
      // Smooth deceleration curve based on time, not distance
      if (progress > 0.75) {
        // Start slowing down in the last 25% of the time
        const decelerationProgress = (progress - 0.75) / 0.25;
        const decelerationFactor = 1 - (decelerationProgress * 0.9); // Slow down to 10% of original speed
        speed = Math.max(minSpeed, 15 * decelerationFactor);
      }
      
      currentDistance += speed;
      
      // Calculate current offset with seamless wrapping
      let currentOffset = currentDistance % fullRotationDistance;
      
      setSlotOffset(currentOffset);
      
      // Continue animation if time hasn't elapsed
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Time's up - finish animation
        finishAnimation();
      }
    };
    
    const finishAnimation = () => {
      setIsSpinning(false);
      audioManager?.stopSpinSound();
      
      // Calculate which name is currently in the center
      const currentOffset = currentDistance % fullRotationDistance;
      const centerPosition = currentOffset + centerOffset;
      const currentIndex = Math.round(centerPosition / itemHeight) % slotNames.length;
      
      // Calculate the exact position to center this name
      const targetFinalOffset = (Math.round(centerPosition / itemHeight) * itemHeight) - centerOffset;
      
      // Smooth final positioning to exact center
      let currentFinalOffset = currentOffset;
      
      const smoothFinish = () => {
        const diff = targetFinalOffset - currentFinalOffset;
        if (Math.abs(diff) > 0.5) {
          currentFinalOffset += diff * 0.2;
          setSlotOffset(currentFinalOffset);
          requestAnimationFrame(smoothFinish);
        } else {
          // Ensure perfect alignment
          setSlotOffset(targetFinalOffset);
          
          // Set winner based on final position
          const actualWinner = slotNames[currentIndex];
          
          setWinner(actualWinner);
          
          setTimeout(() => {
            setShowWinner(true);
            audioManager?.playWinnerSound();
            triggerConfetti();
          }, 300);
        }
      };
      
      smoothFinish();
    };
    
    // Start spinning sound
    audioManager?.playSpinSound();
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Cleanup function in case component unmounts
    spinIntervalRef.current = {
      clearInterval: () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        audioManager?.stopSpinSound();
      }
    } as any;
  };

  return {
    isSpinning,
    winner,
    showWinner,
    slotNames,
    slotOffset,
    startDraw,
    clearWinnerState
  };
}
