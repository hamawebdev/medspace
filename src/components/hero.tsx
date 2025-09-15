// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[75vh] lg:min-h-[80vh] xl:min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 pb-12 lg:pb-16">
      {/* Custom Gradient Background */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `linear-gradient(to right, var(--gradient-left), var(--gradient-center), var(--gradient-right))`
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Left side geometric patterns */}
        <div className="absolute left-8 top-1/4 w-32 h-32 opacity-20">
          <div className="w-full h-full rounded-full border-2 border-white/30"></div>
          <div className="absolute top-4 left-4 w-24 h-24 rounded-full border border-white/20"></div>
        </div>

        {/* Right side dot pattern */}
        <div className="absolute right-8 top-1/3 grid grid-cols-8 gap-2 opacity-30">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white/40 rounded-full"></div>
          ))}
        </div>

        {/* Bottom left decorative circle */}
        <div className="absolute left-0 bottom-32 w-64 h-64 bg-white/5 rounded-full blur-xl"></div>

        {/* Top right small dots */}
        <div className="absolute right-16 top-16 grid grid-cols-4 gap-3 opacity-40">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white/30 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Enhanced Wave Divider at Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden -z-10">
        <svg
          className="relative block w-full h-16 sm:h-20 lg:h-24 xl:h-28"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60L50,50C100,40,200,20,300,25C400,30,500,60,600,70C700,80,800,70,900,60C1000,50,1100,40,1150,35L1200,30L1200,120L1150,120C1100,120,1000,120,900,120C800,120,700,120,600,120C500,120,400,120,300,120C200,120,100,120,50,120L0,120Z"
            className="fill-background transition-all duration-300"
          ></path>
        </svg>
        {/* Subtle gradient overlay for smoother transition */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-7xl mx-auto py-8 lg:py-12 xl:py-16">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">

            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[0.95]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span className="block text-white drop-shadow-2xl" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' }}>
                    Studying is easy
                  </span>
                  <span className="block text-white drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' }}>
                    with <span className="text-emerald-400">MedCortex.</span>
                  </span>
                </h1>
              </motion.div>

              {/* Subtext */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <p
                  className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    lineHeight: '1.3',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  Welcome, future doctors! to your platform
                </p>
                <p
                  className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    lineHeight: '1.4',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  One place that brings together everything you need to excel in your academic journey, from Year 1 to Year 6.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
              >

                <Link href="/login" aria-label="Login to your MedCortex account">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-50 px-8 py-3 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 min-w-[120px] border-2 border-white"
                    style={{ fontFamily: 'var(--font-sans)' }}
                    aria-label="Login to MedCortex"
                  >
                    LOGIN
                  </Button>
                </Link>

                <Link href="/register" aria-label="Sign up for MedCortex">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-400 text-gray-900 hover:bg-emerald-300 px-8 py-3 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 min-w-[120px] border-2 border-emerald-400"
                    style={{ fontFamily: 'var(--font-sans)' }}
                    aria-label="Sign up for MedCortex"
                  >
                    SIGN UP
                  </Button>
                </Link>

              </motion.div>
            </div>

            {/* Right Column - Futuristic Brain Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-start order-1 lg:order-2 relative"
            >
              {/* Desktop Image */}
              <div className="hidden lg:block relative">
                <Image
                  src="/homepage-hero-desktop.png"
                  alt="Futuristic 3D wireframe brain illustration resting on a stylized hand - MedCortex Platform"
                  width={700}
                  height={700}
                  className="w-full h-auto object-contain max-w-lg lg:max-w-xl xl:max-w-2xl drop-shadow-2xl relative z-10"
                  style={{
                    filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))'
                  }}
                  priority
                />
                {/* Additional glow overlay for brain */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-emerald-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
              </div>

              {/* Mobile/Tablet Image */}
              <div className="block lg:hidden relative">
                <Image
                  src="/homepage-hero-mobile.png"
                  alt="Futuristic 3D wireframe brain illustration resting on a stylized hand - MedCortex Platform"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain max-w-xs sm:max-w-sm drop-shadow-2xl relative z-10"
                  style={{
                    filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 15px rgba(34, 211, 238, 0.3))'
                  }}
                  priority
                />
                {/* Additional glow overlay for brain */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-emerald-400/10 to-blue-400/10 rounded-full blur-xl"></div>
              </div>

              {/* Enhanced glow effects behind image */}
              <div className="absolute inset-0 -z-10">
                {/* Main glow */}
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl scale-75 animate-pulse"></div>
                {/* Secondary glow */}
                <div className="absolute inset-0 bg-emerald-400/15 rounded-full blur-2xl scale-90 animate-pulse" style={{ animationDelay: '1s' }}></div>
                {/* Tertiary glow */}
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl scale-110 animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
