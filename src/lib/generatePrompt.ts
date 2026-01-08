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
          content: `You are an expert prompt engineer. Generate the BEST possible prompt based on user input.

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
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `${provider} API error: ${response.status}`);
  }

  const data = await response.json();
  const rawPrompt = data.choices[0].message.content || "";
  
  // Clean and parse the prompt to single line without symbols or tags
  return parsePrompt(rawPrompt);
}

function parsePrompt(text: string): string {
  return text
    // Remove XML-like tags and their content for thinking/metadata tags
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<output>[\s\S]*?<\/output>/gi, "")
    .replace(/<prompt>[\s\S]*?<\/prompt>/gi, "")
    .replace(/<result>[\s\S]*?<\/result>/gi, "")
    // Remove any remaining XML-like tags (but keep content between them)
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    // Remove common prefixes
    .replace(/^(here('s| is)|prompt:?|generated:?|result:?|output:?)\s*/gi, "")
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
