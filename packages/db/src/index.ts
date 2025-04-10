// Import necessary types from the generated client
import type {
  Prisma,
  StripePayment as PrismaStripePayment,
} from "../generated/client";

export * from "../generated/client";
export { db } from "./client";
export * from "../schema";

// Define and export the simplified type for StripePayment
// This is because trpc cannot handle the json type from prisma that is dependent on internal types
export type ExportableStripePayment = Omit<PrismaStripePayment, "metadata"> & {
  metadata?: Record<string, unknown> | null; // Use a portable type for metadata
};
