# Security Best Practices for Mirava Magic Prompt

This document outlines the security measures implemented in Mirava Magic Prompt and provides guidance for maintaining a secure client-side application.

## Table of Contents
- [Security Architecture](#security-architecture)
- [Credential Protection](#credential-protection)
- [Cloudflare Pages Functions](#cloudflare-pages-functions)
- [API Key Protection](#api-key-protection)
- [Input Sanitization](#input-sanitization)
- [Content Security Policy](#content-security-policy)
- [Data Integrity](#data-integrity)
- [Storage TTL & Expiry](#storage-ttl--expiry)
- [Security Limitations](#security-limitations)
- [Security Checklist](#security-checklist)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Security Architecture

PromptGen uses a **Zero-Credential-Exposure Architecture** where all sensitive credentials are kept server-side via Cloudflare Pages Functions:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                        ┌───────────────────────┐   │
│  │   React App     │                        │   SecureStorage       │   │
│  │                 │                        │   (AES-256-GCM)       │   │
│  │  ❌ No Supabase │                        │   API Keys Only       │   │
│  │     Credentials │                        │                       │   │
│  └────────┬────────┘                        └───────────────────────┘   │
│           │                                                              │
│           │ HTTPS (No credentials in request)                           │
└───────────┼──────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES EDGE FUNCTIONS                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /api/stats (GET/POST)          /api/stats/stream (SSE)                 │
│  ┌──────────────────┐           ┌──────────────────┐                    │
│  │ Increment/Fetch  │           │ Real-time        │                    │
│  │ Stats            │           │ Updates          │                    │
│  └────────┬─────────┘           └────────┬─────────┘                    │
│           │                              │                               │
│           │  ┌──────────────────────────────────────────┐               │
│           └──│  🔐 SUPABASE_URL                         │               │
│              │  🔐 SUPABASE_SERVICE_ROLE_KEY            │               │
│              │                                          │               │
│              │  (Stored in Cloudflare Environment)      │               │
│              └──────────────────────────────────────────┘               │
│                              │                                           │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │      SUPABASE         │
                    │  - RLS Protected      │
                    │  - RPC Functions      │
                    │  - Stats Table        │
                    └───────────────────────┘
```

### Key Security Layers

1. **Zero Client Credentials** - No Supabase URL or keys in client bundle
2. **Edge Function Proxy** - All database calls go through Cloudflare
3. **Service Role Key** - Server-side only, enables controlled operations
4. **Encryption at Rest** - User API keys encrypted with AES-256-GCM
5. **Input Sanitization** - All user inputs sanitized before storage
6. **Content Security Policy** - Restricts script execution and API endpoints
7. **HMAC Integrity** - Detects tampering of stored data

---

## Credential Protection

### ✅ Zero-Exposure Architecture

**All Supabase credentials are 100% hidden from the client:**

| What | Before (Exposed) | After (Hidden) |
|------|-----------------|----------------|
| Supabase URL | ❌ In client bundle | ✅ Server-side only |
| Supabase Key | ❌ In DevTools | ✅ Server-side only |
| Network Tab | ❌ Shows credentials | ✅ Shows only `/api/*` |
| Console | ❌ May leak info | ✅ No credentials |

### How It Works

1. **Client makes request** to `/api/stats`
2. **Edge function receives request** (no credentials exposed)
3. **Edge function uses env vars** to connect to Supabase
4. **Supabase responds** to edge function
5. **Edge function returns** sanitized response to client

### What's Visible in DevTools

```
Network Tab:
✅ POST /api/stats         → 200 OK (increment)
✅ GET  /api/stats         → 200 OK (fetch)
✅ GET  /api/stats/stream  → SSE connection

❌ No Supabase URLs visible
❌ No API keys visible
❌ No WebSocket connections to Supabase
```

---

## Cloudflare Pages Functions

### Function: `/api/stats`

Handles stats operations without exposing credentials:

```typescript
// functions/api/stats.ts

// GET - Fetch current stats
// POST - Increment prompt count

// Credentials from Cloudflare environment:
const supabase = createClient(
  env.SUPABASE_URL,              // Never sent to client
  env.SUPABASE_SERVICE_ROLE_KEY  // Never sent to client
);
```

### Function: `/api/stats/stream`

Server-Sent Events for real-time updates:

```typescript
// functions/api/stats/stream.ts

// Polls Supabase every 3 seconds
// Pushes updates to client via SSE
// Auto-reconnects after 25 seconds (Worker limit)
```

### Setting Up Environment Variables

**In Cloudflare Dashboard:**

1. Go to **Pages** → **Your Project** → **Settings**
2. Click **Environment Variables**
3. Add for **Production**:
   - `SUPABASE_URL` = `https://xxx.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIs...`

⚠️ **Use SERVICE_ROLE_KEY, not anon key** - Server-side only!

### Why Service Role Key is Safe Here

```
┌─────────────────────────────────────────────────────────┐
│ Service Role Key                                         │
├─────────────────────────────────────────────────────────┤
│ ✅ Full access to Supabase                               │
│ ❌ NEVER expose to client (we don't!)                   │
│ ✅ Only accessible in edge function environment          │
│ ✅ Edge function controls what operations are allowed    │
│ ✅ RPC function limits operations to +1 increment        │
└─────────────────────────────────────────────────────────┘
```

---

## API Key Protection

### Encryption Implementation

API keys are protected using the Web Crypto API with AES-256-GCM:

```typescript
// src/lib/secureStorage.ts

// Key Derivation
- PBKDF2 with 100,000 iterations
- Browser fingerprint + stored salt as key material
- Separate keys for encryption and HMAC

// Encryption
- AES-256-GCM (Authenticated Encryption)
- Random 96-bit IV per encryption
- Automatic key rotation (30 days)
```

### Usage

```typescript
import { secureStorage } from '@/lib/secureStorage';

// Store API key (encrypted)
await secureStorage.setItem('api_key', myApiKey, 24 * 60 * 60 * 1000); // 24h TTL

// Retrieve (auto-decrypts, returns null if expired/tampered)
const key = await secureStorage.getItem<string>('api_key');

// Clear all sensitive data
secureStorage.clearSensitiveData();
```

### API Key Validation

```typescript
import { sanitizeApiKey, isValidApiKeyFormat } from '@/lib/sanitize';

// Sanitize before storage
const cleanKey = sanitizeApiKey(userInput, 'openai');

// Validate format
if (!isValidApiKeyFormat(key, 'openai')) {
  showError('Invalid API key format');
}
```

---

## Input Sanitization

All user inputs are sanitized before storage or use:

### Sanitization Functions

| Function | Purpose |
|----------|---------|
| `sanitizeInput()` | General user input - removes XSS, limits length |
| `sanitizeApiKey()` | API keys - validates format, removes whitespace |
| `sanitizeUrl()` | URLs - HTTPS only, domain whitelist |
| `sanitizeModelName()` | Model names - alphanumeric only |
| `sanitizeForStorage()` | Recursively sanitizes objects |

### XSS Prevention

```typescript
// Removes dangerous content:
- <script> tags and content
- on* event handlers (onclick, onerror, etc.)
- javascript: and data: URLs
- expression() CSS hack
- iframe, object, embed, form, meta, link, style tags
- Null bytes and control characters
```

### Usage Example

```typescript
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize';

// Before storing user input
const cleanInput = sanitizeInput(userInput, INPUT_LIMITS.USER_INPUT);
await addToHistory({
  userInput: cleanInput,
  // ... other fields
});
```

---

## Content Security Policy

CSP is configured in `index.html` to restrict what resources can be loaded:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' 
    https://api.openai.com 
    https://generativelanguage.googleapis.com 
    https://openrouter.ai 
    https://api.groq.com
    https://*.supabase.co
    wss://*.supabase.co;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
" />
```

### CSP Directives Explained

| Directive | Setting | Purpose |
|-----------|---------|---------|
| `default-src` | 'self' | Only load resources from same origin |
| `connect-src` | Whitelist | Only allow API calls to known AI providers |
| `frame-ancestors` | 'none' | Prevent clickjacking |
| `object-src` | 'none' | Block Flash/plugins |
| `upgrade-insecure-requests` | enabled | Force HTTPS |

### For Production Deployment

Configure these as HTTP headers (stronger than meta tag):

**Vercel (`vercel.json`):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**Nginx:**
```nginx
add_header Content-Security-Policy "default-src 'self'; ..." always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
```

---

## Data Integrity

All stored data includes HMAC verification to detect tampering:

```typescript
// Structure of encrypted data
interface EncryptedEnvelope {
  v: number;      // Version
  iv: string;     // Initialization vector
  data: string;   // Encrypted data
  hmac: string;   // HMAC signature for integrity
  ts: number;     // Timestamp
  exp?: number;   // Expiry time
}
```

### Verification Process

1. Before decryption, HMAC is verified
2. If HMAC doesn't match, data is rejected (possible tampering)
3. Console warning is logged for security monitoring

---

## Storage TTL & Expiry

### Automatic Expiration

| Data Type | TTL | Favorites |
|-----------|-----|-----------|
| API Keys | 24 hours | N/A |
| History Items | 30 days | Never expire |
| Encryption Salt | 30 days (rotation) | N/A |

### Inactivity Timeout

```typescript
// SecureStorage auto-clears after 30 minutes of inactivity
const storage = SecureStorage.getInstance(
  30,  // minutes of inactivity
  ['promptgen_api_keys']  // keys to clear
);
```

### Manual Cleanup

```typescript
// Clear all API keys
clearAllSensitiveData();

// Clear non-favorite history
clearNonFavorites();

// Clear everything
secureStorage.clearAll();
```

---

## Security Limitations

### ⚠️ Important Disclaimers

**This is client-side security, which has inherent limitations:**

1. **XSS Vulnerability**: If an attacker can execute JavaScript in the browser, they can potentially access decrypted data when it's in use.

2. **Key Derivation**: The encryption key is derived from browser fingerprint, which is not a secret. This provides defense-in-depth, not absolute security.

3. **No Server = No Revocation**: API keys stored client-side cannot be remotely revoked.

4. **localStorage Persistence**: Data persists across browser sessions unless manually cleared.

### Recommendations for Sensitive Use Cases

For highly sensitive applications, consider:

1. **Backend Token Exchange**: Store API keys on a secure backend, issue short-lived tokens
2. **OAuth Integration**: Use provider OAuth flows instead of raw API keys
3. **Environment Variables**: For development, use `.env` files (not committed to git)
4. **Key Rotation**: Regularly rotate API keys with providers
5. **Usage Monitoring**: Monitor API key usage on provider dashboards

---

## Security Checklist

### Before Deploying

- [ ] Remove any hardcoded API keys from source code
- [ ] Enable HTTPS (required for Web Crypto API)
- [ ] Configure CSP as HTTP headers (not just meta tag)
- [ ] Test CSP with browser DevTools
- [ ] Review `connect-src` whitelist for custom endpoints
- [ ] Set appropriate TTL values for your use case

### Ongoing Security

- [ ] Monitor for CSP violations (use `report-uri`)
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Review browser console for security warnings
- [ ] Periodically rotate encryption salt
- [ ] Check for leaked API keys in logs

### User Education

- [ ] Warn users not to paste API keys in public
- [ ] Provide "clear all data" option in settings
- [ ] Explain data storage in privacy policy
- [ ] Show security status indicator (encryption available)

---

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to [your-security-email]
3. Include detailed reproduction steps
4. Allow 90 days for fix before public disclosure

---

## Security Audit Log

| Date | Version | Change | Auditor |
|------|---------|--------|---------|
| 2024-XX-XX | 1.0.0 | Initial security implementation | Claude |

---

## Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
