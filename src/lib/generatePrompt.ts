import { ApiProvider, providerEndpoints } from "@/hooks/useApiKey";
import { getPromptTemplate } from "./promptTemplates";
import { sanitizePromptForIP } from "./ipFilter";
import { 
  sanitizeInput, 
  sanitizeApiKey, 
  sanitizeCustomBaseUrl,
  sanitizeModelName,
  apiRateLimiter,
  validateContentType,
  INPUT_LIMITS 
} from "./sanitize";

// ============================================================================
// PROMPT LENGTH CONFIGURATION
// ============================================================================

/** Default target word count for prompts */
export const DEFAULT_PROMPT_LENGTH = 300;

/** Minimum allowed word count */
export const MIN_PROMPT_LENGTH = 10;

/** Maximum allowed word count */
export const MAX_PROMPT_LENGTH = 500;

/** Minimum tokens to generate */
export const MIN_TOKENS = 100;

/** Maximum tokens to generate - set high to accommodate all models */
export const MAX_TOKENS = 8192;

/**
 * Calculate max_tokens based on target word count.
 * Uses approximately 8x multiplier to ensure prompt is never cut off.
 * 
 * Why 8x? 
 * - Average word is ~1.3 tokens
 * - System instructions take ~300-500 tokens  
 * - Template prompt takes ~100-300 tokens
 * - Model overhead and safety buffer
 * - Many models have 4K-8K output limits, we want to use most of it
 * 
 * Formula: maxTokens = Math.ceil(targetWords * 8)
 * Clamped between MIN_TOKENS (100) and MAX_TOKENS (8192)
 * 
 * @param targetWords - Target word count (10-500)
 * @returns Calculated max_tokens value
 * 
 * @example
 * calculateMaxTokens(50)  // returns 400
 * calculateMaxTokens(100) // returns 800
 * calculateMaxTokens(200) // returns 1600
 * calculateMaxTokens(300) // returns 2400
 * calculateMaxTokens(500) // returns 4000
 */
export function calculateMaxTokens(targetWords: number): number {
  const clampedWords = Math.max(MIN_PROMPT_LENGTH, Math.min(MAX_PROMPT_LENGTH, targetWords));
  const calculatedTokens = Math.ceil(clampedWords * 8);
  return Math.max(MIN_TOKENS, Math.min(MAX_TOKENS, calculatedTokens));
}

/**
 * Validate and clamp prompt length to valid range
 * @param length - Target word count
 * @returns Clamped value between MIN_PROMPT_LENGTH and MAX_PROMPT_LENGTH
 */
export function validatePromptLength(length: number): number {
  if (typeof length !== 'number' || isNaN(length)) {
    return DEFAULT_PROMPT_LENGTH;
  }
  return Math.max(MIN_PROMPT_LENGTH, Math.min(MAX_PROMPT_LENGTH, Math.round(length)));
}

// ============================================================================
// DEPRECATED: Legacy prompt length options (kept for reference)
// ============================================================================

/** @deprecated Use numeric promptLength instead */
export type PromptLengthOption = "short" | "medium" | "long" | "detailed";

/** @deprecated Use numeric promptLength instead */
export interface PromptLengthConfig {
  label: string;
  targetWords: string;
  maxTokens: number;
  description: string;
}

/** @deprecated Use numeric promptLength with calculateMaxTokens() instead */
export const promptLengthOptions: Record<PromptLengthOption, PromptLengthConfig> = {
  short: {
    label: "Short",
    targetWords: "15-25",
    maxTokens: 100,
    description: "Concise and focused prompt, ideal for Stable Diffusion"
  },
  medium: {
    label: "Medium",
    targetWords: "40-60",
    maxTokens: 200,
    description: "Balanced prompt with good detail, ideal for Midjourney"
  },
  long: {
    label: "Long",
    targetWords: "80-100",
    maxTokens: 400,
    description: "Detailed prompt with rich descriptions"
  },
  detailed: {
    label: "Very Detailed",
    targetWords: "120-150",
    maxTokens: 600,
    description: "Comprehensive prompt for DALL-E 3 and complex scenes"
  },
};

// ============================================================================
// PROMPT LENGTH INSTRUCTIONS
// ============================================================================

/** Maximum retries for incomplete prompts */
const MAX_RETRIES = 2;

/** Minimum word percentage to consider prompt complete */
const MIN_WORD_PERCENTAGE = 0.75; // 75% of target

/**
 * Check if prompt output is truncated/incomplete
 * Returns true if the prompt appears to be cut off mid-sentence
 */
function isTruncated(text: string): boolean {
  if (!text || text.length === 0) return true;
  
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  
  // Check for common truncation patterns
  const lastChar = trimmed[trimmed.length - 1];
  const last10Chars = trimmed.slice(-10).toLowerCase();
  
  // Incomplete sentence indicators
  const incompletePatterns = [
    /\s(the|a|an|in|on|at|to|for|of|with|and|or|but|as|if|is|are|was|were|be|been|being|have|has|had|will|would|could|should|may|might|must|shall|can)\s*$/i,
    /\s(this|that|these|those|which|who|whom|whose|where|when|what|how|why)\s*$/i,
    /\s(very|quite|rather|somewhat|extremely|highly|incredibly)\s*$/i,
    /[,;:\-–—]\s*$/,  // Ends with punctuation that expects continuation
  ];
  
  for (const pattern of incompletePatterns) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  // Good endings: sentence-ending punctuation
  const goodEndings = ['.', '!', '?', '"', "'", ')', ']'];
  if (goodEndings.includes(lastChar)) {
    return false;
  }
  
  // If ends mid-word (no space before last word, no punctuation)
  // Check if last "word" is incomplete by seeing if sentence feels complete
  return true; // Conservative: assume truncated if not clearly complete
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Check if output meets minimum word count requirement
 */
function meetsWordCount(text: string, targetWords: number): boolean {
  const actualWords = countWords(text);
  const minRequired = Math.floor(targetWords * MIN_WORD_PERCENTAGE);
  return actualWords >= minRequired;
}

/**
 * Get length-specific system prompt instructions based on target word count
 * @param targetWords - Target word count (10-500)
 * @returns Instruction string for the AI model
 */
function getPromptLengthInstructions(targetWords: number): string {
  const validatedLength = validatePromptLength(targetWords);
  
  if (validatedLength < 50) {
    return `Generate a prompt with EXACTLY ${validatedLength} words (count them!). Be CONCISE and FOCUSED. Include only the essential elements: subject and primary style. No unnecessary details.`;
  } else if (validatedLength <= 150) {
    return `Generate a prompt with EXACTLY ${validatedLength} words (count them!). Include subject, style, lighting, and mood. Balance brevity with descriptive detail. Count your words to ensure you meet the target.`;
  } else if (validatedLength <= 300) {
    return `Generate a DETAILED prompt with EXACTLY ${validatedLength} words (count them!). Be highly descriptive with comprehensive coverage of: subject, style, mood, lighting, composition, atmosphere, textures, colors, artistic techniques, and camera angles. You MUST reach the word count target.`;
  } else {
    // STRENGTHENED for 300+ words - this is the key fix
    return `
⚠️ CRITICAL LENGTH REQUIREMENT: Generate a prompt with EXACTLY ${validatedLength} words.

MANDATORY RULES:
1. You MUST write AT LEAST ${validatedLength} words - NO EXCEPTIONS
2. DO NOT stop writing until you have reached ${validatedLength} words
3. If you feel like stopping, ADD MORE DETAILS instead
4. Count your words as you write - you need ${validatedLength} total
5. NEVER end mid-sentence - always complete your thoughts
6. Keep adding rich, descriptive content until target is met

CONTENT TO INCLUDE (expand on ALL of these):
- Subject: Detailed physical description, pose, expression, clothing, accessories
- Environment: Setting, location, surroundings, foreground/background elements
- Lighting: Type, direction, color, shadows, highlights, reflections
- Atmosphere: Mood, emotion, feeling, ambiance, time of day
- Style: Artistic style, medium, technique, influences
- Colors: Palette, tones, saturation, contrast
- Composition: Framing, perspective, depth of field, focus
- Textures: Materials, surfaces, patterns, details
- Technical: Camera settings, lens effects, film grain, resolution

REMEMBER: ${validatedLength} words is a LONG prompt. Keep writing detailed descriptions until you reach the target. DO NOT STOP EARLY.`;
  }
}

interface GenerateOptions {
  apiKey: string;
  provider: ApiProvider;
  model: string;
  promptType: string;
  userInput: string;
  baseUrl?: string;
  creativity?: number; // 1-5 scale
  backgroundStyle?: string; // Background style option
  promptLength?: number; // Target word count (10-500), default: 300
}

interface BatchGenerateOptions extends GenerateOptions {
  batchSize: number;
  onProgress?: (completed: number, total: number) => void;
  onPromptReady?: (prompt: string, index: number) => void;
}

// Background style instructions for prompt generation
const backgroundInstructions: Record<string, string> = {
  "none": "",
  "pure-white": "IMPORTANT: The image MUST have a pure white background (#FFFFFF), clean white backdrop, isolated subject on white, product photography style white background, no shadows on background, pristine white environment.",
  "pure-green": "IMPORTANT: The image MUST have a chroma key green screen background (#00FF00), solid bright green backdrop for compositing, VFX green screen, keying-ready green background, no spill, even green lighting.",
  "pure-black": "IMPORTANT: The image MUST have a pure black background (#000000), solid black backdrop, dark void background, subject isolated on black, dramatic black environment, no visible background elements.",
  "transparent": "IMPORTANT: The image should be suitable for transparent/alpha background, isolated subject, clean edges for cutout, no background elements, PNG-ready isolated composition.",
  "studio": "IMPORTANT: Professional studio backdrop with even neutral background, photography studio lighting setup, controlled lighting environment, seamless backdrop, professional product/portrait lighting.",
  "gradient-white": "IMPORTANT: Soft gradient background from white to light gray, smooth vignette effect, subtle gradient backdrop, professional gradient lighting, soft fade from center.",
  "gradient-black": "IMPORTANT: Dark gradient vignette background, edges fading to black, dramatic dark gradient, center-lit with dark edges, moody gradient backdrop.",
};

// Map creativity level (1-5) to temperature, top_p, top_k
// NOTE: For long-form content with Gemini, use lower temperatures to prevent 
// early truncation caused by repetition loops that trigger MAX_TOKENS
function getCreativityParams(creativity: number = 3, isLongForm: boolean = false) {
  const level = Math.max(1, Math.min(5, creativity));
  
  // Long-form content needs lower temperature to ensure complete output
  // High temperature causes repetition loops that trigger MAX_TOKENS early
  // This is a documented Gemini API issue
  const params = isLongForm ? {
    1: { temperature: 0.2, top_p: 0.8, top_k: 20 },   // Very focused
    2: { temperature: 0.3, top_p: 0.85, top_k: 30 },  // Balanced-low
    3: { temperature: 0.4, top_p: 0.9, top_k: 40 },   // Balanced (capped for stability)
    4: { temperature: 0.5, top_p: 0.92, top_k: 50 },  // Creative (capped)
    5: { temperature: 0.6, top_p: 0.95, top_k: 60 },  // Very creative (capped at 0.6)
  } : {
    1: { temperature: 0.3, top_p: 0.7, top_k: 20 },   // Very focused
    2: { temperature: 0.5, top_p: 0.8, top_k: 30 },   // Balanced-low
    3: { temperature: 0.7, top_p: 0.9, top_k: 40 },   // Balanced
    4: { temperature: 0.9, top_p: 0.95, top_k: 60 },  // Creative
    5: { temperature: 1.2, top_p: 1.0, top_k: 100 },  // Very creative
  };
  
  return params[level as keyof typeof params];
}

// Get creativity params formatted for specific provider
// isLongForm: true for prompts >= 300 words (uses lower temp for Gemini stability)
function getCreativityParamsForProvider(creativity: number = 3, provider: ApiProvider, isLongForm: boolean = false) {
  const base = getCreativityParams(creativity, isLongForm && provider === "gemini");
  
  if (provider === "gemini") {
    // Gemini uses camelCase and different param names
    // For long-form content, we use lower temperature (already handled in getCreativityParams)
    // Adding topK and candidateCount for better output control
    return {
      temperature: base.temperature,
      topP: base.top_p,
      topK: base.top_k, // Re-enabled - supported in gemini-2.0-flash and 2.5-flash
      candidateCount: 1, // Single focused response reduces truncation issues
    };
  }
  
  // OpenAI, Groq, OpenRouter use snake_case
  return {
    temperature: base.temperature,
    top_p: base.top_p,
    // top_k is not standard in OpenAI API, only some providers support it
  };
}

// Build request for Gemini API (uses different format)
function buildGeminiRequest(
  model: string, 
  systemPrompt: string, 
  userContent: string, 
  creativity: number
) {
  const creativityParams = getCreativityParamsForProvider(creativity, "gemini");
  
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userContent}` }]
      }
    ],
    generationConfig: {
      ...creativityParams,
      maxOutputTokens: 500,
    },
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };
}

// Build request for OpenAI-compatible APIs
function buildOpenAIRequest(
  model: string,
  systemContent: string,
  userContent: string,
  creativity: number,
  provider: ApiProvider
) {
  const creativityParams = getCreativityParamsForProvider(creativity, provider);
  
  return {
    model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
    max_tokens: 500,
    ...creativityParams,
  };
}

// Single prompt generation with security validation
async function generateSinglePrompt({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
  baseUrl: customBaseUrl,
  variationIndex,
  creativity = 3,
  backgroundStyle = "none",
  promptLength = DEFAULT_PROMPT_LENGTH,
}: GenerateOptions & { variationIndex: number; creativity?: number; backgroundStyle?: string; promptLength?: number }): Promise<string> {
  // ========================================
  // SECURITY: Input validation and sanitization
  // ========================================
  
  // Rate limiting check
  if (!apiRateLimiter.isAllowed(provider)) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }

  // Sanitize user input
  const sanitizedUserInput = sanitizeInput(userInput, INPUT_LIMITS.USER_INPUT);
  if (!sanitizedUserInput.trim()) {
    throw new Error('User input is required and cannot be empty after sanitization');
  }

  // Validate and sanitize API key (don't log it)
  const sanitizedApiKey = provider !== 'custom' 
    ? sanitizeApiKey(apiKey, provider as Exclude<ApiProvider, 'custom'>)
    : apiKey;
  
  if (!sanitizedApiKey) {
    throw new Error('Invalid API key format');
  }

  // Sanitize model name
  const sanitizedModel = sanitizeModelName(model);

  // Sanitize prompt type
  const sanitizedPromptType = sanitizeInput(promptType, 100);

  // Get background instruction
  const bgInstruction = backgroundInstructions[backgroundStyle] || "";

  // Get prompt length configuration
  const maxTokens = calculateMaxTokens(promptLength);
  
  // Debug: Log the calculated max tokens (dev only)
  if (import.meta.env.DEV) {
    console.log(`[generatePrompt] promptLength: ${promptLength}, maxTokens: ${maxTokens}, provider: ${provider}`);
  }

  const systemPrompt = getPromptTemplate(sanitizedPromptType, sanitizedUserInput);
  
  let baseUrl: string;
  
  if (provider === "custom") {
    if (!customBaseUrl) {
      throw new Error("Base URL is required for custom provider");
    }
    // Validate and sanitize custom URL
    const sanitizedUrl = sanitizeCustomBaseUrl(customBaseUrl);
    if (!sanitizedUrl) {
      throw new Error("Invalid custom base URL. Must be a valid HTTPS URL.");
    }
    baseUrl = sanitizedUrl.replace(/\/+$/, "");
  } else {
    baseUrl = providerEndpoints[provider].base;
  }

  // Build the system instruction content
  // For longer prompts (300+), use STRONGER instructions with emphasis on not stopping
  const isLongPrompt = promptLength >= 300;
  
  const systemContent = isLongPrompt 
    ? `You are an expert prompt engineer. Generate variation #${variationIndex + 1}.

⚠️ CRITICAL: This prompt MUST be EXACTLY ${promptLength} words. DO NOT STOP EARLY.

OUTPUT FORMAT:
- Single continuous line, no formatting, no prefixes, pure prompt text only
- NO explanations, NO introductions, NO "Here is" - just the prompt itself

WORD COUNT REQUIREMENT (MANDATORY):
- You MUST write ${promptLength} words - count as you write
- If you feel like stopping, ADD MORE DESCRIPTIVE DETAILS instead
- Keep expanding until you reach ${promptLength} words
- NEVER end mid-sentence - complete every thought
- A ${promptLength}-word prompt is LONG - keep going until done

CONTENT (cover ALL of these in detail):
- Subject: Detailed physical description, pose, expression, clothing, accessories
- Environment: Setting, location, surroundings, foreground/background
- Lighting: Type, direction, color, shadows, highlights, reflections  
- Atmosphere: Mood, emotion, feeling, ambiance, time of day
- Style: Artistic style, medium, technique, rendering
- Colors: Palette, tones, saturation, contrast
- Composition: Framing, perspective, depth, camera angle
- Textures: Materials, surfaces, patterns, fine details

IP SAFE: No real names, no copyrighted characters, no artist names, no brand names.
${bgInstruction ? `BACKGROUND: ${bgInstruction}` : ''}

START NOW with the prompt content (${promptLength} words required):`
    : `You are an expert prompt engineer. Generate a UNIQUE and CREATIVE prompt variation based on user input.
This is variation #${variationIndex + 1} - make it distinctly different from other variations while keeping the core concept.

PROMPT LENGTH REQUIREMENT (CRITICAL):
${getPromptLengthInstructions(promptLength)}

ABSOLUTE OUTPUT RULES - FOLLOW EXACTLY:
1. Output ONLY the final prompt text - NOTHING ELSE
2. The prompt MUST be a SINGLE continuous line (NO line breaks, NO paragraphs)
3. NO XML tags like <thinking>, <output>, <prompt>, or any <tag></tag> format
4. NO special symbols: *, #, -, •, **, ##, etc.
5. NO markdown formatting whatsoever
6. NO prefixes: "Prompt:", "Here is:", "Generated:", "Output:", "Result:"
7. NO explanations, introductions, or conclusions
8. NO numbered lists or bullet points
9. NO quotes around the prompt
10. JUST the pure prompt text as one flowing sentence

IP SAFETY RULES (CRITICAL - MUST FOLLOW):
- NEVER use real celebrity or public figure names
- NEVER use copyrighted character names (no Disney, Marvel, DC, anime characters)
- NEVER reference specific artists by name (no "Greg Rutkowski style", "Artgerm", etc.)
- NEVER use trademarked brand names (no Nike, Apple, Disney, etc.)
- NEVER reference copyrighted franchises (no Star Wars, Harry Potter, Pokemon, etc.)
- Instead, use GENERIC DESCRIPTIONS:
  - "superhero in red and blue suit" NOT "Spider-Man"
  - "cartoon mouse mascot" NOT "Mickey Mouse"
  - "detailed fantasy art style" NOT "Greg Rutkowski style"
  - "smartphone photography" NOT "iPhone photo"
- This is LEGALLY REQUIRED to avoid copyright/trademark infringement

VARIATION GUIDELINES (Variation #${variationIndex + 1}):
- Each variation should explore a DIFFERENT creative direction
- Vary the style, mood, perspective, or artistic approach
- Use different descriptive words and compositional choices
- Make this variation feel fresh and unique

PROMPT QUALITY:
- Rich, vivid, and highly detailed descriptions
- Use commas to separate concepts naturally
- Include style, mood, lighting, atmosphere, composition
- Add quality enhancers and specific artistic direction
- Make it immediately usable for AI generation
${bgInstruction ? `
BACKGROUND REQUIREMENT (CRITICAL - MUST INCLUDE):
${bgInstruction}
Include this background specification prominently in your generated prompt.` : ''}

START YOUR RESPONSE DIRECTLY WITH THE PROMPT CONTENT.`;

  let response: Response;
  let rawPrompt: string;

  if (provider === "gemini") {
    // Gemini uses a different API format
    // For long prompts, prefer gemini-2.5-flash (65K tokens) over 2.0-flash (8K tokens)
    const modelName = sanitizedModel || getDefaultModel(provider, promptLength);
    const geminiUrl = `${baseUrl}/models/${modelName}:generateContent?key=${sanitizedApiKey}`;
    
    // Use isLongForm to get appropriate creativity params for Gemini
    // Long-form content uses lower temperature to prevent MAX_TOKENS truncation
    const creativityParams = getCreativityParamsForProvider(creativity, "gemini", isLongPrompt);
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemContent }]
      },
      generationConfig: {
        ...creativityParams,
        maxOutputTokens: maxTokens,
        // Note: stopSequences can help prevent incomplete outputs
        // but we avoid adding them as they may cut off valid content
      },
    };
    
    // Debug: Log the full request (dev only)
    if (import.meta.env.DEV) {
      console.log(`[Gemini Request] URL: ${geminiUrl.replace(/key=.*$/, 'key=***')}`);
      console.log(`[Gemini Request] generationConfig:`, requestBody.generationConfig);
      console.log(`[Gemini Request] systemInstruction length: ${systemContent.length} chars`);
      console.log(`[Gemini Request] user content length: ${systemPrompt.length} chars`);
    }
    
    response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    // Validate content type
    const contentType = response.headers.get('content-type');
    if (!validateContentType(contentType, 'application/json')) {
      throw new Error('Invalid response content type from API');
    }

    const data = await response.json();
    
    // Check finishReason - this is critical for detecting truncation
    const finishReason = data.candidates?.[0]?.finishReason;
    const usageMetadata = data.usageMetadata;
    
    // Debug: Log the full Gemini response (dev only)
    if (import.meta.env.DEV) {
      console.log(`[Gemini Response] finishReason: ${finishReason}, usageMetadata:`, usageMetadata);
      console.log(`[Gemini Response] Full candidate:`, JSON.stringify(data.candidates?.[0], null, 2));
      
      // Warn if MAX_TOKENS but output seems too short
      if (finishReason === "MAX_TOKENS") {
        const outputTokens = usageMetadata?.candidatesTokenCount || 0;
        console.warn(`[Gemini] MAX_TOKENS hit at ${outputTokens} tokens (limit: ${maxTokens})`);
        if (outputTokens < maxTokens * 0.5) {
          console.error(`[Gemini] ⚠️ OUTPUT TRUNCATED EARLY! Only ${outputTokens} tokens generated out of ${maxTokens} allowed. This is a known Gemini API issue.`);
        }
      }
    }
    
    // Gemini response format: { candidates: [{ content: { parts: [{ text: \"...\" }] } }] }
    rawPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else {
    // OpenAI-compatible API (OpenAI, Groq, OpenRouter, Custom)
    const creativityParams = getCreativityParamsForProvider(creativity, provider);
    
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sanitizedApiKey}`,
      },
      body: JSON.stringify({
        model: sanitizedModel || getDefaultModel(provider),
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: systemPrompt },
        ],
        max_tokens: maxTokens,
        ...creativityParams,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `${provider} API error: ${response.status}`);
    }

    // Validate content type
    const contentType = response.headers.get('content-type');
    if (!validateContentType(contentType, 'application/json')) {
      throw new Error('Invalid response content type from API');
    }

    const data = await response.json();
    // OpenAI response format: { choices: [{ message: { content: "..." } }] }
    rawPrompt = data.choices?.[0]?.message?.content || "";
    
    // Check finish_reason for OpenAI-compatible APIs
    if (import.meta.env.DEV) {
      const finishReason = data.choices?.[0]?.finish_reason;
      console.log(`[OpenAI Response] finish_reason: ${finishReason}`);
    }
  }
  
  // Parse and clean the prompt, then apply IP filter
  let cleanedPrompt = parsePrompt(rawPrompt);
  
  // ========================================
  // VALIDATION: Check for truncation and insufficient length
  // ========================================
  const actualWordCount = countWords(cleanedPrompt);
  const targetWords = validatePromptLength(promptLength);
  const minRequired = Math.floor(targetWords * MIN_WORD_PERCENTAGE);
  const promptIsTruncated = isTruncated(cleanedPrompt);
  const promptTooShort = actualWordCount < minRequired;
  
  // Debug: Log validation results (dev only)
  if (import.meta.env.DEV) {
    console.log(`[Validation] Target: ${targetWords} words, Actual: ${actualWordCount} words, Min required: ${minRequired}`);
    console.log(`[Validation] Truncated: ${promptIsTruncated}, Too short: ${promptTooShort}`);
    if (promptIsTruncated) {
      console.log(`[Validation] Last 50 chars: "...${cleanedPrompt.slice(-50)}"`);
    }
  }
  
  // If prompt is truncated or too short, LOG WARNING but DO NOT remove content
  if ((promptIsTruncated || promptTooShort) && targetWords >= 200) {
    // Log warning - but KEEP the full AI response (we paid for those tokens!)
    if (import.meta.env.DEV) {
      console.warn(`[Validation] ⚠️ INCOMPLETE OUTPUT DETECTED!`);
      console.warn(`[Validation] Truncated: ${promptIsTruncated}, Words: ${actualWordCount}/${targetWords}`);
      console.warn(`[Validation] Last 100 chars: "...${cleanedPrompt.slice(-100)}"`);
      console.warn(`[Validation] This likely means the AI model stopped early. Consider:`);
      console.warn(`[Validation] - Using a different model (e.g., gemini-2.5-flash for long prompts)`);
      console.warn(`[Validation] - Reducing target word count`);
      console.warn(`[Validation] - Lowering creativity level`);
      console.warn(`[Validation] RETURNING FULL AI OUTPUT (not removing incomplete ending)`);
    }
    
    // IMPORTANT: Do NOT remove content! Return what the AI generated.
    // Users paid for these tokens - truncating further is wasteful.
    // The incomplete ending is better than missing content.
  }
  
  // Debug: Log raw vs cleaned prompt length (dev only)
  if (import.meta.env.DEV) {
    const rawWordCount = rawPrompt.split(/\s+/).filter(Boolean).length;
    const finalWordCount = countWords(cleanedPrompt);
    console.log(`[parsePrompt] Raw words: ${rawWordCount}, Final words: ${finalWordCount}`);
    if (rawWordCount > finalWordCount + 10) {
      console.warn(`[parsePrompt] Significant word loss detected! Raw: "${rawPrompt.substring(0, 200)}..."`);
    }
  }
  
  return sanitizePromptForIP(cleanedPrompt);
}

// Batch parallel generation with progress tracking and streaming results
export async function generatePromptBatch({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
  baseUrl,
  batchSize,
  onProgress,
  onPromptReady,
  creativity,
  backgroundStyle,
  promptLength,
}: BatchGenerateOptions): Promise<string[]> {
  let completed = 0;
  const results: (string | null)[] = new Array(batchSize).fill(null);
  const errors: Error[] = [];

  // Create wrapped promises that report progress and stream results
  const promises = Array.from({ length: batchSize }, async (_, index) => {
    try {
      const result = await generateSinglePrompt({
        apiKey,
        provider,
        model,
        promptType,
        userInput,
        baseUrl,
        variationIndex: index,
        creativity,
        backgroundStyle,
        promptLength,
      });
      results[index] = result;
      completed++;
      onProgress?.(completed, batchSize);
      // Stream the result immediately when ready
      onPromptReady?.(result, index);
      return result;
    } catch (error) {
      completed++;
      onProgress?.(completed, batchSize);
      errors.push(error instanceof Error ? error : new Error("Unknown error"));
      return null;
    }
  });

  // Execute all in parallel
  await Promise.all(promises);

  // Filter out nulls and return successful prompts in order
  const successfulPrompts = results.filter((r): r is string => r !== null);

  if (successfulPrompts.length === 0) {
    throw new Error(errors[0]?.message || "All prompt generations failed");
  }

  return successfulPrompts;
}

// Legacy single prompt (for backwards compatibility)
export async function generatePrompt(options: GenerateOptions): Promise<string> {
  return generateSinglePrompt({ ...options, variationIndex: 0 });
}

// ============================================================================
// PARSE PROMPT - COMPREHENSIVE CLEANING FOR SINGLE-LINE OUTPUT
// ============================================================================

/**
 * Parses and cleans the AI-generated prompt to ensure it's a single clean line.
 * 
 * This function aggressively removes:
 * - XML/HTML tags (thinking, output, prompt, result, etc.)
 * - Markdown formatting (headers, bold, italic, code blocks)
 * - Common AI prefixes ("Here is:", "Prompt:", etc.)
 * - List markers (bullets, numbers, dashes)
 * - Special characters and formatting symbols
 * - Multiple whitespace and line breaks
 * 
 * @param text - Raw AI output
 * @returns Clean single-line prompt string
 */
function parsePrompt(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let cleaned = text;

  // ========================================
  // PHASE 1: Remove XML/HTML-style tags
  // ========================================
  
  // Remove content within thinking/internal tags entirely
  const tagsToRemoveWithContent = [
    "thinking",
    "thought",
    "internal",
    "reasoning",
    "analysis",
    "reflection",
    "scratchpad",
    "notes",
    "meta",
  ];
  for (const tag of tagsToRemoveWithContent) {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  // Extract content from output/prompt/result tags (keep inner content)
  const tagsToExtractContent = [
    "output",
    "prompt",
    "result",
    "response",
    "answer",
    "content",
    "final",
    "generated",
  ];
  for (const tag of tagsToExtractContent) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const match = regex.exec(cleaned);
    if (match && match[1]) {
      // If we find this tag, use its content as the result
      cleaned = match[1];
    }
  }

  // Remove any remaining XML/HTML tags (opening, closing, self-closing)
  cleaned = cleaned
    // Self-closing tags: <tag />
    .replace(/<[a-zA-Z][^>]*\/>/g, "")
    // Opening tags: <tag> or <tag attr="value">
    .replace(/<[a-zA-Z][^>]*>/g, "")
    // Closing tags: </tag>
    .replace(/<\/[a-zA-Z][^>]*>/g, "")
    // Malformed tags
    .replace(/<[^>]+>/g, "");

  // ========================================
  // PHASE 2: Remove Markdown formatting
  // ========================================
  
  // Code blocks (```code``` and `inline code`)
  cleaned = cleaned
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, (match) => match.slice(1, -1)); // Keep content of inline code

  // Headers (# ## ### etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Bold/Italic with asterisks and underscores
  cleaned = cleaned
    // Bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, "$1");

  // Links: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Images: ![alt](url) -> remove entirely
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // Blockquotes: > text
  cleaned = cleaned.replace(/^>\s*/gm, "");

  // Horizontal rules: --- or *** or ___
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, "");

  // ========================================
  // PHASE 3: Remove common AI prefixes
  // ========================================
  
  // Common prefix patterns (case insensitive, with optional colon and whitespace)
  const prefixPatterns = [
    // Direct prefixes
    /^(?:here(?:'s| is| are)?|this is|presenting|introducing)[\s:]+/i,
    /^(?:prompt|generated(?: prompt)?|output|result|response|answer)[\s:]+/i,
    /^(?:the (?:generated )?prompt(?: is)?|my (?:generated )?prompt)[\s:]+/i,
    /^(?:final (?:prompt|output|result)|your prompt)[\s:]+/i,
    /^(?:certainly|sure|absolutely|of course)[!,.\s]+(?:here(?:'s| is))?[\s:]*/i,
    /^(?:i(?:'ve| have) (?:created|generated|written|crafted))[\s:]+/i,
    /^(?:based on (?:your|the) (?:input|request)[,.\s]+(?:here(?:'s| is))?)/i,
    // Numbered variations
    /^(?:variation|version|option|alternative)\s*#?\d*[\s:]+/i,
    // Context cleanup
    /^(?:for (?:this|the) (?:image|prompt|request)[,.\s]+)/i,
  ];

  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // ========================================
  // PHASE 4: Remove list markers and bullets
  // ========================================
  
  // Bullet points: •, ●, ○, ▪, ▸, ►, -, *, +
  cleaned = cleaned.replace(/^[\s]*[•●○▪▸►\-*+]\s*/gm, "");

  // Numbered lists: 1. 2. 3. or 1) 2) 3) or (1) (2) (3)
  cleaned = cleaned.replace(/^[\s]*(?:\d+[.)]\s*|\(\d+\)\s*)/gm, "");

  // Letter lists: a. b. c. or a) b) c)
  cleaned = cleaned.replace(/^[\s]*[a-zA-Z][.)]\s*/gm, "");

  // ========================================
  // PHASE 5: Remove special characters and artifacts
  // ========================================
  
  // Remove remaining markdown-style symbols
  cleaned = cleaned.replace(/[*#`_~^]/g, "");

  // Remove pipe characters (table formatting)
  cleaned = cleaned.replace(/\|/g, " ");

  // Remove backslashes (escape characters)
  cleaned = cleaned.replace(/\\/g, "");

  // Remove square and curly brackets (often JSON/array artifacts)
  cleaned = cleaned.replace(/[\[\]{}]/g, "");

  // Remove angle brackets (remaining from tags)
  cleaned = cleaned.replace(/[<>]/g, "");

  // ========================================
  // PHASE 6: Normalize quotes
  // ========================================
  
  // Remove surrounding quotes (both single and double, smart quotes too)
  cleaned = cleaned
    .replace(/^["'"'„«»]+/, "")
    .replace(/["'"'„«»]+$/, "");

  // Convert smart quotes to regular (within the text)
  cleaned = cleaned
    .replace(/[""„«»]/g, '"')
    .replace(/['']/g, "'");

  // ========================================
  // PHASE 7: Whitespace normalization (SINGLE LINE)
  // ========================================
  
  // Replace all types of line breaks and multiple spaces with single space
  cleaned = cleaned
    // All line break types
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    // Multiple spaces, tabs, etc.
    .replace(/[\t\f\v]+/g, " ")
    .replace(/\s{2,}/g, " ")
    // Non-breaking spaces
    .replace(/\u00A0/g, " ")
    // Zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

  // ========================================
  // PHASE 8: Final cleanup
  // ========================================
  
  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  // Fix double punctuation
  cleaned = cleaned
    .replace(/([.,!?;:]){2,}/g, "$1")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.,!?;:])\s+([.,!?;:])/g, "$1$2");

  // Fix spacing around commas
  cleaned = cleaned
    .replace(/\s+,/g, ",")
    .replace(/,(?!\s)/g, ", ");

  // Remove leading/trailing punctuation that doesn't make sense
  cleaned = cleaned
    .replace(/^[,;:\-–—]+\s*/, "")
    .replace(/\s*[,;:\-–—]+$/, "");

  // Final trim
  cleaned = cleaned.trim();

  return cleaned;
}

function getDefaultModel(provider: ApiProvider, promptLength?: number): string {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "gemini":
      // For long-form content (300+ words), prefer gemini-2.5-flash which has
      // 65K output token limit and better handling of long content.
      // gemini-2.0-flash has 8K limit and known truncation issues.
      // NOTE: User can override this by selecting a specific model in settings.
      if (promptLength && promptLength >= 300) {
        return "gemini-2.5-flash"; // 65K output tokens, more stable for long content
      }
      return "gemini-2.0-flash"; // 8K output tokens, good for short/medium
    case "openrouter":
      return "openai/gpt-4o-mini";
    case "groq":
      return "llama-3.3-70b-versatile";
    case "custom":
      return "gpt-3.5-turbo";
    default:
      return "gpt-4o-mini";
  }
}

// Export parsePrompt for testing purposes
export { parsePrompt };
