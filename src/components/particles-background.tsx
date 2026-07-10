"use client";

import React from "react";

export default function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-transparent">
      {/* Ultra-Soft Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #8882 1px, transparent 1px),
            linear-gradient(to bottom, #8882 1px, transparent 1px)
          `,
          backgroundSize: "4rem 4rem",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />

      {/* Smooth Glassmorphic Gradient Orbs - No Noise, Just Clean Blur */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-[100px] sm:blur-[150px] animate-pulse"
        style={{ animationDuration: "10s" }}
      />

      <div
        className="absolute top-[15%] right-[-15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-purple-500/15 dark:bg-purple-600/10 blur-[100px] sm:blur-[150px] animate-pulse"
        style={{ animationDuration: "12s", animationDelay: "2s" }}
      />

      <div
        className="absolute bottom-[-20%] left-[15%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/10 blur-[100px] sm:blur-[150px] animate-pulse"
        style={{ animationDuration: "14s", animationDelay: "4s" }}
      />

      {/* Subtle Glow at the center for depth */}
      <div className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] max-w-[300px] max-h-[300px] rounded-full bg-cyan-400/10 dark:bg-cyan-500/5 blur-[80px] sm:blur-[120px]" />
    </div>
  );
}
