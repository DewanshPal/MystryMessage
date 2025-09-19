import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: `${process.env.GEMINI_API_KEY}` });

export async function POST() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log(response.text);
    return new Response(response.text, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback questions in case of API failure
    if (error instanceof Error) {
      const fallbackQuestions = "What's your favorite way to spend a weekend?||If you could learn any skill instantly, what would it be?||What's something that always makes you smile?";
      
      // Return fallback for quota or other API errors
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('unauthorized')) {
        return new Response(fallbackQuestions, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
      
      return NextResponse.json(
        { name: error.name, message: error.message },
        { status: 500 },
      );
    }
    throw error;
  }
}
