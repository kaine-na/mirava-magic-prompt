/**
 * IP Safety Instructions for System Prompt
 * 
 * This module provides instructions to inject into the system prompt
 * that instruct the AI to avoid generating content that infringes
 * on intellectual property rights.
 * 
 * @module ipSafety
 */

/**
 * Full IP Safety Instructions for System Prompt
 * 
 * These comprehensive instructions are injected into the system prompt
 * to proactively prevent the AI from generating IP-infringing content.
 * 
 * Use this version when context window allows (recommended for most models).
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
   - Instead use generic archetypes with distinctive visual features
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
   - EXCEPTION: Historical artists (died before 1950) may be referenced:
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
     • "Pokemon" → "collectible creature aesthetic"
     • "Minecraft" → "voxel block-based world"

6. USE GENERIC DESCRIPTIONS ALWAYS:
   - Describe visual characteristics, not identities
   - Focus on: colors, shapes, clothing, poses, expressions, environments
   - Be creative with descriptive alternatives that capture the essence

REMEMBER: Generate prompts that describe WHAT something looks like, not WHO or WHAT specific IP it represents.
`;

/**
 * Compact version for models with shorter context windows
 * 
 * Use this version when you need to conserve tokens (e.g., for models
 * with smaller context windows or when near token limits).
 */
export const IP_SAFETY_INSTRUCTIONS_COMPACT = `
IP SAFETY RULES (MANDATORY):
- NO real celebrity names → use "person with [physical description]"
- NO copyrighted characters → use visual archetypes with distinctive features
- NO living artist names → describe style without attribution (e.g., "fantasy art with dramatic lighting")
- NO brand/trademark names → use generic product descriptions
- NO franchise names → describe aesthetics without naming the franchise
ALWAYS use generic visual descriptions instead of specific identities.
`;

/**
 * Minimal version for extremely constrained contexts
 * 
 * Use only when absolutely necessary due to token constraints.
 */
export const IP_SAFETY_INSTRUCTIONS_MINIMAL = `
IMPORTANT: Never use real names (celebrities, characters, artists, brands, franchises). Always use generic visual descriptions instead.
`;

/**
 * Get the appropriate IP safety instructions based on context constraints
 * 
 * @param maxTokens - Maximum tokens available for instructions
 * @returns The appropriate version of IP safety instructions
 */
export function getIPSafetyInstructions(maxTokens: number = 1000): string {
  // Rough token estimates (actual may vary by model)
  const FULL_TOKENS = 600;
  const COMPACT_TOKENS = 100;
  const MINIMAL_TOKENS = 25;

  if (maxTokens >= FULL_TOKENS) {
    return IP_SAFETY_INSTRUCTIONS;
  } else if (maxTokens >= COMPACT_TOKENS) {
    return IP_SAFETY_INSTRUCTIONS_COMPACT;
  } else if (maxTokens >= MINIMAL_TOKENS) {
    return IP_SAFETY_INSTRUCTIONS_MINIMAL;
  } else {
    // If even minimal won't fit, return empty (rely on post-generation filter)
    return '';
  }
}

/**
 * Category-specific instruction snippets for targeted use
 */
export const IP_SAFETY_BY_CATEGORY = {
  characters: `
CHARACTERS: Never use copyrighted character names. Instead describe their visual appearance:
- Superhero names → describe powers, costume colors, and distinctive features
- Game characters → describe outfit, species, and equipment
- Cartoon characters → describe shape, colors, and personality through appearance
`,

  celebrities: `
CELEBRITIES: Never use real celebrity names. Instead describe their appearance:
- Actors → describe physical features and typical roles
- Musicians → describe style, instruments, and aesthetic
- Athletes → describe sport, build, and appearance
`,

  artists: `
ARTISTS: Never reference living artists by name. Instead describe their style:
- Digital artists → describe lighting, color palette, and technique
- Photographers → describe composition, mood, and camera style
- Only historical artists (died before 1950) may be named
`,

  brands: `
BRANDS: Never use trademarked brand names. Instead describe the product:
- Tech products → describe form factor and design language
- Fashion → describe style, materials, and aesthetic
- Vehicles → describe type, origin, and distinctive features
`,

  franchises: `
FRANCHISES: Never name specific entertainment franchises. Instead describe the aesthetic:
- Movie/TV → describe setting, visual style, and themes
- Games → describe art style, mechanics-inspired visuals
- Comics → describe visual style without publisher names
`,
} as const;

/**
 * Build custom IP safety instructions from selected categories
 * 
 * @param categories - Array of categories to include
 * @returns Combined instruction string
 */
export function buildCustomIPInstructions(
  categories: Array<keyof typeof IP_SAFETY_BY_CATEGORY>
): string {
  if (categories.length === 0) {
    return IP_SAFETY_INSTRUCTIONS_MINIMAL;
  }

  const header = 'IP SAFETY RULES (MANDATORY):\n';
  const body = categories
    .map(cat => IP_SAFETY_BY_CATEGORY[cat])
    .join('\n');
  
  return header + body;
}
