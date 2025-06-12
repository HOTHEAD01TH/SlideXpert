import { NextResponse } from 'next/server'
import axios from 'axios'

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

// Increase the timeout for the Edge runtime
export const maxDuration = 120; // 2 minutes

async function generateImage(prompt: string, retryCount = 0) {
  try {
    // Log the request to help with debugging
    console.log('Sending image generation request with prompt:', prompt);
    
    // Use the exact format required by Hugging Face API
    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'  // Critical: specify the expected response format
      },
      data: {
        inputs: prompt
      },
      responseType: 'arraybuffer',
      timeout: 90000, // 90 second timeout - increased from 60s
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

    // Don't enhance the prompt automatically
    console.log('Processing image request for prompt:', prompt);
    
    // Set a timeout for the entire request
    const timeoutPromise = new Promise<string>(resolve => {
      setTimeout(() => {
        console.log('Request timeout reached, returning placeholder');
        resolve('/placeholder.png');
      }, 100000); // 100 second global timeout
    });
    
    // Race between the image generation and the timeout
    const result = await Promise.race([
      generateImage(prompt),
      timeoutPromise
    ]);
    
    // If result is a string (direct image URL), return it
    return NextResponse.json({ imageUrl: result });
    
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image',
      imageUrl: '/placeholder.png' 
    }, { status: 500 });
  }
}