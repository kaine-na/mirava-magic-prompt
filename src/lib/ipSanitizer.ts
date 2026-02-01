/**
 * IP Sanitization Module
 * 
 * This module provides post-generation filtering to catch and replace
 * any IP-infringing terms that slip through the AI's generation.
 * 
 * @module ipSanitizer
 */

import { IP_BLOCKLIST, IPBlocklistEntry, IPCategory } from './ipBlocklist';

/**
 * Result of IP sanitization
 */
export interface IPSanitizationResult {
  /** The sanitized prompt with IP terms replaced */
  sanitizedPrompt: string;
  /** Whether any IP terms were found and replaced */
  wasModified: boolean;
  /** List of replacements made */
  replacements: IPReplacement[];
  /** Categories of IP found */
  categoriesFound: IPCategory[];
}

/**
 * Single replacement made during sanitization
 */
export interface IPReplacement {
  /** The original term that was found */
  original: string;
  /** The replacement text used */
  replacement: string;
  /** Category of the IP term */
  category: IPCategory;
  /** Position in the original string where the term was found */
  position: number;
}

/**
 * Configuration options for IP sanitization
 */
export interface IPSanitizeOptions {
  /** Whether to log replacements (for monitoring) */
  logReplacements?: boolean;
  /** Callback for each replacement (for analytics) */
  onReplacement?: (replacement: IPReplacement) => void;
  /** Additional custom blocklist entries */
  customBlocklist?: IPBlocklistEntry[];
  /** Categories to skip (for specific use cases) */
  skipCategories?: IPCategory[];
  /** Whether to use case-sensitive matching (default: false) */
  caseSensitive?: boolean;
}

/**
 * Sanitizes a prompt by detecting and replacing IP-infringing terms.
 * 
 * This function scans the generated prompt against a blocklist of
 * copyrighted characters, celebrity names, brand names, artist names,
 * and franchise names, replacing them with generic alternatives.
 * 
 * @param prompt - The generated prompt to sanitize
 * @param options - Configuration options
 * @returns Sanitization result with cleaned prompt and metadata
 * 
 * @example
 * ```typescript
 * const result = sanitizePromptForIP("Spider-Man swinging through New York");
 * console.log(result.sanitizedPrompt);
 * // "web-slinging superhero in red and blue suit swinging through New York"
 * ```
 * 
 * @example
 * ```typescript
 * // With logging enabled
 * const result = sanitizePromptForIP(prompt, {
 *   logReplacements: true,
 *   onReplacement: (rep) => analytics.track('ip_replacement', rep)
 * });
 * ```
 */
export function sanitizePromptForIP(
  prompt: string,
  options: IPSanitizeOptions = {}
): IPSanitizationResult {
  const {
    logReplacements = false,
    onReplacement,
    customBlocklist = [],
    skipCategories = [],
    caseSensitive = false,
  } = options;

  // Handle empty or invalid input
  if (!prompt || typeof prompt !== 'string') {
    return {
      sanitizedPrompt: prompt || '',
      wasModified: false,
      replacements: [],
      categoriesFound: [],
    };
  }

  // Combine default blocklist with custom entries
  const blocklist = [...IP_BLOCKLIST, ...customBlocklist];
  
  // Filter out skipped categories
  const activeBlocklist = blocklist.filter(
    entry => !skipCategories.includes(entry.category)
  );

  let sanitizedPrompt = prompt;
  const replacements: IPReplacement[] = [];
  const categoriesFound = new Set<IPCategory>();

  // Sort by term length (longest first) to handle overlapping terms
  // This ensures "Spider-Man" is matched before "Spider" or "Man"
  const sortedBlocklist = [...activeBlocklist].sort((a, b) => {
    const lenA = typeof a.term === 'string' ? a.term.length : a.term.source.length;
    const lenB = typeof b.term === 'string' ? b.term.length : b.term.source.length;
    return lenB - lenA;
  });

  for (const entry of sortedBlocklist) {
    const { term, replacement, category } = entry;
    
    let regex: RegExp;
    const flags = caseSensitive ? 'g' : 'gi';
    
    if (term instanceof RegExp) {
      // Clone regex with appropriate flags
      regex = new RegExp(term.source, flags);
    } else {
      // Create word-boundary regex for string terms
      // Escape special regex characters
      const escaped = escapeRegExp(term);
      regex = new RegExp(`\\b${escaped}\\b`, flags);
    }

    // Find all matches before replacing
    const matches: Array<{ match: string; index: number }> = [];
    let match: RegExpExecArray | null;
    
    // Reset regex lastIndex
    regex.lastIndex = 0;
    
    // We need to work on a copy to track original positions
    const originalForMatching = sanitizedPrompt;
    
    while ((match = regex.exec(originalForMatching)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
      });
      
      // Prevent infinite loops with zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }

    if (matches.length > 0) {
      // Perform the replacement
      sanitizedPrompt = sanitizedPrompt.replace(regex, replacement);
      categoriesFound.add(category);

      // Record replacements
      for (const m of matches) {
        const rep: IPReplacement = {
          original: m.match,
          replacement,
          category,
          position: m.index,
        };
        replacements.push(rep);
        
        if (onReplacement) {
          onReplacement(rep);
        }
      }

      if (logReplacements) {
        const termStr = typeof term === 'string' ? term : term.source;
        console.log(
          `[IP Sanitizer] Replaced "${termStr}" with "${replacement}" ` +
          `(${category}) - ${matches.length} occurrence(s)`
        );
      }
    }
  }

  return {
    sanitizedPrompt,
    wasModified: replacements.length > 0,
    replacements,
    categoriesFound: Array.from(categoriesFound),
  };
}

/**
 * Simple version that just returns the sanitized string
 * 
 * Use this when you don't need the detailed replacement information.
 * 
 * @param prompt - The generated prompt to sanitize
 * @returns The sanitized prompt string
 * 
 * @example
 * ```typescript
 * const cleanPrompt = sanitizePromptForIPSimple("Batman standing on rooftop");
 * // "dark vigilante hero with cape and pointed cowl standing on rooftop"
 * ```
 */
export function sanitizePromptForIPSimple(prompt: string): string {
  return sanitizePromptForIP(prompt).sanitizedPrompt;
}

/**
 * Check if a prompt contains potential IP terms without replacing
 * 
 * Use this for validation or preview purposes.
 * 
 * @param prompt - The prompt to check
 * @returns Object containing whether IP was found, which terms, and categories
 * 
 * @example
 * ```typescript
 * const check = checkForIPTerms("Create an image of Pikachu");
 * if (check.hasIPTerms) {
 *   console.warn('Found IP terms:', check.terms);
 * }
 * ```
 */
export function checkForIPTerms(prompt: string): {
  hasIPTerms: boolean;
  terms: string[];
  categories: IPCategory[];
} {
  const result = sanitizePromptForIP(prompt);
  return {
    hasIPTerms: result.wasModified,
    terms: result.replacements.map(r => r.original),
    categories: result.categoriesFound,
  };
}

/**
 * Get a summary of what would be sanitized
 * 
 * @param prompt - The prompt to analyze
 * @returns Human-readable summary of IP terms found
 */
export function getIPSanitizationSummary(prompt: string): string {
  const result = sanitizePromptForIP(prompt);
  
  if (!result.wasModified) {
    return 'No IP terms detected.';
  }
  
  const byCategory = result.replacements.reduce((acc, rep) => {
    if (!acc[rep.category]) {
      acc[rep.category] = [];
    }
    acc[rep.category].push(rep.original);
    return acc;
  }, {} as Record<string, string[]>);
  
  const lines = Object.entries(byCategory).map(([category, terms]) => {
    const uniqueTerms = [...new Set(terms)];
    return `- ${category}: ${uniqueTerms.join(', ')}`;
  });
  
  return `Found ${result.replacements.length} IP term(s):\n${lines.join('\n')}`;
}

/**
 * Batch sanitize multiple prompts
 * 
 * @param prompts - Array of prompts to sanitize
 * @param options - Sanitization options
 * @returns Array of sanitization results
 */
export function batchSanitizePrompts(
  prompts: string[],
  options: IPSanitizeOptions = {}
): IPSanitizationResult[] {
  return prompts.map(prompt => sanitizePromptForIP(prompt, options));
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Stats collector for monitoring IP sanitization
 */
export class IPSanitizationStats {
  private totalChecked = 0;
  private totalModified = 0;
  private replacementsByCategory: Record<string, number> = {};
  private topTerms: Map<string, number> = new Map();

  /**
   * Record a sanitization result
   */
  record(result: IPSanitizationResult): void {
    this.totalChecked++;
    if (result.wasModified) {
      this.totalModified++;
    }
    
    for (const rep of result.replacements) {
      this.replacementsByCategory[rep.category] = 
        (this.replacementsByCategory[rep.category] || 0) + 1;
      
      const count = this.topTerms.get(rep.original) || 0;
      this.topTerms.set(rep.original, count + 1);
    }
  }

  /**
   * Get summary statistics
   */
  getStats(): {
    totalChecked: number;
    totalModified: number;
    modificationRate: number;
    replacementsByCategory: Record<string, number>;
    topTerms: Array<{ term: string; count: number }>;
  } {
    const topTermsArray = Array.from(this.topTerms.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalChecked: this.totalChecked,
      totalModified: this.totalModified,
      modificationRate: this.totalChecked > 0 
        ? this.totalModified / this.totalChecked 
        : 0,
      replacementsByCategory: { ...this.replacementsByCategory },
      topTerms: topTermsArray,
    };
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.totalChecked = 0;
    this.totalModified = 0;
    this.replacementsByCategory = {};
    this.topTerms.clear();
  }
}

// Export a singleton stats collector
export const ipSanitizationStats = new IPSanitizationStats();
