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
          setSuccessMessage('Registration successful! Please verify your email before logging in.');
          break;
        case 'email-verified':
          setSuccessMessage('Email verified successfully! You can now log in.');
          toast.success('Email verified successfully!');
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

      // Handle specific API errors
      if (error.message.includes('email not verified') || error.message.includes('verification required')) {
        console.log('🚀 LoginForm: Email verification required, redirecting...');
        // Redirect to verification required page
        router.push(`/auth/verification-required?email=${encodeURIComponent(data.email)}&reason=login-blocked`);
        return;
      }

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
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Design system background */}
      <div className="absolute inset-0 section-bg bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-chart-1/5" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col space-y-6">
          <Card className="glass border-border/20 card-hover-lift animate-fade-in-up">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl font-semibold tracking-tight">Welcome back</CardTitle>
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
                  {/* Social Login Buttons */}
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 bg-background border-2 border-border hover:bg-gradient-to-r hover:from-chart-2/10 hover:to-chart-3/20 hover:border-chart-2/60 btn-modern btn-interactive group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="ml-2 text-sm font-semibold group-hover:text-foreground transition-colors duration-200">Login with Google</span>
                    </Button>
                  </div>


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
  );
} 