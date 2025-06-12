import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing')
}

const model = new GoogleGenerativeAI(GEMINI_API_KEY!)
  .getGenerativeModel({ 
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

async function generateSlides(prompt: string, signal: AbortSignal) {
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
      }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    const text = result.response.text();
    console.log('Raw Gemini response:', text);

    const cleanedText = text.trim()
      .replace(/```json\s*|\s*```/g, '')
      .replace(/^[\s\S]*?\[/, '[')
      .replace(/\][\s\S]*$/, ']')
      .replace(/\n/g, ' ')
      .replace(/,(\s*})/g, '$1')
      .replace(/,(\s*])/g, '$1');
    
    try {
      const fixedText = cleanedText
        .replace(/([{\[,]\s*)"([^"]+)":\s*"([^"]+)([^"]*)$/gm, '$1"$2": "$3"$4')
        .replace(/([^,{])\s*}/g, '$1,}')
        .replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(fixedText);
      
      if (!Array.isArray(parsed) || parsed.length !== 5) {
        throw new Error('Invalid response format');
      }
      
      const validatedSlides = parsed.map(slide => ({
        title: String(slide.title || '').slice(0, 50),
        content: String(slide.content || ''),
        imagePrompt: String(slide.imagePrompt || '').slice(0, 100)
      }));

      return validatedSlides;
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Problematic text:', cleanedText);
      throw new Error('Failed to parse Gemini response');
    }
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Check for quota exceeded errors
    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      throw new Error('The AI service is currently busy. Please try again later.');
    }
    
    throw error;
  }
}

export const runtime = 'edge'
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: Request) {
  try {
    const { prompt, checkExisting = true } = await request.json()
    
    // Add timeout to Gemini API call
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes

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

    try {
      const slides = await generateSlides(prompt, controller.signal)
      clearTimeout(timeoutId)
      return NextResponse.json({ slides, fromCache: false })
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request took too long to process. Please try again with a simpler prompt.' },
          { status: 408 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate presentation' },
      { status: error.status || 500 }
    )
  }
}