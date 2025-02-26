import { NextResponse } from 'next/server'
import axios from 'axios'
import { readFileSync } from 'fs';
import { join } from 'path';

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

async function generateImage(prompt: string) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { 
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert the image buffer to base64
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error: any) {
    console.error('Hugging Face API error:', error);
    // Fallback to placeholder image
    return getPlaceholderImage();
  }
}

// Get a random placeholder from Unsplash
async function getPlaceholderImage() {
  try {
    const response = await axios.get('https://source.unsplash.com/512x768/?abstract', {
      responseType: 'arraybuffer'
    });
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error getting placeholder:', error);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const imageUrl = await generateImage(prompt);
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 