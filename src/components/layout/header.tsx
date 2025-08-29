// @ts-nocheck
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import AuthAPI from '@/lib/auth-api';
import { Logo } from '@/components/ui/logo';
import {
  Menu,
  X,
  BookOpen,
  Users,
  BarChart3,
  Phone,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { isAuthenticated, user, loading, initializeAuth, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize authentication on component mount (only once)
  useEffect(() => {
    if (!authInitialized) {
      console.log('🔐 Header: Initializing auth...');
      initializeAuth().finally(() => {
        setAuthInitialized(true);
      });
    }
  }, [initializeAuth, authInitialized]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/student/dashboard';
    return AuthAPI.getRedirectPath(user.role);
  };

  const navItems = [
    { 
      href: '/', 
      label: 'Home',
      icon: Sparkles
    },
    { 
      href: '#features', 
      label: 'Features',
      icon: BookOpen
    },
    { 
      href: '#pricing', 
      label: 'Pricing',
      icon: BarChart3
    },
    { 
      href: '#testimonials', 
      label: 'Reviews',
      icon: Users
    },
    { 
      href: '#contact', 
      label: 'Contact',
      icon: Phone
    },
  ];

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5'
          : 'bg-background/60 backdrop-blur-md'
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Modern Logo */}
        <Link href="/" className="group flex items-center transition-all duration-300 hover:scale-105 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 object-contain"
            />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text whitespace-nowrap">
              MedCortex
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center max-w-2xl mx-auto xl:mx-50">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center space-x-2 px-4 xl:px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-accent/50 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <span>{item.label}</span>
              <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-chart-2 transition-all duration-200 group-hover:w-3/4 group-hover:-translate-x-1/2"></div>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {!loading && (
              <>
                {isAuthenticated && user ? (
                  // Authenticated user - show Dashboard and Logout
                  <>
                    <Link href={getDashboardUrl()}>
                      <Button
                        size="sm"
                        className="relative bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 btn-modern overflow-hidden group px-3 lg:px-4"
                      >
                        <span className="relative z-10 flex items-center">
                          <LayoutDashboard className="mr-1.5 lg:mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="hidden lg:inline">Dashboard</span>
                          <span className="lg:hidden">Dash</span>
                          <ChevronRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
                        </span>
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="relative font-medium hover:bg-accent/80 transition-all duration-200 px-3 lg:px-4"
                    >
                      <LogOut className="mr-1.5 lg:mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline">Logout</span>
                      <span className="lg:hidden">Out</span>
                    </Button>
                  </>
                ) : (
                  // Not authenticated - show Login and Sign Up
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative font-medium hover:bg-accent/80 transition-all duration-200 px-3 lg:px-4"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        size="sm"
                        className="relative bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 btn-modern overflow-hidden group px-3 lg:px-4"
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="hidden lg:inline">Sign Up</span>
                          <span className="lg:hidden">Join</span>
                          <ChevronRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
                        </span>
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative h-9 w-9 rounded-lg border border-gray-200/40 dark:border-gray-700/40 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:scale-105 flex-shrink-0 ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Menu 
                className={`h-4 w-4 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                }`} 
              />
              <X 
                className={`absolute h-4 w-4 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                }`} 
              />
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-background/95 backdrop-blur-xl">
          <div className="container px-4 sm:px-6 py-4 sm:py-6">
            <nav className="space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 touch-target"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary/10 to-chart-2/10 group-hover:from-primary/20 group-hover:to-chart-2/20 transition-all duration-200">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </Link>
              ))}
            </nav>
            
            {/* Mobile Auth Buttons */}
            <div className="mt-6 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
              {!loading && (
                <>
                  {isAuthenticated && user ? (
                    // Authenticated user - show Dashboard and Logout
                    <>
                      <Link href={getDashboardUrl()} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-center bg-accent/50 hover:bg-accent transition-all duration-200"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    // Not authenticated - show Login and Sign Up
                    <>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center bg-accent/50 hover:bg-accent transition-all duration-200"
                        >
                          Login to Account
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start Free Trial
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 