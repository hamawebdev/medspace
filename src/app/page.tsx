// @ts-nocheck
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components';
import { PricingToggle, PricingMode } from '@/components/ui/pricing-toggle';
import { useHomepageStudyPacks } from '@/hooks/use-study-packs';
import { transformStudyPacksForHomepage, sortStudyPacksForDisplay, getStudyPackDisplayIcon } from '@/utils/study-pack-transform';
import {
  BookOpen,
  BarChart3,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Brain,
  GraduationCap,
  TrendingUp,
  Target,
  Clock,
  Shield,
  Zap,
  Globe,
  Trophy,
  Play,
  Check,
  HelpCircle,
  Layers,
  RefreshCw,
  Rocket,
  BarChart
} from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [pricingMode, setPricingMode] = useState<PricingMode>('YEAR');

  // Force light mode for homepage
  useEffect(() => {
    // Force light mode by setting data-theme and class
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Also set the theme in localStorage to override next-themes
    localStorage.setItem('theme', 'light');
    
    return () => {
      // Cleanup: restore system theme preference when leaving homepage
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    };
  }, []);

  // Fetch study packs from API
  const { studyPacks, loading: studyPacksLoading, error: studyPacksError, refresh } = useHomepageStudyPacks();

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const stats = [
    {
      icon: Users,
      label: "Active Students",
      value: "25,000+",
      description: "Medical students worldwide trust our platform",
      color: "from-primary to-ring",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      icon: BookOpen,
      label: "Questions Answered",
      value: "2.5M+",
      description: "Comprehensive medical questions solved daily",
      color: "from-chart-1 to-chart-2",
      bgColor: "bg-chart-1/10",
      borderColor: "border-chart-1/20"
    },
    {
      icon: Trophy,
      label: "Success Rate",
      value: "100%",
      description: "Students achieve their target scores",
      color: "from-chart-2 to-chart-4",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/20"
    },
    {
      icon: Globe,
      label: "Universities",
      value: "150+",
      description: "Top medical schools globally represented",
      color: "from-chart-5 to-destructive",
      bgColor: "bg-chart-5/10",
      borderColor: "border-chart-5/20"
    },
  ];

  // Caractéristiques section data - matching the provided design
  const characteristics = [
    {
      icon: HelpCircle,
      title: 'Banque de Questions Premium',
      description: '100 000+ questions médicales alignées sur le programme officiel de la Faculté de Médecine de Sétif.',
    },
    {
      icon: Layers,
      title: 'Organisation Intelligente',
      description: 'Contenu structuré par modules, cours et années d\'études pour un apprentissage ciblé.',
    },
    {
      icon: CheckCircle,
      title: 'Contenu Certifié',
      description: 'Questions validées par des experts médicaux selon les standards internationaux.',
    },
    {
      icon: RefreshCw,
      title: 'Évolution Continue',
      description: 'Plateforme dynamique constamment enrichie pour rester à la pointe de l\'innovation.',
    },
    {
      icon: Rocket,
      title: 'Explications Détaillées',
      description: 'Corrections enrichies de schémas anatomiques et imagerie médicale.',
    },
    {
      icon: BarChart,
      title: 'Intelligence d\'Apprentissage',
      description: 'Analytics avancés pour transformer vos données en insights actionnables.',
    },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms analyze your performance and create personalized study paths for optimal learning outcomes.',
      gradient: 'from-primary to-chart-1',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Comprehensive performance tracking with detailed insights, progress visualization, and predictive scoring.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Study groups, peer discussions, and expert mentorship programs to enhance your medical education journey.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Evidence-Based Content',
      description: 'All content reviewed by medical professionals and updated with the latest research and clinical guidelines.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get immediate explanations and detailed breakdowns for every question to accelerate your learning.',
      gradient: 'from-emerald-500 to-blue-500',
    },
    {
      icon: Target,
      title: 'Exam Preparation',
      description: 'Specialized modules for USMLE, MCAT, and regional medical exams with proven success strategies.',
      gradient: 'from-chart-1 to-primary',
    },
  ];


  // Transform API data for display
  const pricingPlans = sortStudyPacksForDisplay(
    transformStudyPacksForHomepage(studyPacks, pricingMode)
  );

  const faqs = [
    {
      question: "How does MedCortex personalize my learning experience?",
      answer: "Our platform analyzes your performance patterns, learning speed, and knowledge gaps to create a customized study plan. It adapts based on your progress and focuses on areas where you need the most improvement."
    },
    {
      question: "What makes MedCortex different from other medical learning platforms?",
      answer: "MedCortex combines evidence-based medical education with expert-created content. Our materials are developed by medical professionals, our analytics provide deep insights, and our collaborative features connect you with peers and mentors worldwide."
    },
    {
      question: "Can I access MedCortex on mobile devices?",
      answer: "Yes! MedCortex is fully optimized for mobile devices. You can study on-the-go, access your progress anywhere, and sync your data across all devices seamlessly."
    },
    {
      question: "Do you offer support for medical licensing exams?",
      answer: "Absolutely! We have specialized modules for USMLE, MCAT, PLAB, and other regional medical licensing exams. Our exam preparation tools include practice tests, performance analytics, and expert guidance."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 30-day free trial for all new users. This gives you full access to explore our platform, try different features, and see how MedCortex can enhance your medical education."
    },
    {
      question: "How often is the content updated?",
      answer: "Our content is continuously updated by our team of medical professionals and educators. We ensure all information reflects the latest medical research, clinical guidelines, and best practices in medical education."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden force-light-mode">
      <Header />
      <div>
        <Hero />

      {/* Caractéristiques Section - Replicating the provided design */}
      <section id="caracteristiques" className="container px-4 py-20 mx-auto bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Caractéristiques
            </h2>
          </div>

          {/* Features Grid - 3x2 layout matching the design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {characteristics.map((characteristic, index) => {
              const IconComponent = characteristic.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
                >
                  {/* Icon Container - Primary color with hover effects matching the design */}
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ease-out group-hover:shadow-xl group-hover:shadow-primary/25 group-hover:scale-110 group-hover:-translate-y-1">
                    <IconComponent className="w-8 h-8 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                    {characteristic.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-center leading-relaxed max-w-sm transition-colors duration-300 group-hover:text-foreground/80">
                    {characteristic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Section - Two-column alternating layout */}
      <section id="fonctionnalites" className="container px-4 py-20 mx-auto relative overflow-hidden bg-background">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Fonctionnalités
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-chart-1 rounded-full mx-auto"></div>
          </div>

          {/* Feature Items - Alternating Layout */}
          <div className="space-y-16 md:space-y-24">
            {/* Feature 1: Filtres - Image Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Image Container */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Filter Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Créer une session</h4>
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>

                    {/* Modules Section */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-foreground mb-2">Modules</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-sm text-foreground">Cardiologie</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                            <span className="text-sm text-foreground">Pneumologie</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full"></div>
                            <span className="text-sm text-foreground">Neurologie</span>
                          </div>
                        </div>
                      </div>

                      {/* Cours Section */}
                      <div>
                        <h5 className="text-sm font-medium text-foreground mb-2">Cours</h5>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="text-sm text-foreground">Insuffisance cardiaque</span>
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-primary-foreground" fill="currentColor" viewBox="0 0 8 8">
                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground pl-2">Physiopathologie de l'insuffisance cardiaque</div>
                          <div className="text-xs text-muted-foreground pl-2">Traitement de l'insuffisance cardiaque</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Filtres
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  MedCortex vous donne la possibilité de choisir les cours sur lesquels vous voulez vous exercer. Vous pouvez choisir un ou plusieurs cours à la fois, selon vos préférences. Vous pouvez même choisir des cours de modules différents.
                </p>
              </div>
            </div>

            {/* Feature 2: Flexibilité - Text Left, Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left lg:order-1 group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Flexibilité
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  Notre plateforme s'adapte à votre rythme d'apprentissage. Étudiez quand vous voulez, où vous voulez, avec un accès 24h/24 et 7j/7 à tous vos contenus pédagogiques.
                </p>
              </div>

              {/* Image Container */}
              <div className="relative group lg:order-2">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Flexibility Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Tableau de bord</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Study Options */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-foreground">Étude libre</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Choisissez vos modules</p>
                        </div>

                        <div className="p-3 bg-muted rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-muted-foreground/30 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-foreground">Examen</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Mode chronométré</p>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-foreground mb-3">Progression récente</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm text-foreground">Cardiologie</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-muted rounded-full">
                                <div className="w-12 h-2 bg-primary rounded-full"></div>
                              </div>
                              <span className="text-xs text-muted-foreground">75%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm text-foreground">Pneumologie</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-muted rounded-full">
                                <div className="w-8 h-2 bg-primary rounded-full"></div>
                              </div>
                              <span className="text-xs text-muted-foreground">50%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Anciennes sessions et Playlists personnalisées - Image Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Image Container */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Sessions & Playlists Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Mes Sessions</h4>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>

                    {/* Sessions List */}
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Cardiologie - Session 1</span>
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 8 8">
                              <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Reprendre à la question 15/50</div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Pneumologie - Session 2</span>
                          <div className="w-6 h-6 bg-muted-foreground/30 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Terminée - 45/50 correctes</div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Ma Playlist Personnalisée</span>
                          <div className="w-6 h-6 bg-muted-foreground/30 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">25 questions sélectionnées</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Anciennes sessions et Playlists personnalisées
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  MedCortex vous donne la possibilité de sauvegarder toutes vos sessions et vos progressions pour continuer quand bon vous semble à l'endroit exact où vous vous êtes arrêtés. Vous avez la possibilité de créer des playlists de questions personnalisées.
                </p>
              </div>
            </div>

            {/* Feature 4: Notes personnelles - Text Left, Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left lg:order-1 group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Notes personnelles
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  Vous avez la possibilité d'ajouter des notes personnelles sauvegardées avec les questions correspondantes et que vous pourrez consulter quand bon vous semble.
                </p>
              </div>

              {/* Image Container */}
              <div className="relative group lg:order-2">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Notes Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Mes Notes</h4>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground mb-1">Insuffisance cardiaque</div>
                            <div className="text-xs text-muted-foreground">Rappel: BNP &gt; 400 pg/mL...</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground mb-1">Pneumonie</div>
                            <div className="text-xs text-muted-foreground">Critères de CURB-65...</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground mb-1">Électrocardiogramme</div>
                            <div className="text-xs text-muted-foreground">Définition des ondes...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Analyse des performances - Image Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Image Container */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Analytics Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Analytics</h4>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Analytics Content */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                          <div className="text-xs text-muted-foreground mb-1">Temps moyen</div>
                          <div className="text-lg font-bold text-foreground">2m 30s</div>
                        </div>
                        <div className="p-3 bg-muted rounded-xl">
                          <div className="text-xs text-muted-foreground mb-1">Précision</div>
                          <div className="text-lg font-bold text-foreground">85%</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">Cardiologie</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-muted rounded-full">
                              <div className="w-12 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-xs text-muted-foreground">75%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">Pneumologie</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-muted rounded-full">
                              <div className="w-8 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-xs text-muted-foreground">50%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Analyse des performances
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  MedCortex dispose d'un timer qui vous permet de monitorer le temps que vous passez sur la question et sur la session dans son ensemble. La plateforme propose aussi un outil statistique avancé pour suivre vos progressions par module, par session et par examen.
                </p>
              </div>
            </div>

            {/* Feature 6: Surligneur - Text Left, Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left lg:order-1 group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Surligneur : mettez en évidence les points clés !
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  Nous avons intégré un surligneur à la plateforme qui vous permet, à la lecture des questions et notamment des cas cliniques, de mettre en évidence toutes les informations que vous jugez utiles pour résoudre le problème. Vous n'avez donc pas besoin de relire incessamment les énoncés interminables…
                </p>
              </div>

              {/* Image Container */}
              <div className="relative group lg:order-2">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Highlighter Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-card p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-foreground">Question</h4>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                    </div>

                    {/* Question with highlighting */}
                    <div className="space-y-3">
                      <div className="text-sm text-foreground leading-relaxed">
                        <p className="mb-2">Un patient de 65 ans se présente aux urgences avec une douleur thoracique...</p>
                        <p className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded">
                          <strong>douleur thoracique rétrosternale</strong>
                        </p>
                        <p className="mb-2">...depuis 2 heures. Il a des antécédents de...</p>
                        <p className="bg-blue-200 text-blue-900 px-2 py-1 rounded">
                          <strong>diabète de type 2</strong>
                        </p>
                        <p>...et d'hypertension artérielle.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 7: Mode nuit - Image Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Image Container */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Dark Mode Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-white">Mode Nuit</h4>
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                    </div>

                    {/* Dark mode content */}
                    <div className="space-y-4">
                      <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-sm text-white mb-2">Question 15/50</div>
                        <div className="text-xs text-gray-300">Cardiologie - Insuffisance cardiaque</div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-xs text-gray-300">A) Option 1</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-xs text-gray-300">B) Option 2</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-xs text-gray-300">C) Option 3</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-gray-400">Temps: 2m 30s</div>
                        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left group">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    Mode nuit
                  </h3>
                  {/* Primary color underline accent */}
                  <div className="w-16 h-1 bg-primary rounded-full mb-6 mx-auto lg:mx-0 transition-all duration-300 group-hover:w-20 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-chart-1"></div>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300 group-hover:text-foreground/90">
                  Notre plateforme dispose d'un mode nuit tout à fait agréable pour les yeux, idéal pour les longues soirées de révisions…
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="container px-4 py-32 mx-auto bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Choose Your
              <span className="block text-primary">
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Specialized content packages for every stage of your medical journey
            </p>
          </div>

          {/* Pricing Toggle */}
          <PricingToggle
            value={pricingMode}
            onChange={setPricingMode}
          />

          {/* Loading State */}
          {studyPacksLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {studyPacksError && !studyPacksLoading && (
            <div className="text-center py-20">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive font-medium">{studyPacksError}</p>
                <Button
                  variant="outline"
                  onClick={refresh}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          )}

          {/* Study Packs Grid */}
          {!studyPacksLoading && !studyPacksError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 sm:px-0">
              {pricingPlans.map((plan, index) => {
                return (
                  <div
                    key={plan.id}
                    className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border/50"
                  >
                    {/* Colored Header Strip with Study Pack Name */}
                    <div className="bg-primary text-primary-foreground text-center py-4 px-6">
                      <h3 className="font-bold text-sm uppercase tracking-wide">
                        {plan.title}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 text-center space-y-6">
                      {/* Price Display */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm text-muted-foreground font-medium">DA</span>
                          <span className="text-3xl sm:text-4xl font-bold text-foreground break-words">
                            {plan.priceValue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Subscribe Button */}
                      <div className="pt-4">
                        <Link href="/register">
                          <Button
                            variant="outline"
                            className="w-full border-border hover:bg-muted/50 transition-colors duration-200"
                          >
                            S'inscrire
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section id="faq" className="container px-4 py-32 mx-auto bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Got Questions?
              <span className="block text-primary mt-2">
                We&apos;ve Got Answers
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about MedCortex and how it can transform your medical education journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating accent */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="relative z-10 text-left font-bold text-lg px-8 py-8 hover:no-underline group-hover:text-primary transition-colors duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm mt-1">
                          {index + 1}
                        </div>
                        <span className="flex-1">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="relative z-10 text-muted-foreground text-base leading-relaxed px-8 pb-8 ml-12">
                      <div className="pl-4 border-l-2 border-primary/20">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>

          {/* Additional Help Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-primary/10 border border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Still have questions?</h3>
                  <p className="text-muted-foreground">
                    Our support team is here to help you 24/7. Get personalized assistance from medical education experts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href="mailto:medcortexdz@gmail.com">
                        <Clock className="w-4 h-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      </div>
    </div>
  );
}
