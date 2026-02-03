/**
 * Subscription helpers for checking user plan and limits
 */

import { createClient } from '@/lib/supabase/server'

export type Plan = 'free' | 'pro'

export interface UserSubscription {
  plan: Plan
  status: string
  isActive: boolean
  currentPeriodEnd: Date | null
  cancelledAt: Date | null
  endsAt: Date | null
  lemonSqueezyId: string | null
}

export interface PlanLimits {
  maxRetros: number
  maxParticipants: number
  hasExport: boolean
  hasAnalytics: boolean
  hasAISummary: boolean
  linkValidityDays: number | null // null = permanent
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxRetros: 3,
    maxParticipants: 10,
    hasExport: false,
    hasAnalytics: false,
    hasAISummary: true,  // Keep AI summary for free tier as differentiator
    linkValidityDays: 7,
  },
  pro: {
    maxRetros: Infinity,
    maxParticipants: Infinity,
    hasExport: true,
    hasAnalytics: true,
    hasAISummary: true,
    linkValidityDays: null, // Permanent
  },
}

/**
 * Get the current user's subscription status
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription> {
  const supabase = await createClient()
  
  // If no userId provided, get from session
  let effectiveUserId = userId
  if (!effectiveUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    effectiveUserId = user?.id
  }
  
  // Default free subscription for non-authenticated users
  if (!effectiveUserId) {
    return {
      plan: 'free',
      status: 'none',
      isActive: false,
      currentPeriodEnd: null,
      cancelledAt: null,
      endsAt: null,
      lemonSqueezyId: null,
    }
  }
  
  // Check for active subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', effectiveUserId)
    .in('status', ['active', 'past_due', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error || !subscription) {
    // No active subscription = free tier
    return {
      plan: 'free',
      status: 'none',
      isActive: true, // Free tier is always "active"
      currentPeriodEnd: null,
      cancelledAt: null,
      endsAt: null,
      lemonSqueezyId: null,
    }
  }
  
  // Check if subscription is truly active
  const isActive = ['active', 'past_due'].includes(subscription.status)
  
  // If cancelled but not yet ended, still active until ends_at
  const now = new Date()
  const endsAt = subscription.ends_at ? new Date(subscription.ends_at) : null
  const stillHasAccess = isActive || (endsAt !== null && endsAt > now)
  
  return {
    plan: stillHasAccess ? (subscription.plan as Plan) : 'free',
    status: subscription.status,
    isActive: stillHasAccess,
    currentPeriodEnd: subscription.current_period_end 
      ? new Date(subscription.current_period_end) 
      : null,
    cancelledAt: subscription.cancelled_at 
      ? new Date(subscription.cancelled_at) 
      : null,
    endsAt,
    lemonSqueezyId: subscription.lemon_squeezy_id,
  }
}

/**
 * Get the limits for the current user's plan
 */
export async function getUserLimits(userId?: string): Promise<PlanLimits> {
  const subscription = await getUserSubscription(userId)
  return PLAN_LIMITS[subscription.plan]
}

/**
 * Check if user can create a new retro
 */
export async function canCreateRetro(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  const limits = await getUserLimits(userId)
  
  if (limits.maxRetros === Infinity) {
    return { allowed: true }
  }
  
  // Count active retros for this user
  const { count, error } = await supabase
    .from('retros')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_closed', false)
  
  if (error) {
    console.error('Error counting retros:', error)
    return { allowed: true } // Fail open
  }
  
  if ((count ?? 0) >= limits.maxRetros) {
    return {
      allowed: false,
      reason: `Free plan limit: ${limits.maxRetros} active retros. Upgrade to Pro for unlimited.`,
    }
  }
  
  return { allowed: true }
}

/**
 * Check if a feature is available for the user's plan
 */
export async function hasFeature(
  userId: string | undefined,
  feature: keyof PlanLimits
): Promise<boolean> {
  const limits = await getUserLimits(userId)
  const value = limits[feature]
  
  // For boolean features
  if (typeof value === 'boolean') {
    return value
  }
  
  // For numeric features, check if it's not 0 or null
  return value !== 0 && value !== null
}
