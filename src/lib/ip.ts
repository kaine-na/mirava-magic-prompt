/**
 * IP Safety Module - Central Export
 * 
 * This module exports all IP safety related functionality:
 * - System prompt instructions (Layer 1)
 * - Post-generation sanitizer (Layer 2)
 * - Blocklist data (Layer 3)
 * 
 * @module ip
 * 
 * @example
 * ```typescript
 * // Import everything
 * import { 
 *   IP_SAFETY_INSTRUCTIONS,
 *   sanitizePromptForIP,
 *   IP_BLOCKLIST 
 * } from './ip';
 * 
 * // Use in system prompt
 * const systemPrompt = `You are an assistant. ${IP_SAFETY_INSTRUCTIONS}`;
 * 
 * // Sanitize generated output
 * const cleanPrompt = sanitizePromptForIP(generatedPrompt);
 * ```
 */

// Layer 1: System Prompt Instructions
export {
  IP_SAFETY_INSTRUCTIONS,
  IP_SAFETY_INSTRUCTIONS_COMPACT,
  IP_SAFETY_INSTRUCTIONS_MINIMAL,
  getIPSafetyInstructions,
  IP_SAFETY_BY_CATEGORY,
  buildCustomIPInstructions,
} from './ipSafety';

// Layer 2: Post-Generation Sanitizer
export {
  sanitizePromptForIP,
  sanitizePromptForIPSimple,
  checkForIPTerms,
  getIPSanitizationSummary,
  batchSanitizePrompts,
  IPSanitizationStats,
  ipSanitizationStats,
} from './ipSanitizer';

// Export types from sanitizer
export type {
  IPSanitizationResult,
  IPReplacement,
  IPSanitizeOptions,
} from './ipSanitizer';

// Layer 3: Blocklist Data
export {
  IP_BLOCKLIST,
  getBlocklistByCategory,
  getBlocklistStats,
  searchBlocklist,
  createExtendedBlocklist,
} from './ipBlocklist';

// Export types from blocklist
export type {
  IPCategory,
  IPBlocklistEntry,
} from './ipBlocklist';
