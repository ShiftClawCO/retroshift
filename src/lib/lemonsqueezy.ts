/**
 * LemonSqueezy API client and utilities
 */

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

export interface LemonSqueezySubscription {
  id: string
  attributes: {
    store_id: number
    customer_id: number
    order_id: number
    order_item_id: number
    product_id: number
    variant_id: number
    product_name: string
    variant_name: string
    user_name: string
    user_email: string
    status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired'
    status_formatted: string
    card_brand: string
    card_last_four: string
    pause: null | {
      mode: string
      resumes_at: string
    }
    cancelled: boolean
    trial_ends_at: string | null
    billing_anchor: number
    first_subscription_item: {
      id: number
      subscription_id: number
      price_id: number
      quantity: number
      created_at: string
      updated_at: string
    }
    urls: {
      update_payment_method: string
      customer_portal: string
    }
    renews_at: string
    ends_at: string | null
    created_at: string
    updated_at: string
    test_mode: boolean
  }
}

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
    }
  }
  data: LemonSqueezySubscription
}

/**
 * Get customer portal URL for subscription management
 */
export async function getCustomerPortalUrl(subscriptionId: string): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    console.error('LEMONSQUEEZY_API_KEY not set')
    return null
  }

  try {
    const response = await fetch(`${LEMONSQUEEZY_API_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch subscription:', response.status)
      return null
    }

    const data = await response.json()
    return data.data.attributes.urls.customer_portal
  } catch (error) {
    console.error('Error fetching customer portal URL:', error)
    return null
  }
}

/**
 * Verify webhook signature from LemonSqueezy
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return computedSignature === signature
}

/**
 * Generate checkout URL with pre-filled data
 */
export function getCheckoutUrl(options: {
  variantId: string
  userId: string
  email?: string
  name?: string
  redirectUrl?: string
}): string {
  const { variantId, userId, email, name, redirectUrl } = options
  
  // LemonSqueezy checkout overlay URL format
  const baseUrl = `https://shiftclaw.lemonsqueezy.com/checkout/buy/${variantId}`
  const params = new URLSearchParams()
  
  // Pass user_id as custom data to link subscription to user
  params.set('checkout[custom][user_id]', userId)
  
  if (email) {
    params.set('checkout[email]', email)
  }
  
  if (name) {
    params.set('checkout[name]', name)
  }
  
  if (redirectUrl) {
    params.set('checkout[redirect_url]', redirectUrl)
  }
  
  // Enable checkout overlay
  params.set('embed', '1')
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Map LemonSqueezy status to our internal status
 */
export function mapSubscriptionStatus(lsStatus: string): string {
  const statusMap: Record<string, string> = {
    'on_trial': 'active',
    'active': 'active',
    'paused': 'paused',
    'past_due': 'past_due',
    'unpaid': 'past_due',
    'cancelled': 'cancelled',
    'expired': 'expired',
  }
  
  return statusMap[lsStatus] || 'unknown'
}
