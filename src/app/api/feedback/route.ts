import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Free tier limits
const FREE_MAX_PARTICIPANTS = 10
const FREE_LINK_VALIDITY_DAYS = 7

interface FeedbackEntry {
  category: string
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    
    const body = await request.json()
    const { retroId, entries, participantId } = body as {
      retroId: string
      entries: FeedbackEntry[]
      participantId: string
    }

    if (!retroId || !entries || entries.length === 0 || !participantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get retro with owner info
    const { data: retro, error: retroError } = await supabase
      .from('retros')
      .select('*, user_id')
      .eq('id', retroId)
      .single()

    if (retroError || !retro) {
      return NextResponse.json(
        { error: 'Retro not found' },
        { status: 404 }
      )
    }

    // Check if retro is closed
    if (retro.is_closed) {
      return NextResponse.json(
        { error: 'RETRO_CLOSED', message: 'This retro is closed' },
        { status: 403 }
      )
    }

    // Check if owner is Pro
    let isPro = false
    if (retro.user_id) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', retro.user_id)
        .in('status', ['active', 'past_due'])
        .single()
      
      isPro = subscription?.plan === 'pro'
    }

    // FREE TIER CHECKS
    if (!isPro) {
      // Check 1: Link validity (7 days)
      const createdAt = new Date(retro.created_at)
      const now = new Date()
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceCreation > FREE_LINK_VALIDITY_DAYS) {
        return NextResponse.json(
          { 
            error: 'LINK_EXPIRED', 
            message: `This retro link has expired. Free tier links are valid for ${FREE_LINK_VALIDITY_DAYS} days.`
          },
          { status: 403 }
        )
      }

      // Check 2: Participant limit (10 unique participants)
      // Count distinct participant IDs from existing entries
      const { data: existingEntries } = await supabase
        .from('entries')
        .select('participant_id')
        .eq('retro_id', retroId)

      const uniqueParticipants = new Set<string>()
      existingEntries?.forEach(entry => {
        if (entry.participant_id) {
          uniqueParticipants.add(entry.participant_id)
        }
      })

      // If this is a new participant, check the limit
      if (!uniqueParticipants.has(participantId)) {
        if (uniqueParticipants.size >= FREE_MAX_PARTICIPANTS) {
          return NextResponse.json(
            { 
              error: 'PARTICIPANT_LIMIT', 
              message: `This retro has reached the maximum of ${FREE_MAX_PARTICIPANTS} participants for the free tier.`
            },
            { status: 403 }
          )
        }
      }
    }

    // All checks passed - insert entries
    const toInsert = entries
      .filter(e => e.content.trim())
      .map(e => ({
        retro_id: retroId,
        category: e.category,
        content: e.content.trim(),
        participant_id: participantId,
      }))

    if (toInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid entries to submit' },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase
      .from('entries')
      .insert(toInsert)

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, count: toInsert.length })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
