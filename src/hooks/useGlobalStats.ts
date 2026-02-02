import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GlobalStats, 
  subscribeToStats, 
  incrementPromptCount, 
  setUserOnline, 
  setUserGenerating 
} from '@/lib/firebase';

/**
 * Hook for managing global real-time statistics
 * 
 * Features:
 * - Real-time stats subscription
 * - Increment prompt count
 * - Track online/generating status
 * - Auto-cleanup on unmount
 */
export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalPrompts: 0,
    onlineUsers: 1,
    generatingUsers: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const cleanupOnlineRef = useRef<(() => void) | null>(null);
  const isGeneratingRef = useRef(false);

  // Subscribe to real-time stats updates and set user online
  useEffect(() => {
    // Subscribe to stats changes
    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats);
      setIsConnected(true);
    });

    // Set user as online
    cleanupOnlineRef.current = setUserOnline();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanupOnlineRef.current?.();
    };
  }, []);

  /**
   * Increment the global prompt count
   * Call this for EACH individual prompt generated
   */
  const incrementPrompt = useCallback(async () => {
    try {
      await incrementPromptCount();
    } catch (error) {
      console.error('Failed to increment prompt count:', error);
    }
  }, []);

  /**
   * Set the generating status for this user
   * @param generating - true when starting, false when done
   */
  const setGenerating = useCallback((generating: boolean) => {
    // Avoid duplicate calls
    if (isGeneratingRef.current === generating) return;
    
    isGeneratingRef.current = generating;
    setUserGenerating(generating);
  }, []);

  return {
    stats,
    isConnected,
    incrementPrompt,
    setGenerating,
  };
}

export type { GlobalStats };
