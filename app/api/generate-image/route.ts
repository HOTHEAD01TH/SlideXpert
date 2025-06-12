import { NextResponse } from 'next/server'
import axios from 'axios'

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

// Increase the timeout for the Edge runtime
export const maxDuration = 180; // 3 minutes (maximum allowed by Vercel)

async function generateImage(prompt: string, retryCount = 0) {
  try {
    // Log the request to help with debugging
    console.log('Sending image generation request with prompt:', prompt);
    
    // Use the exact format required by Hugging Face API
    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'  // Critical: specify the expected response format
      },
      data: {
        inputs: prompt,
        options: {
          wait_for_model: true  // Wait for the model to load if it's not ready
        }
      },
      responseType: 'arraybuffer',
      timeout: 150000, // 150 second timeout (2.5 minutes)
    });

    // Check if we got a valid response
    if (response.data && response.data.byteLength > 0) {
      const base64Image = Buffer.from(response.data).toString('base64');
      return `data:image/png;base64,${base64Image}`; // Changed to PNG
    } else {
      throw new Error('Empty response from image API');
    }
  } catch (error: any) {
    // Add detailed error logging
    console.error('Hugging Face API error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code
    });
    
    // Handle timeout errors (ECONNABORTED or 504)
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      console.log('Request timed out, using placeholder image');
      return '/placeholder.png';
    }
    
    // Special handling for common Hugging Face API errors
    if (error.response?.status === 404) {
      console.log('Model not found, using placeholder image');
      return '/placeholder.png'; // Return placeholder directly
    }
    
    // 503 means the model is still loading
    if (error.response?.status === 503) {
      if (retryCount < 1) { // Reduced retries for production
        console.log('Model is loading, waiting and retrying...');
        // Wait longer for model loading (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));
        return generateImage(prompt, retryCount + 1);
      } else {
        console.log('Model still loading after retries, using placeholder');
        return '/placeholder.png';
      }
    }
    
    // Add retry logic for other errors
    if (retryCount < 1) {
      console.log(`Retrying image generation after error (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
      return generateImage(prompt, retryCount + 1);
    }
    
    // Return placeholder for any error
    console.log('Failed to generate image after retries, using placeholder');
    return '/placeholder.png';
  }
}

// Add a fallback function to use a simpler model
async function generateImageFallback(prompt: string) {
  try {
    console.log('Trying fallback model for prompt:', prompt);
    
    // Use a simpler model as fallback
    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'
      },
      data: {
        inputs: prompt,
        options: {
          wait_for_model: true
        }
      },
      responseType: 'arraybuffer',
      timeout: 60000, // 60 second timeout for fallback
    });

    if (response.data && response.data.byteLength > 0) {
      const base64Image = Buffer.from(response.data).toString('base64');
      return `data:image/png;base64,${base64Image}`;
    }
  } catch (error) {
    console.error('Fallback model also failed:', error);
  }
  
  // If fallback also fails, return placeholder
  return '/placeholder.png';
}

export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'Prompt is required',
        imageUrl: '/placeholder.png'
      }, { status: 400 });
    }

    console.log('Processing image request for prompt:', prompt);
    
    // Set a timeout for the entire request
    const timeoutPromise = new Promise<string>(resolve => {
      setTimeout(() => {
        console.log('Request timeout reached, returning placeholder');
        resolve('/placeholder.png');
      }, 160000); // 160 second global timeout (2.6 minutes)
    });
    
    try {
      // Try the primary model first
      const result = await Promise.race([
        generateImage(prompt, 0),
        timeoutPromise
      ]);
      
      // If we got a placeholder from the primary model, try the fallback
      if (result === '/placeholder.png') {
        console.log('Primary model failed, trying fallback model');
        const fallbackResult = await generateImageFallback(prompt);
        return NextResponse.json({ imageUrl: fallbackResult });
      }
      
      return NextResponse.json({ imageUrl: result });
    } catch (error) {
      console.log('Error with primary model, trying fallback');
      const fallbackResult = await generateImageFallback(prompt);
      return NextResponse.json({ imageUrl: fallbackResult });
    }
    
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image',
      imageUrl: '/placeholder.png' 
    }, { status: 500 });
  }
}