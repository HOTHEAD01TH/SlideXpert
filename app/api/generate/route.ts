import { NextResponse } from 'next/server'
import axios from 'axios'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { rateLimit } from '@/lib/rate-limit'
import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const STARAI_API_KEY = process.env.STARAI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing')
}

if (!STARAI_API_KEY) {
  console.error('STARAI_API_KEY is missing')
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
    "content": "string (max 100 words)",
    "imagePrompt": "string (max 100 chars)"
  }
]

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
      // If parsing fails, try generating again
      throw new Error('Failed to parse presentation data');
    }
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

async function generateImage(prompt: string) {
  try {
    const cleanPrompt = prompt
      .replace(/[^\w\s,.!?-]/g, '')
      .substring(0, 300)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const createResponse = await axios.post(
      'https://api.starryai.com/creations/',
      {
        prompt: cleanPrompt,
        model: 'lyra',
        aspectRatio: '16:9',
        highResolution: false,
        images: 1,
        steps: 20,
        initialImageMode: 'color',
        stylePreset: 'digital-art'
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'X-API-Key': STARAI_API_KEY
        }
      }
    )

    if (!createResponse.data?.id) {
      throw new Error('Invalid response from StarAI API')
    }

    return await checkImageStatus(createResponse.data.id)
  } catch (error: any) {
    console.error('StarAI API error:', error.response?.data || error.message)
    throw new Error('Failed to generate image')
  }
}

async function checkImageStatus(creationId: string): Promise<string> {
  const maxAttempts = 30
  const delayMs = 3000

  const checkStatus = async (attempt: number): Promise<string> => {
    if (attempt >= maxAttempts) {
      throw new Error('Image generation timeout')
    }

    await new Promise(resolve => setTimeout(resolve, delayMs))

    try {
      const statusResponse = await axios.get(
        `https://api.starryai.com/creations/${creationId}`,
        {
          headers: {
            'accept': 'application/json',
            'X-API-Key': STARAI_API_KEY
          }
        }
      )

      const status = statusResponse.data?.status
      const imageUrl = statusResponse.data?.images?.[0]?.url

      if (status === 'completed' && imageUrl) {
        return imageUrl
      }

      if (status === 'failed') {
        throw new Error('Image generation failed')
      }

      return checkStatus(attempt + 1)
    } catch (error: any) {
      console.error('Status check error:', error.response?.data || error.message)
      if (attempt < maxAttempts - 1) {
        return checkStatus(attempt + 1)
      }
      throw new Error('Failed to check image status')
    }
  }

  return checkStatus(0)
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