/**
 * @deprecated This file is DEPRECATED and kept for backward compatibility.
 * 
 * ⚠️  SECURITY NOTE: The old implementation exposed Supabase credentials to the client.
 * 
 * The new secure implementation is in `./stats-api.ts` which routes all
 * Supabase operations through Cloudflare Pages Functions, keeping credentials
 * server-side only.
 * 
 * In development mode, it uses a localStorage-based demo mode.
 * 
 * Migration:
 * - Old: import { supabase, incrementPromptCount } from '@/lib/supabase'
 * - New: import { incrementPromptCount } from '@/lib/stats-api'
 * 
 * The useGlobalStats hook uses this file which re-exports from stats-api.ts.
 */

// Re-export everything from the new secure API for backward compatibility
export {
  type GlobalStats,
  type PresenceManager,
  isSecureStatsEnabled as isSupabaseConfigured,
  getStats,
  incrementPromptCount,
  subscribeToStats,
  trackPresence,
  subscribeToDemoStats,
  incrementPromptCountDemo,
  setUserOnlineDemo,
  setUserGeneratingDemo,
  resetDemoStats,
} from './stats-api';

// Legacy export - always null since we no longer use direct Supabase client
export const supabase = null;
