import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Cancel subscription endpoint.
 * Sets the subscription to cancel at end of billing period.
 */
export async function POST() {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Convex to find Stripe customer ID
    const convexUser = await convex.query(api.users.getByWorkosId, {
      workosId: user.id,
    });

    if (!convexUser?.stripeCustomerId) {
      return Response.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // List subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: convexUser.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return Response.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];

    // Set subscription to cancel at end of billing period
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        cancel_at_period_end: true,
      }
    );

    // Stripe types don't expose current_period_end directly on Response
    // but it's present on the actual subscription object
    const subData = updatedSubscription as unknown as {
      cancel_at: number | null;
      current_period_end: number;
    };

    return Response.json({
      success: true,
      cancelAt: subData.cancel_at
        ? subData.cancel_at * 1000
        : subData.current_period_end * 1000,
    });
  } catch (err: unknown) {
    console.error("Error canceling subscription:", err);
    const message =
      err instanceof Error ? err.message : "Failed to cancel subscription";
    return Response.json({ error: message }, { status: 500 });
  }
}
