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
    const centerOffset = 120; // Offset to center the selection in the red box (240px window / 2 = 120px)
    
    // Pre-determine the winner and calculate target position
    const finalWinner = names[Math.floor(Math.random() * names.length)];
    
    // Find a good position for the winner in our slot array (avoid edges for smooth animation)
    const middleSection = slotNames.slice(names.length, slotNames.length - names.length);
    const winnerIndexInMiddle = middleSection.findIndex(name => name === finalWinner);
    const targetIndex = names.length + winnerIndexInMiddle;
    const finalTargetOffset = (targetIndex * itemHeight) - centerOffset;
    
    // Calculate total distance to travel (fewer rotations for slower overall speed)
    const minRotations = 5; // Reduced from 8 to 5 for slower spinning
    const fullRotationDistance = names.length * itemHeight;
    const totalDistance = (minRotations * fullRotationDistance) + finalTargetOffset;
    
    const spinDuration = 19000; // 19 seconds
    const startTime = Date.now();
    let currentDistance = 0;
    
    // Adjusted physics parameters for slower, more realistic motion
    const maxSpeed = 12; // Reduced from 25 to 12 for much slower spinning
    const accelerationPhase = 0.1; // 10% of time accelerating (shorter)
    const constantPhase = 0.3; // 30% of time at constant speed
    const decelerationPhase = 0.6; // 60% of time decelerating (much longer for realistic slowdown)
    
    let animationId: number;
    
    // More realistic easing functions
    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };
    
    // Smoother acceleration with less aggressive curve
    const easeInQuad = (t: number): number => {
      return t * t;
    };
    
    // More realistic deceleration curve (like a real spinning wheel with friction)
    const realWorldDeceleration = (t: number): number => {
      // Combination of exponential and quadratic for more realistic physics
      const exponential = 1 - Math.pow(2, -8 * t);
      const quadratic = 1 - Math.pow(1 - t, 2);
      return (exponential * 0.7) + (quadratic * 0.3);
    };
    
    // Reduced speed variation for smoother motion
    const getSpeedVariation = (baseSpeed: number): number => {
      const variation = 0.02; // Reduced from 0.05 to 0.02 for smoother motion
      const randomFactor = 1 + (Math.random() - 0.5) * variation;
      return baseSpeed * randomFactor;
    };
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      
      let speed: number;
      
      if (progress <= accelerationPhase) {
        // Smoother acceleration phase
        const accelerationProgress = progress / accelerationPhase;
        const easedProgress = easeInQuad(accelerationProgress);
        speed = getSpeedVariation(maxSpeed * easedProgress);
      } else if (progress <= accelerationPhase + constantPhase) {
        // Constant speed phase with minimal variations
        speed = getSpeedVariation(maxSpeed);
      } else {
        // Extended, more realistic deceleration phase
        const decelerationStart = accelerationPhase + constantPhase;
        const decelerationProgress = (progress - decelerationStart) / decelerationPhase;
        
        // Use realistic deceleration curve
        const decelerationFactor = 1 - realWorldDeceleration(decelerationProgress);
        
        // More gradual minimum speed reduction
        const minSpeed = 0.2; // Lower minimum speed for more gradual stop
        speed = Math.max(minSpeed, maxSpeed * decelerationFactor);
        
        // More realistic micro-stutters that start earlier and are more subtle
        if (decelerationProgress > 0.5) {
          const stutterIntensity = (decelerationProgress - 0.5) / 0.5;
          const stutterFrequency = 0.15; // Slower, more realistic stutter frequency
          const stutter = Math.sin(elapsedTime * stutterFrequency) * stutterIntensity * 0.15; // More subtle
          speed *= (1 + stutter);
        }
        
        // Add final "tick-tick-tick" effect in last 15% of deceleration
        if (decelerationProgress > 0.85) {
          const tickProgress = (decelerationProgress - 0.85) / 0.15;
          const tickFrequency = 0.8 + (tickProgress * 1.2); // Increasing frequency as it slows
          const tickEffect = Math.abs(Math.sin(elapsedTime * tickFrequency)) * tickProgress * 0.3;
          speed *= (1 - tickEffect);
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
        // Time's up - finish animation with final positioning
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
      
      // Calculate the exact position to center this name with precise alignment
      const targetFinalOffset = (Math.round(centerPosition / itemHeight) * itemHeight) - centerOffset;
      
      // Smooth final positioning instead of immediate snap
      const finalPositioningDuration = 200; // 200ms for final positioning
      const startOffset = slotOffset;
      const endOffset = targetFinalOffset;
      const positioningStartTime = Date.now();
      
      const finalPositioning = () => {
        const positioningElapsed = Date.now() - positioningStartTime;
        const positioningProgress = Math.min(positioningElapsed / finalPositioningDuration, 1);
        
        // Smooth final positioning with ease-out
        const easedProgress = easeOutQuart(positioningProgress);
        const currentFinalOffset = startOffset + (endOffset - startOffset) * easedProgress;
        
        setSlotOffset(currentFinalOffset);
        
        if (positioningProgress < 1) {
          requestAnimationFrame(finalPositioning);
        } else {
          // Set winner based on final position
          const actualWinner = slotNames[currentIndex];
          setWinner(actualWinner);
          
          setTimeout(() => {
            setShowWinner(true);
            audioManager?.playWinnerSound();
            triggerConfetti();
          }, 100); // Slightly shorter delay for better UX
        }
      };
      
      requestAnimationFrame(finalPositioning);
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