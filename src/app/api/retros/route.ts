import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_RETRO_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'past_due'])
      .single()

    const isPro = !!subscription

    // If not pro, check retro count
    if (!isPro) {
      const { count, error: countError } = await supabase
        .from('retros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_closed', false)

      if (countError) {
        console.error('Error counting retros:', countError)
        return NextResponse.json(
          { error: 'Failed to check retro limit' },
          { status: 500 }
        )
      }

      if ((count || 0) >= FREE_RETRO_LIMIT) {
        return NextResponse.json(
          { 
            error: 'Free plan limit reached',
            code: 'LIMIT_REACHED',
            limit: FREE_RETRO_LIMIT 
          },
          { status: 403 }
        )
      }
    }

    // Parse request body
    const body = await request.json()
    const { title, format } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Create retro
    const { data: retro, error: insertError } = await supabase
      .from('retros')
      .insert({
        title: title.trim(),
        format: format || 'start-stop-continue',
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating retro:', insertError)
      return NextResponse.json(
        { error: 'Failed to create retro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ retro })

  } catch (error) {
    console.error('Create retro error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
