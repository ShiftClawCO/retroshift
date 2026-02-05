import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import Stripe from "stripe";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.subscription || !session.metadata?.workosId) {
        console.error("Missing subscription or workosId in checkout session");
        break;
      }
      
      const subscriptionData = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      await convex.mutation(api.subscriptions.create, {
        workosId: session.metadata.workosId,
        stripeSubscriptionId: subscriptionData.id,
        stripePriceId: subscriptionData.items.data[0].price.id,
        status: subscriptionData.status,
        currentPeriodEnd: (subscriptionData as any).current_period_end * 1000,
      });
      
      await convex.mutation(api.users.updatePlan, {
        workosId: session.metadata.workosId,
        plan: "pro",
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      
      try {
        await convex.mutation(api.subscriptions.update, {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: (subscription as any).current_period_end * 1000,
        });
      } catch (err) {
        // Subscription may not exist yet if this fires before checkout.session.completed
        console.warn("Could not update subscription:", err);
      }
      
      // Update plan based on status
      const plan = subscription.status === "active" ? "pro" : "free";
      await convex.mutation(api.users.updatePlan, {
        stripeCustomerId: subscription.customer as string,
        plan,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      
      try {
        await convex.mutation(api.subscriptions.update, {
          stripeSubscriptionId: subscription.id,
          status: "canceled",
        });
      } catch (err) {
        console.warn("Could not update subscription on delete:", err);
      }
      
      await convex.mutation(api.users.updatePlan, {
        stripeCustomerId: subscription.customer as string,
        plan: "free",
      });
      break;
    }
  }

  return Response.json({ received: true });
}
