import { NextResponse } from 'next/server'
import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const STARAI_API_KEY = process.env.STARAI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing')
}

if (!STARAI_API_KEY) {
  console.error('STARAI_API_KEY is missing')
}

const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  .getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateSlides(prompt: string) {
  try {
    const model = new GoogleGenerativeAI(GEMINI_API_KEY!)
      .getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Create a detailed presentation outline for: "${prompt}"
          
          Respond with a JSON array of exactly 5 slides.
          Each slide must follow this format:
          {
            "title": "Slide Title",
            "content": "Detailed slide content with 60-80 words per slide. Include facts, examples, and explanations. Make it engaging and informative.",
            "imagePrompt": "Detailed description for generating an image that represents this slide"
          }
          
          Guidelines:
          - Titles under 50 characters
          - Content should be 60-80 words (300-400 characters) per slide
          - Image prompts under 100 characters
          - Must be valid JSON array
          - No additional text or explanations`
        }]
      }]
    });

    const text = result.response.text();
    console.log('Gemini response:', text);

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Failed to parse presentation data');
    }
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw new Error(`Gemini API error: ${error.message}`)
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
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Generating slides for prompt:', prompt)

    try {
      const slides = await generateSlides(prompt)
      console.log('Generated slides:', slides)

      return NextResponse.json({ slides })
    } catch (error: any) {
      console.error('Processing error:', error)
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate presentation' },
      { status: 500 }
    )
  }
}