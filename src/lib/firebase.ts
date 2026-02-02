/**
 * Firebase Realtime Database Integration for Global Stats
 * 
 * This file provides a mock implementation for demo purposes.
 * To connect to real Firebase, uncomment the Firebase code and add your credentials.
 * 
 * Features:
 * - Total prompts generated (global counter)
 * - Online users count (presence system)
 * - Currently generating count (active sessions)
 */

// ============================================================================
// MOCK IMPLEMENTATION (For Demo - Uses localStorage + BroadcastChannel)
// ============================================================================

// Types
export interface GlobalStats {
  totalPrompts: number;
  onlineUsers: number;
  generatingUsers: number;
}

// Storage keys
const STORAGE_KEYS = {
  TOTAL_PROMPTS: 'mirava_global_total_prompts',
  ONLINE_USERS: 'mirava_online_users',
  GENERATING_USERS: 'mirava_generating_users',
  USER_ID: 'mirava_user_id',
} as const;

// Generate a unique user ID for this session
const getUserId = (): string => {
  let userId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

// BroadcastChannel for cross-tab communication (simulates Firebase real-time)
const channel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('mirava_stats_channel')
  : null;

// In-memory state for this tab
let isOnline = false;
let isGenerating = false;

// Simulate real-time subscriptions with storage events + BroadcastChannel
type StatsCallback = (stats: GlobalStats) => void;
const subscribers: Set<StatsCallback> = new Set();

// Get current stats from localStorage
const getStats = (): GlobalStats => {
  const totalPrompts = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PROMPTS) || '0', 10);
  const onlineUsers = parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '1', 10);
  const generatingUsers = parseInt(localStorage.getItem(STORAGE_KEYS.GENERATING_USERS) || '0', 10);
  
  return {
    totalPrompts: isNaN(totalPrompts) ? 0 : totalPrompts,
    onlineUsers: Math.max(1, isNaN(onlineUsers) ? 1 : onlineUsers),
    generatingUsers: isNaN(generatingUsers) ? 0 : generatingUsers,
  };
};

// Notify all subscribers
const notifySubscribers = () => {
  const stats = getStats();
  subscribers.forEach(callback => callback(stats));
};

// Listen for cross-tab updates
if (channel) {
  channel.onmessage = () => {
    notifySubscribers();
  };
}

// Also listen for storage events (backup for browsers without BroadcastChannel)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key?.startsWith('mirava_')) {
      notifySubscribers();
    }
  });
}

// Broadcast changes to other tabs
const broadcastChange = () => {
  channel?.postMessage({ type: 'stats_update', timestamp: Date.now() });
  notifySubscribers();
};

/**
 * Increment the global prompt count by 1
 * Called for EACH individual prompt generated, not per batch
 */
export const incrementPromptCount = async (): Promise<void> => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PROMPTS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, String(current + 1));
  broadcastChange();
};

/**
 * Subscribe to real-time stats updates
 * Returns an unsubscribe function
 */
export const subscribeToStats = (callback: StatsCallback): (() => void) => {
  subscribers.add(callback);
  
  // Immediately call with current stats
  callback(getStats());
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
};

/**
 * Set user as online (call when component mounts)
 * Returns cleanup function to call on unmount
 */
export const setUserOnline = (): (() => void) => {
  if (isOnline) return () => {};
  
  isOnline = true;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, String(current + 1));
  broadcastChange();
  
  // Cleanup function
  const cleanup = () => {
    if (!isOnline) return;
    isOnline = false;
    const updated = Math.max(0, parseInt(localStorage.getItem(STORAGE_KEYS.ONLINE_USERS) || '1', 10) - 1);
    localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, String(updated));
    broadcastChange();
  };
  
  // Handle page unload
  const handleUnload = () => cleanup();
  window.addEventListener('beforeunload', handleUnload);
  
  // Return cleanup that also removes the event listener
  return () => {
    cleanup();
    window.removeEventListener('beforeunload', handleUnload);
  };
};

/**
 * Set user generating status
 * @param generating - true when starting generation, false when done
 */
export const setUserGenerating = (generating: boolean): void => {
  if (generating === isGenerating) return;
  
  isGenerating = generating;
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.GENERATING_USERS) || '0', 10);
  
  if (generating) {
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(current + 1));
  } else {
    localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, String(Math.max(0, current - 1)));
  }
  
  broadcastChange();
};

/**
 * Reset stats (for testing/development)
 */
export const resetStats = (): void => {
  localStorage.setItem(STORAGE_KEYS.TOTAL_PROMPTS, '0');
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, '1');
  localStorage.setItem(STORAGE_KEYS.GENERATING_USERS, '0');
  broadcastChange();
};


// ============================================================================
// REAL FIREBASE IMPLEMENTATION (Uncomment when you have credentials)
// ============================================================================

/*
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  increment, 
  update, 
  onDisconnect, 
  set, 
  serverTimestamp,
  runTransaction,
  push,
  remove
} from 'firebase/database';

// Firebase config - Replace with your actual credentials
// Note: These values are safe to expose in client-side code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mirava-magic-prompt.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mirava-magic-prompt-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mirava-magic-prompt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mirava-magic-prompt.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database references
const statsRef = ref(database, 'stats');
const presenceRef = ref(database, 'presence');
const generatingRef = ref(database, 'generating');

// Generate unique user ID
const getUserId = (): string => {
  let id = sessionStorage.getItem('mirava_firebase_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('mirava_firebase_user_id', id);
  }
  return id;
};

// Increment the total prompt count atomically
export const incrementPromptCount = async (): Promise<void> => {
  const totalPromptsRef = ref(database, 'stats/totalPrompts');
  await runTransaction(totalPromptsRef, (current) => {
    return (current || 0) + 1;
  });
};

// Subscribe to real-time stats updates
export const subscribeToStats = (callback: (stats: GlobalStats) => void): (() => void) => {
  const unsubscribers: (() => void)[] = [];
  
  let currentStats: GlobalStats = {
    totalPrompts: 0,
    onlineUsers: 0,
    generatingUsers: 0
  };
  
  // Subscribe to total prompts
  const totalPromptsRef = ref(database, 'stats/totalPrompts');
  const unsubTotalPrompts = onValue(totalPromptsRef, (snapshot) => {
    currentStats.totalPrompts = snapshot.val() || 0;
    callback({ ...currentStats });
  });
  unsubscribers.push(unsubTotalPrompts);
  
  // Subscribe to online users count (count presence entries)
  const unsubPresence = onValue(presenceRef, (snapshot) => {
    currentStats.onlineUsers = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    callback({ ...currentStats });
  });
  unsubscribers.push(unsubPresence);
  
  // Subscribe to generating users count
  const unsubGenerating = onValue(generatingRef, (snapshot) => {
    currentStats.generatingUsers = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    callback({ ...currentStats });
  });
  unsubscribers.push(unsubGenerating);
  
  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

// Set user as online with presence system
export const setUserOnline = (): (() => void) => {
  const userId = getUserId();
  const userPresenceRef = ref(database, `presence/${userId}`);
  
  // Set presence
  set(userPresenceRef, {
    online: true,
    lastSeen: serverTimestamp()
  });
  
  // Remove on disconnect
  onDisconnect(userPresenceRef).remove();
  
  // Return cleanup function
  return () => {
    remove(userPresenceRef);
  };
};

// Set user generating status
let userGeneratingRef: any = null;
export const setUserGenerating = (generating: boolean): void => {
  const userId = getUserId();
  const generatingStatusRef = ref(database, `generating/${userId}`);
  
  if (generating) {
    set(generatingStatusRef, {
      generating: true,
      startedAt: serverTimestamp()
    });
    onDisconnect(generatingStatusRef).remove();
    userGeneratingRef = generatingStatusRef;
  } else if (userGeneratingRef) {
    remove(userGeneratingRef);
    userGeneratingRef = null;
  }
};
*/
