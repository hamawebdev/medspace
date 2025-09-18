// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
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

// Shared form fields component to avoid duplication
function LoginFormFields({
  register,
  errors,
  showPassword,
  setShowPassword,
  isSubmitting,
  isLoading,
  className = "",
  formId = ""
}: {
  register: any;
  errors: any;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  className?: string;
  formId?: string;
}) {
  // Handle password visibility toggle without affecting form state
  const handlePasswordToggle = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Password visibility toggle clicked, current state:', showPassword);
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  // Unique IDs to avoid conflicts between desktop and mobile forms
  const emailId = `email-${formId}`;
  const passwordId = `password-${formId}`;

  // Debug registration
  const emailRegistration = register("email");
  const passwordRegistration = register("password");

  console.log('🔍 Email registration:', emailRegistration);
  console.log('🔍 Password registration:', passwordRegistration);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-3">
        <Label htmlFor={emailId} className="text-sm font-semibold">Email</Label>
        <Input
          id={emailId}
          type="email"
          placeholder="m@example.com"
          className="h-12"
          {...emailRegistration}
          disabled={isSubmitting || isLoading}
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-destructive text-sm animate-slide-up">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-center">
          <Label htmlFor={passwordId} className="text-sm font-semibold">Password</Label>
          <Link
            href="/forgot-password"
            className="ml-auto text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md px-2 py-1 underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="relative group">
          <Input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pr-12 h-12"
            {...passwordRegistration}
            disabled={isSubmitting || isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={handlePasswordToggle}
            disabled={isSubmitting || isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
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
        className="w-full h-12 font-semibold group"
      >
        {isSubmitting || isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
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
  );
}

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

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch,
  } = form;

  // Watch form values for debugging
  const formValues = watch();

  // Debug form state changes
  React.useEffect(() => {
    console.log('🔍 Form values changed:', formValues);
    console.log('🔍 Form errors:', errors);
    console.log('🔍 Is submitting:', isSubmitting);
  }, [formValues, errors, isSubmitting]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('🚀 LoginForm: Starting login submission...', {
      email: data.email,
      hasPassword: !!data.password,
      formValues: getValues()
    });

    // Prevent form clearing during submission
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

        // Clear form only on successful login
        reset();

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
      {/* Single Form - Responsive Design */}
      <div className="min-h-screen flex">
        {/* Left Column - Login Form (always visible) */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-[#3A6E7C] via-[#3A6E7C] to-[#2A5A68] lg:bg-[#3A6E7C]">
          <div className="w-full max-w-md">
            <Card className="border-white/20 lg:border-white/20 card-hover-lift animate-fade-in-up shadow-xl bg-transparent lg:bg-transparent glass lg:glass-none">
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-semibold tracking-tight text-white lg:text-white flex items-center justify-center">
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
                    <LoginFormFields
                      register={register}
                      errors={errors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      isSubmitting={isSubmitting}
                      isLoading={isLoading}
                      formId="main"
                      className="[&_label]:text-white [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder:text-white/60 [&_input]:focus:border-white/40 [&_input]:focus:ring-white/20 [&_input]:hover:border-white/30 [&_a]:text-white/80 [&_a]:hover:text-white [&_a]:focus:ring-white/20 [&_button[type=button]]:text-[hsl(195_33.7%_39%)] [&_p]:text-red-200 [&_button[type=submit]]:bg-white [&_button[type=submit]]:text-gray-900 [&_button[type=submit]]:hover:bg-white/90 [&_button[type=submit]]:shadow-lg"
                    />

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

        {/* Right Column - Auth Image (desktop only) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <img
            src="/auth-image.jpg"
            alt="Medical Education Platform"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional overlay for better contrast */}
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
    </div>
  );
} 