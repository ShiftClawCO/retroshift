'use client'

import { useState, useEffect } from 'react'
import { supabase, Vote, VOTE_EMOJIS, VoteEmoji, getVoterId } from '@/lib/supabase'

interface VoteButtonsProps {
  entryId: string
  initialVotes: Vote[]
}

export default function VoteButtons({ entryId, initialVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const [voterId, setVoterId] = useState<string>('')
  const [loading, setLoading] = useState<VoteEmoji | null>(null)

  useEffect(() => {
    setVoterId(getVoterId())
  }, [])

  const getVoteCount = (emoji: VoteEmoji) => {
    return votes.filter(v => v.emoji === emoji).length
  }

  const hasVoted = (emoji: VoteEmoji) => {
    return votes.some(v => v.emoji === emoji && v.voter_id === voterId)
  }

  const toggleVote = async (emoji: VoteEmoji) => {
    if (!voterId || loading) return

    setLoading(emoji)

    const existingVote = votes.find(v => v.emoji === emoji && v.voter_id === voterId)

    if (existingVote) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)

      if (!error) {
        setVotes(prev => prev.filter(v => v.id !== existingVote.id))
      }
    } else {
      // Add vote
      const { data, error } = await supabase
        .from('votes')
        .insert({
          entry_id: entryId,
          emoji,
          voter_id: voterId,
        })
        .select()
        .single()

      if (!error && data) {
        setVotes(prev => [...prev, data])
      }
    }

    setLoading(null)
  }

  return (
    <div className="flex gap-1 mt-3">
      {VOTE_EMOJIS.map((emoji) => {
        const count = getVoteCount(emoji)
        const voted = hasVoted(emoji)
        
        return (
          <button
            key={emoji}
            onClick={() => toggleVote(emoji)}
            disabled={loading === emoji}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
              voted
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            } ${loading === emoji ? 'opacity-50' : ''}`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
