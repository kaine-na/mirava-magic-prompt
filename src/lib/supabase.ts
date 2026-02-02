/**
 * Supabase Client for Global Stats
 * 
 * This module provides real-time global statistics using Supabase:
 * - Total prompts generated (atomic counter via RPC)
 * - Online users count (presence system)
 * - Currently generating count (active sessions)
 * 
 * Falls back to demo mode with localStorage when Supabase is not configured.
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// Configuration
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client (or null if not configured)
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

// ============================================================================
// Types
// ============================================================================

export interface GlobalStats {
  totalPrompts: number;
  onlineUsers: number;
  generatingUsers: number;
}

export interface PresenceState {
  id: string;
  generating: boolean;
}

// ============================================================================
// Stats Functions
// ============================================================================

/**
 * Increment the global prompt count atomically using RPC
 * @returns The new total count, or null if failed
 */
export async function incrementPromptCount(): Promise<number | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.rpc('increment_prompt_count');
    
    if (error) {
      console.error('Error incrementing prompt count:', error);
      return null;
    }
    
    return data as number;
  } catch (error) {
    console.error('Failed to increment prompt count:', error);
    return null;
  }
}

/**
 * Get current stats from the database
 * @returns Current global stats, or null if failed
 */
export async function getStats(): Promise<GlobalStats | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('total_prompts')
      .eq('id', 'global')
      .single();
    
    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
    
    return {
      totalPrompts: data.total_prompts ?? 0,
      onlineUsers: 0, // Will be updated by presence
      generatingUsers: 0, // Will be updated by presence
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

/**
 * Subscribe to real-time stats changes
 * @param callback Function called when stats change
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToStats(
  callback: (stats: Partial<GlobalStats>) => void
): () => void {
  if (!supabase) return () => {};
  
  const channel: RealtimeChannel = supabase
    .channel('stats-realtime')
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'stats', 
        filter: 'id=eq.global' 
      },
      (payload) => {
        callback({
          totalPrompts: payload.new.total_prompts ?? 0,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to stats realtime updates');
      }
    });
  
  return () => {
    console.log('🔌 Unsubscribing from stats realtime');
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// Presence Tracking
// ============================================================================

export interface PresenceManager {
  setGenerating: (generating: boolean) => Promise<void>;
  cleanup: () => void;
}

/**
 * Track user presence and generating status
 * @param onPresenceChange Callback when presence changes (online count, generating count)
 * @returns Object with setGenerating function and cleanup function
 */
export function trackPresence(
  onPresenceChange: (online: number, generating: number) => void
): PresenceManager {
  if (!supabase) {
    return {
      setGenerating: async () => {},
      cleanup: () => {},
    };
  }
  
  // Generate unique ID for this session
  const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let currentGenerating = false;
  
  const channel: RealtimeChannel = supabase.channel('online-users', {
    config: {
      presence: {
        key: uniqueId,
      },
    },
  });
  
  // Handle presence sync events
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      let onlineCount = 0;
      let generatingCount = 0;
      
      // Count all users and those who are generating
      Object.values(state).forEach((users) => {
        (users as PresenceState[]).forEach((user) => {
          onlineCount++;
          if (user.generating) {
            generatingCount++;
          }
        });
      });
      
      onPresenceChange(onlineCount, generatingCount);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track this user as online
        await channel.track({
          id: uniqueId,
          generating: false,
        });
        console.log('✅ User presence tracked');
      }
    });
  
  /**
   * Update generating status
   */
  const setGenerating = async (generating: boolean): Promise<void> => {
    if (currentGenerating === generating) return;
    
    currentGenerating = generating;
    
    try {
      await channel.track({
        id: uniqueId,
        generating,
      });
    } catch (error) {
      console.error('Failed to update generating status:', error);
    }
  };
  
  /**
   * Cleanup: untrack and remove channel
   */
  const cleanup = (): void => {
    console.log('🔌 Cleaning up presence');
    channel.untrack();
    supabase.removeChannel(channel);
  };
  
  // Auto-cleanup on page unload
  const handleBeforeUnload = (): void => {
    cleanup();
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
  
  return {
    setGenerating,
    cleanup: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      cleanup();
    },
  };
}

// ============================================================================
// Demo Mode Fallback (localStorage-based for when Supabase is not configured)
// ============================================================================

const STORAGE_KEYS = {
  TOTAL_PROMPTS: 'mirava_global_total_prompts',
  ONLINE_USERS: 'mirava_online_users',
  GENERATING_USERS: 'mirava_generating_users',
  USER_ID: 'mirava_user_id',
} as const;

// BroadcastChannel for cross-tab communication (simulates real-time)
const channel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('mirava_stats_channel')
  : null;

// Subscribers for demo mode
type DemoStatsCallback = (stats: GlobalStats) => void;
const demoSubscribers: Set<DemoStatsCallback> = new Set();

// Demo mode state
let demoIsOnline = false;
let demoIsGenerating = false;

/**
 * Get demo stats from localStorage
 */
const getDemoStats = (): GlobalStats => {
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
  demoSubscribers.forEach((callback) => callback(stats));
};

/**
 * Broadcast demo changes to other tabs
 */
const broadcastDemoChange = (): void => {
  channel?.postMessage({ type: 'stats_update', timestamp: Date.now() });
  notifyDemoSubscribers();
};

// Listen for cross-tab updates (demo mode)
if (channel) {
  channel.onmessage = () => {
    notifyDemoSubscribers();
  };
}

// Listen for storage events (backup for demo mode)
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
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PROMPTS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, String(current + 1));
  broadcastDemoChange();
};

/**
 * Demo mode: Subscribe to stats updates
 */
export const subscribeToDemoStats = (callback: DemoStatsCallback): (() => void) => {
  demoSubscribers.add(callback);
  callback(getDemoStats());
  
  return () => {
    demoSubscribers.delete(callback);
  };
};

/**
 * Demo mode: Set user online status
 */
export const setUserOnlineDemo = (): (() => void) => {
  if (demoIsOnline) return () => {};
  
  demoIsOnline = true;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, String(current + 1));
  broadcastDemoChange();
  
  const cleanup = (): void => {
    if (!demoIsOnline) return;
    demoIsOnline = false;
    const updated = Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '1', 10) - 1);
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
  if (generating === demoIsGenerating) return;
  
  demoIsGenerating = generating;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.GENERATING_USERS) || '0', 10);
  
  if (generating) {
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(current + 1));
  } else {
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(Math.max(0, current - 1)));
  }
  
  broadcastDemoChange();
};

/**
 * Reset demo stats (for testing/development)
 */
export const resetDemoStats = (): void => {
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, '0');
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, '1');
  localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, '0');
  broadcastDemoChange();
};
