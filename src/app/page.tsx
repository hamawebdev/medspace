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
      title: 'Questions',
      description: 'Questions diverses conformes au programme de la Faculté de Médecine d\'Alger.',
    },
    {
      icon: Layers,
      title: 'Structure',
      description: 'Questions organisées par module, par cours, par année, et par périodes d\'examens.',
    },
    {
      icon: CheckCircle,
      title: 'Fiabilité',
      description: 'Questions dûment corrigées et vérifiées selon les dernières recommandations.',
    },
    {
      icon: RefreshCw,
      title: 'Mise à jour',
      description: 'Plateforme interactive et régulièrement mise à jour.',
    },
    {
      icon: Rocket,
      title: 'Explications',
      description: 'Réponses commentées et illustrées par des schémas, images radiologiques, tableaux récapitulatifs, mindmaps.',
    },
    {
      icon: BarChart,
      title: 'Analyse de l\'apprentissage',
      description: 'QUIZY offre une visualisation de toutes les données liées à ton apprentissage pour te permettre d\'optimiser tes révisions.',
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


  const pricingPlans = [
    {
      year: 1,
      title: '1st Year Foundation',
      description: 'Essential medical sciences and clinical foundations',
      price: '12,000 DA',
      features: ['Basic Sciences Q&A', 'Anatomy & Physiology', '24/7 Support', 'Mobile Access'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
    {
      year: 2,
      title: '2nd Year Advanced',
      description: 'Pathology, pharmacology, and clinical correlation',
      price: '12,000 DA',
      features: ['Advanced Pathology', 'Pharmacology Bank', 'Case Studies', 'Peer Discussions'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
    {
      year: 3,
      title: '3rd Year Clinical',
      description: 'Clinical rotations and patient care essentials',
      price: '12,000 DA',
      features: ['Clinical Cases', 'OSCE Preparation', 'Mentorship Program', 'Advanced Analytics'],
      popular: true,
      gradient: 'from-primary to-primary'
    },
    {
      year: 4,
      title: '4th Year Specialization',
      description: 'Advanced clinical practice and specialty introduction',
      price: '12,000 DA',
      features: ['Specialty Modules', 'Research Tools', 'Publication Guidance', 'Career Planning'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
    {
      year: 5,
      title: '5th Year Mastery',
      description: 'Clinical excellence and advanced patient management',
      price: '12,000 DA',
      features: ['Advanced Diagnostics', 'Treatment Planning', 'Leadership Skills', 'Quality Improvement'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
    {
      year: 6,
      title: '6th Year Preparation',
      description: 'Final year mastery and residency readiness',
      price: '12,000 DA',
      features: ['Residency Prep', 'Board Exam Focus', 'Interview Skills', 'Career Transition'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
    {
      year: 'R',
      title: 'Residency Excellence',
      description: 'Advanced training for medical residents and fellows',
      price: '15,000 DA',
      features: ['Specialty Training', 'Research Methods', 'Teaching Skills', 'Board Certification'],
      popular: false,
      gradient: 'from-primary to-primary'
    },
  ];

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
      answer: "Yes, we offer a 14-day free trial for all new users. This gives you full access to explore our platform, try different features, and see how MedCortex can enhance your medical education."
    },
    {
      question: "How often is the content updated?",
      answer: "Our content is continuously updated by our team of medical professionals and educators. We ensure all information reflects the latest medical research, clinical guidelines, and best practices in medical education."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <Hero />

      {/* Caractéristiques Section - Replicating the provided design */}
      <section className="container px-4 py-20 mx-auto bg-background">
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
      <section className="container px-4 py-20 mx-auto bg-muted/30 relative overflow-hidden">
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
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Filter Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-white p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-gray-800">Créer une session</h4>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>

                    {/* Modules Section */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Modules</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-sm text-gray-700">Cardiologie</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-700">Pneumologie</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-700">Neurologie</span>
                          </div>
                        </div>
                      </div>

                      {/* Cours Section */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Cours</h5>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="text-sm text-gray-700">Insuffisance cardiaque</span>
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 pl-2">Physiopathologie de l'insuffisance cardiaque</div>
                          <div className="text-xs text-gray-500 pl-2">Traitement de l'insuffisance cardiaque</div>
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
                  Quizy vous donne la possibilité de choisir les cours sur lesquels vous voulez vous exercer. Vous pouvez choisir un ou plusieurs cours à la fois, selon vos préférences. Vous pouvez même choisir des cours de modules différents.
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
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/20">
                  {/* Flexibility Interface Mockup */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-white p-6">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-gray-800">Tableau de bord</h4>
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
                            <span className="text-sm font-medium text-gray-700">Étude libre</span>
                          </div>
                          <p className="text-xs text-gray-600">Choisissez vos modules</p>
                        </div>

                        <div className="p-3 bg-gray-100 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gray-400 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Examen</span>
                          </div>
                          <p className="text-xs text-gray-600">Mode chronométré</p>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Progression récente</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Cardiologie</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className="w-12 h-2 bg-primary rounded-full"></div>
                              </div>
                              <span className="text-xs text-gray-500">75%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Pneumologie</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className="w-8 h-2 bg-primary rounded-full"></div>
                              </div>
                              <span className="text-xs text-gray-500">50%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="container px-4 py-32 mx-auto bg-muted/30">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-border bg-card overflow-hidden ${
                  plan.popular ? 'ring-4 ring-primary shadow-2xl' : 'shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    MOST POPULAR
                  </div>
                )}

                <div className="h-2 bg-primary"></div>

                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {plan.year === 'R' ? (
                      <GraduationCap className="h-8 w-8 text-primary-foreground" />
                    ) : (
                      <span className="text-primary-foreground font-bold text-xl">{plan.year}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">{plan.title}</CardTitle>
                  <CardDescription className="text-sm mt-2 text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-6">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>

                                      <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                  <Link href="/register">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section className="container px-4 py-32 mx-auto bg-muted/30">
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
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Help Center
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
  );
}
