"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconLoader2, IconFileText, IconDownload } from '@tabler/icons-react'
import type { Presentation } from '@/types/slides'
import { useRouter } from 'next/navigation'
import pptxgen from 'pptxgenjs'

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadPresentations()
  }, [])

  async function loadPresentations() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('presentations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (data) {
          console.log('Loaded presentations:', data);
          setPresentations(data)
        }
        if (error) {
          console.error('Error loading presentations:', error)
        }
      }
    } catch (error) {
      console.error('Error in loadPresentations:', error);
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Presentations</h1>
      <div className="grid grid-cols-1 gap-6">
        {presentations.map((presentation) => (
          <div 
            key={presentation.id}
            className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-medium mb-2">{presentation.prompt}</h3>
                <p className="text-sm text-neutral-400">
                  Created on {new Date(presentation.created_at!).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/dashboard/generate?prompt=${encodeURIComponent(presentation.prompt)}`)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors"
                >
                  View Presentation
                </button>
              </div>
            </div>
            <p className="text-sm text-neutral-400">{presentation.slides.length} slides</p>
          </div>
        ))}
      </div>
    </div>
  )
} 