// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginSchema, type LoginFormData } from "@/lib/validations";

import { AuthAPI } from "@/lib/auth-api";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ModernLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL messages
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      switch (message) {
        case 'registration-success':
          setSuccessMessage('Registration successful! You can now log in.');
          break;
        case 'password-reset':
          setSuccessMessage('Password reset successful! Please log in with your new password.');
          toast.success('Password reset successful!');
          break;
        default:
          break;
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('🚀 LoginForm: Starting login submission...', { email: data.email });
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('🚀 LoginForm: Calling AuthAPI.login...');
      const response = await AuthAPI.login(data);
      console.log('🚀 LoginForm: AuthAPI.login response received', { hasUser: !!response.user, userRole: response.user?.role });

      if (response.user) {
        console.log('🚀 LoginForm: Login successful, showing toast...');
        toast.success('Login successful!');

        // Redirect based on user role
        const redirectPath = AuthAPI.getRedirectPath(response.user.role);
        console.log('🚀 LoginForm: Redirecting to:', redirectPath);

        router.push(redirectPath);
        return;
      } else {
        console.error('🚀 LoginForm: No user in response');
        setError('Login failed: No user data received');
      }
    } catch (error: any) {
      console.error('🚀 LoginForm: Login error caught', error);



      // Handle API server connection errors
      if (error.message.includes('Cannot connect to API server')) {
        const errorMessage = 'Backend server is not running. Please check the API configuration in docs/API_CONFIGURATION.md';
        console.error('🚀 LoginForm: API server connection error:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Show the actual API error message
      const errorMessage = error.message || 'Login failed';
      console.error('🚀 LoginForm: Setting error message:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('🚀 LoginForm: Setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen force-light-mode">
      {/* Desktop Two-Column Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Column - Login Form */}
        <div
          className="flex-1 flex items-center justify-center p-8 lg:p-12"
          style={{ backgroundColor: '#3A6E7C' }}
        >
          <div className="w-full max-w-md">
            <Card
              className="border-white/20 card-hover-lift animate-fade-in-up shadow-xl bg-transparent"
            >
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center !group-hover:text-white">
                  Welcome back
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl animate-slide-up">
                        <p className="text-green-100 text-sm font-medium">{successMessage}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl animate-slide-up">
                        <p className="text-red-100 text-sm font-medium">{error}</p>
                      </div>
                    )}

                    {/* Email and Password Fields */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-white">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent hover:border-white/30"
                          {...register("email")}
                          required
                        />
                        {errors.email && (
                          <p className="text-red-200 text-sm animate-slide-up">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Label htmlFor="password" className="text-sm font-semibold text-white">Password</Label>
                          <Link
                            href="/forgot-password"
                            className="ml-auto text-sm text-white/80 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-md px-2 py-1 underline-offset-4"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent hover:border-white/30"
                            {...register("password")}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-md p-1"
                            style={{ color: 'hsl(195 33.7% 39%)' }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-200 text-sm animate-slide-up">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full h-12 bg-white text-gray-900 hover:bg-white/90 font-semibold group shadow-lg"
                      >
                          {isSubmitting || isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin mr-2" />
                              Signing in...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Login
                              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
                            </div>
                          )}
                      </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                      <span className="text-white/80">Don&apos;t have an account?</span>{" "}
                      <Link
                        href="/register"
                        className="text-white hover:text-white/80 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-md px-2 py-1 underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Terms and Privacy */}
            <div className="text-white/60 text-center text-xs text-balance mt-6">
              By clicking continue, you agree to our{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-white/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-white/80">
                Privacy Policy
              </Link>.
            </div>
          </div>
        </div>

        {/* Right Column - Auth Image */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src="/auth-image.jpg"
            alt="Medical Education Platform"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional overlay for better contrast */}
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* Mobile Layout - Keep Current Design */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-6 relative">
        {/* Design system background - using hero gradient */}
        <div className="absolute inset-0 section-bg bg-grid-pattern">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, var(--gradient-left), var(--gradient-center), var(--gradient-right))`
            }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col space-y-6">
            <Card className="glass border-border/20 card-hover-lift animate-fade-in-up">
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-semibold tracking-tight flex items-center justify-center !group-hover:text-foreground">Welcome back</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-xl animate-slide-up">
                        <p className="text-chart-2 text-sm font-medium">{successMessage}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-slide-up">
                        <p className="text-destructive text-sm font-medium">{error}</p>
                      </div>
                    )}
                    {/* Email and Password Fields */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          className="h-12 bg-background border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 hover:border-primary/50"
                          {...register("email")}
                          required
                        />
                        {errors.email && (
                          <p className="text-destructive text-sm animate-slide-up">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                          <Link
                            href="/forgot-password"
                            className="ml-auto text-sm text-primary hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1 underline-offset-4"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-12 h-12 bg-background border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 hover:border-primary/50"
                            {...register("password")}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-destructive text-sm animate-slide-up">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full h-12 btn-modern btn-interactive font-semibold group"
                      >
                          {isSubmitting || isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Signing in...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Login
                              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
                            </div>
                          )}
                      </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="text-primary hover:text-primary/80 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1 underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Terms and Privacy */}
            <div className="text-muted-foreground text-center text-xs text-balance">
              By clicking continue, you agree to our{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 