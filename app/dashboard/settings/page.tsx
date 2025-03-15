"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  IconLoader2, 
  IconInfoCircle, 
  IconLock, 
  IconCrown, 
  IconSettings 
} from '@tabler/icons-react'
import Head from 'next/head'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Settings - SlideXpert</title>
      </Head>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {/* Notice about slide limit */}
        <div className="mb-8 p-4 bg-blue-900/30 backdrop-blur-sm border border-blue-800 rounded-lg flex items-start gap-3">
          <IconInfoCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Current Limitations</p>
            <p>We currently limit presentations to 5 slides to manage API usage and ensure optimal performance for all users. Upgrade to Premium for custom slide counts and additional features.</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="space-y-6">
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700">
            <h2 className="text-xl font-medium mb-6">User Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                <div className="text-white bg-neutral-700/50 rounded-lg p-3">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">User ID</label>
                <div className="text-white bg-neutral-700/50 rounded-lg p-3 font-mono text-sm">
                  {user?.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Account Created</label>
                <div className="text-white bg-neutral-700/50 rounded-lg p-3">
                  {new Date(user?.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Last Sign In</label>
                <div className="text-white bg-neutral-700/50 rounded-lg p-3">
                  {new Date(user?.last_sign_in_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features (Locked) */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-amber-700/50">
            <div className="flex items-center gap-2 mb-6">
              <IconCrown className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-medium text-amber-500">Premium Features</h2>
            </div>
            
            <div className="space-y-6">
              {/* Slide Count Settings */}
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Custom Slide Count</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    disabled
                    value={5}
                    className="w-24 bg-neutral-700/30 border border-neutral-600 rounded-lg p-2 text-neutral-400 cursor-not-allowed"
                  />
                  <IconLock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Image Style Settings */}
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Image Generation Style</label>
                <div className="flex items-center gap-3">
                  <select
                    disabled
                    className="w-full max-w-xs bg-neutral-700/30 border border-neutral-600 rounded-lg p-2 text-neutral-400 cursor-not-allowed"
                  >
                    <option>Realistic (Premium)</option>
                    <option>Artistic (Premium)</option>
                    <option>Abstract (Premium)</option>
                  </select>
                  <IconLock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Image Resolution Settings */}
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Image Resolution</label>
                <div className="flex items-center gap-3">
                  <select
                    disabled
                    className="w-full max-w-xs bg-neutral-700/30 border border-neutral-600 rounded-lg p-2 text-neutral-400 cursor-not-allowed"
                  >
                    <option>Standard (512x512)</option>
                    <option>HD (1024x1024) (Premium)</option>
                    <option>Ultra HD (2048x2048) (Premium)</option>
                  </select>
                  <IconLock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Theme Settings */}
              <div className="relative">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Presentation Themes</label>
                <div className="flex items-center gap-3">
                  <select
                    disabled
                    className="w-full max-w-xs bg-neutral-700/30 border border-neutral-600 rounded-lg p-2 text-neutral-400 cursor-not-allowed"
                  >
                    <option>Default</option>
                    <option>Professional (Premium)</option>
                    <option>Modern (Premium)</option>
                    <option>Creative (Premium)</option>
                  </select>
                  <IconLock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Premium Banner */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/20 to-purple-900/20 rounded-lg border border-amber-600/30">
                <p className="text-amber-300 text-sm">
                  Unlock all premium features and customize your presentation experience.
                  Premium coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 