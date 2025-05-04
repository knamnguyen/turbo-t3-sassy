// apps/nextjs/src/app/api/webhooks/stripe/route.ts
import type { WebhookResult } from "@sassy/stripe";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { StripeService } from "@sassy/stripe";

import { env } from "~/env";
import { metadata } from "../../../layout";

/**
 * Stripe webhook handler
 * This receives events from Stripe when subscription status changes
 * It updates Clerk metadata with subscription status
 */

console.log("Stripe webhook route loaded");
export async function POST(req: Request) {
  try {
    console.log("Stripe webhook received");
    // Create Stripe service
    const stripeService = new StripeService({
      secretKey: env.STRIPE_SECRET_KEY || "",
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    });

    // Get raw request body
    const body = await req.text();

    // Get Stripe signature from headers
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe signature", { status: 400 });
    }

    // Process the webhook event sent from Stripe
    const result = await stripeService.handleWebhookEvent(
      signature,
      Buffer.from(body),
    );

    // If we have a user ID and it's a subscription or charge event, update Clerk metadata
    // Stripe userid is currently undefined
    // separation of concerns for data: don't even need to store stripe userid in clerk lol just query status from stripe directly
    if (
      result.clerkUserId &&
      result.event &&
      (result.event.includes("subscription") ||
        result.event.includes("charge.succeeded"))
    ) {
      // // Get subscription status from Stripe
      // const status = await stripeService.hasAccess(result.clerkUserId);
      // // Update Clerk user metadata
      // const client = await clerkClient();
      // await client.users.updateUserMetadata(result.clerkUserId, {
      //   publicMetadata: {
      //     hasAccess: status.hasAccess,
      //     isLifetime: status.isLifetime,
      //   },
      // });
    }

    console.log("Stripe webhook processed");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new NextResponse(
      "Webhook error: " +
        (error instanceof Error ? error.message : "Unknown error"),
      { status: 400 },
    );
  }
}

// Ensure this route is always dynamically evaluated
export const dynamic = "force-dynamic";
