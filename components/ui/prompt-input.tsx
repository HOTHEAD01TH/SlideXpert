"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconSend, IconLoader2 } from '@tabler/icons-react'

export const PromptInput = ({ onSubmit }: { onSubmit: (prompt: string) => void }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    onSubmit(prompt)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700 mt-4"
    >
      <h3 className="text-xl font-semibold mb-4">Create Your Presentation</h3>
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation content..."
          className="w-full bg-neutral-900/50 border border-neutral-700 rounded-lg p-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={4}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IconSend className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </motion.div>
  )
} 