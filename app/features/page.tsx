"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { IconBrain, IconDownload, IconPresentationAnalytics, IconHistory, IconCloud, IconSettings } from "@tabler/icons-react";
import { products } from "@/config/products";

export default function FeaturesPage() {
  const features = [
    {
      title: "AI-Powered Generation",
      description: "Create professional presentations instantly using our advanced AI technology",
      icon: <IconBrain className="w-8 h-8 text-purple-500" />
    },
    {
      title: "Free to Use",
      description: "Get started with our basic features at no cost, including up to 5 slides per presentation",
      icon: <IconPresentationAnalytics className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Downloadable PPT",
      description: "Export your presentations in PowerPoint format, ready for use anywhere",
      icon: <IconDownload className="w-8 h-8 text-green-500" />
    },
    {
      title: "Presentation History",
      description: "Access all your previously generated presentations anytime",
      icon: <IconHistory className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Cloud Storage",
      description: "Your presentations are automatically saved and accessible from any device",
      icon: <IconCloud className="w-8 h-8 text-teal-500" />
    },
    {
      title: "Custom Settings",
      description: "Control slide count, style preferences, and content generation parameters",
      icon: <IconSettings className="w-8 h-8 text-indigo-500" />
    }
  ];

  const demoSlides = [
    {
      title: "Death Note Anime",
      thumbnail: "/ppt5.png",
      downloadUrl: "/death_note.pptx",
    },
    {
      title: "Top Rappers",
      thumbnail: "/ppt3.png", 
      downloadUrl: "/top_rappers.pptx",
    },
    {
      title: "Beauty of Kashmir",
      thumbnail: "/ppt4.png",
      downloadUrl: "/kashmir.pptx",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Features Section */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">Our Features</h1>
        <p className="text-neutral-400 text-center max-w-2xl mx-auto mb-12">
          Transform your ideas into stunning presentations with our AI-powered platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -5 }}
              className="bg-neutral-900/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-800"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured Slides Section */}
        <h2 className="text-3xl font-bold text-center mb-8">Featured Slides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {products.map((product) => (
            <motion.div
              key={product.title}
              whileHover={{ y: -10 }}
              className="bg-neutral-900 rounded-xl p-6"
            >
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={400}
                height={300}
                className="rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
            </motion.div>
          ))}
        </div>

        {/* Demo Presentations */}
        <h2 className="text-3xl font-bold text-center mb-8">Demo Presentations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demoSlides.map((demo) => (
            <div key={demo.title} className="bg-neutral-900 rounded-xl p-6">
              <Image
                src={demo.thumbnail}
                alt={demo.title}
                width={400}
                height={300}
                className="rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-4">{demo.title}</h3>
              <a
                href={demo.downloadUrl}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                Download Demo
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 