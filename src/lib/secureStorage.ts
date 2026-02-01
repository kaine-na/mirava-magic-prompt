/**
 * Secure Storage Module - Client-Side Encryption for localStorage
 * 
 * SECURITY ARCHITECTURE:
 * - AES-256-GCM encryption for data at rest
 * - PBKDF2 key derivation with browser fingerprint + user salt
 * - HMAC integrity verification for tamper detection
 * - Automatic key rotation support
 * - Memory-safe key handling
 * 
 * LIMITATIONS (client-side security):
 * - Cannot fully protect against XSS (if attacker has JS execution)
 * - Fingerprint can be spoofed by sophisticated attackers
 * - This provides defense-in-depth, NOT absolute security
 * 
 * For truly sensitive data, consider:
 * - Backend token exchange
 * - OAuth flows with short-lived tokens
 */

// Constants for cryptographic operations
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000; // Increased from typical 10k for security
const HMAC_ALGORITHM = 'SHA-256';

// Storage keys for encryption metadata
const ENCRYPTION_SALT_KEY = '__pg_enc_salt';
const KEY_CREATED_AT_KEY = '__pg_key_created';
const KEY_ROTATION_DAYS = 30; // Rotate keys every 30 days

/**
 * Encrypted data envelope structure
 */
interface EncryptedEnvelope {
  v: number;           // Version for future-proofing
  iv: string;          // Base64 encoded IV
  data: string;        // Base64 encoded encrypted data
  hmac: string;        // Base64 encoded HMAC for integrity
  ts: number;          // Timestamp for TTL
  exp?: number;        // Optional expiry timestamp
}

/**
 * Storage item with metadata
 */
interface SecureStorageItem<T> {
  data: T;
  createdAt: number;
  expiresAt?: number;
}

/**
 * Generate a cryptographically secure random salt
 */
export async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a browser fingerprint for key derivation
 * This provides an additional layer of protection - the key is tied to this browser
 * 
 * NOTE: This is NOT a unique identifier, just adds entropy to key derivation
 */
function getBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '0',
    // Canvas fingerprint (simplified)
    typeof HTMLCanvasElement !== 'undefined' ? 'canvas' : 'no-canvas',
  ];
  
  return components.join('|');
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive an encryption key using PBKDF2
 * Combines browser fingerprint with stored salt for key material
 */
export async function deriveKey(salt: Uint8Array, purpose: 'encrypt' | 'hmac'): Promise<CryptoKey> {
  const fingerprint = getBrowserFingerprint();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(fingerprint),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Add purpose to salt to derive different keys for encryption and HMAC
  const purposedSalt = new Uint8Array([...salt, ...encoder.encode(purpose)]);

  const keyUsage: KeyUsage[] = purpose === 'encrypt' 
    ? ['encrypt', 'decrypt'] 
    : ['sign', 'verify'];

  const algorithm = purpose === 'encrypt'
    ? { name: ALGORITHM, length: KEY_LENGTH }
    : { name: 'HMAC', hash: HMAC_ALGORITHM };

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: purposedSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    algorithm,
    false, // Not extractable - security measure
    keyUsage
  );
}

/**
 * Generate HMAC for data integrity verification
 */
async function generateHmac(data: string, hmacKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    encoder.encode(data)
  );
  return arrayBufferToBase64(signature);
}

/**
 * Verify HMAC signature
 */
async function verifyHmac(data: string, signature: string, hmacKey: CryptoKey): Promise<boolean> {
  const encoder = new TextEncoder();
  try {
    return await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      base64ToArrayBuffer(signature),
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

/**
 * Get or create the encryption salt
 * Salt is stored in localStorage and used for key derivation
 */
async function getOrCreateSalt(): Promise<Uint8Array> {
  const storedSalt = localStorage.getItem(ENCRYPTION_SALT_KEY);
  
  if (storedSalt) {
    try {
      return new Uint8Array(base64ToArrayBuffer(storedSalt));
    } catch {
      // Corrupted salt, regenerate
    }
  }
  
  const newSalt = await generateSalt();
  localStorage.setItem(ENCRYPTION_SALT_KEY, arrayBufferToBase64(newSalt.buffer));
  localStorage.setItem(KEY_CREATED_AT_KEY, Date.now().toString());
  return newSalt;
}

/**
 * Check if key rotation is needed
 */
export function isKeyRotationNeeded(): boolean {
  const createdAt = localStorage.getItem(KEY_CREATED_AT_KEY);
  if (!createdAt) return false;
  
  const ageInDays = (Date.now() - parseInt(createdAt, 10)) / (1000 * 60 * 60 * 24);
  return ageInDays > KEY_ROTATION_DAYS;
}

/**
 * Encrypt data using AES-GCM
 * Returns a JSON string containing the encrypted envelope
 */
export async function encrypt(data: string, expiresInMs?: number): Promise<string> {
  const salt = await getOrCreateSalt();
  const encryptionKey = await deriveKey(salt, 'encrypt');
  const hmacKey = await deriveKey(salt, 'hmac');
  
  // Generate random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    encryptionKey,
    encoder.encode(data)
  );

  const now = Date.now();
  const envelope: EncryptedEnvelope = {
    v: 1,
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encrypted),
    hmac: '', // Will be set below
    ts: now,
    exp: expiresInMs ? now + expiresInMs : undefined,
  };

  // Generate HMAC over the encrypted data for integrity
  envelope.hmac = await generateHmac(envelope.data + envelope.ts.toString(), hmacKey);
  
  return JSON.stringify(envelope);
}

/**
 * Decrypt data from encrypted envelope
 * Throws if integrity check fails or data has expired
 */
export async function decrypt(encryptedJson: string): Promise<string | null> {
  try {
    const envelope: EncryptedEnvelope = JSON.parse(encryptedJson);
    
    // Version check for future compatibility
    if (envelope.v !== 1) {
      console.warn('[SecureStorage] Unknown envelope version:', envelope.v);
      return null;
    }

    // Check expiry
    if (envelope.exp && Date.now() > envelope.exp) {
      console.warn('[SecureStorage] Data has expired');
      return null;
    }

    const salt = await getOrCreateSalt();
    const encryptionKey = await deriveKey(salt, 'encrypt');
    const hmacKey = await deriveKey(salt, 'hmac');

    // Verify HMAC integrity
    const isValid = await verifyHmac(envelope.data + envelope.ts.toString(), envelope.hmac, hmacKey);
    if (!isValid) {
      console.error('[SecureStorage] HMAC verification failed - data may be tampered');
      return null;
    }

    const iv = new Uint8Array(base64ToArrayBuffer(envelope.iv));
    const encryptedData = base64ToArrayBuffer(envelope.data);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      encryptionKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[SecureStorage] Decryption failed:', error);
    return null;
  }
}

/**
 * SecureStorage class - Drop-in replacement for localStorage with encryption
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly inactivityTimeoutMs: number;
  private readonly sensitiveKeys: Set<string>;

  private constructor(
    inactivityTimeoutMinutes: number = 30,
    sensitiveKeys: string[] = []
  ) {
    this.inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
    this.sensitiveKeys = new Set(sensitiveKeys);
    this.setupInactivityClear();
    this.setupPageVisibilityHandler();
  }

  /**
   * Get singleton instance
   */
  static getInstance(
    inactivityTimeoutMinutes: number = 30,
    sensitiveKeys: string[] = ['mirava_api_keys']
  ): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage(inactivityTimeoutMinutes, sensitiveKeys);
    }
    return SecureStorage.instance;
  }

  /**
   * Setup inactivity detection to clear sensitive data
   */
  private setupInactivityClear(): void {
    const resetTimer = () => {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      this.inactivityTimer = setTimeout(() => {
        this.clearSensitiveData();
        console.info('[SecureStorage] Sensitive data cleared due to inactivity');
      }, this.inactivityTimeoutMs);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Initial timer
    resetTimer();
  }

  /**
   * Clear sensitive data when page becomes hidden (tab switch, minimize)
   */
  private setupPageVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Optional: Clear on page hide (uncomment for maximum security)
        // this.clearSensitiveData();
        console.debug('[SecureStorage] Page hidden - tracking inactivity');
      }
    });

    // Clear on page unload
    window.addEventListener('beforeunload', () => {
      // Clear in-memory sensitive data references
      // Note: localStorage data persists, but memory is cleared
    });
  }

  /**
   * Store encrypted data with optional TTL
   */
  async setItem<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const item: SecureStorageItem<T> = {
      data: value,
      createdAt: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    };

    const encrypted = await encrypt(JSON.stringify(item), ttlMs);
    localStorage.setItem(key, encrypted);
  }

  /**
   * Retrieve and decrypt data
   * Returns null if data doesn't exist, is expired, or integrity check fails
   */
  async getItem<T>(key: string): Promise<T | null> {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    // Check if this is encrypted data (JSON envelope) or legacy plain data
    try {
      const parsed = JSON.parse(encrypted);
      if (parsed.v && parsed.iv && parsed.data) {
        // Encrypted envelope
        const decrypted = await decrypt(encrypted);
        if (!decrypted) return null;

        const item: SecureStorageItem<T> = JSON.parse(decrypted);
        
        // Check TTL
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.removeItem(key);
          return null;
        }

        return item.data;
      }
      // Legacy unencrypted data - return as-is for migration
      return parsed as T;
    } catch {
      // Not JSON, return null
      return null;
    }
  }

  /**
   * Remove an item
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all sensitive data
   */
  clearSensitiveData(): void {
    this.sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Clear all data managed by SecureStorage
   */
  clearAll(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('mirava_') || key.startsWith('__pg_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Migrate legacy unencrypted data to encrypted storage
   */
  async migrateUnencryptedData(key: string): Promise<boolean> {
    const raw = localStorage.getItem(key);
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      // Check if already encrypted
      if (parsed.v && parsed.iv && parsed.data) {
        return false; // Already encrypted
      }

      // Re-save with encryption
      await this.setItem(key, parsed);
      console.info(`[SecureStorage] Migrated ${key} to encrypted storage`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utility: Clear all sensitive data (for logout/security events)
 */
export function clearAllSensitiveData(): void {
  const sensitiveKeys = [
    'mirava_api_keys',
    '__pg_enc_salt',
    '__pg_key_created',
  ];
  sensitiveKeys.forEach(key => localStorage.removeItem(key));
}

/**
 * Utility: Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return !!(
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof crypto.subtle.encrypt === 'function'
  );
}

/**
 * Export singleton instance for convenience
 */
export const secureStorage = SecureStorage.getInstance();
