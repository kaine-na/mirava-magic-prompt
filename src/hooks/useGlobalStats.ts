import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GlobalStats,
  isSupabaseConfigured,
  getStats,
  incrementPromptCount,
  subscribeToStats,
  trackPresence,
  PresenceManager,
  // Demo mode functions
  subscribeToDemoStats,
  incrementPromptCountDemo,
  setUserOnlineDemo,
  setUserGeneratingDemo,
} from '@/lib/supabase';

/**
 * Hook for managing global real-time statistics
 * 
 * Features:
 * - Real-time stats subscription (Supabase or demo mode)
 * - Increment prompt count
 * - Track online/generating status
 * - Auto-cleanup on unmount
 * - Fallback to demo mode when Supabase is not configured
 */
export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalPrompts: 0,
    onlineUsers: 1,
    generatingUsers: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());
  
  const presenceRef = useRef<PresenceManager | null>(null);
  const cleanupDemoOnlineRef = useRef<(() => void) | null>(null);
  const isGeneratingRef = useRef(false);

  // Initialize based on whether Supabase is configured
  useEffect(() => {
    const supabaseEnabled = isSupabaseConfigured();
    setIsDemoMode(!supabaseEnabled);
    
    if (supabaseEnabled) {
      // ============================================
      // SUPABASE MODE
      // ============================================
      
      // 1. Fetch initial stats
      getStats().then((initialStats) => {
        if (initialStats) {
          setStats((prev) => ({
            ...prev,
            totalPrompts: initialStats.totalPrompts,
          }));
          setIsConnected(true);
        }
      });
      
      // 2. Subscribe to real-time stats updates
      const unsubscribeStats = subscribeToStats((newStats) => {
        setStats((prev) => ({
          ...prev,
          ...newStats,
        }));
        setIsConnected(true);
      });
      
      // 3. Track presence (online/generating users)
      presenceRef.current = trackPresence((onlineCount, generatingCount) => {
        setStats((prev) => ({
          ...prev,
          onlineUsers: Math.max(1, onlineCount),
          generatingUsers: generatingCount,
        }));
      });
      
      return () => {
        unsubscribeStats();
        presenceRef.current?.cleanup();
        presenceRef.current = null;
      };
    } else {
      // ============================================
      // DEMO MODE (localStorage)
      // ============================================
      
      // Subscribe to demo stats changes
      const unsubscribe = subscribeToDemoStats((newStats) => {
        setStats(newStats);
        setIsConnected(true);
      });
      
      // Set user as online in demo mode
      cleanupDemoOnlineRef.current = setUserOnlineDemo();
      
      return () => {
        unsubscribe();
        cleanupDemoOnlineRef.current?.();
        cleanupDemoOnlineRef.current = null;
      };
    }
  }, []);

  /**
   * Increment the global prompt count
   * Call this for EACH individual prompt generated
   */
  const incrementPrompt = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        // Supabase: atomic increment via RPC
        await incrementPromptCount();
      } else {
        // Demo mode: localStorage increment
        await incrementPromptCountDemo();
      }
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
    
    if (isSupabaseConfigured()) {
      // Supabase: update presence
      presenceRef.current?.setGenerating(generating);
    } else {
      // Demo mode: localStorage
      setUserGeneratingDemo(generating);
    }
  }, []);

  return {
    stats,
    isConnected,
    isDemoMode,
    incrementPrompt,
    setGenerating,
  };
}

export type { GlobalStats };
