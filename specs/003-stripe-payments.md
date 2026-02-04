# Spec 003: Migrate Payments to Stripe

## Overview
Replace LemonSqueezy with Stripe for subscription payments.

## Current State
- LemonSqueezy integration
- Webhook at `/api/webhooks/lemonsqueezy`
- Plan stored in Supabase subscriptions table

## Target State
- Stripe Checkout for subscriptions
- Stripe Customer Portal for management
- Webhook syncs to Convex

## Pricing
- **Free:** €0 (3 retros, 10 participants, 7-day links)
- **Pro:** €9/month (unlimited)

## Requirements

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
npm uninstall @lemonsqueezy/lemonsqueezy.js  # If installed
```

### 2. Stripe Configuration

Create `src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
```

Create `src/lib/stripe-client.ts`:
```typescript
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
```

### 3. Stripe Products Setup

In Stripe Dashboard:
1. Create Product: "RetroShift Pro"
   - Description: "Unlimited retros, participants, and permanent links"
2. Create Price: €9.00/month recurring
3. Save Price ID as `STRIPE_PRICE_ID`

### 4. Checkout Session API

Create `src/app/api/stripe/checkout/route.ts`:
```typescript
import { stripe } from "@/lib/stripe";
import { getUser } from '@workos-inc/authkit-nextjs';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  const { user } = await getUser();
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
    
    await convex.mutation(api.users.updateStripeCustomer, {
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
```

### 5. Stripe Webhook

Create `src/app/api/stripe/webhook/route.ts`:
```typescript
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

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
    console.error("Webhook signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      await convex.mutation(api.subscriptions.create, {
        workosId: session.metadata!.workosId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
      
      await convex.mutation(api.users.updatePlan, {
        workosId: session.metadata!.workosId,
        plan: "pro",
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await convex.mutation(api.subscriptions.update, {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000,
      });
      
      // Update plan based on status
      const plan = subscription.status === "active" ? "pro" : "free";
      await convex.mutation(api.users.updatePlanByStripeCustomer, {
        stripeCustomerId: subscription.customer as string,
        plan,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await convex.mutation(api.subscriptions.update, {
        stripeSubscriptionId: subscription.id,
        status: "canceled",
      });
      
      await convex.mutation(api.users.updatePlanByStripeCustomer, {
        stripeCustomerId: subscription.customer as string,
        plan: "free",
      });
      break;
    }
  }

  return Response.json({ received: true });
}
```

### 6. Customer Portal

Create `src/app/api/stripe/portal/route.ts`:
```typescript
import { stripe } from "@/lib/stripe";
import { getUser } from '@workos-inc/authkit-nextjs';
import { ConvexHttpClient } from "convex/browser";

export async function POST() {
  const { user } = await getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUser = await convex.query(api.users.getByWorkosId, {
    workosId: user.id,
  });

  if (!convexUser?.stripeCustomerId) {
    return Response.json({ error: "No subscription" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: convexUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-retros`,
  });

  return Response.json({ url: session.url });
}
```

### 7. Update Pricing Page

Modify `src/app/pricing/page.tsx`:
```typescript
"use client";
import { useUser } from "@/hooks/useUser";

export default function PricingPage() {
  const { user, isPro } = useUser();

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  const handleManage = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    // Pricing UI with buttons
  );
}
```

### 8. Convex Subscription Functions

Create `convex/subscriptions.ts`:
```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({...});
export const update = mutation({...});
export const getByUser = query({...});
```

### 9. Remove LemonSqueezy

Delete:
- `src/app/api/webhooks/lemonsqueezy/route.ts`
- Any LemonSqueezy related code

## Environment Variables

Remove:
```
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_WEBHOOK_SECRET
```

Add:
```
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
```

## Stripe Dashboard Setup
1. Create product "RetroShift Pro"
2. Create price €9/month
3. Set up webhook endpoint: https://retroshift.vercel.app/api/stripe/webhook
4. Enable events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
5. Configure Customer Portal

## Acceptance Criteria
- [ ] Checkout redirects to Stripe
- [ ] Successful payment upgrades to Pro
- [ ] Webhook updates Convex
- [ ] Subscription cancellation reverts to Free
- [ ] Customer Portal works for managing subscription
- [ ] No LemonSqueezy code remains

## Files to Create
- `src/lib/stripe.ts`
- `src/lib/stripe-client.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/portal/route.ts`
- `convex/subscriptions.ts`

## Files to Delete
- `src/app/api/webhooks/lemonsqueezy/route.ts`
