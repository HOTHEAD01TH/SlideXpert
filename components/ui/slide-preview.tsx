"use client"

import { motion } from 'framer-motion'
import { IconDownload, IconPresentation } from '@tabler/icons-react'

interface SlidePreviewProps {
  slides: any[]
  onDownload: () => void
  currentSlide: number
  setCurrentSlide: (slide: number) => void
}

export function SlidePreview({ slides, onDownload, currentSlide, setCurrentSlide }: SlidePreviewProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="relative w-full aspect-[16/9] bg-neutral-800 rounded-lg overflow-hidden mb-6">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 p-8"
        >
          <h2 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h2>
          <p className="text-lg mb-4">{slides[currentSlide].content}</p>
          {slides[currentSlide].imageUrl && (
            <img 
              src={slides[currentSlide].imageUrl} 
              alt={slides[currentSlide].title}
              className="max-w-[50%] rounded-lg shadow-lg"
            />
          )}
        </motion.div>
      </div>

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

      <button
        onClick={onDownload}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
      >
        <IconDownload className="w-5 h-5" />
        Download Presentation
      </button>
    </div>
  )
} 