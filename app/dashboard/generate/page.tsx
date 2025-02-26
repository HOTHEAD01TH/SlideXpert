"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconLoader2 } from '@tabler/icons-react'
import { SlidePreview } from '@/components/ui/slide-preview'

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt')
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(-1) // Track which image is being generated
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const generateSlides = async () => {
      try {
        // First, generate the slide content
        const textResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        const textData = await textResponse.json();
        
        if (!textResponse.ok) {
          throw new Error(textData.error || 'Failed to generate presentation');
        }
        
        // Set slides immediately with text content
        setSlides(textData.slides);
        setLoading(false);
        
        // Then, start loading images in the background
        setImagesLoading(true);
        
        const slidesWithImages = [...textData.slides];
        
        // Generate images one by one with a 1-minute delay between each
        for (let i = 0; i < slidesWithImages.length; i++) {
          const slide = slidesWithImages[i];
          setCurrentImageIndex(i); // Update which image is being generated
          
          if (slide.imagePrompt) {
            try {
              console.log(`Generating image ${i+1} of ${slidesWithImages.length}: ${slide.imagePrompt}`);
              
              const imageResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: slide.imagePrompt })
              });
              
              const imageData = await imageResponse.json();
              
              if (imageData.imageUrl && !imageData.error) {
                // Update this specific slide with its image
                const updatedSlides = [...slidesWithImages];
                updatedSlides[i] = {
                  ...slide,
                  imageUrl: imageData.imageUrl
                };
                
                // Update both our working copy and the state
                slidesWithImages[i] = updatedSlides[i];
                setSlides(updatedSlides);
                console.log(`Successfully generated image for slide ${i+1}`);
              } else {
                console.log(`Image generation failed for slide ${i+1}: ${imageData.error || 'Unknown error'}`);
                // Continue without an image
              }
              
              // If this isn't the last slide, wait for 1 minute before the next request
              if (i < slidesWithImages.length - 1) {
                console.log(`Waiting 60 seconds before generating the next image...`);
                await new Promise(resolve => setTimeout(resolve, 60000)); // 60000ms = 1 minute
              }
            } catch (imageError) {
              console.error('Error generating image:', imageError);
              // Continue with other slides even if one image fails
              
              // Still wait before the next request
              if (i < slidesWithImages.length - 1) {
                console.log(`Waiting 60 seconds before generating the next image...`);
                await new Promise(resolve => setTimeout(resolve, 60000));
              }
            }
          }
        }
        
        setImagesLoading(false);
        setCurrentImageIndex(-1); // Reset the image index when done
      } catch (error: any) {
        console.error('Error generating slides:', error);
        setError(error.message || 'Failed to generate presentation. Please try again.');
        setLoading(false);
        setImagesLoading(false);
      }
    }

    if (prompt) {
      generateSlides()
    } else {
      setLoading(false);
    }
  }, [prompt])

  const handleDownload = async () => {
    // Implementation for downloading the presentation
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
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {imagesLoading && (
        <div className="fixed bottom-4 right-4 bg-neutral-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg">
          <IconLoader2 className="w-4 h-4 animate-spin" />
          <span>
            {currentImageIndex >= 0 
              ? `Generating image ${currentImageIndex + 1} of ${slides.length}...` 
              : "Generating images..."}
          </span>
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