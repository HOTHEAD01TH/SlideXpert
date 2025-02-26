"use client"

import { motion } from 'framer-motion'
import { IconDownload } from '@tabler/icons-react'

type Slide = {
  title: string
  content: string
  imagePrompt?: string
  imageUrl?: string
}

type SlidePreviewProps = {
  slides: Slide[]
  onDownload: () => void
  currentSlide: number
  setCurrentSlide: (slide: number) => void
}

export function SlidePreview({ slides, onDownload, currentSlide, setCurrentSlide }: SlidePreviewProps) {
  const formatContent = (content: string) => {
    const sentences = content.split(/(?<=\.)\s+/);
    return (
      <ul className="list-disc pl-5 space-y-2">
        {sentences.map((sentence, idx) => (
          <li key={idx} className="text-lg">{sentence.trim()}</li>
        ))}
      </ul>
    );
  };

  // Always keep image on right side
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <div className="relative w-full aspect-[16/9] bg-neutral-800 rounded-lg overflow-hidden mb-6 shadow-xl">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 p-8 flex"
        >
          {/* Content layout with image always on right */}
          <div className="flex w-full h-full">
            {/* Text content section */}
            <div className="w-[65%] pr-6 flex flex-col">
              <h2 className="text-3xl font-bold mb-4 text-purple-300">{slides[currentSlide].title}</h2>
              <div className="mt-2">
                {formatContent(slides[currentSlide].content)}
              </div>
            </div>
            
            {/* Image section - always on right */}
            <div className="w-[35%] flex items-center justify-center">
              {slides[currentSlide].imageUrl ? (
                <img 
                  src={slides[currentSlide].imageUrl} 
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 rounded-lg flex items-center justify-center">
                  <p className="text-neutral-400">Image loading...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Slide navigation dots */}
      <div className="flex gap-2 mb-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index ? 'bg-purple-500' : 'bg-neutral-600'
            }`}
          />
        ))}
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-md transition-colors font-medium"
      >
        <IconDownload className="w-5 h-5" />
        Download Presentation
      </button>
    </div>
  )
} 