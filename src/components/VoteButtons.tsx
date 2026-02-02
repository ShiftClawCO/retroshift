'use client'

import { useState, useEffect } from 'react'
import { supabase, Vote, VOTE_EMOJIS, VoteEmoji, getVoterId } from '@/lib/supabase'

interface VoteButtonsProps {
  entryId: string
  initialVotes: Vote[]
  onVoteChange?: (votes: Vote[]) => void
}

export default function VoteButtons({ entryId, initialVotes, onVoteChange }: VoteButtonsProps) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const [voterId, setVoterId] = useState<string>('')
  const [loading, setLoading] = useState<VoteEmoji | null>(null)

  useEffect(() => {
    setVoterId(getVoterId())
  }, [])

  // Update when initialVotes change
  useEffect(() => {
    setVotes(initialVotes)
  }, [initialVotes])

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

    try {
      if (existingVote) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)

        if (!error) {
          const newVotes = votes.filter(v => v.id !== existingVote.id)
          setVotes(newVotes)
          onVoteChange?.(newVotes)
        }
      } else {
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
          const newVotes = [...votes, data]
          setVotes(newVotes)
          onVoteChange?.(newVotes)
        }
      }
    } catch (err) {
      console.error('Vote error:', err)
    }

    setLoading(null)
  }

  // Emoji styling
  const getEmojiStyle = (emoji: VoteEmoji, voted: boolean, count: number) => {
    const baseStyle = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all duration-200 font-medium'
    
    if (voted) {
      switch (emoji) {
        case '👍': return `${baseStyle} bg-emerald-600 text-white shadow-md shadow-emerald-500/30`
        case '🔥': return `${baseStyle} bg-orange-600 text-white shadow-md shadow-orange-500/30`
        case '💡': return `${baseStyle} bg-amber-500 text-white shadow-md shadow-amber-500/30`
        case '👎': return `${baseStyle} bg-red-600 text-white shadow-md shadow-red-500/30`
        default: return `${baseStyle} bg-slate-600 text-white`
      }
    }
    
    if (count > 0) {
      return `${baseStyle} bg-slate-700/80 text-slate-200 hover:bg-slate-600 border border-slate-600`
    }
    
    return `${baseStyle} bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700`
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {VOTE_EMOJIS.map((emoji) => {
        const count = getVoteCount(emoji)
        const voted = hasVoted(emoji)
        
        return (
          <button
            key={emoji}
            onClick={() => toggleVote(emoji)}
            disabled={loading === emoji}
            className={`${getEmojiStyle(emoji, voted, count)} ${
              loading === emoji ? 'opacity-50 cursor-wait' : 'cursor-pointer'
            }`}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && (
              <span className={`text-xs ${voted ? 'text-white/90' : 'text-slate-400'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
