export const promptTemplates: Record<string, string> = {
  image: `Create an exceptional, highly detailed image generation prompt based on this concept:

"{input}"

Requirements for your prompt:
- Describe the subject with vivid, specific details
- Include artistic style (photography, digital art, oil painting, anime, 3D render, etc.)
- Specify lighting conditions (golden hour, dramatic shadows, soft diffused light, neon glow)
- Define color palette and mood (warm tones, muted pastels, vibrant saturated colors)
- Add composition details (close-up, wide angle, bird's eye view, rule of thirds)
- Include quality enhancers (8k resolution, highly detailed, masterpiece, professional)
- Mention texture and material details where relevant
- Add atmosphere and environment context

Generate ONE perfect prompt as a single flowing sentence with comma-separated descriptors.`,

  video: `Create a compelling video generation prompt based on this concept:

"{input}"

Requirements for your prompt:
- Describe the scene and primary action with clarity
- Specify camera movement (slow pan, tracking shot, zoom in, orbital, static)
- Include timing and pacing (slow motion, real-time, time-lapse)
- Define visual style (cinematic, documentary, animated, music video aesthetic)
- Add lighting and color grading (warm tones, cool blue, high contrast, filmic)
- Mention atmosphere and mood (tense, peaceful, energetic, mysterious)
- Include environmental details and background elements

Generate ONE perfect prompt as a single flowing sentence describing the video scene.`,

  social: `Create an engaging social media post based on this requirement:

"{input}"

Requirements for your content:
- Start with an attention-grabbing hook
- Use conversational, authentic tone
- Include relevant emojis strategically placed
- Add a clear call-to-action
- Suggest 3-5 relevant hashtags at the end
- Keep it platform-appropriate length
- Make it shareable and engaging

Generate the complete social media post as one cohesive piece.`,

  "3d": `Create a detailed 3D model generation prompt based on this concept:

"{input}"

Requirements for your prompt:
- Describe the object from multiple perspectives
- Specify materials and surface properties (matte, glossy, metallic, rough, smooth)
- Include color palette and finish details
- Define the level of detail (high poly, game-ready, sculpted)
- Add lighting and rendering style (PBR, stylized, realistic)
- Mention scale and proportions
- Include intended use context (game asset, product visualization, character)

Generate ONE perfect prompt describing the 3D model in detail.`,

  chat: `Create an effective system prompt for a conversational AI based on this requirement:

"{input}"

Requirements for your system prompt:
- Define the AI's role and expertise clearly
- Establish personality traits and communication style
- Set behavioral guidelines and response patterns
- Include relevant domain knowledge context
- Define limitations and boundaries
- Specify tone (professional, friendly, formal, casual)
- Add response formatting preferences

Generate ONE comprehensive system prompt that sets up the AI perfectly.`,

  code: `Create a precise code generation prompt based on this requirement:

"{input}"

Requirements for your prompt:
- Specify the programming language and version
- Include framework or library requirements
- Define coding standards and best practices to follow
- Request proper error handling and validation
- Mention documentation and comments needs
- Include edge cases to consider
- Specify testing requirements if applicable

Generate ONE clear and detailed prompt for code generation.`,

  music: `Create a detailed music generation prompt based on this concept:

"{input}"

Requirements for your prompt:
- Specify genre and subgenre clearly
- Include tempo range (BPM) and energy level
- Define mood and emotional qualities
- Mention instrumentation and arrangement style
- Add structure suggestions (intro, verse, chorus, bridge)
- Include vocal style if applicable (or specify instrumental)
- Reference similar artists or tracks for style guidance
- Describe dynamics and progression

Generate ONE flowing prompt describing the music piece.`,

  writing: `Create an inspiring creative writing prompt based on this concept:

"{input}"

Requirements for your prompt:
- Specify the format (short story, article, poem, script, essay)
- Define the target audience and reading level
- Include tone and style preferences
- Set the theme and key elements to explore
- Mention perspective and narrative voice
- Add length guidelines if relevant
- Include any specific requirements or constraints

Generate ONE comprehensive writing prompt.`,

  marketing: `Create compelling marketing copy based on this requirement:

"{input}"

Requirements for your copy:
- Identify and speak to the target audience
- Lead with benefits, not features
- Use emotional triggers and power words
- Include a strong, clear call-to-action
- Create urgency or exclusivity where appropriate
- Keep it concise and scannable
- Make the value proposition crystal clear

Generate the marketing copy as one polished piece.`,

  email: `Create a professional email based on this requirement:

"{input}"

Requirements for your email:
- Write a compelling subject line
- Start with appropriate greeting
- Get to the point quickly in the opening
- Structure the body for easy reading
- Include specific call-to-action
- End with appropriate closing and sign-off
- Match the tone to the context (formal, semi-formal, friendly)

Generate the complete email with subject line.`,

  art: `Create an artistic style prompt based on this concept:

"{input}"

Requirements for your prompt:
- Specify the art movement or artist influence
- Include technique details (brushwork, texture, composition)
- Define the color palette and harmony
- Add medium simulation (oil paint, watercolor, charcoal, digital)
- Describe mood, atmosphere, and emotional impact
- Mention lighting and shadow treatment
- Include any historical or cultural context

Generate ONE detailed prompt in the specified artistic style.`,

  custom: `Create an optimized prompt based on this request:

"{input}"

Requirements:
- Understand the core goal and desired outcome
- Structure the prompt for maximum clarity
- Include all relevant context and specifications
- Add specific instructions for best results
- Consider the target AI model's strengths
- Optimize for quality output

Generate ONE perfect, focused prompt for this request.`,
};

export function getPromptTemplate(type: string, userInput: string): string {
  const template = promptTemplates[type] || promptTemplates.custom;
  return template.replace("{input}", userInput);
}
