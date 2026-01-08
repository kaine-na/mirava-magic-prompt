import { ApiProvider, providerEndpoints } from "@/hooks/useApiKey";
import { getPromptTemplate } from "./promptTemplates";

interface GenerateOptions {
  apiKey: string;
  provider: ApiProvider;
  model: string;
  promptType: string;
  userInput: string;
}

export async function generatePrompt({
  apiKey,
  provider,
  model,
  promptType,
  userInput,
}: GenerateOptions): Promise<string> {
  const systemPrompt = getPromptTemplate(promptType, userInput);
  const endpoint = providerEndpoints[provider];

  if (provider === "openai") {
    const response = await fetch(`${endpoint.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful prompt engineering assistant." },
          { role: "user", content: systemPrompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  if (provider === "gemini") {
    const modelId = model || "gemini-1.5-flash";
    const response = await fetch(
      `${endpoint.base}/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Gemini API error");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  if (provider === "openrouter") {
    const response = await fetch(`${endpoint.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful prompt engineering assistant." },
          { role: "user", content: systemPrompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenRouter API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  if (provider === "groq") {
    const response = await fetch(`${endpoint.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful prompt engineering assistant." },
          { role: "user", content: systemPrompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Groq API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  throw new Error("Invalid provider");
}
