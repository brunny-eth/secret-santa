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

    // The content is now in the response object
    console.log('Full Claude Response:', response);
    
    // Extract the text from the response
    const text = response.content[0].text;
    
    // Split into suggestions
    const suggestions = text.split('\n')
      .filter(line => line.trim() && line.match(/^\d+\./))  // Keep only numbered lines
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove the number prefix

    return Response.json({ suggestions });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return Response.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}