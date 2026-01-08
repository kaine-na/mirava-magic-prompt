import { ApiProvider, providerEndpoints } from "@/hooks/useApiKey";
import { getPromptTemplate } from "./promptTemplates";

interface GenerateOptions {
  apiKey: string;
  provider: ApiProvider;
  model: string;
  promptType: string;
  userInput: string;
  baseUrl?: string;
  creativity?: number; // 1-5 scale
}

interface BatchGenerateOptions extends GenerateOptions {
  batchSize: number;
  onProgress?: (completed: number, total: number) => void;
}

// Map creativity level (1-5) to temperature, top_p, top_k
function getCreativityParams(creativity: number = 3) {
  const level = Math.max(1, Math.min(5, creativity));
  
  const params = {
    1: { temperature: 0.3, top_p: 0.7, top_k: 20 },   // Very focused
    2: { temperature: 0.5, top_p: 0.8, top_k: 30 },   // Balanced-low
    3: { temperature: 0.7, top_p: 0.9, top_k: 40 },   // Balanced
    4: { temperature: 0.9, top_p: 0.95, top_k: 60 },  // Creative
    5: { temperature: 1.2, top_p: 1.0, top_k: 100 },  // Very creative
  };
  
  return params[level as keyof typeof params];
}

// Single prompt generation
async function generateSinglePrompt({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
  baseUrl: customBaseUrl,
  variationIndex,
  creativity = 3,
}: GenerateOptions & { variationIndex: number; creativity?: number }): Promise<string> {
  const systemPrompt = getPromptTemplate(promptType, userInput);
  
  let baseUrl: string;
  
  if (provider === "custom") {
    if (!customBaseUrl) {
      throw new Error("Base URL is required for custom provider");
    }
    baseUrl = customBaseUrl.replace(/\/+$/, "");
  } else {
    baseUrl = providerEndpoints[provider].base;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || getDefaultModel(provider),
      messages: [
        { 
          role: "system", 
          content: `You are an expert prompt engineer. Generate a UNIQUE and CREATIVE prompt variation based on user input.
This is variation #${variationIndex + 1} - make it distinctly different from other variations while keeping the core concept.

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

START YOUR RESPONSE DIRECTLY WITH THE PROMPT CONTENT.` 
        },
        { role: "user", content: systemPrompt },
      ],
      max_tokens: 500,
      ...getCreativityParams(creativity),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `${provider} API error: ${response.status}`);
  }

  const data = await response.json();
  const rawPrompt = data.choices[0].message.content || "";
  
  return parsePrompt(rawPrompt);
}

// Batch parallel generation with progress tracking
export async function generatePromptBatch({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
  baseUrl,
  batchSize,
  onProgress,
  creativity,
}: BatchGenerateOptions): Promise<string[]> {
  let completed = 0;
  const successfulPrompts: string[] = [];
  const errors: Error[] = [];

  // Create wrapped promises that report progress
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
      });
      successfulPrompts.push(result);
      completed++;
      onProgress?.(completed, batchSize);
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

  if (successfulPrompts.length === 0) {
    throw new Error(errors[0]?.message || "All prompt generations failed");
  }

  return successfulPrompts;
}

// Legacy single prompt (for backwards compatibility)
export async function generatePrompt(options: GenerateOptions): Promise<string> {
  return generateSinglePrompt({ ...options, variationIndex: 0 });
}

function parsePrompt(text: string): string {
  return text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<output>[\s\S]*?<\/output>/gi, "")
    .replace(/<prompt>[\s\S]*?<\/prompt>/gi, "")
    .replace(/<result>[\s\S]*?<\/result>/gi, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/^(here('s| is)|prompt:?|generated:?|result:?|output:?)\s*/gi, "")
    .replace(/[*#`_~]/g, "")
    .replace(/^[-•●○▪]\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function getDefaultModel(provider: ApiProvider): string {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "gemini":
      return "gemini-2.0-flash";
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
