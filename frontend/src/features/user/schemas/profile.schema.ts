import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').max(100),
  lastName: z.string().min(1, 'Last name cannot be empty').max(100),
  email: z.string().email('Enter a valid email address'),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
