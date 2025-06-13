import { NextResponse } from 'next/server'
import axios from 'axios'

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

async function generateImage(prompt: string, retryCount = 0) {
  try {
    console.log(`Generating image with prompt: "${prompt.substring(0, 30)}..."`);
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { 
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted",
          guidance_scale: 7.5,
          num_inference_steps: 30,  // Reduce steps for faster generation
          width: 768,  // Standard size that works well
          height: 512
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png'
        },
        responseType: 'arraybuffer',
        timeout: 60000 // Increase timeout to 60 seconds
      }
    );

    console.log('Image generated successfully');
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error: any) {
    // Add retry logic for 500 errors
    if (error.response?.status === 500 && retryCount < 1) {
      console.log(`Retrying image generation after 500 error (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      return generateImage(prompt, retryCount + 1);
    }

    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      console.error('Image generation timed out');
      return NextResponse.json({ 
        error: 'Image generation timed out. Please try again.' 
      }, { status: 504 });
    }

    if (error.response?.status === 402) {
      console.error('API quota exceeded or invalid key (402 error)');
      return NextResponse.json({ 
        error: 'Hugging Face API quota exceeded or invalid API key. Please check your API key and quota status.',
        imageUrl: '/placeholder.png'
      }, { status: 402 });
    }

    console.error('Hugging Face API error:', error.response?.status || error.code || 'Unknown error');
    return NextResponse.json({ 
      error: 'Failed to generate image',
      imageUrl: '/placeholder.png'
    }, { status: error.response?.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateImage(prompt);
    
    // If result is a NextResponse (error case), return it directly
    if (result instanceof NextResponse) {
      return result;
    }
    
    return NextResponse.json({ imageUrl: result });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image',
      imageUrl: '/placeholder.png' 
    }, { status: 500 });
  }
} 