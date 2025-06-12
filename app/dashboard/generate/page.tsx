"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconLoader2 } from '@tabler/icons-react'
import { SlidePreview } from '@/components/ui/slide-preview'
import { supabase } from '@/lib/supabase'
import pptxgen from 'pptxgenjs'
import type { Presentation, Slide } from '@/types/slides'
import { Button } from '@/components/ui/button'
import { IconPhoto } from '@tabler/icons-react'

function GenerateContent() {
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(-1) // Track which image is being generated
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isCancelled, setIsCancelled] = useState(false)
  const cancelRef = useRef(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Auth check:', user ? 'User found' : 'No user');
      setUser(user);
      setLoading(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, []);

  const handleCancelGeneration = () => {
    setIsCancelled(true)
    cancelRef.current = true
    setImagesLoading(false)
    setCurrentImageIndex(-1)
  }

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    // Reset cancel state when prompt changes
    return () => {
      cancelRef.current = false;
      setIsCancelled(false);
      timeouts.forEach(timeout => clearTimeout(timeout));
    }
  }, [prompt]);

  // Modify the useEffect for prompt param to prevent auto-generation
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && !loading && !hasGenerated && user) {
      setPrompt(promptParam);
      
      // Don't auto-generate on page load
      if (searchParams.get('generate') === 'true') {
        loadExistingPresentation(promptParam).then(exists => {
          if (!exists) {
            setHasGenerated(true); // Mark as generated
            generateSlides();
          } else {
            setHasGenerated(true); // Mark as generated even if we found existing
          }
        });
      } else {
        // Just set the prompt without generating
        setHasGenerated(false);
        setLoading(false);
      }
    }
  }, [searchParams, loading, user, hasGenerated]);

  const generateSlides = async () => {
    if (isGenerating) {
      console.log('🚫 Generation already in progress');
      return;
    }

    try {
      setIsGenerating(true);
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('You must be logged in to generate presentations');
      }

      console.log('🚀 Starting slide generation for prompt:', prompt);
      setError(null);
      setLoading(true);
      setImagesLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      try {
        const textResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt,
            checkExisting: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        let errorMessage = 'Failed to generate presentation';
        
        if (!textResponse.ok) {
          if (textResponse.status === 504) {
            errorMessage = 'The request timed out. Please try again.';
          } else if (textResponse.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          } else {
            try {
              const errorData = await textResponse.json();
              errorMessage = errorData.error || errorMessage;
              
              // Handle Gemini API quota errors
              if (errorMessage.includes('Gemini API quota')) {
                errorMessage = 'The AI service is currently busy. Please try again later.';
              }
            } catch {
              const errorText = await textResponse.text();
              errorMessage = errorText || errorMessage;
            }
          }
          throw new Error(errorMessage);
        }

        let textData;
        const responseText = await textResponse.text();
        
        try {
          textData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid response from server. Please try again.');
        }

        if (!textData.slides || !Array.isArray(textData.slides)) {
          throw new Error('Invalid response format. Please try again.');
        }

        // Continue with the rest of your existing code
        setSlides(textData.slides);
        const slidesWithImages = [...textData.slides];
        const imagePrompts = slidesWithImages.map(slide => slide.imagePrompt);
        setLoading(false);
        
        // Save initial history
        if (user) {
          console.log('👤 Current user:', user.id);
          console.log('📝 Preparing to save generation history...');
          const historyEntry = {
            user_id: user.id,
            user_prompt: prompt,
            gemini_response: JSON.stringify(textData.slides, null, 2),
            image_prompts: imagePrompts
          };

          console.log('📊 History entry data:', historyEntry);
          const { data: historyData, error: historyError } = await supabase
            .from('generation_history')
            .insert(historyEntry)
            .select()
            .single();

          if (historyError) {
            console.error('❌ Error saving generation history:', historyError);
            console.error('Error details:', {
              code: historyError.code,
              message: historyError.message,
              details: historyError.details
            });
          } else {
            console.log('✅ Generation history saved successfully, ID:', historyData.id);
          }
        }
        
        // Don't automatically generate images, wait for user to click button
        setImagesLoading(false);
        setCurrentImageIndex(-1);
        console.log('🎉 Text generation process completed successfully');
      } catch (error: any) {
        console.error('❌ Error in generation process:', error);
        const errorMsg = error.message || 'An unexpected error occurred';
        
        setError(errorMsg);
      } finally {
        setIsGenerating(false);
        setLoading(false);
        setImagesLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Error in generation process:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setError(errorMsg);
    }
  };

  // Separate function to load existing presentation
  const loadExistingPresentation = async (searchPrompt: string) => {
    try {
      setLoading(true);
      const { data: existingPresentation } = await supabase
        .from('presentations')
        .select('*')
        .eq('prompt', searchPrompt.trim())
        .maybeSingle();

      if (existingPresentation) {
        console.log('Found existing presentation:', existingPresentation);
        setSlides(existingPresentation.slides);
        
        // Check if any slides are missing images
        const needsImages = existingPresentation.slides.some((slide: Slide) => !slide.imageUrl);
        if (needsImages) {
          console.log('🎨 Some slides missing images, regenerating...');
          setImagesLoading(true);
          const slidesWithImages = [...existingPresentation.slides];
          
          // Generate images for slides that don't have them
          for (let i = 0; i < slidesWithImages.length; i++) {
            const slide = slidesWithImages[i];
            if (!slide.imageUrl && slide.imagePrompt) {
              setCurrentImageIndex(i);
              try {
                console.log(`Generating image for slide ${i + 1}: ${slide.imagePrompt.substring(0, 50)}...`);
                
                const imageResponse = await fetch('/api/generate-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: slide.imagePrompt })
                });
                
                if (!imageResponse.ok) {
                  console.warn(`Image generation failed for slide ${i + 1}, using placeholder`);
                  slidesWithImages[i] = {
                    ...slide,
                    imageUrl: '/placeholder.png'
                  };
                } else {
                  const imageData = await imageResponse.json();
                  if (imageData.imageUrl) {
                    slidesWithImages[i] = {
                      ...slide,
                      imageUrl: imageData.imageUrl,
                      imageModel: imageData.model,
                      imageSimplified: imageData.simplified
                    };
                    console.log(`✅ Successfully generated image for slide ${i + 1}${imageData.model ? ` using ${imageData.model}` : ''}`);
                  }
                }
              } catch (imageError) {
                console.error(`Error generating image for slide ${i + 1}:`, imageError);
                slidesWithImages[i] = {
                  ...slide,
                  imageUrl: '/placeholder.png'
                };
              }
              
              setSlides([...slidesWithImages]);
              
              // Wait between requests to avoid rate limiting
              if (i < slidesWithImages.length - 1 && i + 1 < slidesWithImages.filter(s => !s.imageUrl && s.imagePrompt).length) {
                console.log('Waiting before generating next image...');
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
          
          // Update presentation with new images
          const { error: updateError } = await supabase
            .from('presentations')
            .update({ slides: slidesWithImages })
            .eq('id', existingPresentation.id);
            
          if (updateError) {
            console.error('Error updating presentation with images:', updateError);
          } else {
            console.log('✅ Updated presentation with generated images');
          }
          
          setImagesLoading(false);
          setCurrentImageIndex(-1);
        }
        
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Error loading existing presentation:', error);
      setLoading(false);
      return false;
    }
  };

  // Reset hasGenerated when prompt changes
  useEffect(() => {
    return () => {
      setHasGenerated(false);
    };
  }, [prompt]);

  // Add this useEffect to monitor loading state
  useEffect(() => {
    if (loading) {
      console.log('Loading state changed to true');
    }
  }, [loading]);

  const handleDownload = async () => {
    try {
      setDownloading(true)
      
      // Create a new presentation
      const pres = new pptxgen()
      
      // Set presentation properties
      pres.layout = 'LAYOUT_16x9'
      pres.title = prompt || 'AI Generated Presentation'
      
      // Add each slide to the presentation
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        
        // Create a new slide
        const pptSlide = pres.addSlide()
        pptSlide.background = { color: '000000' }
        
        // Add title
        pptSlide.addText(slide.title, {
          x: 0.5,
          y: 0.3,
          w: '90%',
          h: 1.0,
          fontSize: 32,
          bold: true,
          color: 'FFFFFF',
          align: 'left'
        })
        
        // Format content as bullet points
        const sentences = slide.content
          .split(/(?<=\.)\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
        
        let currentY = 1.5
        sentences.forEach((sentence, index) => {
          pptSlide.addText(sentence, {
            x: 0.5,
            y: currentY,
            w: '45%',
            h: 0.7,
            fontSize: 14,
            color: 'FFFFFF',
            bullet: { type: 'bullet' },
            align: 'left',
            paraSpaceBefore: 8,
            paraSpaceAfter: 8
          })
          currentY += 0.8
        })
        
        // Add image if available
        if (slide.imageUrl) {
          try {
            let imageData = '';
            
            // For data URLs (base64 images)
            if (slide.imageUrl.startsWith('data:')) {
              // Keep the full data URL including the header
              imageData = slide.imageUrl;
            } else {
              // For remote URLs, fetch and construct proper data URL
              const response = await fetch(slide.imageUrl, {
                cache: 'no-store',
                headers: {
                  'Accept': 'image/*'
                }
              });
              
              if (!response.ok) throw new Error('Failed to fetch image');
              
              const blob = await response.blob();
              const arrayBuffer = await blob.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              imageData = `data:image/jpeg;base64,${base64}`;
            }
            
            pptSlide.addImage({
              data: imageData,
              x: 6,
              y: 0.3,
              w: 3.5,
              h: 5.0
            });
          } catch (error) {
            console.error('Error adding image to slide:', error);
          }
        }
      }
      
      // Generate a filename based on the prompt
      const filename = prompt 
        ? `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`
        : 'ai_generated_presentation.pptx'
      
      // Save the presentation
      await pres.writeFile({ fileName: filename })
      setDownloading(false)
    } catch (error: any) {
      console.error('Error generating PPTX:', error)
      setError('Failed to download presentation. Please try again.')
      setDownloading(false)
    }
  }

  const savePresentation = async (prompt: string, slides: Slide[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          prompt: prompt,
          slides: slides
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving presentation:', error)
        return null
      }

      return data
    }
    return null
  }

  const generateImages = async () => {
    if (!slides || slides.length === 0) {
      setError("No slides to generate images for");
      return;
    }
    
    setIsGeneratingImages(true);
    setImagesLoading(true);
    const slidesWithImages = [...slides];
    
    try {
      // Process one slide at a time to avoid overloading the API
      for (let i = 0; i < slidesWithImages.length; i++) {
        if (cancelRef.current) break;

        const slide = slidesWithImages[i];
        setCurrentImageIndex(i);
        
        if (slide.imagePrompt) {
          try {
            console.log(`Generating image for slide ${i + 1}: ${slide.imagePrompt.substring(0, 50)}...`);
            
            const imageResponse = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: slide.imagePrompt })
            });
            
            if (!imageResponse.ok) {
              console.warn(`Image generation failed for slide ${i + 1}, using placeholder`);
              slidesWithImages[i] = {
                ...slide,
                imageUrl: '/placeholder.png'
              };
            } else {
              const imageData = await imageResponse.json();
              if (imageData.imageUrl) {
                slidesWithImages[i] = {
                  ...slide,
                  imageUrl: imageData.imageUrl,
                  imageModel: imageData.model,
                  imageSimplified: imageData.simplified
                };
                console.log(`✅ Successfully generated image for slide ${i + 1}${imageData.model ? ` using ${imageData.model}` : ''}`);
              }
            }
          } catch (imageError) {
            console.error(`Error generating image for slide ${i + 1}:`, imageError);
            slidesWithImages[i] = {
              ...slide,
              imageUrl: '/placeholder.png'
            };
          }
          
          setSlides([...slidesWithImages]);
          
          // Wait between requests to avoid rate limiting
          if (i < slidesWithImages.length - 1) {
            console.log('Waiting before generating next image...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // Now save the presentation with images
      if (user) {
        console.log('💾 Preparing to save presentation...');
        const presentation = {
          user_id: user.id,
          prompt: prompt || '',
          slides: slidesWithImages,
          created_at: new Date().toISOString()
        };
        
        console.log('📊 Presentation data:', {
          user_id: presentation.user_id,
          prompt: presentation.prompt,
          slides_count: presentation.slides.length
        });

        const { data, error: presentationError } = await supabase
          .from('presentations')
          .insert(presentation)
          .select()
          .single();

        if (presentationError) {
          console.error('❌ Error saving presentation:', presentationError);
          console.error('Error details:', {
            code: presentationError.code,
            message: presentationError.message,
            details: presentationError.details
          });
        } else {
          console.log('✅ Presentation saved successfully, ID:', data.id);
        }
      }
      
      setImagesLoading(false);
      setCurrentImageIndex(-1);
      setIsGeneratingImages(false);
      console.log('🎉 Image generation process completed successfully');
    } catch (error: any) {
      console.error('❌ Error in image generation process:', error);
      setError(error.message || 'An unexpected error occurred during image generation');
      setImagesLoading(false);
      setIsGeneratingImages(false);
    }
  };

  if (loading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="mt-4 text-neutral-400">
          {!authChecked ? 'Checking authentication...' : 'Generating your presentation...'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-center max-w-md">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            // Add a small delay before retrying
            setTimeout(() => {
              if (prompt && !error.includes("Rate limit")) {
                generateSlides();
              }
            }, 1000);
          }}
          className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (prompt && !isGenerating && !loading && slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to generate your presentation</h2>
          <p className="text-neutral-400">Topic: {prompt}</p>
        </div>
        <button 
          onClick={generateSlides}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-md transition-colors text-lg"
        >
          Generate Presentation
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {!slides.length && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={generateSlides}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            Generate New Presentation
          </button>
        </div>
      )}
      
      {imagesLoading && (
        <div className="fixed bottom-4 right-4 bg-neutral-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg">
          <IconLoader2 className="w-4 h-4 animate-spin" />
          <span>
            {currentImageIndex >= 0 
              ? `Generating image ${currentImageIndex + 1} of ${slides.length}${retryCount > 0 ? ` (Retry ${retryCount})` : ''}...` 
              : "Generating images..."}
          </span>
          <button
            onClick={handleCancelGeneration}
            className="ml-2 bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      )}
      
      {downloading && (
        <div className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg">
          <IconLoader2 className="w-4 h-4 animate-spin" />
          <span>Creating PowerPoint file...</span>
        </div>
      )}
      
      <SlidePreview
        slides={slides}
        onDownload={handleDownload}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
      
      {slides.length > 0 && !isGenerating && !imagesLoading && !isGeneratingImages && (
        <div className="mt-4 text-center">
          <Button onClick={generateImages} className="bg-green-600 hover:bg-green-700">
            <IconPhoto className="mr-2 h-4 w-4" />
            Generate Images
          </Button>
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    }>
      <GenerateContent />
    </Suspense>
  )
} 