"use client";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FloatingNav } from "@/components/ui/floating-navbar";
import Link from "next/link";
import { Footer } from '@/components/ui/footer'

const products = [
  {
    title: "Data Analytics",
    thumbnail: "/temp1.jpg"
  },
  {
    title: "Team Collaboration",
    thumbnail: "/temp2.jpg"
  },
  {
    title: "Custom Branding",
    thumbnail: "/temp3.jpg"
  },
  {
    title: "Interactive Charts",
    thumbnail: "/temp4.jpg"
  },
  {
    title: "Video Integration",
    thumbnail: "/temp5.jpg"
  },
  {
    title: "Real-time Editing",
    thumbnail: "/temp6.jpg"
  },
  {
    title: "Export Options",
    thumbnail: "/temp7.jpg"
  },
  {
    title: "Cloud Storage",
    thumbnail: "/temp8.jpg"
  },
  {
    title: "Version Control",
    thumbnail: "/temp9.jpg"
  },
  {
    title: "Mobile Support",
    thumbnail: "/temp10.jpg"
  },
  {
    title: "Advanced Security",
    thumbnail: "/temp11.jpg"
  },
  {
    title: "API Access",
    thumbnail: "/temp12.jpg"
  },
  {
    title: "Smart Presentations",
    thumbnail: "/temp13.jpg"
  },
  {
    title: "AI-Powered Content",
    thumbnail: "/temp14.jpg"
  },
  {
    title: "Beautiful Templates",
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
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center">
          <Link href="/signup">
            <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              Get Started
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
