import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  const user = await getUser();
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create Stripe customer
  const convexUser = await convex.query(api.users.getByWorkosId, { 
    workosId: user.id 
  });
  
  let customerId = convexUser?.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { workosId: user.id },
    });
    customerId = customer.id;
    
    // Use Convex action that calls internal mutation
    await convex.action(api.stripe.linkStripeCustomer, {
      workosId: user.id,
      stripeCustomerId: customerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-retros?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { workosId: user.id },
  });

  return Response.json({ url: session.url });
}
