import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { supabase } from '@/lib/supabase'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const { retroId, locale = 'en' } = await request.json()

    if (!retroId) {
      return NextResponse.json({ error: 'Missing retroId' }, { status: 400 })
    }

    // Fetch retro and entries
    const { data: retro } = await supabase
      .from('retros')
      .select('*')
      .eq('id', retroId)
      .single()

    if (!retro) {
      return NextResponse.json({ error: 'Retro not found' }, { status: 404 })
    }

    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('retro_id', retroId)

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries to summarize' }, { status: 400 })
    }

    // Group entries by category
    const grouped: Record<string, string[]> = {}
    for (const entry of entries) {
      if (!grouped[entry.category]) grouped[entry.category] = []
      grouped[entry.category].push(entry.content)
    }

    const feedbackText = Object.keys(grouped)
      .map(cat => `${cat.toUpperCase()}:\n${grouped[cat].map(i => `- ${i}`).join('\n')}`)
      .join('\n\n')

    const systemPrompt = locale === 'it' 
      ? `Sei un facilitatore di retrospettive agile esperto. Analizza il feedback del team e fornisci:
1. Un breve riassunto (2-3 frasi) dei temi principali
2. I 3 punti più importanti emersi
3. 2-3 azioni concrete suggerite

Rispondi in italiano. Sii conciso e pratico.`
      : `You are an expert agile retrospective facilitator. Analyze the team feedback and provide:
1. A brief summary (2-3 sentences) of the main themes
2. The 3 most important points that emerged
3. 2-3 concrete suggested actions

Be concise and practical.`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Retrospective: "${retro.title}"\n\nFeedback:\n${feedbackText}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    })

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summary error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to generate summary: ${message}` }, { status: 500 })
  }
}
