/**
 * Security Configuration
 * 
 * Centralized security settings for Mirava Magic Prompt application.
 * Modify these settings based on your security requirements.
 */

export const SecurityConfig = {
  // ============================================================================
  // API KEY SETTINGS
  // ============================================================================
  apiKeys: {
    /** Time-to-live for stored API keys in milliseconds (24 hours) */
    ttlMs: 24 * 60 * 60 * 1000,
    
    /** Maximum length for API keys */
    maxLength: 200,
    
    /** Enable key rotation reminder after this many days */
    rotationReminderDays: 30,
  },

  // ============================================================================
  // STORAGE SETTINGS
  // ============================================================================
  storage: {
    /** Inactivity timeout in minutes before clearing sensitive data */
    inactivityTimeoutMinutes: 30,
    
    /** Keys that are considered sensitive and cleared on inactivity */
    sensitiveKeys: ['mirava_api_keys'],
    
    /** Key rotation interval in days */
    keyRotationDays: 30,
    
    /** Maximum storage size warning threshold (KB) */
    maxStorageSizeKb: 400,
  },

  // ============================================================================
  // HISTORY SETTINGS
  // ============================================================================
  history: {
    /** Time-to-live for history items in days (favorites exempt) */
    ttlDays: 30,
    
    /** Maximum number of history items to store */
    maxItems: 50,
    
    /** Maximum length for user input */
    maxUserInputLength: 10000,
    
    /** Maximum length for generated prompts */
    maxPromptLength: 50000,
  },

  // ============================================================================
  // RATE LIMITING
  // ============================================================================
  rateLimiting: {
    /** Rate limit window in milliseconds */
    windowMs: 60000,
    
    /** Maximum API calls per window */
    maxCallsPerWindow: 30,
  },

  // ============================================================================
  // ALLOWED DOMAINS (Content Security Policy)
  // ============================================================================
  allowedApiDomains: [
    'api.openai.com',
    'generativelanguage.googleapis.com',
    'openrouter.ai',
    'api.groq.com',
  ],

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================
  validation: {
    /** API key patterns per provider */
    apiKeyPatterns: {
      openai: /^sk-[a-zA-Z0-9_-]{20,}$/,
      gemini: /^AIza[a-zA-Z0-9_-]{35,}$/,
      openrouter: /^sk-or-v1-[a-zA-Z0-9]{40,}$/,
      groq: /^gsk_[a-zA-Z0-9]{40,}$/,
    },
    
    /** Allowed characters for model names */
    modelNamePattern: /^[a-zA-Z0-9._/-]+$/,
    
    /** Maximum URL length */
    maxUrlLength: 2048,
  },

  // ============================================================================
  // ENCRYPTION SETTINGS
  // ============================================================================
  encryption: {
    /** PBKDF2 iterations for key derivation */
    pbkdf2Iterations: 100000,
    
    /** Encryption algorithm */
    algorithm: 'AES-GCM',
    
    /** Key length in bits */
    keyLength: 256,
    
    /** IV length in bytes */
    ivLength: 12,
    
    /** Salt length in bytes */
    saltLength: 16,
  },

  // ============================================================================
  // DEVELOPMENT/DEBUG SETTINGS
  // ============================================================================
  debug: {
    /** Log security events to console */
    logSecurityEvents: process.env.NODE_ENV === 'development',
    
    /** Show security status in UI */
    showSecurityStatus: true,
  },
} as const;

/**
 * Deep freeze the config to prevent runtime modifications
 */
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach(key => {
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value as object);
    }
  });
  return Object.freeze(obj);
}

export default deepFreeze(SecurityConfig);
