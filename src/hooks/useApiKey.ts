import { useState, useEffect, useCallback } from "react";
import { secureStorage, isCryptoAvailable, clearAllSensitiveData } from "@/lib/secureStorage";
import { sanitizeApiKey, sanitizeModelName, isValidProvider } from "@/lib/sanitize";

const API_KEYS_STORAGE_KEY = "mirava_api_keys";
const API_PROVIDER_STORAGE_KEY = "mirava_api_provider";
const API_MODEL_STORAGE_KEY = "mirava_api_model";
const SELECTED_CUSTOM_MODEL_KEY = "mirava_selected_custom_model";

// TTL for API keys - 24 hours (can be adjusted)
const API_KEY_TTL_MS = 24 * 60 * 60 * 1000;

export type ApiProvider = "openai" | "gemini" | "openrouter" | "groq" | "custom";

export const providerEndpoints: Record<Exclude<ApiProvider, "custom">, { base: string; modelsPath: string; authType: "bearer" | "query" }> = {
  openai: {
    base: "https://api.openai.com/v1",
    modelsPath: "/models",
    authType: "bearer",
  },
  gemini: {
    base: "https://generativelanguage.googleapis.com/v1beta",
    modelsPath: "/models",
    authType: "query",
  },
  openrouter: {
    base: "https://openrouter.ai/api/v1",
    modelsPath: "/models",
    authType: "bearer",
  },
  groq: {
    base: "https://api.groq.com/openai/v1",
    modelsPath: "/models",
    authType: "bearer",
  },
};

// Store API keys per provider
type ApiKeys = Partial<Record<Exclude<ApiProvider, "custom">, string>>;

// Security status type for UI feedback
export interface SecurityStatus {
  isEncryptionAvailable: boolean;
  isKeyEncrypted: boolean;
  lastSecurityCheck: number;
}

export function useApiKey() {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({});
  const [provider, setProviderState] = useState<ApiProvider>("openai");
  const [model, setModelState] = useState<string>("");
  const [selectedCustomModelId, setSelectedCustomModelIdState] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isEncryptionAvailable: false,
    isKeyEncrypted: false,
    lastSecurityCheck: 0,
  });

  // Check encryption availability on mount
  useEffect(() => {
    setSecurityStatus(prev => ({
      ...prev,
      isEncryptionAvailable: isCryptoAvailable(),
      lastSecurityCheck: Date.now(),
    }));
  }, []);

  // Load encrypted data on mount
  useEffect(() => {
    const loadStoredData = async () => {
      setIsLoading(true);
      try {
        // Load encrypted API keys
        const storedKeys = await secureStorage.getItem<ApiKeys>(API_KEYS_STORAGE_KEY);
        if (storedKeys) {
          setApiKeysState(storedKeys);
          setSecurityStatus(prev => ({ ...prev, isKeyEncrypted: true }));
        } else {
          // Check for legacy unencrypted data and migrate
          const legacyKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
          if (legacyKeys) {
            try {
              const parsed = JSON.parse(legacyKeys);
              // Check if it's not an encrypted envelope
              if (!parsed.v || !parsed.iv) {
                console.info('[useApiKey] Migrating legacy unencrypted API keys...');
                // Sanitize keys before migration
                const sanitizedKeys: ApiKeys = {};
                for (const [prov, key] of Object.entries(parsed)) {
                  if (typeof key === 'string' && isValidProvider(prov)) {
                    const sanitized = sanitizeApiKey(key, prov as Exclude<ApiProvider, 'custom'>);
                    if (sanitized) {
                      sanitizedKeys[prov as Exclude<ApiProvider, 'custom'>] = sanitized;
                    }
                  }
                }
                await secureStorage.setItem(API_KEYS_STORAGE_KEY, sanitizedKeys, API_KEY_TTL_MS);
                setApiKeysState(sanitizedKeys);
                setSecurityStatus(prev => ({ ...prev, isKeyEncrypted: true }));
              }
            } catch {
              // Invalid legacy data, ignore
            }
          }
        }

        // Load non-sensitive preferences (these don't need encryption)
        const storedProvider = localStorage.getItem(API_PROVIDER_STORAGE_KEY);
        const storedModel = localStorage.getItem(API_MODEL_STORAGE_KEY);
        const storedCustomModelId = localStorage.getItem(SELECTED_CUSTOM_MODEL_KEY);

        if (storedProvider && isValidProvider(storedProvider)) {
          setProviderState(storedProvider as ApiProvider);
        }
        if (storedModel) {
          setModelState(sanitizeModelName(storedModel));
        }
        if (storedCustomModelId) {
          setSelectedCustomModelIdState(sanitizeModelName(storedCustomModelId));
        }
      } catch (error) {
        console.error('[useApiKey] Error loading stored data:', error);
        // Clear potentially corrupted data
        setApiKeysState({});
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Secure setter for API keys
  const setApiKeyForProvider = useCallback(async (
    prov: Exclude<ApiProvider, "custom">, 
    key: string
  ): Promise<boolean> => {
    // Sanitize the key before storage
    const sanitizedKey = sanitizeApiKey(key, prov);
    if (!sanitizedKey) {
      console.warn(`[useApiKey] Invalid API key format for ${prov}`);
      return false;
    }

    const updated = { ...apiKeys, [prov]: sanitizedKey };
    setApiKeysState(updated);

    // Store with encryption and TTL
    try {
      await secureStorage.setItem(API_KEYS_STORAGE_KEY, updated, API_KEY_TTL_MS);
      setSecurityStatus(prev => ({ ...prev, isKeyEncrypted: true }));
      return true;
    } catch (error) {
      console.error('[useApiKey] Failed to store encrypted API key:', error);
      // Fallback to in-memory only (do NOT store unencrypted)
      return false;
    }
  }, [apiKeys]);

  const getApiKeyForProvider = useCallback((prov: Exclude<ApiProvider, "custom">) => {
    return apiKeys[prov] || "";
  }, [apiKeys]);

  const setProvider = useCallback((prov: ApiProvider) => {
    if (!isValidProvider(prov)) {
      console.warn(`[useApiKey] Invalid provider: ${prov}`);
      return;
    }
    setProviderState(prov);
    localStorage.setItem(API_PROVIDER_STORAGE_KEY, prov);
    // Clear model when provider changes (except for custom)
    if (prov !== "custom") {
      setModelState("");
      localStorage.removeItem(API_MODEL_STORAGE_KEY);
    }
  }, []);

  const setModel = useCallback((mod: string) => {
    const sanitized = sanitizeModelName(mod);
    setModelState(sanitized);
    localStorage.setItem(API_MODEL_STORAGE_KEY, sanitized);
  }, []);

  const setSelectedCustomModelId = useCallback((id: string) => {
    const sanitized = sanitizeModelName(id);
    setSelectedCustomModelIdState(sanitized);
    localStorage.setItem(SELECTED_CUSTOM_MODEL_KEY, sanitized);
  }, []);

  const clearApiKeyForProvider = useCallback(async (prov: Exclude<ApiProvider, "custom">) => {
    const updated = { ...apiKeys };
    delete updated[prov];
    setApiKeysState(updated);
    
    try {
      if (Object.keys(updated).length > 0) {
        await secureStorage.setItem(API_KEYS_STORAGE_KEY, updated, API_KEY_TTL_MS);
      } else {
        secureStorage.removeItem(API_KEYS_STORAGE_KEY);
      }
    } catch (error) {
      console.error('[useApiKey] Failed to update stored keys:', error);
    }

    if (provider === prov) {
      setModelState("");
      localStorage.removeItem(API_MODEL_STORAGE_KEY);
    }
  }, [apiKeys, provider]);

  /**
   * Clear all API keys and sensitive data (for logout/security)
   */
  const clearAllKeys = useCallback(() => {
    setApiKeysState({});
    clearAllSensitiveData();
    setSecurityStatus(prev => ({ ...prev, isKeyEncrypted: false }));
  }, []);

  /**
   * Mask API key for display (show only first and last 4 chars)
   */
  const maskApiKey = useCallback((key: string): string => {
    if (!key || key.length < 12) return '••••••••';
    return `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
  }, []);

  /**
   * Verify API key by making a test request
   */
  const verifyApiKey = useCallback(async (
    prov: Exclude<ApiProvider, "custom">,
    key: string
  ): Promise<{ valid: boolean; error?: string }> => {
    const endpoint = providerEndpoints[prov];
    if (!endpoint) {
      return { valid: false, error: 'Unknown provider' };
    }

    try {
      let fetchUrl: string;
      let headers: HeadersInit = { 'Content-Type': 'application/json' };

      if (endpoint.authType === "query") {
        // Gemini uses API key as query parameter
        fetchUrl = `${endpoint.base}${endpoint.modelsPath}?key=${key}`;
      } else {
        // Others use Bearer token
        fetchUrl = `${endpoint.base}${endpoint.modelsPath}`;
        headers = { ...headers, 'Authorization': `Bearer ${key}` };
      }

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        return { valid: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { 
        valid: false, 
        error: errorData.error?.message || `HTTP ${response.status}` 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }, []);

  // Current provider's API key (for non-custom)
  const currentApiKey = provider !== "custom" ? (apiKeys[provider] || "") : "";
  const hasApiKey = provider === "custom" ? true : currentApiKey.length > 0;

  return {
    apiKeys,
    provider,
    model,
    selectedCustomModelId,
    currentApiKey,
    isLoading,
    securityStatus,
    setApiKeyForProvider,
    getApiKeyForProvider,
    setProvider,
    setModel,
    setSelectedCustomModelId,
    clearApiKeyForProvider,
    clearAllKeys,
    maskApiKey,
    verifyApiKey,
    hasApiKey,
  };
}
