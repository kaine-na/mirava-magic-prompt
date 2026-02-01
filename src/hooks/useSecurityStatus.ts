import { useState, useEffect, useCallback } from 'react';
import { isCryptoAvailable, isKeyRotationNeeded, clearAllSensitiveData, SecureStorage } from '@/lib/secureStorage';

/**
 * Security status interface for UI display
 */
export interface SecurityStatusInfo {
  /** Whether Web Crypto API is available */
  isEncryptionAvailable: boolean;
  /** Whether stored keys are encrypted */
  hasEncryptedStorage: boolean;
  /** Whether key rotation is needed */
  needsKeyRotation: boolean;
  /** Last security check timestamp */
  lastCheckedAt: number;
  /** Whether the browser is in a secure context (HTTPS) */
  isSecureContext: boolean;
  /** Whether localStorage is available */
  isStorageAvailable: boolean;
  /** Overall security score (0-100) */
  securityScore: number;
  /** Human-readable security level */
  securityLevel: 'high' | 'medium' | 'low';
  /** Security recommendations */
  recommendations: string[];
}

/**
 * Calculate security score based on available features
 */
function calculateSecurityScore(
  isEncryptionAvailable: boolean,
  isSecureContext: boolean,
  isStorageAvailable: boolean,
  needsKeyRotation: boolean
): { score: number; level: SecurityStatusInfo['securityLevel']; recommendations: string[] } {
  let score = 0;
  const recommendations: string[] = [];

  // Secure context (HTTPS) - 30 points
  if (isSecureContext) {
    score += 30;
  } else {
    recommendations.push('Use HTTPS for secure connections');
  }

  // Web Crypto API available - 30 points
  if (isEncryptionAvailable) {
    score += 30;
  } else {
    recommendations.push('Use a modern browser with Web Crypto API support');
  }

  // Storage available - 20 points
  if (isStorageAvailable) {
    score += 20;
  } else {
    recommendations.push('Enable localStorage in browser settings');
  }

  // Key rotation up to date - 20 points
  if (!needsKeyRotation) {
    score += 20;
  } else {
    recommendations.push('Encryption key rotation is recommended');
  }

  let level: SecurityStatusInfo['securityLevel'];
  if (score >= 80) {
    level = 'high';
  } else if (score >= 50) {
    level = 'medium';
  } else {
    level = 'low';
    recommendations.push('Consider using a different browser or environment');
  }

  return { score, level, recommendations };
}

/**
 * Hook to monitor and manage security status
 */
export function useSecurityStatus() {
  const [status, setStatus] = useState<SecurityStatusInfo>({
    isEncryptionAvailable: false,
    hasEncryptedStorage: false,
    needsKeyRotation: false,
    lastCheckedAt: 0,
    isSecureContext: false,
    isStorageAvailable: false,
    securityScore: 0,
    securityLevel: 'low',
    recommendations: [],
  });

  const checkSecurityStatus = useCallback(() => {
    // Check all security features
    const isEncryptionAvailable = isCryptoAvailable();
    const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
    const needsKeyRotation = isKeyRotationNeeded();
    
    // Check storage availability
    let isStorageAvailable = false;
    try {
      const testKey = '__security_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      isStorageAvailable = true;
    } catch {
      isStorageAvailable = false;
    }

    // Check if there's encrypted data
    let hasEncryptedStorage = false;
    try {
      const encSalt = localStorage.getItem('__pg_enc_salt');
      hasEncryptedStorage = encSalt !== null;
    } catch {
      hasEncryptedStorage = false;
    }

    // Calculate security score
    const { score, level, recommendations } = calculateSecurityScore(
      isEncryptionAvailable,
      isSecureContext,
      isStorageAvailable,
      needsKeyRotation
    );

    setStatus({
      isEncryptionAvailable,
      hasEncryptedStorage,
      needsKeyRotation,
      lastCheckedAt: Date.now(),
      isSecureContext,
      isStorageAvailable,
      securityScore: score,
      securityLevel: level,
      recommendations,
    });
  }, []);

  // Check status on mount
  useEffect(() => {
    checkSecurityStatus();
    
    // Re-check periodically (every 5 minutes)
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkSecurityStatus]);

  /**
   * Emergency clear all sensitive data
   */
  const emergencyClear = useCallback(() => {
    clearAllSensitiveData();
    checkSecurityStatus();
  }, [checkSecurityStatus]);

  /**
   * Force key rotation (clears existing encrypted data)
   */
  const forceKeyRotation = useCallback(async () => {
    // Clear the encryption salt to force new key generation
    localStorage.removeItem('__pg_enc_salt');
    localStorage.removeItem('__pg_key_created');
    
    // Clear encrypted data (will need to be re-entered)
    clearAllSensitiveData();
    
    checkSecurityStatus();
  }, [checkSecurityStatus]);

  return {
    status,
    checkSecurityStatus,
    emergencyClear,
    forceKeyRotation,
  };
}

/**
 * Hook for inactivity detection
 */
export function useInactivityTimeout(
  timeoutMinutes: number = 30,
  onTimeout: () => void
) {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onTimeout();
      }, timeoutMinutes * 60 * 1000);
    };

    // Events that reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMinutes, onTimeout]);
}

/**
 * Hook to show security warning in dev console
 */
export function useDevConsoleWarning() {
  useEffect(() => {
    // Only show in browser environment
    if (typeof window === 'undefined') return;

    const style = 'color: red; font-size: 20px; font-weight: bold;';
    const warningStyle = 'color: red; font-size: 14px;';
    const infoStyle = 'color: blue; font-size: 12px;';

    console.log('%c⚠️ Security Warning', style);
    console.log(
      '%cThis is a browser feature for developers. If someone told you to paste code here, they are trying to hack you.',
      warningStyle
    );
    console.log(
      '%cNever paste code or API keys into the console!',
      warningStyle
    );
    console.log(
      '%cLearn more: https://en.wikipedia.org/wiki/Self-XSS',
      infoStyle
    );
  }, []);
}
