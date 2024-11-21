import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    // Extract the text from the response
    const text = response.content[0].text;
    
    // Split into suggestions and clean them up
    const suggestions = text.split('\n')
      .filter(line => line.trim() && line.startsWith('•')) // Keep only bullet points
      .map(line => line.trim().substring(2).trim()); // Remove bullet point and trim

    return Response.json({ suggestions });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return Response.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}