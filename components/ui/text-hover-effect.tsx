"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";

export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="h-32 md:h-28 w-full relative z-50">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 200"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        <defs>
          <linearGradient
            id="shimmerGradient"
            gradientUnits="userSpaceOnUse"
          >
            <motion.stop
              offset="-20%"
              stopColor="currentColor"
              animate={{
                offset: ["-20%", "120%", "120%", "-20%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="0%"
              stopColor="#3b82f6"
              animate={{
                offset: ["0%", "140%", "140%", "0%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="20%"
              stopColor="#ef4444"
              animate={{
                offset: ["20%", "160%", "160%", "20%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="40%"
              stopColor="#eab308"
              animate={{
                offset: ["40%", "180%", "180%", "40%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="60%"
              stopColor="#22c55e"
              animate={{
                offset: ["60%", "200%", "200%", "60%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="80%"
              stopColor="#8b5cf6"
              animate={{
                offset: ["80%", "220%", "220%", "80%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
            <motion.stop
              offset="100%"
              stopColor="currentColor"
              animate={{
                offset: ["100%", "240%", "240%", "100%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1]
              }}
            />
          </linearGradient>
        </defs>

        {/* Base text layer */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold text-[80px] md:text-[120px]"
          fill="currentColor"
          opacity="0.1"
        >
          {text}
        </text>

        {/* Animated outline */}
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="1"
          className="font-bold text-[80px] md:text-[120px]"
          fill="transparent"
          stroke="currentColor"
          initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
          animate={{
            strokeDashoffset: 0,
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.text>

        {/* Shimmer effect layer */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="1"
          className="font-bold text-[80px] md:text-[120px]"
          fill="url(#shimmerGradient)"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
