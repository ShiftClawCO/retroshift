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

  // Use action (not RLS query) — API routes don't have Convex auth tokens.
  // Security: getUser() above verifies the WorkOS session cookie.
  const convexUser = await convex.action(api.userActions.getUserByWorkosId, {
    workosId: user.id,
  });

  if (!convexUser?.stripeCustomerId) {
    return Response.json({ error: "No subscription found" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: convexUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-retros`,
  });

  return Response.json({ url: session.url });
}
