import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { 
  verifyWebhookSignature, 
  mapSubscriptionStatus,
  type LemonSqueezyWebhookPayload 
} from '@/lib/lemonsqueezy'

// Lazy-initialize service role client for webhook operations
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase configuration for webhooks')
    }
    
    supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false }
    })
  }
  return supabaseAdmin
}

// Webhook events we handle
const HANDLED_EVENTS = [
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_resumed',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused',
]

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')
    
    // Verify webhook signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }
    
    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }
    
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // Parse payload
    const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name
    
    console.log(`[LemonSqueezy Webhook] Received event: ${eventName}`)
    
    // Check if we handle this event
    if (!HANDLED_EVENTS.includes(eventName)) {
      console.log(`[LemonSqueezy Webhook] Ignoring event: ${eventName}`)
      return NextResponse.json({ received: true })
    }
    
    // Extract subscription data
    const subscription = payload.data
    const attrs = subscription.attributes
    
    // Get user_id from custom data (passed during checkout)
    const userId = payload.meta.custom_data?.user_id
    
    if (!userId) {
      console.error('[LemonSqueezy Webhook] No user_id in custom_data')
      // Try to find user by email as fallback
      const admin = getSupabaseAdmin()
      const { data: users } = await admin.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email === attrs.user_email)
      
      if (!user) {
        console.error(`[LemonSqueezy Webhook] Could not find user for email: ${attrs.user_email}`)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400 }
        )
      }
      
      // Continue with found user
      return await handleSubscriptionEvent(eventName, subscription, user.id)
    }
    
    return await handleSubscriptionEvent(eventName, subscription, userId)
    
  } catch (error) {
    console.error('[LemonSqueezy Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionEvent(
  eventName: string,
  subscription: LemonSqueezyWebhookPayload['data'],
  userId: string
) {
  const admin = getSupabaseAdmin()
  const attrs = subscription.attributes
  const subscriptionId = subscription.id
  
  // Map status
  const status = mapSubscriptionStatus(attrs.status)
  
  // Base subscription data
  const subscriptionData = {
    user_id: userId,
    lemon_squeezy_id: subscriptionId,
    lemon_squeezy_customer_id: String(attrs.customer_id),
    lemon_squeezy_order_id: String(attrs.order_id),
    lemon_squeezy_product_id: String(attrs.product_id),
    lemon_squeezy_variant_id: String(attrs.variant_id),
    plan: 'pro', // Currently only one paid plan
    status,
    billing_anchor: attrs.billing_anchor,
    current_period_end: attrs.renews_at,
    cancelled_at: attrs.cancelled ? new Date().toISOString() : null,
    ends_at: attrs.ends_at,
  }
  
  switch (eventName) {
    case 'subscription_created': {
      console.log(`[LemonSqueezy] Creating subscription for user ${userId}`)
      
      const { error } = await admin
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'lemon_squeezy_id',
        })
      
      if (error) {
        console.error('[LemonSqueezy] Error creating subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      console.log(`[LemonSqueezy] Subscription created for user ${userId}`)
      break
    }
    
    case 'subscription_updated':
    case 'subscription_resumed':
    case 'subscription_paused':
    case 'subscription_unpaused': {
      console.log(`[LemonSqueezy] Updating subscription ${subscriptionId}`)
      
      const { error } = await admin
        .from('subscriptions')
        .update({
          status,
          current_period_end: attrs.renews_at,
          cancelled_at: attrs.cancelled ? new Date().toISOString() : null,
          ends_at: attrs.ends_at,
        })
        .eq('lemon_squeezy_id', subscriptionId)
      
      if (error) {
        console.error('[LemonSqueezy] Error updating subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      console.log(`[LemonSqueezy] Subscription updated: ${subscriptionId}`)
      break
    }
    
    case 'subscription_cancelled': {
      console.log(`[LemonSqueezy] Cancelling subscription ${subscriptionId}`)
      
      const { error } = await admin
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          ends_at: attrs.ends_at,
        })
        .eq('lemon_squeezy_id', subscriptionId)
      
      if (error) {
        console.error('[LemonSqueezy] Error cancelling subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      console.log(`[LemonSqueezy] Subscription cancelled: ${subscriptionId}`)
      break
    }
    
    case 'subscription_expired': {
      console.log(`[LemonSqueezy] Expiring subscription ${subscriptionId}`)
      
      const { error } = await admin
        .from('subscriptions')
        .update({
          status: 'expired',
          ends_at: new Date().toISOString(),
        })
        .eq('lemon_squeezy_id', subscriptionId)
      
      if (error) {
        console.error('[LemonSqueezy] Error expiring subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      console.log(`[LemonSqueezy] Subscription expired: ${subscriptionId}`)
      break
    }
  }
  
  return NextResponse.json({ received: true, event: eventName })
}
