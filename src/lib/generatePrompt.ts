import { ApiProvider, providerEndpoints } from "@/hooks/useApiKey";
import { getPromptTemplate } from "./promptTemplates";

interface GenerateOptions {
  apiKey: string;
  provider: ApiProvider;
  model: string;
  promptType: string;
  userInput: string;
  baseUrl?: string;
}

export async function generatePrompt({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
  baseUrl: customBaseUrl,
}: GenerateOptions): Promise<string> {
  const systemPrompt = getPromptTemplate(promptType, userInput);
  
  // Get base URL - all providers use OpenAI-compatible format
  let baseUrl: string;
  
  if (provider === "custom") {
    if (!customBaseUrl) {
      throw new Error("Base URL is required for custom provider");
    }
    baseUrl = customBaseUrl.replace(/\/+$/, "");
  } else {
    baseUrl = providerEndpoints[provider].base;
  }

  // All providers use OpenAI-compatible chat completions format
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
          content: `You are an expert prompt engineer. Your task is to generate the BEST possible prompt based on user input.

CRITICAL OUTPUT RULES:
1. Output ONLY the final prompt text - nothing else
2. The prompt MUST be a single continuous line (no line breaks)
3. NO special symbols like *, #, -, •, etc.
4. NO markdown formatting
5. NO prefixes like "Prompt:", "Here is:", "Generated:"
6. NO explanations before or after the prompt
7. The prompt should be rich, detailed, and optimized for AI generation
8. Use natural flowing language with commas to separate concepts
9. Include style, mood, lighting, composition, and quality descriptors where relevant` 
        },
        { role: "user", content: systemPrompt },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `${provider} API error: ${response.status}`);
  }

  const data = await response.json();
  const rawPrompt = data.choices[0].message.content || "";
  
  // Clean and parse the prompt to single line without symbols
  return parsePrompt(rawPrompt);
}

function parsePrompt(text: string): string {
  return text
    // Remove common prefixes
    .replace(/^(here('s| is)|prompt:?|generated:?|result:?)\s*/gi, "")
    // Remove markdown formatting
    .replace(/[*#`_~]/g, "")
    // Remove bullet points and list markers
    .replace(/^[-•●○▪]\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    // Convert line breaks to spaces
    .replace(/[\r\n]+/g, " ")
    // Remove multiple spaces
    .replace(/\s+/g, " ")
    // Remove quotes at start/end
    .replace(/^["']|["']$/g, "")
    // Trim
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
