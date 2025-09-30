import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get prompt from request body, or use default if not provided
    let prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    
    try {
      const body = await request.json();
      if (body.prompt && body.prompt.trim()) {
        prompt = body.prompt;
      }
    } catch {
      // If no valid JSON body, use default prompt
    }

    // Direct API call to Google Gemini
    console.log('Making request to Gemini API...');
    console.log('API Key present:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    console.log('Request payload:', JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt.substring(0, 100) + '...' }] // Log first 100 chars
        }
      ]
    }));
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error Details:`);
      console.error(`Status: ${response.status}`);
      console.error(`Error Text:`, errorText);
      
      // Try to parse error JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`Parsed Error:`, errorJson);
      } catch (e) {
        console.error('Could not parse error as JSON');
      }
      
      // throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Create proper AI SDK streaming format for useCompletion
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send start event
        controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"0"}\n\n`));
        
        // Send the text content as delta
        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"0","delta":"${generatedText.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`));
        
        // Send end event
        controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"0"}\n\n`));
        
        // Send finish event
        controller.enqueue(encoder.encode(`data: {"type":"finish"}\n\n`));
        
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('=== GEMINI API ERROR DETAILS ===');
    console.error('Error type:', typeof error);
    console.error('Error instanceof Error:', error instanceof Error);
    console.error('Full error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    console.log('=== FALLING BACK TO RANDOM QUESTIONS ===');
    
    // Comprehensive fallback questions
    const fallbackQuestions = [
      "What's your favorite way to spend a weekend?||If you could learn any skill instantly, what would it be?||What's something that always makes you smile?",
      "What's the best advice you've ever received?||If you could visit any place in the world, where would you go?||What's a book or movie that changed your perspective?",
      "What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?",
      "What's your biggest dream or goal?||If you could master any instrument, which would you choose?||What's your favorite childhood memory?",
      "What's something you're grateful for today?||If you could time travel, would you go to the past or future?||What's the most interesting thing you've learned recently?"
    ];
    
    // Pick a random set of fallback questions
    const randomFallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    
    console.log('Selected fallback questions:', randomFallback);
    console.log('=== PREPARING FALLBACK RESPONSE ===');
    
    // Return fallback with proper AI SDK streaming format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        console.log('Streaming fallback start...');
        
        // Send start event
        controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"0"}\n\n`));
        
        // Send the fallback text as delta
        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"0","delta":"${randomFallback.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`));
        
        // Send end event
        controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"0"}\n\n`));
        
        // Send finish event
        controller.enqueue(encoder.encode(`data: {"type":"finish"}\n\n`));
        
        console.log('Streaming fallback complete.');
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
