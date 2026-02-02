import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GlobalStats,
  isSecureStatsEnabled,
  isSecureStatsEnabledAsync,
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
} from '@/lib/stats-api';

// ============================================================================
// Singleton Presence Manager
// ============================================================================

// Module-level singleton to ensure presence is only tracked once
let singletonPresenceManager: PresenceManager | null = null;
let singletonCleanupDemoOnline: (() => void) | null = null;
let presenceInitialized = false;
let presenceSubscriberCount = 0;

// Shared callbacks for presence updates
type PresenceCallback = (online: number, generating: number) => void;
const presenceCallbacks: Set<PresenceCallback> = new Set();

// Module-level generating state to share across hook instances
let sharedGeneratingState = false;

/**
 * Initialize presence tracking (called once globally)
 */
function initializePresence(): void {
  if (presenceInitialized) return;
  presenceInitialized = true;
  
  if (import.meta.env.DEV) {
    console.log('[useGlobalStats] Initializing global presence tracking');
  }
  
  const handlePresenceChange = (online: number, generating: number) => {
    if (import.meta.env.DEV) {
      console.log('[useGlobalStats] Presence changed - online:', online, 'generating:', generating);
    }
    presenceCallbacks.forEach(callback => {
      try {
        callback(online, generating);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[useGlobalStats] Error in presence callback:', e);
        }
      }
    });
  };
  
  // Presence always uses demo mode (WebSocket can't be proxied through edge functions)
  singletonPresenceManager = trackPresence(handlePresenceChange);
}

/**
 * Clean up presence tracking (called when all subscribers leave)
 */
function cleanupPresence(): void {
  if (!presenceInitialized) return;
  
  if (import.meta.env.DEV) {
    console.log('[useGlobalStats] Cleaning up global presence tracking');
  }
  presenceInitialized = false;
  
  singletonPresenceManager?.cleanup();
  singletonPresenceManager = null;
  
  singletonCleanupDemoOnline?.();
  singletonCleanupDemoOnline = null;
}

/**
 * Hook for managing global real-time statistics
 * 
 * Features:
 * - Secure stats via Cloudflare Pages Functions (production)
 * - Real-time updates via SSE (production) or BroadcastChannel (demo)
 * - Increment prompt count
 * - Track online/generating status (demo mode - presence can't be proxied)
 * - Auto-cleanup on unmount
 * - Fallback to demo mode in development
 * 
 * Security:
 * - No Supabase credentials exposed to client
 * - All API calls go through edge functions
 * - Credentials stored in Cloudflare environment variables
 */
export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalPrompts: 0,
    onlineUsers: 1,
    generatingUsers: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!isSecureStatsEnabled());
  
  // Track if this hook instance has set up presence
  const presenceSetupRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize based on whether secure stats is enabled
  useEffect(() => {
    let isMounted = true;
    
    // Async initialization to check if edge functions are available
    const initialize = async () => {
      const secureEnabled = await isSecureStatsEnabledAsync();
      
      if (!isMounted) return;
      
      setIsDemoMode(!secureEnabled);
      
      if (import.meta.env.DEV) {
        console.log('[useGlobalStats] Mode:', secureEnabled ? 'SECURE' : 'DEMO');
      }
      
      // Set up presence callback for this component
      const presenceCallback: PresenceCallback = (onlineCount, generatingCount) => {
        setStats((prev) => ({
          ...prev,
          onlineUsers: Math.max(1, onlineCount),
          generatingUsers: generatingCount,
        }));
      };
      
      // Register presence callback
      presenceCallbacks.add(presenceCallback);
      presenceSubscriberCount++;
      
      if (import.meta.env.DEV) {
        console.log('[useGlobalStats] Subscriber count:', presenceSubscriberCount);
      }
      
      // Initialize presence if this is the first subscriber
      if (!presenceSetupRef.current) {
        presenceSetupRef.current = true;
        initializePresence();
      }
      
      if (secureEnabled) {
        // ============================================
        // SECURE MODE (Cloudflare Pages Functions)
        // ============================================
        
        // 1. Fetch initial stats
        getStats().then((initialStats) => {
          if (initialStats && isMounted) {
            setStats((prev) => ({
              ...prev,
              totalPrompts: initialStats.totalPrompts,
            }));
            setIsConnected(true);
          }
        });
        
        // 2. Subscribe to real-time stats updates via SSE
        const unsubscribeStats = subscribeToStats((newStats) => {
          if (isMounted) {
            setStats((prev) => ({
              ...prev,
              ...newStats,
            }));
            setIsConnected(true);
          }
        });
        
        // Store cleanup for later
        cleanupRef.current = () => {
          unsubscribeStats();
          presenceCallbacks.delete(presenceCallback);
          presenceSubscriberCount--;
          
          if (import.meta.env.DEV) {
            console.log('[useGlobalStats] Subscriber count after cleanup:', presenceSubscriberCount);
          }
          
          if (presenceSubscriberCount === 0) {
            cleanupPresence();
          }
        };
      } else {
        // ============================================
        // DEMO MODE (localStorage + BroadcastChannel)
        // ============================================
        
        // Subscribe to demo stats changes
        const unsubscribe = subscribeToDemoStats((newStats) => {
          if (isMounted) {
            setStats(newStats);
            setIsConnected(true);
          }
        });
        
        // Store cleanup for later
        cleanupRef.current = () => {
          unsubscribe();
          presenceCallbacks.delete(presenceCallback);
          presenceSubscriberCount--;
          
          if (import.meta.env.DEV) {
            console.log('[useGlobalStats] Subscriber count after cleanup:', presenceSubscriberCount);
          }
          
          if (presenceSubscriberCount === 0) {
            cleanupPresence();
          }
        };
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
      cleanupRef.current?.();
    };
  }, []);

  /**
   * Increment the global prompt count
   * Call this for EACH individual prompt generated
   */
  const incrementPrompt = useCallback(async () => {
    try {
      if (isSecureStatsEnabled()) {
        // Secure mode: API call to edge function
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
    // Use module-level state to avoid duplicate calls across hook instances
    if (sharedGeneratingState === generating) {
      if (import.meta.env.DEV) {
        console.log('[useGlobalStats] Generating status unchanged:', generating);
      }
      return;
    }
    sharedGeneratingState = generating;
    
    if (import.meta.env.DEV) {
      console.log('[useGlobalStats] Setting generating status to:', generating);
    }
    
    // Update via the singleton presence manager
    if (singletonPresenceManager) {
      singletonPresenceManager.setGenerating(generating);
    } else {
      // Fallback to direct demo mode update
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
