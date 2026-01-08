import { ApiProvider } from "@/hooks/useApiKey";
import { getPromptTemplate } from "./promptTemplates";

interface GenerateOptions {
  apiKey: string;
  provider: ApiProvider;
  promptType: string;
  userInput: string;
}

export async function generatePrompt({
  apiKey,
  provider,
  promptType,
  userInput,
}: GenerateOptions): Promise<string> {
  const systemPrompt = getPromptTemplate(promptType, userInput);

  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [{ role: "user", content: systemPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Anthropic API error");
    }

    const data = await response.json();
    return data.content[0].text;
  }

  if (provider === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

  throw new Error("Invalid provider");
}
