"use client";

import { motion } from "framer-motion";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">About SlideXpert</h1>
          
          {/* Mission Statement */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-neutral-300 leading-relaxed">
              SlideXpert was created with a simple goal: to revolutionize the way presentations 
              are made. By harnessing the power of AI, we're making it possible for anyone to 
              create professional-quality presentations in minutes, not hours.
            </p>
          </div>

          {/* Creator Section */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Creator</h2>
            <div className="flex items-center gap-6 mb-4">
              <img
                src="https://github.com/hothead01th.png"
                alt="Creator"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold">hothead01th</h3>
                <p className="text-neutral-400">Full Stack Developer</p>
              </div>
            </div>
            <p className="text-neutral-300 leading-relaxed mb-6">
              As a developer passionate about AI and productivity tools, I created SlideXpert 
              to solve the common challenge of creating engaging presentations quickly and 
              efficiently.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/hothead01th"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
              >
                <IconBrandGithub className="w-5 h-5" />
                GitHub
              </a>
              <a
                href="https://twitter.com/hothead01th"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
              >
                <IconBrandX className="w-5 h-5" />
                Twitter
              </a>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-4">Built With</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "OpenAI", "Framer Motion"].map((tech) => (
                <div key={tech} className="bg-neutral-800 rounded-lg p-4 text-center">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 