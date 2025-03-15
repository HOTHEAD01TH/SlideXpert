import Link from 'next/link'
import { IconBrandGithub, IconBrandX, IconWorld } from '@tabler/icons-react'

export function Footer() {
  const socialLinks = [
    {
      icon: <IconBrandGithub className="w-5 h-5" />,
      href: 'https://github.com/hothead01th',
      label: 'GitHub'
    },
    {
      icon: <IconBrandX className="w-5 h-5" />,
      href: 'https://twitter.com/hothead01th',
      label: 'X (Twitter)'
    },
    {
      icon: <IconWorld className="w-5 h-5" />,
      href: 'https://hothead01th.vercel.app',
      label: 'Vercel'
    }
  ]

  return (
    <footer className="border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">SlideXpert</h3>
            <p className="text-neutral-400">
              Transform your ideas into professional presentations with AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800">
          <p className="text-center text-neutral-400">
            © {new Date().getFullYear()} SlideXpert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 