// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Star, Shield, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-background to-muted/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,theme(colors.violet.500/0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_50%,theme(colors.violet.400/0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.blue.500/0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,theme(colors.blue.400/0.05),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge className="inline-flex items-center px-4 py-2 bg-muted border-0 text-muted-foreground animate-glow-pulse">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 25,000+ Medical Students
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
          >
            <span className="block text-foreground mb-2">Master Medical</span>
            <span className="block bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered learning platform that adapts to your pace and delivers 
            better results in less time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold border-2 hover:bg-muted/50 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">25,000+</div>
              <div className="text-sm text-muted-foreground">Students Trust Us</div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">94%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">150+</div>
              <div className="text-sm text-muted-foreground">Medical Schools</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
