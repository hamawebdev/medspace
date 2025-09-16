// @ts-nocheck
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function TestLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const formValues = watch();

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted:', data);
    alert(`Form submitted with email: ${data.email} and password: ${data.password}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Login Form</h1>
        
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <strong>Current Values:</strong>
          <pre>{JSON.stringify(formValues, null, 2)}</pre>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="test-password">Password</Label>
            <div className="relative">
              <Input
                id="test-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="pr-10"
                {...register("password")}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Test Submit'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Test Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Try typing in both fields</li>
            <li>Click the eye icon to toggle password visibility</li>
            <li>Submit with empty fields to see validation</li>
            <li>Submit with valid data to see success</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
