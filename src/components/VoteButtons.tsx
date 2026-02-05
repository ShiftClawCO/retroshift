'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Vote, getParticipantId } from '@/lib/types'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteButtonsProps {
  entryId: Id<"entries">
  initialVotes: Vote[]
}

export default function VoteButtons({ entryId, initialVotes }: VoteButtonsProps) {
  const [participantId, setParticipantId] = useState<string>('')
  const [loading, setLoading] = useState<'up' | 'down' | null>(null)
  
  const upsertVote = useMutation(api.votes.upsert)

  useEffect(() => {
    setParticipantId(getParticipantId())
  }, [])

  // Calculate totals from votes
  const upvotes = initialVotes.filter(v => v.value > 0).length
  const downvotes = initialVotes.filter(v => v.value < 0).length
  
  // Check if current user has voted
  const myVote = initialVotes.find(v => v.participantId === participantId)
  const hasUpvoted = myVote?.value === 1
  const hasDownvoted = myVote?.value === -1

  const handleVote = async (value: 1 | -1) => {
    if (!participantId || loading) return

    const isUpvote = value === 1
    setLoading(isUpvote ? 'up' : 'down')

    try {
      // If clicking same vote, toggle off (send 0)
      const newValue = (isUpvote && hasUpvoted) || (!isUpvote && hasDownvoted) ? 0 : value
      
      await upsertVote({
        entryId,
        participantId,
        value: newValue,
      })
    } catch (err) {
      console.error('Vote error:', err)
    }

    setLoading(null)
  }

  const getButtonStyle = (type: 'up' | 'down', isActive: boolean, count: number) => {
    const baseStyle = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all duration-200 font-medium'
    
    if (isActive) {
      return type === 'up'
        ? `${baseStyle} bg-emerald-600 text-white shadow-md shadow-emerald-500/30`
        : `${baseStyle} bg-red-600 text-white shadow-md shadow-red-500/30`
    }
    
    if (count > 0) {
      return `${baseStyle} bg-slate-700/80 text-slate-200 hover:bg-slate-600 border border-slate-600`
    }
    
    return `${baseStyle} bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700`
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      <button
        onClick={() => handleVote(1)}
        disabled={loading === 'up'}
        className={`${getButtonStyle('up', hasUpvoted, upvotes)} ${
          loading === 'up' ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        }`}
        title="Upvote"
      >
        <ThumbsUp className="w-4 h-4" />
        {upvotes > 0 && (
          <span className={`text-xs ${hasUpvoted ? 'text-white/90' : 'text-slate-400'}`}>
            {upvotes}
          </span>
        )}
      </button>
      
      <button
        onClick={() => handleVote(-1)}
        disabled={loading === 'down'}
        className={`${getButtonStyle('down', hasDownvoted, downvotes)} ${
          loading === 'down' ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        }`}
        title="Downvote"
      >
        <ThumbsDown className="w-4 h-4" />
        {downvotes > 0 && (
          <span className={`text-xs ${hasDownvoted ? 'text-white/90' : 'text-slate-400'}`}>
            {downvotes}
          </span>
        )}
      </button>
    </div>
  )
}
