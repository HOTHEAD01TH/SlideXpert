"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconLoader2 } from '@tabler/icons-react'

type GenerationHistory = {
  id: string;
  user_id: string;
  user_prompt: string;
  gemini_response: string;
  image_prompts: string[];
  created_at: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('generation_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (error) throw error
        if (data) setHistory(data)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Generation History</h1>
      <div className="space-y-6">
        {history.map((entry) => (
          <div 
            key={entry.id}
            className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">User Prompt</h3>
              <p className="text-neutral-300">{entry.user_prompt}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Gemini Response</h3>
              <pre className="bg-neutral-900 p-4 rounded-md overflow-x-auto">
                <code>{entry.gemini_response}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Image Generation Prompts</h3>
              <ul className="list-disc pl-5 space-y-2">
                {entry.image_prompts.map((prompt, index) => (
                  <li key={index} className="text-neutral-300">{prompt}</li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-neutral-400 mt-4">
              Generated on {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 