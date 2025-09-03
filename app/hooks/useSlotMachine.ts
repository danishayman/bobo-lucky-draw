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
    const minRotations = 8; // More rotations for more dramatic effect
    const fullRotationDistance = names.length * itemHeight;
    const totalDistance = (minRotations * fullRotationDistance) + finalTargetOffset;
    
    const spinDuration = 19000; // 19 seconds
    const startTime = Date.now();
    let currentDistance = 0;
    
    // Physics-based parameters for more natural motion
    const maxSpeed = 25; // Higher initial speed for more dramatic effect
    const accelerationPhase = 0.15; // 15% of time accelerating
    const constantPhase = 0.35; // 35% of time at constant speed  
    const decelerationPhase = 0.5; // 50% of time decelerating
    
    let animationId: number;
    
    // Natural easing function that mimics real physics
    const easeOutExponential = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };
    
    // Cubic bezier easing for smooth acceleration
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Add subtle randomness to prevent mechanical feeling
    const getSpeedVariation = (baseSpeed: number): number => {
      const variation = 0.05; // 5% variation
      const randomFactor = 1 + (Math.random() - 0.5) * variation;
      return baseSpeed * randomFactor;
    };
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      
      let speed: number;
      
      if (progress <= accelerationPhase) {
        // Acceleration phase - smooth start
        const accelerationProgress = progress / accelerationPhase;
        const easedProgress = easeInOutCubic(accelerationProgress);
        speed = getSpeedVariation(maxSpeed * easedProgress);
      } else if (progress <= accelerationPhase + constantPhase) {
        // Constant speed phase with slight variations
        speed = getSpeedVariation(maxSpeed);
      } else {
        // Deceleration phase - natural slowdown
        const decelerationStart = accelerationPhase + constantPhase;
        const decelerationProgress = (progress - decelerationStart) / decelerationPhase;
        
        // Use exponential decay for more natural deceleration
        const decelerationFactor = 1 - easeOutExponential(decelerationProgress);
        
        // Ensure minimum speed to prevent stopping too early
        const minSpeed = 0.5;
        speed = Math.max(minSpeed, maxSpeed * decelerationFactor);
        
        // Add micro-stutters near the end for realism (like real slot machines)
        if (decelerationProgress > 0.8) {
          const stutterIntensity = (decelerationProgress - 0.8) / 0.2;
          const stutterFrequency = 0.3;
          const stutter = Math.sin(elapsedTime * stutterFrequency) * stutterIntensity * 0.3;
          speed *= (1 + stutter);
        }
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
      
      // Calculate the exact position to center this name with NO offset
      const targetFinalOffset = (Math.round(centerPosition / itemHeight) * itemHeight) - centerOffset;
      
      // Immediately snap to perfect alignment - no gradual movement
      setSlotOffset(targetFinalOffset);
      
      // Set winner based on final position
      const actualWinner = slotNames[currentIndex];
      setWinner(actualWinner);
      
      setTimeout(() => {
        setShowWinner(true);
        audioManager?.playWinnerSound();
        triggerConfetti();
      }, 300);
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
