// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight, University, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { AuthAPI } from "@/lib/auth-api";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface University {
  id: number;
  name: string;
  country: string;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
}

export function ModernRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Data state - optimized with lazy loading
  const [universities, setUniversities] = useState<University[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Memoized window size for better performance
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1000, height: 800 };
  });

  // Debounced resize handler to improve performance
  const updateWindowSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    updateWindowSize();

    // Throttled resize listener for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWindowSize, 100);
    };

    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [updateWindowSize]);

  // Optimized data loading with caching
  const loadData = useCallback(async () => {
    if (dataLoaded || dataLoading) return; // Prevent duplicate calls

    try {
      setDataLoading(true);
      const [universitiesData, specialtiesData] = await Promise.all([
        AuthAPI.getUniversities(),
        AuthAPI.getSpecialties(),
      ]);

      setUniversities(universitiesData);
      setSpecialties(specialtiesData);
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to load registration data:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to load registration options';

      if (errorMessage.includes('API server is currently unavailable')) {
        toast.error('Registration service is temporarily unavailable. Please try again later or contact support.');
      } else {
        toast.error('Failed to load registration options. Please refresh the page.');
      }

      setUniversities([]);
      setSpecialties([]);
    } finally {
      setDataLoading(false);
    }
  }, [dataLoaded, dataLoading]);

  // Load data only when user interacts with dropdowns
  const handleDropdownOpen = useCallback(() => {
    if (!dataLoaded && !dataLoading) {
      loadData();
    }
  }, [dataLoaded, dataLoading, loadData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Changed to onChange for real-time validation
  });

  // Watch all form fields for validation
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const universityId = watch('universityId');
  const specialtyId = watch('specialtyId');
  const currentYear = watch('currentYear');

  // Real-time validation functions
  const validateNameField = useCallback(async (fieldName: 'firstName' | 'lastName', value: string) => {
    if (value && value.length > 0) {
      await trigger(fieldName);
    }
  }, [trigger]);

  // Validate names on input change
  useEffect(() => {
    if (firstName !== undefined) {
      validateNameField('firstName', firstName);
    }
  }, [firstName, validateNameField]);

  useEffect(() => {
    if (lastName !== undefined) {
      validateNameField('lastName', lastName);
    }
  }, [lastName, validateNameField]);

  // Real-time password matching validation
  useEffect(() => {
    if (password !== undefined && confirmPassword !== undefined) {
      // Trigger validation for both password fields when either changes
      trigger(['password', 'confirmPassword']);
    }
  }, [password, confirmPassword, trigger]);

  // Check if all fields are valid and filled
  const isFormValid = useMemo(() => {
    const hasAllRequiredFields = !!(
      firstName?.trim() &&
      lastName?.trim() &&
      email?.trim() &&
      password?.trim() &&
      confirmPassword?.trim() &&
      universityId &&
      specialtyId &&
      currentYear
    );

    const hasNoErrors = !(
      errors.firstName ||
      errors.lastName ||
      errors.email ||
      errors.password ||
      errors.confirmPassword ||
      errors.universityId ||
      errors.specialtyId ||
      errors.currentYear
    );

    return hasAllRequiredFields && hasNoErrors;
  }, [
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    universityId,
    specialtyId,
    currentYear,
    errors.firstName,
    errors.lastName,
    errors.email,
    errors.password,
    errors.confirmPassword,
    errors.universityId,
    errors.specialtyId,
    errors.currentYear,
  ]);

  // Memoized helper function to convert year number to API format
  const convertYearToApiFormat = useMemo(() => {
    const yearMap: { [key: string]: string } = {
      '1': 'ONE',
      '2': 'TWO',
      '3': 'THREE',
      '4': 'FOUR',
      '5': 'FIVE',
      '6': 'SIX',
      '7': 'SEVEN'
    };
    return (year: string): string => yearMap[year] || 'ONE';
  }, []);

  // Memoized year options for better performance
  const yearOptions = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => i + 1),
    []
  );

  // Optimized submit handler with better error handling
  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Combine first and last name into fullName for API
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

      const result = await AuthAPI.register({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        fullName: fullName,
        universityId: parseInt(data.universityId),
        specialtyId: parseInt(data.specialtyId),
        currentYear: convertYearToApiFormat(data.currentYear),
      });

      // Store authentication tokens if provided
      if (result.tokens) {
        apiClient.setTokens(result.tokens.accessToken, result.tokens.refreshToken);

        // Fetch and store user profile for dashboard access
        try {
          const userProfile = await AuthAPI.getCurrentUser();
          if (userProfile) {
            // Store user in localStorage for immediate dashboard access
            const legacyUser = {
              id: userProfile.id,
              email: userProfile.email,
              fullName: userProfile.fullName,
              role: userProfile.role.toLowerCase() as 'student' | 'admin' | 'employee',
              universityId: userProfile.universityId,
              specialtyId: userProfile.specialtyId,
              currentYear: userProfile.currentYear,
              isActive: userProfile.isActive,
              createdAt: userProfile.createdAt,
              updatedAt: userProfile.updatedAt,
              lastLogin: new Date()
            };
            localStorage.setItem('auth_user', JSON.stringify(legacyUser));
          }
        } catch (profileError) {
          console.warn('Failed to fetch user profile after registration:', profileError);
        }
      }

      toast.success('Registration successful! Welcome to MedCortex!');

      // Redirect new users directly to subscription browse page
      router.push('/student/subscriptions/browse');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router, convertYearToApiFormat]);

  // Memoized background gradient for better performance
  const backgroundGradient = useMemo(() => (
    <div className="absolute inset-0 section-bg bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-chart-1/5" />
    </div>
  ), []);

  // Memoized floating elements for better performance
  const floatingElements = useMemo(() => {
    if (!mounted) return null;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => ( // Reduced from 8 to 6 for better performance
          <motion.div
            key={i}
            className="absolute w-2 h-2 gradient-bg-primary rounded-full opacity-60"
            initial={{
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
            }}
            animate={{
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
            }}
            transition={{
              duration: Math.random() * 20 + 20, // Slightly faster animation
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }, [mounted, windowSize]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-8 relative">
      {/* Optimized animated background */}
      {backgroundGradient}

      {/* Optimized floating elements */}
      {floatingElements}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="glass shadow-2xl border-border/20 card-hover-lift animate-fade-in-up">
          <CardHeader className="text-center space-y-6 px-6 md:px-8 pt-8 pb-6 animate-delay-100">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Join MedCortex
            </CardTitle>
            <CardDescription className="text-lg max-w-md mx-auto">
              Start your medical education journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-6 md:px-8 pb-8 animate-delay-200">

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      className={cn(
                        "pl-10 h-10 border",
                        errors.firstName 
                          ? "border-destructive focus:border-destructive focus:ring-destructive" 
                          : "border-border"
                      )}
                      {...register("firstName")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-destructive text-sm">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      className={cn(
                        "pl-10 h-10 border",
                        errors.lastName 
                          ? "border-destructive focus:border-destructive focus:ring-destructive" 
                          : "border-border"
                      )}
                      {...register("lastName")}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-destructive text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-10 border border-border"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* University Field */}
              <div className="space-y-3">
                <Label htmlFor="universityId">University</Label>
                <Select
                  onValueChange={(value) => setValue("universityId", value)}
                  onOpenChange={(open) => open && handleDropdownOpen()}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn("h-10 border border-border", errors.universityId && "border-destructive")}>
                    <div className="flex items-center gap-2">
                      <University className="size-4 text-muted-foreground" />
                      <SelectValue
                        placeholder={
                          dataLoading
                            ? "Loading universities..."
                            : universities.length === 0 && dataLoaded
                              ? "No universities available"
                              : "Select your university"
                        }
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {dataLoading ? (
                      <div className="px-2 py-1 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading universities...
                      </div>
                    ) : universities.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        No universities available. Please refresh the page.
                      </div>
                    ) : (
                      universities.map((university) => (
                        <SelectItem key={university.id} value={university.id.toString()}>
                          <div className="flex flex-col">
                            <span>{university.name}</span>
                            <span className="text-xs text-muted-foreground">{university.country}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.universityId && (
                  <p className="text-destructive text-sm">{errors.universityId.message}</p>
                )}
              </div>

              {/* Specialty and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Medical Specialty</Label>
                  <Select
                    onValueChange={(value) => setValue("specialtyId", value)}
                    onOpenChange={(open) => open && handleDropdownOpen()}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={cn("h-10 border border-border", errors.specialtyId && "border-destructive")}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-muted-foreground" />
                        <SelectValue
                          placeholder={
                            dataLoading
                              ? "Loading specialties..."
                              : specialties.length === 0 && dataLoaded
                                ? "No specialties available"
                                : "Select your specialty"
                          }
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {dataLoading ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading specialties...
                        </div>
                      ) : specialties.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          No specialties available. Please refresh the page.
                        </div>
                      ) : (
                        specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            <div className="flex flex-col">
                              <span>{specialty.name}</span>
                              {specialty.description && (
                                <span className="text-xs text-muted-foreground">{specialty.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.specialtyId && (
                    <p className="text-destructive text-sm">{errors.specialtyId.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Current Year</Label>
                  <Select onValueChange={(value) => setValue("currentYear", value)} disabled={isLoading}>
                    <SelectTrigger className={cn("h-10 border border-border", errors.currentYear && "border-destructive")}>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <SelectValue placeholder="Select year" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currentYear && (
                    <p className="text-destructive text-sm">{errors.currentYear.message}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      className="pl-10 pr-10 h-10 border border-border"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="pl-10 pr-10 h-10 border border-border"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="size-4 text-primary focus:ring-primary border border-border rounded mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || !isFormValid}
                  className="w-full h-10 btn-modern btn-interactive group"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                {!isFormValid && !isSubmitting && !isLoading && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please fill in all fields correctly to continue
                  </p>
                )}
              </div>
            </motion.form>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 