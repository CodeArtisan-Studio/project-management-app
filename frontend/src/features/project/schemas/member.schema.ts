import { z } from 'zod';

export const addMemberSchema = z.object({
  userId: z.string().uuid('Please select a valid user'),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
