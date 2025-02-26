import { NextResponse } from 'next/server'
import axios from 'axios'

const STARAI_API_KEY = process.env.STARAI_API_KEY

if (!STARAI_API_KEY) {
  console.error('STARAI_API_KEY is missing')
}

async function generateImage(prompt: string) {
  try {
    const cleanPrompt = prompt
      .replace(/[^\w\s,.!?-]/g, '')
      .substring(0, 300)

    console.log('Generating image with prompt:', cleanPrompt)

    // Create the image generation request
    const createResponse = await axios.post(
      'https://api.starryai.com/creations/',
      {
        prompt: cleanPrompt,
        model: 'lyra',
        aspectRatio: 'square',
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
        },
        timeout: 60000 // Increased timeout to 60 seconds
      }
    )

    console.log('StarAI creation response:', createResponse.data)
    
    // Get the creation ID from the response
    const creationId = createResponse.data.id
    
    if (!creationId) {
      throw new Error('No creation ID returned from StarAI API')
    }
    
    // Poll for the image status
    const imageUrl = await checkImageStatus(creationId)
    return imageUrl
  } catch (error) {
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
    } catch (error) {
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

    console.log('Generating image for prompt:', prompt)

    try {
      const imageUrl = await generateImage(prompt)
      return NextResponse.json({ imageUrl })
    } catch (error) {
      console.error('Image processing error:', error)
      // Return a 200 response with an error flag instead of throwing
      return NextResponse.json({ 
        error: error.message,
        success: false
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Image request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
} 