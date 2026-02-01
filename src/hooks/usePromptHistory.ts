import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { sanitizeInput, INPUT_LIMITS } from "@/lib/sanitize";

// ============================================================================
// CONFIGURATION
// ============================================================================
const HISTORY_STORAGE_KEY = "mirava_history";
const MAX_HISTORY_ITEMS = 50;
const DEBOUNCE_DELAY_MS = 300;
const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;
const STORAGE_WARNING_THRESHOLD_KB = 400; // Warn before hitting localStorage limits

// ============================================================================
// TYPE DEFINITIONS & VALIDATION SCHEMAS
// ============================================================================
const PromptHistoryItemSchema = z.object({
  id: z.string().min(1),
  promptType: z.string(),
  userInput: z.string(),
  generatedPrompt: z.string(),
  createdAt: z.number().positive(),
  isFavorite: z.boolean().optional().default(false),
});

const PromptHistoryArraySchema = z.array(PromptHistoryItemSchema);

export interface PromptHistoryItem {
  id: string;
  promptType: string;
  userInput: string;
  generatedPrompt: string;
  createdAt: number;
  isFavorite?: boolean;
}

export interface StorageStats {
  itemCount: number;
  sizeKB: number;
  isNearLimit: boolean;
  oldestItemAge: number | null; // days
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a debounced version of a function
 */
function createDebouncedFunction<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): { debouncedFn: T; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debouncedFn, cancel };
}

/**
 * Validate and parse stored data with Zod schema
 */
function validateStoredData(data: unknown): PromptHistoryItem[] {
  try {
    const result = PromptHistoryArraySchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    console.warn("[PromptHistory] Data validation failed:", result.error.message);
    return [];
  } catch {
    console.warn("[PromptHistory] Data validation error");
    return [];
  }
}

/**
 * Remove items older than TTL (30 days), but keep favorites
 */
function removeExpiredItems(items: PromptHistoryItem[]): PromptHistoryItem[] {
  const now = Date.now();
  return items.filter((item) => {
    // Always keep favorites
    if (item.isFavorite) return true;
    // Remove if older than TTL
    return now - item.createdAt < TTL_MS;
  });
}

/**
 * Calculate storage size in KB
 */
function calculateStorageSize(items: PromptHistoryItem[]): number {
  try {
    const jsonString = JSON.stringify(items);
    // Approximate size in KB (UTF-16 encoding in localStorage)
    return (jsonString.length * 2) / 1024;
  } catch {
    return 0;
  }
}

/**
 * Get storage stats
 */
function getStorageStats(items: PromptHistoryItem[]): StorageStats {
  const sizeKB = calculateStorageSize(items);
  const now = Date.now();
  const oldestItem = items.length > 0 
    ? items.reduce((oldest, item) => 
        item.createdAt < oldest.createdAt ? item : oldest
      )
    : null;

  return {
    itemCount: items.length,
    sizeKB: Math.round(sizeKB * 100) / 100,
    isNearLimit: sizeKB > STORAGE_WARNING_THRESHOLD_KB,
    oldestItemAge: oldestItem 
      ? Math.floor((now - oldestItem.createdAt) / (24 * 60 * 60 * 1000))
      : null,
  };
}

/**
 * Safely read from localStorage with error handling
 */
function readFromStorage(): PromptHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    const validated = validateStoredData(parsed);
    const cleaned = removeExpiredItems(validated);
    
    // If we cleaned up expired items, save the cleaned version
    if (cleaned.length !== validated.length) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(cleaned));
    }
    
    return cleaned;
  } catch (error) {
    console.warn("[PromptHistory] Failed to read from storage:", error);
    // Corrupted data - clear it
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

/**
 * Safely write to localStorage with error handling
 */
function writeToStorage(items: PromptHistoryItem[]): boolean {
  try {
    const jsonString = JSON.stringify(items);
    localStorage.setItem(HISTORY_STORAGE_KEY, jsonString);
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("[PromptHistory] Storage quota exceeded. Attempting cleanup...");
      // Try to remove oldest non-favorite items
      const reduced = items
        .sort((a, b) => {
          // Keep favorites at the front
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          // Then sort by date (newest first)
          return b.createdAt - a.createdAt;
        })
        .slice(0, Math.floor(items.length / 2)); // Keep half
      
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(reduced));
        return true;
      } catch {
        console.error("[PromptHistory] Failed to save even with reduced data");
        return false;
      }
    }
    console.error("[PromptHistory] Failed to save to storage:", error);
    return false;
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================
export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Track pending saves to batch them
  const pendingItemsRef = useRef<PromptHistoryItem[] | null>(null);
  const debouncedSaveRef = useRef<{ cancel: () => void } | null>(null);

  // Initialize debounced save function
  useEffect(() => {
    const { debouncedFn, cancel } = createDebouncedFunction(
      (items: PromptHistoryItem[]) => {
        const success = writeToStorage(items);
        if (!success) {
          setSaveError("Failed to save history. Storage may be full.");
        } else {
          setSaveError(null);
        }
        pendingItemsRef.current = null;
      },
      DEBOUNCE_DELAY_MS
    );

    debouncedSaveRef.current = { cancel };
    
    // Store the debounced function for use in callbacks
    (window as unknown as Record<string, unknown>).__promptHistoryDebouncedSave = debouncedFn;

    return () => {
      cancel();
      // Flush any pending saves on unmount
      if (pendingItemsRef.current) {
        writeToStorage(pendingItemsRef.current);
      }
    };
  }, []);

  // Load history from storage on mount
  useEffect(() => {
    const stored = readFromStorage();
    setHistory(stored);
    setIsLoaded(true);
  }, []);

  // Debounced save to storage
  const saveToStorage = useCallback((items: PromptHistoryItem[]) => {
    pendingItemsRef.current = items;
    const debouncedSave = (window as unknown as Record<string, unknown>).__promptHistoryDebouncedSave as 
      ((items: PromptHistoryItem[]) => void) | undefined;
    if (debouncedSave) {
      debouncedSave(items);
    } else {
      // Fallback to immediate save if debounced function not ready
      writeToStorage(items);
    }
  }, []);

  // Add item to history with input sanitization
  const addToHistory = useCallback(
    (item: Omit<PromptHistoryItem, "id" | "createdAt">) => {
      // Sanitize all string inputs before storage
      const sanitizedItem = {
        ...item,
        promptType: sanitizeInput(item.promptType || '', 100),
        userInput: sanitizeInput(item.userInput || '', INPUT_LIMITS.USER_INPUT),
        generatedPrompt: sanitizeInput(item.generatedPrompt || '', INPUT_LIMITS.HISTORY_ITEM),
        isFavorite: Boolean(item.isFavorite),
      };

      const newItem: PromptHistoryItem = {
        ...sanitizedItem,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        isFavorite: sanitizedItem.isFavorite ?? false,
      };

      setHistory((prev) => {
        // Remove expired items first
        const cleaned = removeExpiredItems(prev);
        // Add new item and enforce max limit
        const updated = [newItem, ...cleaned].slice(0, MAX_HISTORY_ITEMS);
        saveToStorage(updated);
        return updated;
      });

      return newItem;
    },
    [saveToStorage]
  );

  // Remove item from history
  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Remove multiple items (batch operation)
  const removeMultiple = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setHistory((prev) => {
        const updated = prev.filter((item) => !idSet.has(item.id));
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore errors
    }
    setSaveError(null);
  }, []);

  // Clear only non-favorite items
  const clearNonFavorites = useCallback(() => {
    setHistory((prev) => {
      const favorites = prev.filter((item) => item.isFavorite);
      saveToStorage(favorites);
      return favorites;
    });
  }, [saveToStorage]);

  // Force cleanup of expired items
  const cleanupExpired = useCallback(() => {
    setHistory((prev) => {
      const cleaned = removeExpiredItems(prev);
      if (cleaned.length !== prev.length) {
        saveToStorage(cleaned);
      }
      return cleaned;
    });
  }, [saveToStorage]);

  // Get favorites (memoized)
  const favorites = useMemo(
    () => history.filter((item) => item.isFavorite),
    [history]
  );

  // Get storage stats (memoized)
  const storageStats = useMemo(
    () => getStorageStats(history),
    [history]
  );

  // Get history by prompt type (memoized factory)
  const getByPromptType = useCallback(
    (promptType: string) => history.filter((item) => item.promptType === promptType),
    [history]
  );

  // Search history
  const searchHistory = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return history.filter(
        (item) =>
          item.userInput.toLowerCase().includes(lowerQuery) ||
          item.generatedPrompt.toLowerCase().includes(lowerQuery) ||
          item.promptType.toLowerCase().includes(lowerQuery)
      );
    },
    [history]
  );

  // Export history as JSON (for backup)
  const exportHistory = useCallback(() => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  // Import history from JSON (merge with existing)
  const importHistory = useCallback(
    (jsonString: string, replace: boolean = false) => {
      try {
        const parsed = JSON.parse(jsonString);
        const validated = validateStoredData(parsed);
        
        if (validated.length === 0) {
          return { success: false, error: "No valid items found in import data" };
        }

        setHistory((prev) => {
          let updated: PromptHistoryItem[];
          
          if (replace) {
            updated = validated;
          } else {
            // Merge, avoiding duplicates by ID
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = validated.filter((item) => !existingIds.has(item.id));
            updated = [...newItems, ...prev];
          }
          
          // Enforce max limit and remove expired
          const final = removeExpiredItems(updated).slice(0, MAX_HISTORY_ITEMS);
          saveToStorage(final);
          return final;
        });

        return { success: true, imported: validated.length };
      } catch (error) {
        return { success: false, error: "Invalid JSON format" };
      }
    },
    [saveToStorage]
  );

  return {
    // State
    history,
    isLoaded,
    saveError,
    
    // Core operations
    addToHistory,
    removeFromHistory,
    removeMultiple,
    toggleFavorite,
    clearHistory,
    clearNonFavorites,
    cleanupExpired,
    
    // Queries
    favorites,
    getFavorites: () => favorites, // Deprecated, use favorites directly
    getByPromptType,
    searchHistory,
    
    // Storage management
    storageStats,
    
    // Import/Export
    exportHistory,
    importHistory,
  };
}

// ============================================================================
// TYPES EXPORT
// ============================================================================
export type { StorageStats };
