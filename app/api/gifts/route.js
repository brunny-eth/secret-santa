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
    
    console.log('Claude response:', text);

    // Split into suggestions and clean them up
    const suggestions = text.split('\n')
      .filter(line => {
        const trimmed = line.trim();
        // Match bullet points, hyphens, or numbered items
        return trimmed && (
          trimmed.startsWith('•') || 
          trimmed.startsWith('-') || 
          /^\d+\./.test(trimmed) ||
          trimmed.startsWith('*')
        );
      })
      .map(line => {
        const trimmed = line.trim();
        // Remove any kind of list marker
        return trimmed.replace(/^(?:\d+\.|[-•*]|\s)+/, '').trim();
      });

    console.log('Processed suggestions:', suggestions);

    // Verify we have suggestions before sending
    if (!suggestions || suggestions.length === 0) {
      console.error('No suggestions found in text:', text);
      return Response.json({ error: 'No suggestions generated' }, { status: 500 });
    }

    return Response.json({ suggestions });
  } catch (error) {
    console.error('Error in gifts API:', error);
    return Response.json({ 
      error: 'Failed to get suggestions', 
      details: error.message 
    }, { status: 500 });
  }
}