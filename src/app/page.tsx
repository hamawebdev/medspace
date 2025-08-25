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
  ChevronRight,
  Quote,
  Check
} from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % howItWorksSteps.length);
    }, 3000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(stepInterval);
    };
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
      value: "94%",
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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms analyze your performance and create personalized study paths for optimal learning outcomes.',
      gradient: 'from-violet-500 to-rose-500',
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
      gradient: 'from-rose-500 to-violet-500',
    },
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "4th Year Medical Student",
      university: "Harvard Medical School",
      content: "MedCortex transformed my study routine completely. The AI-powered recommendations helped me focus on my weak areas, and I improved my test scores by 40% in just 3 months!",
      rating: 5,
      avatar: "🩺"
    },
    {
      name: "Dr. Michael Chen",
      role: "Resident Physician",
      university: "Johns Hopkins Hospital",
      content: "Even as a resident, I still use MedCortex for continuous learning. The clinical cases are incredibly realistic and have enhanced my diagnostic skills significantly.",
      rating: 5,
      avatar: "👨‍⚕️"
    },
    {
      name: "Emma Rodriguez",
      role: "3rd Year Medical Student",
      university: "Stanford University",
      content: "The collaborative features are amazing! Being able to study with peers and get instant feedback from experts has made medical school so much more manageable.",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "James Thompson",
      role: "Medical Graduate",
      university: "Oxford University",
      content: "I used MedCortex throughout my 6 years of medical school. The comprehensive question bank and detailed explanations were instrumental in my success.",
      rating: 5,
      avatar: "🎓"
    }
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: "Sign Up & Assessment",
      description: "Create your account and take our comprehensive assessment to understand your current knowledge level.",
      icon: GraduationCap,
      color: "from-purple-500 to-blue-500"
    },
    {
      step: 2,
      title: "Personalized Learning Path",
      description: "Our AI creates a customized study plan based on your assessment, goals, and learning style.",
      icon: Brain,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: 3,
      title: "Interactive Learning",
      description: "Engage with our comprehensive question bank, clinical cases, and multimedia content.",
      icon: BookOpen,
      color: "from-cyan-500 to-emerald-500"
    },
    {
      step: 4,
      title: "Track Progress & Excel",
      description: "Monitor your improvement with detailed analytics and achieve your medical education goals.",
      icon: TrendingUp,
      color: "from-emerald-500 to-purple-500"
    }
  ];

  const pricingPlans = [
    {
      year: 1,
      title: '1st Year Foundation',
      description: 'Essential medical sciences and clinical foundations',
      price: '12,000 DA',
      features: ['Basic Sciences Q&A', 'Anatomy & Physiology', '24/7 Support', 'Mobile Access'],
      popular: false,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      year: 2,
      title: '2nd Year Advanced',
      description: 'Pathology, pharmacology, and clinical correlation',
      price: '12,000 DA',
      features: ['Advanced Pathology', 'Pharmacology Bank', 'Case Studies', 'Peer Discussions'],
      popular: false,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      year: 3,
      title: '3rd Year Clinical',
      description: 'Clinical rotations and patient care essentials',
      price: '12,000 DA',
      features: ['Clinical Cases', 'OSCE Preparation', 'Mentorship Program', 'Advanced Analytics'],
      popular: true,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      year: 4,
      title: '4th Year Specialization',
      description: 'Advanced clinical practice and specialty introduction',
      price: '12,000 DA',
      features: ['Specialty Modules', 'Research Tools', 'Publication Guidance', 'Career Planning'],
      popular: false,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      year: 5,
      title: '5th Year Mastery',
      description: 'Clinical excellence and advanced patient management',
      price: '12,000 DA',
      features: ['Advanced Diagnostics', 'Treatment Planning', 'Leadership Skills', 'Quality Improvement'],
      popular: false,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      year: 6,
      title: '6th Year Preparation',
      description: 'Final year mastery and residency readiness',
      price: '12,000 DA',
      features: ['Residency Prep', 'Board Exam Focus', 'Interview Skills', 'Career Transition'],
      popular: false,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      year: 'R',
      title: 'Residency Excellence',
      description: 'Advanced training for medical residents and fellows',
      price: '15,000 DA',
      features: ['Specialty Training', 'Research Methods', 'Teaching Skills', 'Board Certification'],
      popular: false,
      gradient: 'from-indigo-500 to-blue-500'
    },
  ];

  const faqs = [
    {
      question: "How does MedCortex personalize my learning experience?",
      answer: "Our AI algorithm analyzes your performance patterns, learning speed, and knowledge gaps to create a customized study plan. It adapts in real-time based on your progress and focuses on areas where you need the most improvement."
    },
    {
      question: "What makes MedCortex different from other medical learning platforms?",
      answer: "MedCortex combines cutting-edge AI technology with evidence-based medical education. Our content is created by medical professionals, our analytics provide deep insights, and our collaborative features connect you with peers and mentors worldwide."
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

      {/* Modern Impact Statistics */}
      <section className="container px-4 py-32 mx-auto relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-6 mb-20">
            <Badge className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
              📊 Our Global Impact
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Transforming Medical Education
              <span className="block gradient-text">
                Around the World
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of medical students who have revolutionized their learning journey with MedCortex
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl border ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm transition-all duration-700 hover:scale-105 hover:shadow-2xl ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Floating Orb Animation */}
                <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500 animate-pulse-soft`}></div>

                <div className="relative p-8 text-center">
                  {/* Icon Container */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Value with Counter Animation */}
                  <div className="space-y-3 mb-6">
                    <div className={`text-4xl sm:text-5xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {stat.label}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Progress Bar Animation */}
                  <div className="mt-6 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 delay-300 ${isVisible ? 'w-full' : 'w-0'}`}
                      style={{ animationDelay: `${index * 200 + 500}ms` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Achievement Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">4.9/5 Rating</h4>
              <p className="text-sm text-muted-foreground">Average student satisfaction score</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">40% Improvement</h4>
              <p className="text-sm text-muted-foreground">Average score increase after 3 months</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">Round-the-clock assistance available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="container px-4 py-32 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-20">
            <Badge className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              ✨ Revolutionary Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Smart Learning Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cutting-edge technology meets medical education excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 bg-card/80 backdrop-blur-sm hover:transform hover:scale-105 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 dark:bg-card/90 dark:hover:bg-card relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`}></div>
                <CardHeader className="relative pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container px-4 py-32 mx-auto bg-muted/30 dark:bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <Badge className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              🚀 Simple Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Your Success Journey in
              <span className="block gradient-text">
                4 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                className={`relative text-center p-8 rounded-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 ${
                  activeStep === index
                    ? 'bg-card shadow-2xl transform scale-105 border-primary/50 dark:bg-card dark:border-primary/30'
                    : 'bg-card/80 backdrop-blur-sm hover:bg-card dark:bg-card/90 dark:hover:bg-card'
                }`}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < howItWorksSteps.length - 1 && (
                  <ChevronRight className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-primary/60 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container px-4 py-32 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <Badge className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
              💬 Student Success Stories
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              What Our Students
              <span className="block text-emerald-600 dark:text-emerald-400">
                Are Saying
              </span>
            </h2>
          </div>

          <div className="relative">
            <Card className="max-w-4xl mx-auto bg-card shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <Quote className="w-12 h-12 text-primary/60 mx-auto mb-6" />

                <blockquote className="text-xl sm:text-2xl text-center text-foreground leading-relaxed mb-8 italic">
                  {testimonials[currentTestimonial].content}
                </blockquote>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <h4 className="font-bold text-lg text-foreground">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                  <p className="text-sm text-primary font-medium">{testimonials[currentTestimonial].university}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index
                      ? 'bg-purple-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="container px-4 py-32 mx-auto bg-accent/5 dark:bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <Badge className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0">
              💎 Flexible Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Choose Your
              <span className="block text-rose-600 dark:text-rose-400">
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
                className={`relative hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 bg-card overflow-hidden ${
                  plan.popular ? 'ring-4 ring-pink-400 shadow-2xl dark:ring-pink-500/50' : 'shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    MOST POPULAR
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.gradient}`}></div>

                <CardHeader className="text-center pt-8 pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {plan.year === 'R' ? (
                      <GraduationCap className="h-8 w-8 text-white" />
                    ) : (
                      <span className="text-white font-bold text-xl">{plan.year}</span>
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
                          <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                  <Link href="/register">
                    <Button
                      className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg transition-all duration-300`}
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
      <section className="container px-4 py-32 mx-auto bg-gradient-to-br from-muted/20 via-background to-accent/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <Badge className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-lg font-semibold shadow-lg">
              ❓ Frequently Asked Questions
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Got Questions?
              <span className="block gradient-text mt-2">
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
                className="group relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating accent */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="relative z-10 text-left font-bold text-lg px-8 py-8 hover:no-underline group-hover:text-primary transition-colors duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
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
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Still have questions?</h3>
                                     <p className="text-muted-foreground">
                     Our support team is here to help you 24/7. Get personalized assistance from medical education experts.
                   </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
                      <Clock className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
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

      {/* Ultra-Modern CTA Section */}
      <section id="contact" className="container px-4 py-32 mx-auto relative">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse-soft"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary via-secondary to-accent">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float-gentle"></div>
                <div className="absolute top-20 right-20 w-24 h-24 bg-white/50 rounded-full animate-float-gentle delay-1000"></div>
                <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white/30 rounded-full animate-float-gentle delay-2000"></div>
              </div>
            </div>

            <CardContent className="relative z-10 p-12 lg:p-20 text-center text-white">
              <div className="space-y-12">
                {/* Header Section */}
                <div className="space-y-6">
                  <Badge className="px-6 py-2 bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                    🚀 Transform Your Future
                  </Badge>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    Ready to Transform Your
                    <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      Medical Education?
                    </span>
          </h2>
                  <p className="text-xl lg:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed">
                    Join thousands of successful medical students and residents who chose MedCortex
                    to accelerate their learning and achieve their goals.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/register">
                    <Button
                      size="lg"
                      className="group bg-white text-primary hover:bg-gray-50 text-lg px-12 py-6 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      <GraduationCap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                      Start Free Trial Today
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-12 py-6 rounded-full border-2 border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300 font-semibold"
                    >
                      <Users className="mr-3 h-6 w-6" />
                Login to Account
              </Button>
            </Link>
          </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold">14-Day Free Trial</span>
                    <span className="text-sm opacity-75">Full access, no commitment</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold">No Credit Card Required</span>
                    <span className="text-sm opacity-75">Start learning immediately</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold">Cancel Anytime</span>
                    <span className="text-sm opacity-75">Flexible subscription options</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="pt-8 border-t border-white/20">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs">👨‍⚕️</div>
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs">👩‍⚕️</div>
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white flex items-center justify-center text-xs">🩺</div>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white flex items-center justify-center text-xs">🎓</div>
                      </div>
                      <span className="text-sm opacity-90">25,000+ students trust MedCortex</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm opacity-90 ml-2">4.9/5 average rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
