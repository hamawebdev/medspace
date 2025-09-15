// @ts-nocheck
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
      .refine((val) => !/\d/.test(val), 'First name cannot contain numbers'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
      .refine((val) => !/\d/.test(val), 'Last name cannot contain numbers'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    universityId: z
      .string()
      .min(1, 'Please select a university'),
    specialtyId: z
      .string()
      .min(1, 'Please select a specialty'),
    currentYear: z
      .string()
      .min(1, 'Please select your current year'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>; 