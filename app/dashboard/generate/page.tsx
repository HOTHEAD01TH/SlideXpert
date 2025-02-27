"use client"

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconLoader2 } from '@tabler/icons-react'
import { SlidePreview } from '@/components/ui/slide-preview'
import { supabase } from '@/lib/supabase'
import pptxgen from 'pptxgenjs'
import type { Presentation, Slide } from '@/types/slides'

export default function GeneratePage() {
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

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

  const generateSlides = async () => {
    try {
      setError(null);
      setLoading(true);
      setImagesLoading(true);
      console.log('Starting slide generation...');

      const textResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          checkExisting: false
        })
      });
      
      const textData = await textResponse.json();
      
      if (!textResponse.ok) {
        if (textResponse.status === 429) {
          throw new Error('Please wait a moment before generating another presentation.');
        }
        throw new Error(textData.error || 'Failed to generate presentation');
      }

      if (!textData.slides || !Array.isArray(textData.slides) || textData.slides.length === 0) {
        throw new Error('Invalid response from Gemini API. Please try again.');
      }
      
      const slidesWithImages = [...textData.slides];
      const imagePrompts = slidesWithImages.map(slide => slide.imagePrompt);
      setSlides(slidesWithImages);
      setLoading(false);
      
      // Save initial history
      if (user) {
        const historyEntry = {
          user_id: user.id,
          user_prompt: prompt,
          gemini_response: JSON.stringify(textData.slides, null, 2),
          image_prompts: imagePrompts
        };

        const { error: historyError } = await supabase
          .from('generation_history')
          .insert(historyEntry);

        if (historyError) {
          console.error('Error saving generation history:', historyError);
        }
      }
      
      // Generate images first
      if (!cancelRef.current && textData.slides.length > 0) {
        for (let i = 0; i < slidesWithImages.length; i++) {
          if (cancelRef.current) break;

          const slide = slidesWithImages[i];
          setCurrentImageIndex(i);
          
          if (slide.imagePrompt) {
            try {
              const imageResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: slide.imagePrompt })
              });
              
              const imageData = await imageResponse.json();
              
              if (imageData.imageUrl) {
                slidesWithImages[i] = {
                  ...slide,
                  imageUrl: imageData.imageUrl
                };
                setSlides([...slidesWithImages]);
              }
              
              if (!imageData.error && i < slidesWithImages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 10000));
              }
            } catch (imageError) {
              console.error('Error generating image:', imageError);
            }
          }
        }
      }
      
      // Now save the presentation with images
      if (user) {
        const presentation = {
          user_id: user.id,
          prompt: prompt || '',
          slides: slidesWithImages, // Now includes generated images
          created_at: new Date().toISOString()
        };

        const { error: presentationError } = await supabase
          .from('presentations')
          .insert(presentation);

        if (presentationError) {
          console.error('Error saving presentation:', presentationError);
        } else {
          console.log('Presentation saved successfully with images');
        }
      }
      
      setImagesLoading(false);
      setCurrentImageIndex(-1);
    } catch (error: any) {
      console.error('Error in generateSlides:', error);
      setError(error.message || 'Failed to generate presentation. Please try again.');
      setLoading(false);
      setImagesLoading(false);
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

  // Use this in your useEffect
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setPrompt(promptParam);
      loadExistingPresentation(promptParam).then(exists => {
        if (!exists) {
          generateSlides();
        }
      });
    }
  }, [searchParams]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="mt-4 text-neutral-400">Generating your presentation...</p>
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
              if (prompt) generateSlides();
            }, 1000);
          }}
          className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    )
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
              ? `Generating image ${currentImageIndex + 1} of ${slides.length}...` 
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
    </div>
  )
} 