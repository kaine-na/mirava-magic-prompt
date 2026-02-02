/**
 * Secure Stats API Client
 * 
 * This module provides a secure interface to the global stats functionality
 * by routing all requests through Cloudflare Pages Functions. No Supabase
 * credentials are exposed to the client.
 * 
 * Architecture:
 * - Client → Edge Function → Supabase
 * - Credentials stored in Cloudflare environment variables
 * - Real-time updates via SSE (Server-Sent Events)
 */

// ============================================================================
// Types
// ============================================================================

export interface GlobalStats {
  totalPrompts: number;
  onlineUsers: number;
  generatingUsers: number;
}

export interface StatsApiResponse {
  success: boolean;
  data?: {
    totalPrompts: number;
    timestamp: string;
  };
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

// API endpoints (relative to origin - works in both dev and prod)
const STATS_API = '/api/stats';
const STATS_STREAM_API = '/api/stats/stream';

// Check if we're in development mode (Vite dev server)
const isDevelopment = import.meta.env.DEV;

// In development, the edge functions aren't available, so we use demo mode
// In production on Cloudflare Pages, the functions are automatically available
export const isSecureStatsEnabled = (): boolean => {
  // In dev mode, always use demo mode (edge functions not available)
  if (isDevelopment) {
    return false;
  }
  // In production, stats API is available via edge functions
  return true;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Increment the global prompt count via secure API
 * @returns The new total count, or null if failed
 */
export async function incrementPromptCount(): Promise<number | null> {
  if (!isSecureStatsEnabled()) return null;
  
  try {
    const response = await fetch(STATS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Stats API error:', response.status);
      return null;
    }
    
    const result: StatsApiResponse = await response.json();
    
    if (!result.success || !result.data) {
      console.error('Stats API failed:', result.error);
      return null;
    }
    
    return result.data.totalPrompts;
  } catch (error) {
    console.error('Failed to increment prompt count:', error);
    return null;
  }
}

/**
 * Get current stats from the secure API
 * @returns Current stats, or null if failed
 */
export async function getStats(): Promise<{ totalPrompts: number } | null> {
  if (!isSecureStatsEnabled()) return null;
  
  try {
    const response = await fetch(STATS_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Stats API error:', response.status);
      return null;
    }
    
    const result: StatsApiResponse = await response.json();
    
    if (!result.success || !result.data) {
      console.error('Stats API failed:', result.error);
      return null;
    }
    
    return {
      totalPrompts: result.data.totalPrompts,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

/**
 * Subscribe to real-time stats updates via Server-Sent Events
 * 
 * Note: SSE connections are automatically reconnected every 25 seconds
 * to comply with Cloudflare Workers limits.
 * 
 * @param callback Function called when stats change
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToStats(
  callback: (stats: Partial<GlobalStats>) => void
): () => void {
  if (!isSecureStatsEnabled()) return () => {};
  
  let eventSource: EventSource | null = null;
  let isActive = true;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const connect = () => {
    if (!isActive) return;
    
    try {
      eventSource = new EventSource(STATS_STREAM_API);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.totalPrompts !== undefined) {
            callback({ totalPrompts: data.totalPrompts });
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };
      
      eventSource.addEventListener('close', () => {
        // Server requested reconnect (after 25s limit)
        if (isActive && eventSource) {
          eventSource.close();
          eventSource = null;
          // Reconnect after a short delay
          reconnectTimeout = setTimeout(connect, 1000);
        }
      });
      
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Reconnect after error with backoff
        if (isActive) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
    } catch (error) {
      console.error('SSE connection error:', error);
      // Retry after delay
      if (isActive) {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }
  };
  
  // Start connection
  connect();
  
  // Return cleanup function
  return () => {
    isActive = false;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

// ============================================================================
// Presence Tracking (Demo Mode Only)
// ============================================================================

// Presence tracking requires WebSocket which can't be proxied through edge functions.
// We use local demo mode for online/generating counts - this is acceptable as:
// 1. It's anonymous data (no PII)
// 2. Counts are approximate anyway
// 3. Real-time presence is a "nice to have" feature

export interface PresenceManager {
  setGenerating: (generating: boolean) => Promise<void>;
  cleanup: () => void;
}

/**
 * Track user presence (uses demo mode - local storage + BroadcastChannel)
 * @param onPresenceChange Callback when presence changes
 */
export function trackPresence(
  onPresenceChange: (online: number, generating: number) => void
): PresenceManager {
  // Presence always uses demo mode since WebSocket can't be proxied
  return createDemoPresence(onPresenceChange);
}

// ============================================================================
// Demo Mode Implementation (for development and presence)
// ============================================================================

const STORAGE_KEYS = {
  TOTAL_PROMPTS: 'mirava_global_total_prompts',
  ONLINE_USERS: 'mirava_online_users',
  GENERATING_USERS: 'mirava_generating_users',
  USER_ID: 'mirava_user_id',
} as const;

// BroadcastChannel for cross-tab communication
const broadcastChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('mirava_stats_channel')
  : null;

// Subscribers for demo mode
type DemoStatsCallback = (stats: GlobalStats) => void;
const demoSubscribers: Set<DemoStatsCallback> = new Set();

// Demo mode state
let demoIsOnline = false;
let demoIsGenerating = false;

// Debug: Track subscriber IDs
let subscriberIdCounter = 0;
const subscriberIds = new WeakMap<DemoStatsCallback, number>();

/**
 * Get demo stats from localStorage
 */
const getDemoStats = (): GlobalStats => {
  if (typeof localStorage === 'undefined') {
    return { totalPrompts: 0, onlineUsers: 1, generatingUsers: 0 };
  }
  
  const totalPrompts = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PROMPTS) || '0', 10);
  const onlineUsers = parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '1', 10);
  const generatingUsers = parseInt(localStorage.getItem(STORAGE_KEYS.GENERATING_USERS) || '0', 10);
  
  return {
    totalPrompts: isNaN(totalPrompts) ? 0 : totalPrompts,
    onlineUsers: Math.max(1, isNaN(onlineUsers) ? 1 : onlineUsers),
    generatingUsers: isNaN(generatingUsers) ? 0 : generatingUsers,
  };
};

/**
 * Notify all demo subscribers
 */
const notifyDemoSubscribers = (): void => {
  const stats = getDemoStats();
  console.log('[Stats Demo] Notifying', demoSubscribers.size, 'subscribers with stats:', stats);
  
  // Use setTimeout to ensure React state updates are processed properly
  // This breaks out of the current execution context
  setTimeout(() => {
    let count = 0;
    demoSubscribers.forEach((callback) => {
      const id = subscriberIds.get(callback) ?? -1;
      console.log('[Stats Demo] Calling subscriber #' + id);
      try {
        callback(stats);
        count++;
      } catch (e) {
        console.error('[Stats] Error in demo stats callback:', e);
      }
    });
    console.log('[Stats Demo] Called', count, 'subscribers successfully');
  }, 0);
};

/**
 * Broadcast demo changes to other tabs
 */
const broadcastDemoChange = (): void => {
  broadcastChannel?.postMessage({ type: 'stats_update', timestamp: Date.now() });
  notifyDemoSubscribers();
};

// Listen for cross-tab updates
if (broadcastChannel) {
  broadcastChannel.onmessage = () => {
    notifyDemoSubscribers();
  };
}

// Listen for storage events
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key?.startsWith('mirava_')) {
      notifyDemoSubscribers();
    }
  });
}

/**
 * Demo mode: Increment prompt count
 */
export const incrementPromptCountDemo = async (): Promise<void> => {
  if (typeof localStorage === 'undefined') return;
  
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PROMPTS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, String(current + 1));
  broadcastDemoChange();
};

/**
 * Demo mode: Subscribe to stats updates
 */
export const subscribeToDemoStats = (callback: DemoStatsCallback): (() => void) => {
  const id = ++subscriberIdCounter;
  subscriberIds.set(callback, id);
  console.log('[Stats Demo] Adding subscriber #' + id + ', total:', demoSubscribers.size + 1);
  demoSubscribers.add(callback);
  
  // Immediately call with current stats
  const currentStats = getDemoStats();
  console.log('[Stats Demo] Initial callback for subscriber #' + id + ' with:', currentStats);
  callback(currentStats);
  
  return () => {
    console.log('[Stats Demo] Removing subscriber #' + id + ', remaining:', demoSubscribers.size - 1);
    demoSubscribers.delete(callback);
    subscriberIds.delete(callback);
  };
};

/**
 * Demo mode: Set user online status
 */
export const setUserOnlineDemo = (): (() => void) => {
  if (typeof localStorage === 'undefined' || demoIsOnline) {
    console.log('[Stats Demo] Already online or localStorage unavailable');
    return () => {};
  }
  
  demoIsOnline = true;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '0', 10);
  const newCount = current + 1;
  console.log('[Stats Demo] Setting user online. Count:', current, '->', newCount);
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, String(newCount));
  broadcastDemoChange();
  
  const cleanup = (): void => {
    if (!demoIsOnline) return;
    demoIsOnline = false;
    const updated = Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '1', 10) - 1);
    console.log('[Stats Demo] User going offline. Count ->', updated);
    localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, String(updated));
    broadcastDemoChange();
  };
  
  const handleUnload = (): void => cleanup();
  window.addEventListener('beforeunload', handleUnload);
  
  return () => {
    cleanup();
    window.removeEventListener('beforeunload', handleUnload);
  };
};

/**
 * Demo mode: Set user generating status
 */
export const setUserGeneratingDemo = (generating: boolean): void => {
  if (typeof localStorage === 'undefined') return;
  if (generating === demoIsGenerating) {
    console.log('[Stats Demo] Generating status unchanged:', generating);
    return;
  }
  
  console.log('[Stats Demo] Updating generating status to:', generating);
  demoIsGenerating = generating;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.GENERATING_USERS) || '0', 10);
  
  if (generating) {
    const newCount = current + 1;
    console.log('[Stats Demo] Incrementing generating count:', current, '->', newCount);
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(newCount));
  } else {
    const newCount = Math.max(0, current - 1);
    console.log('[Stats Demo] Decrementing generating count:', current, '->', newCount);
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(newCount));
  }
  
  broadcastDemoChange();
};

/**
 * Create demo presence manager
 */
function createDemoPresence(
  onPresenceChange: (online: number, generating: number) => void
): PresenceManager {
  console.log('[Stats Demo] Creating demo presence manager');
  
  // Set up listener
  const callback: DemoStatsCallback = (stats) => {
    console.log('[Stats Demo] Presence callback - online:', stats.onlineUsers, 'generating:', stats.generatingUsers);
    onPresenceChange(stats.onlineUsers, stats.generatingUsers);
  };
  
  demoSubscribers.add(callback);
  
  // Initial state - set user online first
  const cleanupOnline = setUserOnlineDemo();
  
  // Then notify with current stats
  const initialStats = getDemoStats();
  console.log('[Stats Demo] Initial stats:', initialStats);
  callback(initialStats);
  
  return {
    setGenerating: async (generating: boolean) => {
      console.log('[Stats Demo] setGenerating called:', generating);
      setUserGeneratingDemo(generating);
    },
    cleanup: () => {
      console.log('[Stats Demo] Cleaning up demo presence');
      demoSubscribers.delete(callback);
      cleanupOnline();
    },
  };
}

/**
 * Reset demo stats (for testing/development)
 */
export const resetDemoStats = (): void => {
  if (typeof localStorage === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, '0');
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, '1');
  localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, '0');
  broadcastDemoChange();
};
