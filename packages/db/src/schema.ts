import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(256),
  content: z.string().min(1),
});

// Explicitly use string-only metadata to avoid portability issues with Prisma's JSON type
export const StripePaymentSchema = z.object({
  amount: z.number(),
  currency: z.string().default("usd"),
  status: z.string(),
  stripePaymentId: z.string(),
  metadata: z.unknown().optional(),
  clerkUserId: z.string(),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type StripePaymentInput = z.infer<typeof StripePaymentSchema>;
