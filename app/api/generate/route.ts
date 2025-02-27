import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { rateLimit } from '@/lib/rate-limit'
import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing')
}

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 50, // Increase from 10 to 50
})

const model = new GoogleGenerativeAI(GEMINI_API_KEY!)
  .getGenerativeModel({ 
    model: "gemini-1.5-pro",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

async function generateSlides(prompt: string) {
  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Create exactly 5 slides about: "${prompt}"

Return ONLY a JSON array in this exact format, with no other text or markdown:
[
  {
    "title": "string (max 50 chars)",
    "content": "string (minimum 4-5 bullet points, make each point concise and informative)",
    "imagePrompt": "string (max 100 chars)"
  }
]

Guidelines for content:
- Each slide should have 4-5 key points
- Points should be clear and concise
- Ensure logical flow between points
- End each point with a period
- Include relevant facts and examples
- Avoid single-word bullet points

The response must be valid JSON with exactly 5 slides.`
        }]
      }]
    });

    const text = result.response.text();
    console.log('Raw Gemini response:', text);

    // Clean the response and ensure it's valid JSON
    const cleanedText = text.trim()
      .replace(/```json\s*|\s*```/g, '') // Remove code blocks
      .replace(/^[\s\S]*?\[/, '[')       // Remove any text before the array
      .replace(/\][\s\S]*$/, ']');       // Remove any text after the array
    
    try {
      const parsed = JSON.parse(cleanedText);
      if (!Array.isArray(parsed) || parsed.length !== 5) {
        throw new Error('Invalid response format');
      }
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse presentation data');
    }
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, checkExisting = true } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Only check Supabase if checkExisting is true
    if (checkExisting) {
      const { data: existingPresentation } = await supabase
        .from('presentations')
        .select('*')
        .eq('prompt', prompt.trim())
        .maybeSingle();

      if (existingPresentation) {
        return NextResponse.json({ 
          slides: existingPresentation.slides,
          fromCache: true 
        });
      }
    }

    // Only generate new slides if not found in cache
    const slides = await generateSlides(prompt);
    return NextResponse.json({ slides, fromCache: false });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate presentation' },
      { status: error.status || 500 }
    );
  }
}