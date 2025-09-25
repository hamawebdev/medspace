// @ts-nocheck
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import AuthAPI from '@/lib/auth-api';
import { Logo } from '@/components/ui/logo';
import { usePathname } from 'next/navigation';
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
  LogOut,
  Github,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { isAuthenticated, user, loading, initializeAuth, logout } = useAuth();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      // Calculate scroll progress for smooth transitions (0 to 1)
      const maxScroll = 200; // Maximum scroll distance for full effect
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Update CSS custom properties for smooth transitions
      document.documentElement.style.setProperty('--scroll-progress', progress.toString());
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
      href: '#caracteristiques',
      label: 'Caractéristiques'
    },
    {
      href: '#fonctionnalites',
      label: 'Fonctionnalités'
    },
    {
      href: '#pricing',
      label: 'Tarifs'
    },
    {
      href: '#faq',
      label: 'FAQ'
    },
  ];

  return (
    <div className="fixed top-0 z-50 w-full flex justify-center transition-all duration-300">
      <div
        className="transition-all duration-300"
        style={{
          width: `calc(100% - ${1 + scrollProgress * 4}rem)`,
          maxWidth: `calc(112rem - ${scrollProgress * 20}rem)`,
          paddingTop: `calc(1rem - ${scrollProgress * 0.3}rem)`,
          paddingBottom: `calc(1rem - ${scrollProgress * 0.3}rem)`
        }}
      >
        <header
          className={`w-full mx-auto transition-all duration-300 rounded-3xl ${
            isScrolled
              ? 'backdrop-blur-xl shadow-xl'
              : 'backdrop-blur-lg shadow-lg'
          }`}
          style={{
            background: `linear-gradient(to right, var(--gradient-left), var(--gradient-center), var(--gradient-right))`,
            opacity: isScrolled ? 0.95 : 0.90
          }}
        >
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-12' : 'h-16'
          }`}
          style={{
            paddingLeft: `${2 - scrollProgress * 0.75}rem`,
            paddingRight: `${2 - scrollProgress * 0.75}rem`
          }}
        >
          {/* Logo with MedCortex branding */}
          <Link href="/" className="group flex items-center transition-all duration-300 hover:scale-105 flex-shrink-0"
            style={{
              gap: `${0.5 - scrollProgress * 0.125}rem`
            }}
          >
            <div
              className="flex items-center transition-all duration-300"
              style={{
                gap: `${0.5 - scrollProgress * 0.125}rem`
              }}
            >
              <Logo
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? 'h-8 w-8' : 'h-10 w-10'
                }`}
                alt="MedCortex Logo"
              />
              <span className={`font-bold text-destructive-foreground transition-all duration-300 ${
                isScrolled ? 'text-lg' : 'text-xl'
              }`}>MedCortex</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center flex-1 justify-center transition-all duration-300"
            style={{
              gap: `${2 - scrollProgress * 0.75}rem`
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-destructive-foreground/90 hover:text-destructive-foreground font-medium transition-all duration-300 whitespace-nowrap ${
                  isScrolled ? 'text-xs' : 'text-sm'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div
            className="flex items-center flex-shrink-0 transition-all duration-300"
            style={{
              gap: `${0.75 - scrollProgress * 0.25}rem`
            }}
          >
            {/* Auth Buttons - Desktop */}
            <div
              className="hidden sm:flex items-center transition-all duration-300"
              style={{
                gap: `${0.75 - scrollProgress * 0.25}rem`
              }}
            >
              {!loading && (
                <>
                  {isAuthenticated && user ? (
                    // Authenticated user - show Dashboard
                    <Link href={getDashboardUrl()}>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-medium transition-all duration-300 shadow-sm"
                        style={{
                          paddingLeft: `${1 - scrollProgress * 0.25}rem`,
                          paddingRight: `${1 - scrollProgress * 0.25}rem`,
                          paddingTop: `${0.5 - scrollProgress * 0.125}rem`,
                          paddingBottom: `${0.5 - scrollProgress * 0.125}rem`,
                          height: `${2.25 - scrollProgress * 0.25}rem`,
                          fontSize: `${0.875 - scrollProgress * 0.125}rem`
                        }}
                      >
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    // Not authenticated - show Login and Sign Up
                    <>
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive-foreground/90 hover:text-destructive-foreground hover:bg-destructive-foreground/10 rounded-2xl font-medium transition-all duration-300"
                          style={{
                            paddingLeft: `${1 - scrollProgress * 0.25}rem`,
                            paddingRight: `${1 - scrollProgress * 0.25}rem`,
                            paddingTop: `${0.5 - scrollProgress * 0.125}rem`,
                            paddingBottom: `${0.5 - scrollProgress * 0.125}rem`,
                            height: `${2.25 - scrollProgress * 0.25}rem`,
                            fontSize: `${0.875 - scrollProgress * 0.125}rem`
                          }}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-medium transition-all duration-300 shadow-sm"
                          style={{
                            paddingLeft: `${1 - scrollProgress * 0.25}rem`,
                            paddingRight: `${1 - scrollProgress * 0.25}rem`,
                            paddingTop: `${0.5 - scrollProgress * 0.125}rem`,
                            paddingBottom: `${0.5 - scrollProgress * 0.125}rem`,
                            height: `${2.25 - scrollProgress * 0.25}rem`,
                            fontSize: `${0.875 - scrollProgress * 0.125}rem`
                          }}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>


            {/* Mobile Menu Button */}
            <button
              className="sm:hidden relative rounded-2xl bg-destructive-foreground/10 hover:bg-destructive-foreground/20 transition-all duration-300 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                height: `${2.25 - scrollProgress * 0.5}rem`,
                width: `${2.25 - scrollProgress * 0.5}rem`,
                marginLeft: `${0.5 - scrollProgress * 0.125}rem`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Menu
                  className={`text-destructive-foreground transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`}
                  style={{
                    height: `${1 - scrollProgress * 0.25}rem`,
                    width: `${1 - scrollProgress * 0.25}rem`
                  }}
                />
                <X
                  className={`absolute text-destructive-foreground transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`}
                  style={{
                    height: `${1 - scrollProgress * 0.25}rem`,
                    width: `${1 - scrollProgress * 0.25}rem`
                  }}
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
          <div className="border-t border-destructive-foreground/20 bg-card backdrop-blur-xl rounded-b-3xl">
            <div className="container px-4 sm:px-6 py-4 sm:py-6">
              <nav className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-3 text-sm font-medium text-destructive-foreground/90 hover:text-destructive-foreground hover:bg-destructive-foreground/10 rounded-2xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="mt-6 space-y-3 border-t border-destructive-foreground/20 pt-6">
                {!loading && (
                  <>
                    {isAuthenticated && user ? (
                      // Authenticated user - show Dashboard and Logout
                      <>
                        <Link href={getDashboardUrl()} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 rounded-2xl shadow-sm"
                          >
                            Dashboard
                          </Button>
                        </Link>

                      </>
                    ) : (
                      // Not authenticated - show Login and Sign Up
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-destructive-foreground/90 hover:text-destructive-foreground hover:bg-destructive-foreground/10 transition-colors duration-200 rounded-2xl"
                          >
                            Login
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 rounded-2xl shadow-sm"
                          >
                            Sign Up
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
      </div>
    </div>
  );
}