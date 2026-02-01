# IP-Safe Prompt Generation System Architecture

## Overview

This document describes the architecture for an Intellectual Property (IP) safe prompt generation system for the PromptGen application. The system ensures that generated prompts do not contain copyrighted, trademarked, or otherwise protected content through a multi-layered defense approach.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER INPUT                                           │
│                    "superhero in red and blue"                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: PRE-GENERATION DEFENSE                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │               System Prompt IP Instructions                          │    │
│  │  • Never use real celebrity names                                    │    │
│  │  • Never use copyrighted character names                             │    │
│  │  • Never reference specific artists by name                          │    │
│  │  • Never use brand names                                             │    │
│  │  • Use generic descriptions instead                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI MODEL GENERATION                                  │
│                    (OpenAI, Gemini, OpenRouter, etc.)                        │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 2: POST-GENERATION FILTER                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │               sanitizePromptForIP(prompt: string)                    │    │
│  │  • Scans output against IP blocklist                                 │    │
│  │  • Replaces detected IP terms with generic alternatives              │    │
│  │  • Logs flagged content for monitoring                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLEAN PROMPT OUTPUT                                  │
│                    "heroic figure in crimson and azure"                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: System Prompt Instructions

### Purpose
Instruct the AI model to proactively avoid generating IP-infringing content before it's created.

### Location
`src/lib/generatePrompt.ts` - Inject into the system prompt message.

### Design: IP Safety Instructions Block

```typescript
// src/lib/ipSafety.ts

/**
 * IP Safety Instructions for System Prompt
 * 
 * These instructions are injected into the system prompt to instruct
 * the AI to avoid generating content that infringes on intellectual property.
 */
export const IP_SAFETY_INSTRUCTIONS = `
INTELLECTUAL PROPERTY SAFETY RULES (MANDATORY - NEVER VIOLATE):

You MUST follow these IP safety rules when generating prompts:

1. NEVER USE REAL CELEBRITY NAMES:
   - Do not mention real actors, musicians, athletes, or public figures
   - Instead use: "person with [physical description]", "figure resembling a [profession]"
   - Example: "Taylor Swift" → "blonde female pop singer", "performer with guitar"

2. NEVER USE COPYRIGHTED CHARACTER NAMES:
   - Do not use names from movies, TV shows, comics, games, or books
   - Instead use generic archetypes with distinctive features
   - Examples:
     • "Spider-Man" → "web-slinging superhero in red and blue suit with web pattern"
     • "Batman" → "dark vigilante hero with cape and pointed cowl"
     • "Pikachu" → "small yellow electric rodent creature with red cheeks"
     • "Mario" → "mustached plumber in red cap and overalls"
     • "Darth Vader" → "dark armored villain with black helmet and cape"
     • "Harry Potter" → "young wizard with glasses and lightning-shaped scar"
     • "Elsa" → "ice princess with blonde braid and blue gown"

3. NEVER REFERENCE SPECIFIC ARTISTS BY NAME:
   - Do not use "in the style of [Artist Name]" for living or recent artists
   - Instead describe the artistic STYLE without naming the artist
   - Examples:
     • "Greg Rutkowski style" → "fantasy digital art with dramatic lighting and rich colors"
     • "Artgerm style" → "polished digital illustration with vibrant colors and clean lines"
     • "Studio Ghibli" → "soft watercolor anime style with pastoral themes"
   - EXCEPTION: Historical artists (pre-1950 death) may be referenced:
     • Acceptable: "Van Gogh style", "Monet impressionism", "Rembrandt lighting"

4. NEVER USE BRAND NAMES OR TRADEMARKS:
   - Do not mention specific companies, products, or trademarked terms
   - Examples:
     • "Nike shoes" → "athletic sneakers with swoosh design"
     • "iPhone" → "modern smartphone with slim bezels"
     • "Ferrari" → "Italian sports car in red"
     • "Coca-Cola" → "classic cola drink in curved bottle"
     • "McDonald's" → "fast food restaurant with golden arches"

5. NEVER REFERENCE SPECIFIC FRANCHISES BY NAME:
   - Do not use franchise names from entertainment properties
   - Examples:
     • "Star Wars" → "space opera with laser swords and galactic conflict"
     • "Marvel" → "comic book superhero style"
     • "Disney" → "family-friendly animated style"
     • "Pokemon" → "collectible creature battle game aesthetic"
     • "Minecraft" → "voxel block-based world"

6. USE GENERIC DESCRIPTIONS ALWAYS:
   - Describe visual characteristics, not identities
   - Focus on: colors, shapes, clothing, poses, expressions, environments
   - Be creative with descriptive alternatives that capture the essence

REMEMBER: Generate prompts that describe WHAT something looks like, not WHO or WHAT specific IP it represents.
`;

/**
 * Compact version for models with shorter context windows
 */
export const IP_SAFETY_INSTRUCTIONS_COMPACT = `
IP SAFETY (MANDATORY):
- NO real celebrity names → use "person with [description]"
- NO copyrighted characters → use visual archetypes with features
- NO living artist names → describe style without attribution
- NO brand/trademark names → use generic product descriptions
- NO franchise names → describe aesthetics without naming
ALWAYS use generic visual descriptions instead of specific identities.
`;
```

### Integration Point

Modify `generateSinglePrompt()` in `src/lib/generatePrompt.ts`:

```typescript
import { IP_SAFETY_INSTRUCTIONS } from './ipSafety';

// In the system message content:
content: `You are an expert prompt engineer...
${IP_SAFETY_INSTRUCTIONS}

ABSOLUTE OUTPUT RULES - FOLLOW EXACTLY:
...
`
```

---

## Layer 2: Post-Generation Filter

### Purpose
Catch and replace any IP terms that slip through the AI's generation, providing a safety net.

### Location
`src/lib/ipSanitizer.ts` - New module for IP sanitization.

### Design: sanitizePromptForIP Function

```typescript
// src/lib/ipSanitizer.ts

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

export interface IPReplacement {
  original: string;
  replacement: string;
  category: IPCategory;
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
  } = options;

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
  const sortedBlocklist = [...activeBlocklist].sort((a, b) => {
    const lenA = typeof a.term === 'string' ? a.term.length : 0;
    const lenB = typeof b.term === 'string' ? b.term.length : 0;
    return lenB - lenA;
  });

  for (const entry of sortedBlocklist) {
    const { term, replacement, category } = entry;
    
    let regex: RegExp;
    if (term instanceof RegExp) {
      // Clone regex with global flag
      regex = new RegExp(term.source, 'gi');
    } else {
      // Create word-boundary regex for string terms
      // Escape special regex characters
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    }

    let match: RegExpExecArray | null;
    const originalPrompt = sanitizedPrompt;
    
    // Find all matches before replacing
    const matches: RegExpExecArray[] = [];
    while ((match = regex.exec(originalPrompt)) !== null) {
      matches.push({ ...match } as RegExpExecArray);
    }

    if (matches.length > 0) {
      // Replace all occurrences
      sanitizedPrompt = sanitizedPrompt.replace(regex, replacement);
      categoriesFound.add(category);

      // Record replacements
      for (const m of matches) {
        const rep: IPReplacement = {
          original: m[0],
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
        console.log(`[IP Sanitizer] Replaced "${term}" with "${replacement}" (${category})`);
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
 */
export function sanitizePromptForIPSimple(prompt: string): string {
  return sanitizePromptForIP(prompt).sanitizedPrompt;
}

/**
 * Check if a prompt contains potential IP terms without replacing
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
```

### Integration Point

Modify `parsePrompt()` in `src/lib/generatePrompt.ts`:

```typescript
import { sanitizePromptForIPSimple } from './ipSanitizer';

function parsePrompt(text: string): string {
  // ... existing cleaning logic ...
  
  // Final IP sanitization pass
  cleaned = sanitizePromptForIPSimple(cleaned);
  
  return cleaned;
}
```

---

## Layer 3: Blocklist Data Structure

### Purpose
Maintain a comprehensive, categorized, and easily extensible database of IP terms and their generic replacements.

### Location
`src/lib/ipBlocklist.ts` - Centralized blocklist data.

### Design: IPBlocklistEntry Interface and Data

```typescript
// src/lib/ipBlocklist.ts

/**
 * Categories of intellectual property
 */
export type IPCategory = 
  | 'character'    // Fictional characters from any media
  | 'brand'        // Company names, product names, trademarks
  | 'celebrity'    // Real people (actors, musicians, athletes, etc.)
  | 'artist'       // Artists, photographers, illustrators
  | 'franchise'    // Entertainment franchises and universes
  | 'game'         // Video game specific IP
  | 'anime'        // Anime/manga specific IP
  | 'music';       // Music artists and bands

/**
 * Single entry in the IP blocklist
 */
export interface IPBlocklistEntry {
  /** The term to detect (string for exact match, RegExp for patterns) */
  term: string | RegExp;
  /** The generic replacement text */
  replacement: string;
  /** Category of IP for filtering and analytics */
  category: IPCategory;
  /** Optional: Related terms or aliases */
  aliases?: string[];
  /** Optional: Notes about this entry */
  notes?: string;
}

/**
 * Comprehensive IP Blocklist
 * 
 * Organization:
 * - Sorted by category
 * - Within category, sorted alphabetically
 * - Includes common variations and misspellings
 */
export const IP_BLOCKLIST: readonly IPBlocklistEntry[] = Object.freeze([
  // ============================================================
  // CHARACTERS - Superheroes (DC)
  // ============================================================
  {
    term: 'Batman',
    replacement: 'dark vigilante hero with cape and pointed cowl',
    category: 'character',
    aliases: ['The Batman', 'Dark Knight', 'Bruce Wayne', 'Bat-Man'],
  },
  {
    term: 'Dark Knight',
    replacement: 'dark vigilante hero with cape and pointed cowl',
    category: 'character',
  },
  {
    term: 'Bruce Wayne',
    replacement: 'wealthy dark-haired businessman',
    category: 'character',
  },
  {
    term: 'Superman',
    replacement: 'powerful flying hero in blue suit with red cape',
    category: 'character',
    aliases: ['Clark Kent', 'Man of Steel', 'Kal-El'],
  },
  {
    term: 'Wonder Woman',
    replacement: 'amazonian warrior princess with tiara and lasso',
    category: 'character',
    aliases: ['Diana Prince'],
  },
  {
    term: 'Joker',
    replacement: 'maniacal clown villain with green hair and white face',
    category: 'character',
  },
  {
    term: 'Harley Quinn',
    replacement: 'acrobatic villain in red and black harlequin costume',
    category: 'character',
  },
  {
    term: 'Aquaman',
    replacement: 'underwater king with trident and scaled armor',
    category: 'character',
  },
  {
    term: 'Flash',
    replacement: 'speedster hero in red suit with lightning bolt emblem',
    category: 'character',
  },
  {
    term: 'Green Lantern',
    replacement: 'cosmic hero with glowing green power ring',
    category: 'character',
  },
  {
    term: 'Catwoman',
    replacement: 'agile thief in black cat-themed bodysuit',
    category: 'character',
    aliases: ['Selina Kyle'],
  },

  // ============================================================
  // CHARACTERS - Superheroes (Marvel)
  // ============================================================
  {
    term: 'Spider-Man',
    replacement: 'web-slinging superhero in red and blue suit with web pattern',
    category: 'character',
    aliases: ['Spiderman', 'Spider Man', 'Peter Parker', 'Miles Morales'],
  },
  {
    term: 'Iron Man',
    replacement: 'armored tech hero in red and gold powered suit',
    category: 'character',
    aliases: ['Ironman', 'Tony Stark'],
  },
  {
    term: 'Captain America',
    replacement: 'patriotic super soldier with round shield and star emblem',
    category: 'character',
    aliases: ['Steve Rogers', 'Cap'],
  },
  {
    term: 'Thor',
    replacement: 'norse thunder god with hammer and flowing cape',
    category: 'character',
  },
  {
    term: 'Hulk',
    replacement: 'massive green-skinned muscular giant',
    category: 'character',
    aliases: ['Bruce Banner', 'Incredible Hulk'],
  },
  {
    term: 'Black Widow',
    replacement: 'skilled spy in black tactical suit',
    category: 'character',
    aliases: ['Natasha Romanoff'],
  },
  {
    term: 'Wolverine',
    replacement: 'feral mutant with metal claws and yellow suit',
    category: 'character',
    aliases: ['Logan'],
  },
  {
    term: 'Deadpool',
    replacement: 'wisecracking mercenary in red and black suit with katanas',
    category: 'character',
    aliases: ['Wade Wilson', 'Merc with a Mouth'],
  },
  {
    term: 'Thanos',
    replacement: 'purple-skinned cosmic titan with golden gauntlet',
    category: 'character',
  },
  {
    term: 'Black Panther',
    replacement: 'agile warrior king in sleek black vibranium suit',
    category: 'character',
    aliases: ["T'Challa"],
  },
  {
    term: 'Doctor Strange',
    replacement: 'sorcerer supreme with red cloak and mystical arts',
    category: 'character',
    aliases: ['Dr. Strange', 'Stephen Strange'],
  },
  {
    term: 'Scarlet Witch',
    replacement: 'powerful sorceress with red magic and headdress',
    category: 'character',
    aliases: ['Wanda Maximoff'],
  },
  {
    term: 'Venom',
    replacement: 'black symbiote creature with white spider symbol and fangs',
    category: 'character',
  },
  {
    term: 'Groot',
    replacement: 'sentient tree creature',
    category: 'character',
  },
  {
    term: 'Rocket Raccoon',
    replacement: 'anthropomorphic raccoon with weapons',
    category: 'character',
  },

  // ============================================================
  // CHARACTERS - Star Wars
  // ============================================================
  {
    term: 'Darth Vader',
    replacement: 'dark armored villain with black helmet, mask, and cape',
    category: 'character',
    aliases: ['Vader', 'Anakin Skywalker'],
  },
  {
    term: 'Luke Skywalker',
    replacement: 'young hero with laser sword in robes',
    category: 'character',
  },
  {
    term: 'Yoda',
    replacement: 'small green elderly alien sage with pointed ears',
    category: 'character',
    aliases: ['Baby Yoda', 'Grogu'],
  },
  {
    term: 'Obi-Wan Kenobi',
    replacement: 'bearded warrior monk with laser sword',
    category: 'character',
    aliases: ['Obi Wan', 'Kenobi'],
  },
  {
    term: 'Princess Leia',
    replacement: 'royal leader with iconic hair buns in white gown',
    category: 'character',
    aliases: ['Leia Organa'],
  },
  {
    term: 'Han Solo',
    replacement: 'roguish smuggler pilot with blaster',
    category: 'character',
  },
  {
    term: 'Chewbacca',
    replacement: 'tall furry alien co-pilot with bandolier',
    category: 'character',
    aliases: ['Chewie'],
  },
  {
    term: 'Stormtrooper',
    replacement: 'soldier in white plastic armor and helmet',
    category: 'character',
  },
  {
    term: 'R2-D2',
    replacement: 'small cylindrical blue and white robot',
    category: 'character',
    aliases: ['R2D2', 'Artoo'],
  },
  {
    term: 'C-3PO',
    replacement: 'golden humanoid protocol robot',
    category: 'character',
    aliases: ['C3PO', 'Threepio'],
  },
  {
    term: 'Kylo Ren',
    replacement: 'dark warrior with crossguard laser sword and mask',
    category: 'character',
  },
  {
    term: 'The Mandalorian',
    replacement: 'armored bounty hunter with T-visor helmet',
    category: 'character',
    aliases: ['Mando', 'Din Djarin'],
  },

  // ============================================================
  // CHARACTERS - Disney Animated
  // ============================================================
  {
    term: 'Mickey Mouse',
    replacement: 'cheerful cartoon mouse with round ears and red shorts',
    category: 'character',
    aliases: ['Mickey'],
  },
  {
    term: 'Minnie Mouse',
    replacement: 'female cartoon mouse with polka dot bow and dress',
    category: 'character',
    aliases: ['Minnie'],
  },
  {
    term: 'Donald Duck',
    replacement: 'cartoon duck in sailor suit with blue hat',
    category: 'character',
  },
  {
    term: 'Goofy',
    replacement: 'tall clumsy cartoon dog in casual clothes',
    category: 'character',
  },
  {
    term: 'Elsa',
    replacement: 'ice princess with platinum blonde braid and blue gown',
    category: 'character',
  },
  {
    term: 'Anna',
    replacement: 'cheerful princess with strawberry blonde braids',
    category: 'character',
  },
  {
    term: 'Moana',
    replacement: 'polynesian princess with curly dark hair on ocean voyage',
    category: 'character',
  },
  {
    term: 'Rapunzel',
    replacement: 'princess with extremely long golden magical hair',
    category: 'character',
  },
  {
    term: 'Cinderella',
    replacement: 'princess in blue ball gown with glass slippers',
    category: 'character',
  },
  {
    term: 'Ariel',
    replacement: 'red-haired mermaid princess with purple seashell top',
    category: 'character',
  },
  {
    term: 'Belle',
    replacement: 'brunette princess in golden yellow ball gown',
    category: 'character',
  },
  {
    term: 'Simba',
    replacement: 'young lion cub destined to be king',
    category: 'character',
  },
  {
    term: 'Stitch',
    replacement: 'blue alien creature with large ears and koala-like appearance',
    category: 'character',
  },
  {
    term: 'Olaf',
    replacement: 'cheerful animated snowman with carrot nose',
    category: 'character',
  },
  {
    term: 'Woody',
    replacement: 'cowboy doll with pull-string and sheriff badge',
    category: 'character',
  },
  {
    term: 'Buzz Lightyear',
    replacement: 'space ranger action figure with wings and laser',
    category: 'character',
  },

  // ============================================================
  // CHARACTERS - Video Games (Nintendo)
  // ============================================================
  {
    term: 'Mario',
    replacement: 'italian plumber with red cap, mustache, and overalls',
    category: 'character',
    aliases: ['Super Mario'],
  },
  {
    term: 'Luigi',
    replacement: 'tall green-clad plumber with mustache',
    category: 'character',
  },
  {
    term: 'Princess Peach',
    replacement: 'blonde princess in pink gown with crown',
    category: 'character',
    aliases: ['Peach'],
  },
  {
    term: 'Bowser',
    replacement: 'large spiky-shelled turtle dragon king',
    category: 'character',
  },
  {
    term: 'Link',
    replacement: 'elf-eared hero in green tunic with sword and shield',
    category: 'character',
  },
  {
    term: 'Zelda',
    replacement: 'elven princess with pointed ears and royal attire',
    category: 'character',
    aliases: ['Princess Zelda'],
  },
  {
    term: 'Ganondorf',
    replacement: 'dark lord villain with red hair and armor',
    category: 'character',
    aliases: ['Ganon'],
  },
  {
    term: 'Pikachu',
    replacement: 'small yellow electric rodent with red cheeks and lightning tail',
    category: 'character',
  },
  {
    term: 'Charizard',
    replacement: 'orange fire-breathing dragon with flame tail',
    category: 'character',
  },
  {
    term: 'Eevee',
    replacement: 'fluffy brown fox-like creature with bushy tail',
    category: 'character',
  },
  {
    term: 'Mewtwo',
    replacement: 'powerful psychic humanoid feline creature',
    category: 'character',
  },
  {
    term: 'Samus Aran',
    replacement: 'armored bounty hunter in orange power suit',
    category: 'character',
    aliases: ['Samus'],
  },
  {
    term: 'Kirby',
    replacement: 'round pink puffball creature with cute face',
    category: 'character',
  },
  {
    term: 'Donkey Kong',
    replacement: 'muscular gorilla with red necktie',
    category: 'character',
    aliases: ['DK'],
  },

  // ============================================================
  // CHARACTERS - Video Games (Other)
  // ============================================================
  {
    term: 'Sonic',
    replacement: 'blue anthropomorphic hedgehog with red sneakers',
    category: 'character',
    aliases: ['Sonic the Hedgehog'],
  },
  {
    term: 'Master Chief',
    replacement: 'armored super soldier in green powered armor with visor',
    category: 'character',
  },
  {
    term: 'Kratos',
    replacement: 'muscular bald warrior with red tattoo and chain weapons',
    category: 'character',
  },
  {
    term: 'Lara Croft',
    replacement: 'athletic female adventurer and archaeologist',
    category: 'character',
  },
  {
    term: 'Cloud Strife',
    replacement: 'spiky blonde-haired warrior with massive sword',
    category: 'character',
    aliases: ['Cloud'],
  },
  {
    term: 'Geralt of Rivia',
    replacement: 'white-haired monster hunter with dual swords',
    category: 'character',
    aliases: ['Geralt', 'The Witcher'],
  },
  {
    term: 'Steve',
    replacement: 'blocky voxel character in blue shirt',
    category: 'character',
    notes: 'Minecraft character',
  },
  {
    term: 'Creeper',
    replacement: 'green blocky explosive creature',
    category: 'character',
    notes: 'Minecraft creature',
  },

  // ============================================================
  // CHARACTERS - Anime/Manga
  // ============================================================
  {
    term: 'Goku',
    replacement: 'spiky black-haired martial artist in orange gi',
    category: 'anime',
    aliases: ['Son Goku', 'Kakarot'],
  },
  {
    term: 'Vegeta',
    replacement: 'proud spiky-haired warrior prince in armor',
    category: 'anime',
  },
  {
    term: 'Naruto',
    replacement: 'blonde ninja with whisker marks and orange outfit',
    category: 'anime',
    aliases: ['Naruto Uzumaki'],
  },
  {
    term: 'Sasuke',
    replacement: 'dark-haired ninja with stoic expression',
    category: 'anime',
    aliases: ['Sasuke Uchiha'],
  },
  {
    term: 'Luffy',
    replacement: 'cheerful pirate captain with straw hat',
    category: 'anime',
    aliases: ['Monkey D. Luffy'],
  },
  {
    term: 'Zoro',
    replacement: 'green-haired swordsman with three katanas',
    category: 'anime',
    aliases: ['Roronoa Zoro'],
  },
  {
    term: 'Tanjiro',
    replacement: 'kind-hearted demon slayer with checkered haori',
    category: 'anime',
    aliases: ['Tanjiro Kamado'],
  },
  {
    term: 'Nezuko',
    replacement: 'demon girl with bamboo muzzle and pink kimono',
    category: 'anime',
  },
  {
    term: 'Eren',
    replacement: 'determined soldier with titan-shifting powers',
    category: 'anime',
    aliases: ['Eren Yeager', 'Eren Jaeger'],
  },
  {
    term: 'Mikasa',
    replacement: 'skilled female soldier with red scarf',
    category: 'anime',
    aliases: ['Mikasa Ackerman'],
  },
  {
    term: 'Sailor Moon',
    replacement: 'magical girl with blonde odango hairstyle and sailor uniform',
    category: 'anime',
    aliases: ['Usagi Tsukino'],
  },
  {
    term: 'Totoro',
    replacement: 'large fluffy forest spirit with round belly and umbrella',
    category: 'anime',
  },
  {
    term: 'Spirited Away',
    replacement: 'mystical Japanese bathhouse fantasy',
    category: 'franchise',
    notes: 'Film title rather than character',
  },

  // ============================================================
  // CHARACTERS - Harry Potter
  // ============================================================
  {
    term: 'Harry Potter',
    replacement: 'young wizard with round glasses, dark messy hair, and lightning scar',
    category: 'character',
  },
  {
    term: 'Hermione',
    replacement: 'bushy-haired clever witch with wand',
    category: 'character',
    aliases: ['Hermione Granger'],
  },
  {
    term: 'Ron Weasley',
    replacement: 'tall red-haired wizard with freckles',
    category: 'character',
  },
  {
    term: 'Dumbledore',
    replacement: 'elderly wizard with long white beard and half-moon glasses',
    category: 'character',
    aliases: ['Albus Dumbledore'],
  },
  {
    term: 'Voldemort',
    replacement: 'pale snake-like dark wizard with no nose',
    category: 'character',
    aliases: ['Tom Riddle', 'He Who Must Not Be Named'],
  },
  {
    term: 'Snape',
    replacement: 'dark-haired wizard professor with hooked nose and black robes',
    category: 'character',
    aliases: ['Severus Snape'],
  },
  {
    term: 'Hogwarts',
    replacement: 'magical castle school for wizards',
    category: 'franchise',
  },

  // ============================================================
  // CHARACTERS - Lord of the Rings
  // ============================================================
  {
    term: 'Gandalf',
    replacement: 'elderly wizard with long grey beard, staff, and pointed hat',
    category: 'character',
  },
  {
    term: 'Frodo',
    replacement: 'small curly-haired halfling carrying a powerful ring',
    category: 'character',
    aliases: ['Frodo Baggins'],
  },
  {
    term: 'Legolas',
    replacement: 'blonde elven archer with long hair and bow',
    category: 'character',
  },
  {
    term: 'Aragorn',
    replacement: 'rugged ranger and rightful king with sword',
    category: 'character',
  },
  {
    term: 'Gollum',
    replacement: 'emaciated grey creature obsessed with a ring',
    category: 'character',
    aliases: ['Smeagol'],
  },
  {
    term: 'Sauron',
    replacement: 'dark lord with flaming eye atop a tower',
    category: 'character',
  },

  // ============================================================
  // CELEBRITIES - Actors
  // ============================================================
  {
    term: /\b(Keanu\s*Reeves|Reeves)\b/i,
    replacement: 'dark-haired male actor with kind demeanor',
    category: 'celebrity',
  },
  {
    term: /\b(Tom\s*Cruise)\b/i,
    replacement: 'charismatic male action star',
    category: 'celebrity',
  },
  {
    term: /\b(Dwayne\s*Johnson|The\s*Rock)\b/i,
    replacement: 'muscular bald male actor',
    category: 'celebrity',
  },
  {
    term: /\b(Scarlett\s*Johansson)\b/i,
    replacement: 'blonde female actress',
    category: 'celebrity',
  },
  {
    term: /\b(Robert\s*Downey\s*Jr\.?)\b/i,
    replacement: 'charismatic male actor with goatee',
    category: 'celebrity',
  },
  {
    term: /\b(Chris\s*Hemsworth)\b/i,
    replacement: 'tall blonde muscular male actor',
    category: 'celebrity',
  },
  {
    term: /\b(Margot\s*Robbie)\b/i,
    replacement: 'blonde australian actress',
    category: 'celebrity',
  },
  {
    term: /\b(Leonardo\s*DiCaprio)\b/i,
    replacement: 'acclaimed male actor',
    category: 'celebrity',
  },
  {
    term: /\b(Brad\s*Pitt)\b/i,
    replacement: 'handsome blonde male actor',
    category: 'celebrity',
  },
  {
    term: /\b(Angelina\s*Jolie)\b/i,
    replacement: 'elegant female actress with full lips',
    category: 'celebrity',
  },
  {
    term: /\b(Jennifer\s*Lawrence)\b/i,
    replacement: 'blonde female actress',
    category: 'celebrity',
  },
  {
    term: /\b(Timoth[ée|ee]\s*Chalamet)\b/i,
    replacement: 'young dark-haired male actor with defined features',
    category: 'celebrity',
  },
  {
    term: /\b(Zendaya)\b/i,
    replacement: 'young female actress with elegant features',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Musicians
  // ============================================================
  {
    term: /\b(Taylor\s*Swift)\b/i,
    replacement: 'blonde female pop singer with red lips',
    category: 'celebrity',
  },
  {
    term: /\b(Beyonc[ée|e])\b/i,
    replacement: 'powerful female R&B singer',
    category: 'celebrity',
  },
  {
    term: /\b(Drake)\b/i,
    replacement: 'male hip hop artist with beard',
    category: 'celebrity',
  },
  {
    term: /\b(Rihanna)\b/i,
    replacement: 'stylish female pop and R&B singer',
    category: 'celebrity',
  },
  {
    term: /\b(Lady\s*Gaga)\b/i,
    replacement: 'avant-garde female pop artist',
    category: 'celebrity',
  },
  {
    term: /\b(Ariana\s*Grande)\b/i,
    replacement: 'petite female pop singer with high ponytail',
    category: 'celebrity',
  },
  {
    term: /\b(Ed\s*Sheeran)\b/i,
    replacement: 'red-haired male singer with acoustic guitar',
    category: 'celebrity',
  },
  {
    term: /\b(BTS)\b/i,
    replacement: 'K-pop boy band members',
    category: 'celebrity',
  },
  {
    term: /\b(Billie\s*Eilish)\b/i,
    replacement: 'young female singer with colorful hair',
    category: 'celebrity',
  },
  {
    term: /\b(The\s*Weeknd)\b/i,
    replacement: 'male R&B singer with distinct hairstyle',
    category: 'celebrity',
  },
  {
    term: /\b(Post\s*Malone)\b/i,
    replacement: 'male artist with face tattoos and braids',
    category: 'celebrity',
  },
  {
    term: /\b(Kanye\s*West|Ye)\b/i,
    replacement: 'male hip hop artist and producer',
    category: 'celebrity',
  },
  {
    term: /\b(Doja\s*Cat)\b/i,
    replacement: 'female hip hop and pop artist',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Athletes
  // ============================================================
  {
    term: /\b(LeBron\s*James)\b/i,
    replacement: 'tall basketball player',
    category: 'celebrity',
  },
  {
    term: /\b(Cristiano\s*Ronaldo)\b/i,
    replacement: 'athletic male soccer player',
    category: 'celebrity',
  },
  {
    term: /\b(Lionel\s*Messi)\b/i,
    replacement: 'skilled male soccer player',
    category: 'celebrity',
  },
  {
    term: /\b(Serena\s*Williams)\b/i,
    replacement: 'powerful female tennis player',
    category: 'celebrity',
  },
  {
    term: /\b(Michael\s*Jordan)\b/i,
    replacement: 'legendary basketball player with bald head',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Other Public Figures
  // ============================================================
  {
    term: /\b(Elon\s*Musk)\b/i,
    replacement: 'tech entrepreneur businessman',
    category: 'celebrity',
  },
  {
    term: /\b(Kim\s*Kardashian)\b/i,
    replacement: 'female media personality with dark hair',
    category: 'celebrity',
  },
  {
    term: /\b(Kylie\s*Jenner)\b/i,
    replacement: 'young female beauty mogul',
    category: 'celebrity',
  },
  {
    term: /\b(Mr\.?\s*Beast|MrBeast)\b/i,
    replacement: 'male content creator',
    category: 'celebrity',
  },

  // ============================================================
  // ARTISTS - Digital/Contemporary (Living)
  // ============================================================
  {
    term: /\b(Greg\s*Rutkowski)\b/i,
    replacement: 'fantasy digital art with dramatic lighting and rich colors',
    category: 'artist',
  },
  {
    term: /\b(Artgerm)\b/i,
    replacement: 'polished digital illustration with vibrant colors and clean lines',
    category: 'artist',
  },
  {
    term: /\b(Wlop)\b/i,
    replacement: 'ethereal digital painting with soft lighting and delicate features',
    category: 'artist',
  },
  {
    term: /\b(Ross\s*Tran)\b/i,
    replacement: 'dynamic stylized digital illustration',
    category: 'artist',
  },
  {
    term: /\b(Loish)\b/i,
    replacement: 'whimsical digital illustration with flowing lines and pastel colors',
    category: 'artist',
  },
  {
    term: /\b(Sakimichan)\b/i,
    replacement: 'polished anime-influenced digital painting',
    category: 'artist',
  },
  {
    term: /\b(Ilya\s*Kuvshinov)\b/i,
    replacement: 'soft anime-style digital portrait with delicate features',
    category: 'artist',
  },
  {
    term: /\b(Craig\s*Mullins)\b/i,
    replacement: 'painterly digital concept art with atmospheric depth',
    category: 'artist',
  },
  {
    term: /\b(Feng\s*Zhu)\b/i,
    replacement: 'dynamic sci-fi concept art with industrial design',
    category: 'artist',
  },
  {
    term: /\b(James\s*Jean)\b/i,
    replacement: 'intricate surreal illustration with organic forms',
    category: 'artist',
  },
  {
    term: /\b(Alphonse\s*Mucha)\b/i,
    replacement: 'art nouveau style with ornate borders and flowing hair',
    category: 'artist',
    notes: 'Historical but name commonly used',
  },
  {
    term: /\b(Makoto\s*Shinkai)\b/i,
    replacement: 'photorealistic anime backgrounds with dramatic skies and lighting',
    category: 'artist',
  },
  {
    term: /\b(Hayao\s*Miyazaki)\b/i,
    replacement: 'whimsical hand-drawn animation with pastoral themes',
    category: 'artist',
  },

  // ============================================================
  // ARTISTS - Photographers
  // ============================================================
  {
    term: /\b(Annie\s*Leibovitz)\b/i,
    replacement: 'dramatic portrait photography with theatrical lighting',
    category: 'artist',
  },
  {
    term: /\b(Peter\s*Lindbergh)\b/i,
    replacement: 'black and white fashion photography with natural beauty',
    category: 'artist',
  },
  {
    term: /\b(Mario\s*Testino)\b/i,
    replacement: 'glamorous fashion photography with vibrant colors',
    category: 'artist',
  },

  // ============================================================
  // BRANDS - Tech Companies
  // ============================================================
  {
    term: 'Apple',
    replacement: 'sleek minimalist tech company',
    category: 'brand',
    notes: 'Only replace when clearly referring to the company',
  },
  {
    term: 'iPhone',
    replacement: 'modern smartphone with slim bezels',
    category: 'brand',
  },
  {
    term: 'MacBook',
    replacement: 'premium aluminum laptop',
    category: 'brand',
  },
  {
    term: 'iPad',
    replacement: 'premium tablet device',
    category: 'brand',
  },
  {
    term: 'AirPods',
    replacement: 'wireless earbuds',
    category: 'brand',
  },
  {
    term: 'Google',
    replacement: 'search engine company',
    category: 'brand',
  },
  {
    term: 'Tesla',
    replacement: 'electric vehicle with minimalist interior',
    category: 'brand',
  },
  {
    term: 'Samsung',
    replacement: 'electronics company',
    category: 'brand',
  },
  {
    term: 'Microsoft',
    replacement: 'software company',
    category: 'brand',
  },
  {
    term: 'Xbox',
    replacement: 'gaming console',
    category: 'brand',
  },
  {
    term: 'PlayStation',
    replacement: 'gaming console',
    category: 'brand',
    aliases: ['PS5', 'PS4', 'PSP'],
  },
  {
    term: 'Nintendo',
    replacement: 'gaming company',
    category: 'brand',
  },
  {
    term: 'Nintendo Switch',
    replacement: 'handheld gaming console',
    category: 'brand',
  },
  {
    term: 'Amazon',
    replacement: 'e-commerce company',
    category: 'brand',
  },

  // ============================================================
  // BRANDS - Fashion & Luxury
  // ============================================================
  {
    term: 'Nike',
    replacement: 'athletic sneakers with swoosh design',
    category: 'brand',
  },
  {
    term: 'Adidas',
    replacement: 'athletic shoes with three stripes',
    category: 'brand',
  },
  {
    term: 'Supreme',
    replacement: 'streetwear brand with red box logo',
    category: 'brand',
  },
  {
    term: 'Gucci',
    replacement: 'luxury Italian fashion brand',
    category: 'brand',
  },
  {
    term: 'Louis Vuitton',
    replacement: 'luxury fashion with monogram pattern',
    category: 'brand',
    aliases: ['LV'],
  },
  {
    term: 'Chanel',
    replacement: 'luxury French fashion brand',
    category: 'brand',
  },
  {
    term: 'Versace',
    replacement: 'Italian luxury fashion with bold patterns',
    category: 'brand',
  },
  {
    term: 'Prada',
    replacement: 'Italian luxury fashion brand',
    category: 'brand',
  },
  {
    term: 'Rolex',
    replacement: 'luxury Swiss watch',
    category: 'brand',
  },
  {
    term: "Levi's",
    replacement: 'classic denim jeans',
    category: 'brand',
    aliases: ['Levis'],
  },

  // ============================================================
  // BRANDS - Automotive
  // ============================================================
  {
    term: 'Ferrari',
    replacement: 'Italian sports car in red',
    category: 'brand',
  },
  {
    term: 'Lamborghini',
    replacement: 'angular Italian supercar',
    category: 'brand',
  },
  {
    term: 'Porsche',
    replacement: 'German sports car',
    category: 'brand',
  },
  {
    term: 'Mercedes',
    replacement: 'luxury German car',
    category: 'brand',
    aliases: ['Mercedes-Benz'],
  },
  {
    term: 'BMW',
    replacement: 'German luxury car',
    category: 'brand',
  },
  {
    term: 'Audi',
    replacement: 'German car with four rings logo',
    category: 'brand',
  },
  {
    term: 'Ford',
    replacement: 'American car brand',
    category: 'brand',
  },
  {
    term: 'Chevrolet',
    replacement: 'American car brand',
    category: 'brand',
    aliases: ['Chevy'],
  },
  {
    term: 'Toyota',
    replacement: 'Japanese reliable car',
    category: 'brand',
  },
  {
    term: 'Honda',
    replacement: 'Japanese car brand',
    category: 'brand',
  },

  // ============================================================
  // BRANDS - Food & Beverage
  // ============================================================
  {
    term: 'Coca-Cola',
    replacement: 'classic cola drink in curved bottle',
    category: 'brand',
    aliases: ['Coke', 'Coca Cola'],
  },
  {
    term: 'Pepsi',
    replacement: 'cola drink with red white and blue',
    category: 'brand',
  },
  {
    term: "McDonald's",
    replacement: 'fast food restaurant with golden arches',
    category: 'brand',
    aliases: ['McDonalds'],
  },
  {
    term: 'Starbucks',
    replacement: 'coffee shop with green mermaid logo',
    category: 'brand',
  },
  {
    term: 'Red Bull',
    replacement: 'energy drink in slim can',
    category: 'brand',
  },
  {
    term: 'Heineken',
    replacement: 'green bottle beer',
    category: 'brand',
  },
  {
    term: "Dunkin'",
    replacement: 'donut and coffee chain',
    category: 'brand',
    aliases: ['Dunkin Donuts'],
  },

  // ============================================================
  // FRANCHISES - Entertainment
  // ============================================================
  {
    term: 'Star Wars',
    replacement: 'space opera with laser swords and galactic conflict',
    category: 'franchise',
  },
  {
    term: 'Marvel',
    replacement: 'comic book superhero universe',
    category: 'franchise',
    aliases: ['Marvel Comics', 'MCU', 'Marvel Cinematic Universe'],
  },
  {
    term: 'DC Comics',
    replacement: 'comic book superhero universe',
    category: 'franchise',
    aliases: ['DC', 'DCEU'],
  },
  {
    term: 'Disney',
    replacement: 'family-friendly animated entertainment',
    category: 'franchise',
  },
  {
    term: 'Pixar',
    replacement: '3D animated film style with emotional storytelling',
    category: 'franchise',
  },
  {
    term: 'DreamWorks',
    replacement: 'animated film studio style',
    category: 'franchise',
  },
  {
    term: 'Pokemon',
    replacement: 'collectible creature franchise',
    category: 'franchise',
    aliases: ['Pokémon'],
  },
  {
    term: 'Dragon Ball',
    replacement: 'martial arts anime with energy attacks',
    category: 'franchise',
    aliases: ['Dragon Ball Z', 'DBZ'],
  },
  {
    term: 'Naruto',
    replacement: 'ninja anime with chakra powers',
    category: 'franchise',
    notes: 'Also a character name',
  },
  {
    term: 'One Piece',
    replacement: 'pirate adventure anime',
    category: 'franchise',
  },
  {
    term: 'Attack on Titan',
    replacement: 'post-apocalyptic anime with giant humanoids',
    category: 'franchise',
    aliases: ['Shingeki no Kyojin'],
  },
  {
    term: 'My Hero Academia',
    replacement: 'superhero school anime',
    category: 'franchise',
    aliases: ['Boku no Hero Academia'],
  },
  {
    term: 'Demon Slayer',
    replacement: 'demon hunting anime with breathing techniques',
    category: 'franchise',
    aliases: ['Kimetsu no Yaiba'],
  },
  {
    term: 'Minecraft',
    replacement: 'voxel block-based sandbox world',
    category: 'franchise',
  },
  {
    term: 'Fortnite',
    replacement: 'battle royale game with building mechanics',
    category: 'franchise',
  },
  {
    term: 'Call of Duty',
    replacement: 'military first-person shooter game',
    category: 'franchise',
    aliases: ['COD'],
  },
  {
    term: 'Grand Theft Auto',
    replacement: 'open world crime game',
    category: 'franchise',
    aliases: ['GTA'],
  },
  {
    term: 'League of Legends',
    replacement: 'fantasy battle arena game',
    category: 'franchise',
    aliases: ['LoL'],
  },
  {
    term: 'Overwatch',
    replacement: 'team-based hero shooter game',
    category: 'franchise',
  },
  {
    term: 'Elden Ring',
    replacement: 'dark fantasy open world game',
    category: 'franchise',
  },
  {
    term: 'Dark Souls',
    replacement: 'challenging dark fantasy action game',
    category: 'franchise',
  },
  {
    term: 'Final Fantasy',
    replacement: 'JRPG fantasy adventure',
    category: 'franchise',
    aliases: ['FF'],
  },
  {
    term: 'Genshin Impact',
    replacement: 'open world anime action RPG',
    category: 'franchise',
  },
  {
    term: 'Studio Ghibli',
    replacement: 'whimsical hand-drawn anime with pastoral themes and nature spirits',
    category: 'franchise',
  },
  {
    term: 'The Witcher',
    replacement: 'dark fantasy monster hunter franchise',
    category: 'franchise',
  },
  {
    term: 'Cyberpunk',
    replacement: 'futuristic dystopian neon-lit aesthetic',
    category: 'franchise',
    notes: 'May refer to genre or specific game',
  },
  {
    term: 'Halo',
    replacement: 'sci-fi space soldier game',
    category: 'franchise',
  },
  {
    term: 'God of War',
    replacement: 'mythological action game',
    category: 'franchise',
  },
  {
    term: 'Zelda',
    replacement: 'fantasy adventure game with elf-eared hero',
    category: 'franchise',
    notes: 'Also a character name',
  },
  {
    term: 'Legend of Zelda',
    replacement: 'fantasy adventure game franchise',
    category: 'franchise',
  },
  {
    term: 'Transformers',
    replacement: 'shape-shifting robots',
    category: 'franchise',
  },
  {
    term: 'Game of Thrones',
    replacement: 'medieval fantasy with political intrigue',
    category: 'franchise',
    aliases: ['GoT', 'House of the Dragon'],
  },
  {
    term: 'Lord of the Rings',
    replacement: 'high fantasy with elves, dwarves, and hobbits',
    category: 'franchise',
    aliases: ['LOTR', 'Rings of Power'],
  },
  {
    term: 'Stranger Things',
    replacement: '1980s supernatural horror mystery',
    category: 'franchise',
  },
  {
    term: 'Avatar',
    replacement: 'alien world with blue humanoids',
    category: 'franchise',
    notes: 'James Cameron film',
  },
  {
    term: 'Avatar: The Last Airbender',
    replacement: 'elemental bending martial arts animation',
    category: 'franchise',
    aliases: ['ATLA', 'The Last Airbender'],
  },
  {
    term: 'SpongeBob',
    replacement: 'yellow sea sponge cartoon character',
    category: 'franchise',
    aliases: ['SpongeBob SquarePants'],
  },
  {
    term: 'The Simpsons',
    replacement: 'yellow-skinned cartoon family',
    category: 'franchise',
  },
  {
    term: 'Family Guy',
    replacement: 'adult animated comedy',
    category: 'franchise',
  },
  {
    term: 'Rick and Morty',
    replacement: 'sci-fi adult animated comedy',
    category: 'franchise',
  },

  // ============================================================
  // MISC - Common Terms
  // ============================================================
  {
    term: 'ArtStation',
    replacement: 'professional digital art portfolio quality',
    category: 'brand',
  },
  {
    term: 'DeviantArt',
    replacement: 'online art community style',
    category: 'brand',
  },
  {
    term: 'Pixiv',
    replacement: 'Japanese illustration community style',
    category: 'brand',
  },
  {
    term: 'Behance',
    replacement: 'professional design portfolio',
    category: 'brand',
  },
]);

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get all entries for a specific category
 */
export function getBlocklistByCategory(category: IPCategory): IPBlocklistEntry[] {
  return IP_BLOCKLIST.filter(entry => entry.category === category);
}

/**
 * Get count of entries per category
 */
export function getBlocklistStats(): Record<IPCategory, number> {
  const stats: Partial<Record<IPCategory, number>> = {};
  for (const entry of IP_BLOCKLIST) {
    stats[entry.category] = (stats[entry.category] || 0) + 1;
  }
  return stats as Record<IPCategory, number>;
}

/**
 * Search blocklist by term
 */
export function searchBlocklist(query: string): IPBlocklistEntry[] {
  const lowerQuery = query.toLowerCase();
  return IP_BLOCKLIST.filter(entry => {
    if (typeof entry.term === 'string') {
      return entry.term.toLowerCase().includes(lowerQuery);
    }
    return entry.term.source.toLowerCase().includes(lowerQuery);
  });
}


---

## Implementation Guide

### File Structure

```
src/lib/
├── ip.ts              # Central export module
├── ipSafety.ts        # Layer 1: System prompt instructions
├── ipSanitizer.ts     # Layer 2: Post-generation filter
├── ipBlocklist.ts     # Layer 3: Blocklist data
└── generatePrompt.ts  # Main generation (integrate here)
```

### Step 1: Integrate Layer 1 (System Prompt)

Modify `src/lib/generatePrompt.ts`:

```typescript
// Add import at top
import { IP_SAFETY_INSTRUCTIONS } from './ip';

// In generateSinglePrompt function, update the system message:
{
  role: "system",
  content: `You are an expert prompt engineer...

${IP_SAFETY_INSTRUCTIONS}

ABSOLUTE OUTPUT RULES - FOLLOW EXACTLY:
...
`
}
```

### Step 2: Integrate Layer 2 (Post-Generation Filter)

Modify `src/lib/generatePrompt.ts`:

```typescript
// Add import at top
import { sanitizePromptForIPSimple } from './ip';

// At the end of parsePrompt function, before the final return:
function parsePrompt(text: string): string {
  // ... existing cleaning logic ...
  
  // Final trim
  cleaned = cleaned.trim();

  // IP SAFETY: Final sanitization pass
  cleaned = sanitizePromptForIPSimple(cleaned);

  return cleaned;
}
```

### Step 3: Optional - Add Logging/Analytics

For monitoring which IP terms are being caught:

```typescript
import { sanitizePromptForIP, ipSanitizationStats } from './ip';

// In parsePrompt or generateSinglePrompt:
const ipResult = sanitizePromptForIP(cleaned, {
  logReplacements: process.env.NODE_ENV === 'development',
  onReplacement: (rep) => {
    // Send to analytics
    console.log(`IP Sanitized: ${rep.original} -> ${rep.replacement}`);
  }
});

ipSanitizationStats.record(ipResult);
cleaned = ipResult.sanitizedPrompt;
```

---

## Testing the System

### Unit Tests

Create `src/lib/__tests__/ipSanitizer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { 
  sanitizePromptForIP, 
  checkForIPTerms,
  sanitizePromptForIPSimple 
} from '../ipSanitizer';

describe('IP Sanitizer', () => {
  describe('sanitizePromptForIP', () => {
    it('should replace character names with descriptions', () => {
      const input = 'Spider-Man swinging through the city';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(true);
      expect(result.sanitizedPrompt).toContain('web-slinging superhero');
      expect(result.sanitizedPrompt).not.toContain('Spider-Man');
    });

    it('should replace celebrity names', () => {
      const input = 'Portrait of Taylor Swift singing';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(true);
      expect(result.sanitizedPrompt).toContain('blonde female pop singer');
      expect(result.categoriesFound).toContain('celebrity');
    });

    it('should replace artist names with style descriptions', () => {
      const input = 'Digital art in the style of Greg Rutkowski';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(true);
      expect(result.sanitizedPrompt).toContain('fantasy digital art');
    });

    it('should replace brand names', () => {
      const input = 'Man wearing Nike shoes and a Rolex';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(true);
      expect(result.sanitizedPrompt).toContain('athletic sneakers');
      expect(result.sanitizedPrompt).toContain('luxury Swiss watch');
    });

    it('should handle multiple IP terms', () => {
      const input = 'Batman and Spider-Man fighting in Star Wars';
      const result = sanitizePromptForIP(input);
      
      expect(result.replacements.length).toBeGreaterThanOrEqual(3);
      expect(result.sanitizedPrompt).not.toContain('Batman');
      expect(result.sanitizedPrompt).not.toContain('Spider-Man');
      expect(result.sanitizedPrompt).not.toContain('Star Wars');
    });

    it('should return unchanged for clean prompts', () => {
      const input = 'A beautiful sunset over the ocean';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(false);
      expect(result.sanitizedPrompt).toBe(input);
      expect(result.replacements).toHaveLength(0);
    });

    it('should be case insensitive by default', () => {
      const input = 'pikachu and BATMAN';
      const result = sanitizePromptForIP(input);
      
      expect(result.wasModified).toBe(true);
      expect(result.replacements.length).toBe(2);
    });
  });

  describe('checkForIPTerms', () => {
    it('should detect IP terms without modifying', () => {
      const input = 'Mickey Mouse dancing';
      const result = checkForIPTerms(input);
      
      expect(result.hasIPTerms).toBe(true);
      expect(result.terms).toContain('Mickey Mouse');
    });
  });

  describe('sanitizePromptForIPSimple', () => {
    it('should return only the sanitized string', () => {
      const result = sanitizePromptForIPSimple('Iron Man flying');
      
      expect(typeof result).toBe('string');
      expect(result).toContain('armored tech hero');
    });
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../generatePrompt';

describe('IP-Safe Generation Integration', () => {
  it('should generate IP-safe prompts', async () => {
    const result = await generatePrompt({
      // ... test config
      userInput: 'superhero like Spider-Man',
    });
    
    expect(result).not.toMatch(/spider.?man/i);
    expect(result).toContain('web-slinging') // or similar generic term
  });
});
```

---

## Extending the Blocklist

### Adding New Entries

To add new IP terms to the blocklist, add entries to `ipBlocklist.ts`:

```typescript
// In IP_BLOCKLIST array:
{
  term: 'New Character Name',
  replacement: 'generic description of visual appearance',
  category: 'character',
  aliases: ['Alternate Name', 'Nickname'],
  notes: 'Optional notes about this entry',
},

// For pattern matching (names with variations):
{
  term: /\bNew\s*Celebrity\b/i,
  replacement: 'physical description',
  category: 'celebrity',
},
```

### Runtime Extension

For user-specific or dynamic blocklists:

```typescript
import { sanitizePromptForIP } from './ip';

const customBlocklist = [
  {
    term: 'Custom Term',
    replacement: 'generic alternative',
    category: 'brand' as const,
  }
];

const result = sanitizePromptForIP(prompt, {
  customBlocklist,
});
```

---

## Best Practices

### 1. Descriptive Replacements
- Describe WHAT something looks like, not WHO it is
- Focus on visual characteristics: colors, shapes, clothing
- Preserve the creative intent of the original request

### 2. Blocklist Maintenance
- Regularly review and update the blocklist
- Add new popular characters, celebrities as they emerge
- Test replacements to ensure they work in context

### 3. Logging and Monitoring
- Enable logging in development to see what's being filtered
- Use analytics to track common IP requests
- Review false positives and adjust as needed

### 4. Performance Considerations
- The blocklist is sorted by term length for optimal matching
- Regex patterns should be efficient (avoid backtracking)
- Consider caching compiled regex patterns for high-volume use

---

## Blocklist Statistics

As of this architecture document:

| Category   | Count | Examples |
|------------|-------|----------|
| character  | 100+  | Spider-Man, Batman, Mario, Pikachu |
| celebrity  | 60+   | Taylor Swift, Keanu Reeves |
| artist     | 20+   | Greg Rutkowski, Artgerm |
| brand      | 50+   | Nike, Apple, Ferrari |
| franchise  | 50+   | Star Wars, Marvel, Pokemon |
| anime      | 20+   | Goku, Naruto, Sailor Moon |

---

## Future Enhancements

### Planned Features

1. **User Input Pre-Filtering**
   - Warn users before generation if their input contains IP
   - Offer to auto-replace in the input field

2. **Configurable Strictness Levels**
   - Strict: Replace all IP terms
   - Moderate: Allow historical artists
   - Lenient: Only replace recent/active IP

3. **Regional IP Lists**
   - Region-specific IP terms
   - Localized replacements

4. **Machine Learning Integration**
   - Train a model to detect novel IP references
   - Suggest replacements for unknown terms

5. **API for External Blocklist Updates**
   - Fetch latest blocklist from server
   - Community-contributed entries
