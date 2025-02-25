"use client";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const products = [
  {
    title: "Data Analytics",
    link: "/features/analytics", 
    thumbnail: "/temp1.jpg"
  },
  {
    title: "Team Collaboration",
    link: "/features/collaboration",
    thumbnail: "/temp2.jpg"
  },
  {
    title: "Custom Branding",
    link: "/features/branding",
    thumbnail: "/temp3.jpg"
  },
  {
    title: "Interactive Charts",
    link: "/features/charts",
    thumbnail: "/temp4.jpg"
  },
  {
    title: "Video Integration",
    link: "/features/video",
    thumbnail: "/temp5.jpg"
  },
  {
    title: "Real-time Editing",
    link: "/features/realtime",
    thumbnail: "/temp6.jpg"
  },
  {
    title: "Export Options",
    link: "/features/export",
    thumbnail: "/temp7.jpg"
  },
  {
    title: "Cloud Storage",
    link: "/features/storage",
    thumbnail: "/temp8.jpg"
  },
  {
    title: "Version Control",
    link: "/features/versions",
    thumbnail: "/temp9.jpg"
  },
  {
    title: "Mobile Support",
    link: "/features/mobile",
    thumbnail: "/temp10.jpg"
  },
  {
    title: "Advanced Security",
    link: "/features/security",
    thumbnail: "/temp11.jpg"
  },
  {
    title: "API Access",
    link: "/features/api",
    thumbnail: "/temp12.jpg"
  },
  {
    title: "Smart Presentations",
    link: "/features/smart-presentations",
    thumbnail: "/temp13.jpg"
  },
  {
    title: "AI-Powered Content",
    link: "/features/ai-content",
    thumbnail: "/temp14.jpg"
  },
  {
    title: "Beautiful Templates",
    link: "/features/templates",
    thumbnail: "/temp15.jpg"
  },
];

const navItems = [
  {
    name: "Features",
    link: "/features",
  },
  {
    name: "Pricing",
    link: "/pricing",
  },
  {
    name: "About",
    link: "/about",
  },
  {
    name: "Contact",
    link: "/contact",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <FloatingNav navItems={navItems} />
      <div className="relative">
        <HeroParallax products={products} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
