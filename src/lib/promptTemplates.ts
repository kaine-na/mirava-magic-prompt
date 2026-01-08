export const promptTemplates: Record<string, string> = {
  image: `You are an expert prompt engineer for AI image generation. Create a detailed, creative prompt based on the user's description.

Guidelines:
- Be specific about style, lighting, colors, and mood
- Include artistic influences or techniques
- Specify composition and camera angles if relevant
- Add quality modifiers (highly detailed, 8k, photorealistic, etc.)

User's idea: {input}

Generate a detailed image prompt:`,

  chat: `You are an expert at crafting system prompts for conversational AI. Create an effective system prompt based on the user's requirements.

Guidelines:
- Define the AI's role and personality clearly
- Include behavioral guidelines and constraints
- Specify the tone and communication style
- Add relevant context and domain knowledge

User's requirements: {input}

Generate a system prompt:`,

  code: `You are an expert at creating prompts for code generation AI. Create a detailed prompt that will produce high-quality code.

Guidelines:
- Specify the programming language and framework
- Include requirements and constraints
- Mention code style and best practices
- Request documentation and error handling

User's requirements: {input}

Generate a code generation prompt:`,

  music: `You are an expert at creating prompts for AI music generation. Create a detailed prompt that will produce great audio.

Guidelines:
- Specify genre, mood, and tempo
- Include instrument preferences
- Describe the structure (intro, verse, chorus)
- Mention influences or reference tracks

User's idea: {input}

Generate a music generation prompt:`,

  writing: `You are an expert at creating prompts for creative writing AI. Create an inspiring prompt for content creation.

Guidelines:
- Specify the format (story, article, poem, etc.)
- Define the tone and target audience
- Include themes and key elements
- Mention style preferences

User's idea: {input}

Generate a creative writing prompt:`,

  custom: `You are an expert prompt engineer. Help create an effective prompt based on the user's needs.

Guidelines:
- Understand the task and goal
- Structure the prompt clearly
- Include relevant context
- Add specific instructions

User's request: {input}

Generate an optimized prompt:`,
};

export function getPromptTemplate(type: string, userInput: string): string {
  const template = promptTemplates[type] || promptTemplates.custom;
  return template.replace("{input}", userInput);
}
