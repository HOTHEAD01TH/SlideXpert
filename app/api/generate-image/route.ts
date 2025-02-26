import { NextResponse } from 'next/server'
import axios from 'axios'
import { readFileSync } from 'fs';
import { join } from 'path';

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
        width: 512,
        height: 768,  // Taller height
        highResolution: true,
        steps: 30,    // Increased steps for better quality
        initialImageMode: 'color',
        stylePreset: 'digital-art'
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'X-API-Key': STARAI_API_KEY
        },
        timeout: 180000 // Increased timeout to 3 minutes
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

// Add retry logic for image status check
async function checkImageStatus(creationId: string, maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const statusResponse = await axios.get(
        `https://api.starryai.com/creations/${creationId}`,
        {
          headers: { 'X-API-Key': STARAI_API_KEY }
        }
      );

      if (statusResponse.data.status === 'completed') {
        return statusResponse.data.images[0].url;
      }

      await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds between checks
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Image generation timeout');
}

// Add this function to get placeholder image
async function getPlaceholderImage() {
  try {
    // Use unsplash API for free placeholder images
    const response = await fetch('https://source.unsplash.com/random/512x768/?abstract');
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.error('Error getting placeholder image:', error);
    // Return a default base64 image if unsplash fails
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    try {
      const imageUrl = await generateImage(prompt);
      return NextResponse.json({ imageUrl });
    } catch (error: any) {
      // If StarAI fails, use placeholder
      const placeholderImage = await getPlaceholderImage();
      return NextResponse.json({ 
        imageUrl: `data:image/jpeg;base64,${placeholderImage}`,
        isPlaceholder: true
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 