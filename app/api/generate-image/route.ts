import { NextResponse } from 'next/server'
import axios from 'axios'

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

async function generateImage(prompt: string) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { 
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error: any) {
    console.error('Hugging Face API error:', error);
    // Return the local placeholder image path
    return '/placeholder.png';
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
    // Return the local placeholder image path on any error
    return NextResponse.json({ imageUrl: '/placeholder.png' });
  }
} 