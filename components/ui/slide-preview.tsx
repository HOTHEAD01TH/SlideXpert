"use client"

import { motion } from 'framer-motion'
import { IconChevronLeft, IconChevronRight, IconDownload } from '@tabler/icons-react'
import type { Slide } from '@/types/slides'

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

  const handlePrevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto"> {/* Increased max-width */}
      {/* Navigation and preview container */}
      <div className="flex items-center gap-8 w-full"> {/* Increased gap */}
        <button
          onClick={handlePrevSlide}
          disabled={currentSlide === 0}
          className="p-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0" // Added flex-shrink-0
        >
          <IconChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative aspect-[16/9] bg-neutral-800 rounded-lg overflow-hidden mb-6 shadow-xl flex-grow"> {/* Added flex-grow */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 p-8 flex"
          >
            <div className="flex-1 pr-4">
              <h2 className="text-3xl font-bold mb-6">{slides[currentSlide]?.title}</h2>
              {formatContent(slides[currentSlide]?.content || '')}
            </div>
            {slides[currentSlide]?.imageUrl && (
              <div className="w-[40%] relative">
                <img
                  src={slides[currentSlide].imageUrl}
                  alt={slides[currentSlide].title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </motion.div>
        </div>

        <button
          onClick={handleNextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0" // Added flex-shrink-0
        >
          <IconChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide counter and download button */}
      <div className="flex items-center gap-4">
        <span className="text-neutral-400">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <button
          onClick={onDownload}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <IconDownload className="w-5 h-5" />
          Download PPTX
        </button>
      </div>
    </div>
  );
}