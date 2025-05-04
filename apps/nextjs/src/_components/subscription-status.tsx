"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { SubscriptionPlanModal } from "@sassy/ui";

import { useSubscription } from "~/hooks/use-subscription";
import { ManageSubscriptionButton } from "./manage-subscription-button";
import { SubscribeButton } from "./subscribe-button";

/**
 * Displays the user's subscription status
 * Also shows temporary status messages for successful or canceled payments
 */
export function SubscriptionStatus() {
  const { isSignedIn } = useUser();
  const { hasAccess, accessType, isLoading } = useSubscription();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Handle payment status messages
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setStatusMessage(
        "Payment successful! Your access should be active soon.",
      );
    } else if (payment === "canceled") {
      setStatusMessage("Payment canceled. You have not been charged.");
    }

    // Clear message after 5 seconds
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">
        Loading subscription status...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <SignInButton mode="modal">
          <button className="rounded-md bg-blue-500 px-4 py-2 text-white">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="ml-2 rounded-md bg-green-500 px-4 py-2 text-white">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="my-4 text-center">
      {statusMessage && (
        <div className="mb-2 rounded-md bg-blue-50 px-4 py-2 text-blue-700">
          {statusMessage}
        </div>
      )}

      {hasAccess ? (
        <div className="rounded-md bg-green-50 px-4 py-2 text-green-700">
          {`Your ${accessType} access is now active!`}
          {(accessType === "monthly" || accessType === "yearly") && (
            <div className="mt-2">
              <ManageSubscriptionButton
                buttonText="Manage billing"
                className="text-sm underline hover:text-green-800"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md bg-yellow-50 px-4 py-2 text-yellow-700">
          <span>No active subscription. </span>
          <SubscriptionPlanModal
            trigger={
              <button className="underline hover:text-yellow-800">
                Subscribe now
              </button>
            }
            title="Choose Your Plan"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <h3 className="mb-2 text-xl font-bold">Monthly Plan</h3>
                <p className="mb-3 text-3xl font-bold">$9.99/month</p>
                <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <li>✓ Full access to all features</li>
                  <li>✓ Premium support</li>
                  <li>✓ Regular updates</li>
                </ul>
                {isSignedIn ? (
                  <SubscribeButton
                    priceId="price_1R3eUoRQf2ptbFsnXfCxNoDq"
                    mode="subscription"
                    buttonText="Subscribe Monthly"
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  />
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Please sign in to subscribe
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <h3 className="mb-2 text-xl font-bold">Yearly Plan</h3>
                <p className="mb-3 text-3xl font-bold">$99.99/year</p>
                <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <li>✓ Full access to all features</li>
                  <li>✓ Premium support</li>
                  <li>✓ Regular updates</li>
                  <li>✓ Save vs Monthly</li>
                </ul>
                {isSignedIn ? (
                  <SubscribeButton
                    priceId="price_1R3eUJRQf2ptbFsnHuI2Kd3L"
                    mode="subscription"
                    buttonText="Subscribe Yearly"
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  />
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Please sign in to subscribe
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <h3 className="mb-2 text-xl font-bold">Lifetime Access</h3>
                <p className="mb-3 text-3xl font-bold">$99.99</p>
                <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <li>✓ One-time payment</li>
                  <li>✓ All features forever</li>
                  <li>✓ Premium support</li>
                  <li>✓ All future updates</li>
                </ul>
                {isSignedIn ? (
                  <SubscribeButton
                    priceId="price_1R3eTqRQf2ptbFsnqzXdqDqe"
                    mode="payment"
                    buttonText="Buy Lifetime Access"
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
                  />
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Please sign in to purchase
                  </p>
                )}
              </div>
            </div>
          </SubscriptionPlanModal>
        </div>
      )}
    </div>
  );
}
