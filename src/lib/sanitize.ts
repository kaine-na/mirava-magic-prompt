/**
 * Input Sanitization Module - XSS Prevention and Input Validation
 * 
 * SECURITY PURPOSE:
 * - Prevent XSS (Cross-Site Scripting) attacks
 * - Validate and sanitize all user inputs
 * - Enforce input length limits
 * - Validate API key formats
 * - Sanitize URLs for safe usage
 * 
 * IMPORTANT: This is defense-in-depth. Always combine with:
 * - Content Security Policy headers
 * - Proper output encoding
 * - Secure HTTP headers
 */

// Maximum lengths for different input types
export const INPUT_LIMITS = {
  USER_INPUT: 10000,      // Max characters for user prompt input
  API_KEY: 200,           // Max length for API keys
  MODEL_NAME: 100,        // Max length for model names
  URL: 2048,              // Max URL length
  HISTORY_ITEM: 50000,    // Max characters per history item
} as const;

// API key format patterns for validation
const API_KEY_PATTERNS: Record<string, RegExp> = {
  openai: /^sk-[a-zA-Z0-9_-]{20,}$/,           // OpenAI: sk-xxx...
  gemini: /^AIza[a-zA-Z0-9_-]{35,}$/,          // Google AI: AIzaSy...
  openrouter: /^sk-or-v1-[a-zA-Z0-9]{40,}$/,   // OpenRouter: sk-or-v1-xxx
  groq: /^gsk_[a-zA-Z0-9]{40,}$/,              // Groq: gsk_xxx
  generic: /^[a-zA-Z0-9_-]{20,}$/,             // Generic pattern
};

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['https:'];

// Known safe API domains (whitelist approach for API calls)
const ALLOWED_API_DOMAINS = [
  'api.openai.com',
  'generativelanguage.googleapis.com',
  'openrouter.ai',
  'api.groq.com',
];

/**
 * HTML entities for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Remove potentially dangerous HTML/script content
 * More aggressive than escaping - actually removes malicious patterns
 */
export function stripDangerousContent(input: string): string {
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]*)/gi, '')
    // Remove javascript: and data: URLs
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    // Remove expression() CSS hack
    .replace(/expression\s*\(/gi, '')
    // Remove iframe, object, embed, form tags
    .replace(/<(iframe|object|embed|form|meta|link|style)[^>]*>/gi, '')
    // Remove closing tags for the above
    .replace(/<\/(iframe|object|embed|form|meta|link|style)>/gi, '');
}

/**
 * Sanitize general user input
 * - Removes XSS vectors
 * - Enforces length limit
 * - Trims whitespace
 * - Normalizes unicode
 */
export function sanitizeInput(input: string, maxLength: number = INPUT_LIMITS.USER_INPUT): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Normalize unicode to NFC form
    .normalize('NFC')
    // Trim whitespace
    .trim()
    // Enforce length limit
    .slice(0, maxLength);

  // Strip dangerous content
  sanitized = stripDangerousContent(sanitized);

  // Remove null bytes and other control characters (except newlines/tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitize and validate API key
 * - Validates format matches known provider patterns
 * - Enforces length limit
 * - Removes whitespace
 * - Returns null if invalid
 */
export function sanitizeApiKey(
  key: string, 
  provider?: 'openai' | 'gemini' | 'openrouter' | 'groq'
): string | null {
  if (typeof key !== 'string') {
    return null;
  }

  // Trim and remove any whitespace
  const cleaned = key.trim().replace(/\s/g, '');

  // Check length
  if (cleaned.length === 0 || cleaned.length > INPUT_LIMITS.API_KEY) {
    return null;
  }

  // Validate format if provider is known
  if (provider && API_KEY_PATTERNS[provider]) {
    if (!API_KEY_PATTERNS[provider].test(cleaned)) {
      // Only log in development - never expose key format details in production
      if (import.meta.env.DEV) {
        console.warn(`[Sanitize] Invalid API key format for provider: ${provider}`);
      }
      // Still return the key but log warning - some providers may have different formats
    }
  }

  // Basic character validation - API keys should only contain safe characters
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.warn('[Sanitize] API key contains unexpected characters');
    }
    // Remove any unexpected characters
    return cleaned.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  return cleaned;
}

/**
 * Validate API key format strictly
 * Returns true only if key matches expected provider pattern
 */
export function isValidApiKeyFormat(
  key: string,
  provider: 'openai' | 'gemini' | 'openrouter' | 'groq'
): boolean {
  if (!key || typeof key !== 'string') return false;
  const pattern = API_KEY_PATTERNS[provider];
  return pattern ? pattern.test(key.trim()) : false;
}

/**
 * Sanitize and validate URL
 * - Validates URL format
 * - Ensures HTTPS only
 * - Optionally validates against whitelist
 * - Returns null if invalid
 */
export function sanitizeUrl(
  url: string,
  options: {
    requireHttps?: boolean;
    allowedDomains?: string[];
    allowCustomDomains?: boolean;
  } = {}
): string | null {
  const {
    requireHttps = true,
    allowedDomains = ALLOWED_API_DOMAINS,
    allowCustomDomains = false,
  } = options;

  if (typeof url !== 'string') {
    return null;
  }

  // Trim and clean
  const cleaned = url.trim().slice(0, INPUT_LIMITS.URL);

  // Remove any javascript: or data: prefixes
  if (/^(javascript|data|vbscript):/i.test(cleaned)) {
    // Only log in development - don't reveal attack detection in production
    if (import.meta.env.DEV) {
      console.error('[Sanitize] Dangerous URL protocol detected');
    }
    return null;
  }

  try {
    const parsed = new URL(cleaned);

    // Check protocol
    if (requireHttps && !ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.warn('[Sanitize] URL must use HTTPS');
      }
      return null;
    }

    // Check domain whitelist (unless custom domains are allowed)
    if (!allowCustomDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsed.hostname === domain || 
        parsed.hostname.endsWith('.' + domain)
      );
      if (!isAllowed) {
        // Only log in development - don't reveal whitelist details
        if (import.meta.env.DEV) {
          console.warn(`[Sanitize] URL domain not in whitelist: ${parsed.hostname}`);
        }
        return null;
      }
    }

    // Remove any credentials from URL
    parsed.username = '';
    parsed.password = '';

    return parsed.toString();
  } catch {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('[Sanitize] Invalid URL format');
    }
    return null;
  }
}

/**
 * Sanitize custom base URL for API endpoints
 * More permissive than sanitizeUrl but still validates structure
 */
export function sanitizeCustomBaseUrl(url: string): string | null {
  return sanitizeUrl(url, {
    requireHttps: true,
    allowCustomDomains: true,
    allowedDomains: [],
  });
}

/**
 * Sanitize model name
 */
export function sanitizeModelName(model: string): string {
  if (typeof model !== 'string') return '';
  
  return model
    .trim()
    .slice(0, INPUT_LIMITS.MODEL_NAME)
    // Model names should only contain alphanumeric, dots, dashes, underscores, slashes
    .replace(/[^a-zA-Z0-9._/-]/g, '');
}

/**
 * Sanitize JSON data before storage
 * Recursively sanitizes all string values in an object
 */
export function sanitizeForStorage<T extends object>(data: T): T {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => 
      typeof item === 'string' 
        ? sanitizeInput(item, INPUT_LIMITS.HISTORY_ITEM)
        : typeof item === 'object' && item !== null
          ? sanitizeForStorage(item)
          : item
    ) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value, INPUT_LIMITS.HISTORY_ITEM);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForStorage(value as object);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Validate that a provider name is valid
 */
export function isValidProvider(provider: string): provider is 'openai' | 'gemini' | 'openrouter' | 'groq' | 'custom' {
  return ['openai', 'gemini', 'openrouter', 'groq', 'custom'].includes(provider);
}

/**
 * Rate limiting helper - Track API call frequency
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxCalls: number;

  constructor(windowMs: number = 60000, maxCalls: number = 60) {
    this.windowMs = windowMs;
    this.maxCalls = maxCalls;
  }

  /**
   * Check if a call is allowed
   */
  isAllowed(key: string = 'default'): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    
    // Filter to only calls within window
    const recentCalls = calls.filter(time => now - time < this.windowMs);
    
    if (recentCalls.length >= this.maxCalls) {
      return false;
    }

    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    return true;
  }

  /**
   * Get remaining calls in current window
   */
  remaining(key: string = 'default'): number {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    const recentCalls = calls.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxCalls - recentCalls.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string = 'default'): void {
    this.calls.delete(key);
  }
}

// Export singleton rate limiter
export const apiRateLimiter = new RateLimiter(60000, 30); // 30 calls per minute

/**
 * Content type validation for API responses
 */
export function validateContentType(contentType: string | null, expected: string = 'application/json'): boolean {
  if (!contentType) return false;
  return contentType.toLowerCase().includes(expected.toLowerCase());
}

/**
 * Deep freeze an object to prevent modification
 * Useful for configuration objects
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach(key => {
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value as object);
    }
  });
  return Object.freeze(obj);
}
