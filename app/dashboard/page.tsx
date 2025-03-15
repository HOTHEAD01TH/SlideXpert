'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'
import { IconFileText, IconHistory, IconSettings, IconLogout, IconBrain, IconPresentationAnalytics, IconUser, IconAlertTriangle, IconCreditCard, IconInfoCircle, IconMail, IconX } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PromptInput } from '@/components/ui/prompt-input'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showBetaAlert, setShowBetaAlert] = useState(true)

  const sidebarLinks = [
    {
      label: "Generate PPTX",
      href: "#",
      icon: <IconBrain className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setShowPrompt(true)
    },
    {
      label: "My Presentations",
      href: "/dashboard/presentations",
      icon: <IconFileText className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "History",
      href: "/dashboard/history",
      icon: <IconHistory className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Features",
      href: "/features",
      icon: <IconPresentationAnalytics className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: <IconCreditCard className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "About",
      href: "/about",
      icon: <IconInfoCircle className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Contact",
      href: "/contact",
      icon: <IconMail className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <IconSettings className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />,
    },
  ]

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          router.push('/signin')
          return
        }
        setUser(session.user)
      } catch (error) {
        console.error('Error checking auth status:', error)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const handlePromptSubmit = (prompt: string) => {
    router.push(`/dashboard/generate?prompt=${encodeURIComponent(prompt)}`)
    setShowPrompt(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody>
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="px-2 py-4 flex items-center gap-2">
                <div className={cn("transition-all flex items-center justify-center", sidebarOpen ? "w-5 h-5" : "w-8 h-8")}>
                  <IconPresentationAnalytics className="w-30 h-30 text-neutral-200" />
                </div>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    width: sidebarOpen ? "auto" : 0,
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                  }}
                  className="text-xl font-bold whitespace-nowrap overflow-hidden"
                >
                SlideXpert
                </motion.span>
              </div>
              <div className="space-y-2">
                {sidebarLinks.map((link) => (
                  <SidebarLink key={link.href} link={link} open={sidebarOpen} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-neutral-700/50 transition-colors">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
                    </Avatar>
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{
                        opacity: sidebarOpen ? 1 : 0,
                        width: sidebarOpen ? "auto" : 0,
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                        opacity: { duration: 0.2 }
                      }}
                      className="text-neutral-200 text-sm whitespace-nowrap overflow-hidden"
                    >
                      Your Profile
                    </motion.span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Last Sign In</p>
                      <p className="text-sm">{new Date(user?.last_sign_in_at).toLocaleString()}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors px-2 py-2 w-full rounded-md hover:bg-neutral-700/50"
              >
                <IconLogout className="w-5 h-5" />
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    width: sidebarOpen ? "auto" : 0,
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                  }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sign Out
                </motion.span>
              </button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-auto relative">
        <StarsBackground className="opacity-50" />
        <ShootingStars className="opacity-30" />
        
        <div className="p-8 relative z-10">
          {showBetaAlert && (
            <div className="mb-8 p-4 bg-neutral-800/80 border border-amber-900/50 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconAlertTriangle className="w-5 h-5 text-amber-500/80 flex-shrink-0" />
                <p className="text-sm text-amber-200/80">
                  Beta Version: Please avoid spamming the service. If images don't appear in some slides, try refreshing the page.
                </p>
              </div>
              <button 
                onClick={() => setShowBetaAlert(false)}
                className="text-amber-200/80 hover:text-amber-200 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Generate PPTX Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <IconBrain className="w-8 h-8 mb-4 text-purple-500" />
              <h3 className="text-xl font-semibold mb-2">Generate Presentation</h3>
              <p className="text-neutral-400 mb-4">Create beautiful presentations from text using AI</p>
              <button 
                onClick={() => setShowPrompt(!showPrompt)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                Start Creating
              </button>
            </div>

            {/* Recent Presentations Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <IconFileText className="w-8 h-8 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2">Recent Presentations</h3>
              <p className="text-neutral-400 mb-4">Access your previously generated presentations</p>
              <button 
                onClick={() => router.push('/dashboard/presentations')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                View All
              </button>
            </div>

            {/* History Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <IconHistory className="w-8 h-8 mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">Generation History</h3>
              <p className="text-neutral-400 mb-4">View your past generation attempts and results</p>
              <button 
                onClick={() => router.push('/dashboard/history')}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                View History
              </button>
            </div>
          </div>

          {/* Prompt Input Section */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {showPrompt && <PromptInput onSubmit={handlePromptSubmit} />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

