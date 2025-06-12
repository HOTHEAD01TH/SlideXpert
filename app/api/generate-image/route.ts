import { NextResponse } from 'next/server'
import axios from 'axios'

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY

// Use a shorter timeout to avoid Vercel timeouts
export const maxDuration = 60; // 1 minute timeout for the Edge function

// Simple in-memory cache (will be cleared on deployment)
type CacheEntry = {
  imageUrl: string;
  model: string;
  timestamp: number;
  simplified?: boolean;
}

// Cache with a 24-hour expiry
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const imageCache = new Map<string, CacheEntry>();

// Define models in order of preference (fastest/lightest first)
const IMAGE_MODELS = [
  {
    name: 'stabilityai/stable-diffusion-xl-base-1.0', // Medium complexity
    timeout: 35000, // 35 seconds
  },
  {
    name: 'black-forest-labs/FLUX.1-dev', // Most complex, best quality
    timeout: 45000, // 45 seconds
  }
];

interface ImageResult {
  success: boolean;
  imageUrl: string;
  model: string;
  error?: string;
  status?: number;
}

async function generateImageWithModel(prompt: string, modelConfig: typeof IMAGE_MODELS[0]): Promise<ImageResult> {
  try {
    console.log(`Trying model ${modelConfig.name} for prompt: ${prompt}`);
    
    const response = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${modelConfig.name}`,
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'
      },
      data: {
        inputs: prompt,
        options: {
          wait_for_model: true,
          use_cache: true // Enable caching for faster responses
        }
      },
      responseType: 'arraybuffer',
      timeout: modelConfig.timeout
    });

    if (response.data && response.data.byteLength > 0) {
      const base64Image = Buffer.from(response.data).toString('base64');
      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        model: modelConfig.name
      };
    }
    
    return {
      success: false,
      imageUrl: '/placeholder.png',
      error: 'Empty response from API',
      model: modelConfig.name
    };
  } catch (error: any) {
    console.error(`Error with model ${modelConfig.name}:`, {
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    return {
      success: false,
      imageUrl: '/placeholder.png',
      error: error.message,
      status: error.response?.status,
      model: modelConfig.name
    };
  }
}

// Simplified prompt to improve success rate
function simplifyPrompt(prompt: string): string {
  // Remove complex descriptors and keep it short
  let simplified = prompt
    .replace(/highly detailed|intricate|photorealistic|cinematic|professional|high quality|4k|8k|uhd/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit to 50 characters
  if (simplified.length > 50) {
    simplified = simplified.substring(0, 50);
  }
  
  return simplified;
}

// Clean the cache of expired entries
function cleanCache() {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [key, entry] of imageCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY) {
      imageCache.delete(key);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    console.log(`Cleaned ${expiredCount} expired entries from image cache`);
  }
}

export const runtime = 'edge';

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
    
    // Clean expired cache entries
    cleanCache();
    
    // Check cache first
    if (imageCache.has(prompt)) {
      const cachedResult = imageCache.get(prompt)!;
      console.log(`Cache hit for prompt: "${prompt.substring(0, 30)}..."`);
      return NextResponse.json({
        imageUrl: cachedResult.imageUrl,
        model: String(cachedResult.model),
        simplified: cachedResult.simplified,
        fromCache: true
      });
    }
    
    // Try with original prompt first
    for (const model of IMAGE_MODELS) {
      const result = await generateImageWithModel(prompt, model);
      
      if (result.success) {
        console.log(`Successfully generated image using ${result.model}`);
        
        // Cache the result
        imageCache.set(prompt, {
          imageUrl: result.imageUrl,
          model: result.model,
          timestamp: Date.now()
        });
        
        return NextResponse.json({ 
          imageUrl: result.imageUrl,
          model: result.model
        });
      }
      
      // If model is loading (503) or rate limited (429), move to next model
      if (result.status === 503 || result.status === 429) {
        console.log(`Model ${result.model} unavailable, trying next model`);
        continue;
      }
    }
    
    // If all models failed with original prompt, try with simplified prompt
    const simplifiedPrompt = simplifyPrompt(prompt);
    console.log(`All models failed with original prompt. Trying simplified prompt: ${simplifiedPrompt}`);
    
    // Check cache for simplified prompt
    if (imageCache.has(simplifiedPrompt)) {
      const cachedResult = imageCache.get(simplifiedPrompt)!;
      console.log(`Cache hit for simplified prompt: "${simplifiedPrompt}"`);
      
      // Cache the original prompt too
      imageCache.set(prompt, {
        imageUrl: cachedResult.imageUrl,
        model: cachedResult.model,
        timestamp: Date.now(),
        simplified: true
      });
      
      return NextResponse.json({
        imageUrl: cachedResult.imageUrl,
        model: String(cachedResult.model),
        simplified: true,
        fromCache: true
      });
    }
    
    for (const model of IMAGE_MODELS) {
      const result = await generateImageWithModel(simplifiedPrompt, model);
      
      if (result.success) {
        console.log(`Successfully generated image using ${result.model} with simplified prompt`);
        
        // Cache both the original and simplified prompts
        imageCache.set(simplifiedPrompt, {
          imageUrl: result.imageUrl,
          model: result.model,
          timestamp: Date.now()
        });
        
        imageCache.set(prompt, {
          imageUrl: result.imageUrl,
          model: result.model,
          timestamp: Date.now(),
          simplified: true
        });
        
        return NextResponse.json({ 
          imageUrl: result.imageUrl,
          model: result.model,
          simplified: true
        });
      }
    }
    
    // If all attempts failed, return placeholder
    console.log('All image generation attempts failed, using placeholder');
    return NextResponse.json({ 
      imageUrl: '/placeholder.png',
      error: 'Failed to generate image with all models'
    });
    
  } catch (error: any) {
    console.error('Request processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      imageUrl: '/placeholder.png' 
    }, { status: 500 });
  }
}