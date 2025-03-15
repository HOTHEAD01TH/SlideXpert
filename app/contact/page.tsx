"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconMail, IconBrandX, IconBrandGithub } from "@tabler/icons-react";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');

    // Add your form submission logic here
    // For now, we'll just simulate a submission
    setTimeout(() => {
      setFormStatus('sent');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">Get in Touch</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={formStatus !== 'idle'}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white px-6 py-3 rounded-md transition-colors"
                >
                  {formStatus === 'idle' && 'Send Message'}
                  {formStatus === 'sending' && 'Sending...'}
                  {formStatus === 'sent' && 'Message Sent!'}
                  {formStatus === 'error' && 'Error - Try Again'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8">
                <h2 className="text-xl font-semibold mb-4">Connect With Us</h2>
                <div className="space-y-4">
                  <a
                    href="mailto:contact@slideexpert.com"
                    className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                  >
                    <IconMail className="w-5 h-5" />
                    contact@slideexpert.com
                  </a>
                  <a
                    href="https://twitter.com/hothead01th"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                  >
                    <IconBrandX className="w-5 h-5" />
                    @hothead01th
                  </a>
                  <a
                    href="https://github.com/hothead01th"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                  >
                    <IconBrandGithub className="w-5 h-5" />
                    hothead01th
                  </a>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8">
                <h2 className="text-xl font-semibold mb-4">FAQ</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">How quickly can I create a presentation?</h3>
                    <p className="text-neutral-300">Most presentations can be generated in under 2 minutes.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Do you offer custom solutions?</h3>
                    <p className="text-neutral-300">Yes! Contact us for enterprise and custom requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 