'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Entry, Vote, VOTE_SCORES } from '@/lib/supabase'

interface LeaderboardProps {
  entries: Entry[]
  votes: Vote[]
}

interface ScoredEntry {
  entry: Entry
  score: number
  voteBreakdown: Record<string, number>
  totalVotes: number
}

export default function Leaderboard({ entries, votes }: LeaderboardProps) {
  const t = useTranslations()

  const { topEntries, controversialEntries } = useMemo(() => {
    const scored: ScoredEntry[] = entries.map(entry => {
      const entryVotes = votes.filter(v => v.entry_id === entry.id)
      
      const voteBreakdown: Record<string, number> = {}
      let score = 0
      
      for (const vote of entryVotes) {
        voteBreakdown[vote.emoji] = (voteBreakdown[vote.emoji] || 0) + 1
        score += VOTE_SCORES[vote.emoji] || 0
      }
      
      return { entry, score, voteBreakdown, totalVotes: entryVotes.length }
    })

    // Top entries: score > 0, sorted by score desc
    const top = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Controversial: score < 0 or has downvotes, sorted by score asc (worst first)
    const controversial = scored
      .filter(s => s.score < 0 || (s.voteBreakdown['👎'] && s.voteBreakdown['👎'] > 0))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)

    return { topEntries: top, controversialEntries: controversial }
  }, [entries, votes])

  if (topEntries.length === 0 && controversialEntries.length === 0) {
    return null
  }

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Top Feedback */}
      {topEntries.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            🏆 {t('leaderboard.title')}
          </h3>
          
          <div className="space-y-3">
            {topEntries.map((item, index) => (
              <div 
                key={item.entry.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-amber-900/20 border border-amber-500/30' 
                    : 'bg-slate-900/50'
                }`}
              >
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-sm font-semibold ${
                      index === 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      +{item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-1 text-xs text-slate-400">
                      {Object.entries(item.voteBreakdown).map(([emoji, count]) => (
                        <span key={emoji}>{emoji}{count}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controversial / Needs Attention */}
      {controversialEntries.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/20 to-slate-800/50 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            ⚠️ {t('leaderboard.controversialTitle')}
          </h3>
          
          <div className="space-y-3">
            {controversialEntries.map((item, index) => (
              <div 
                key={item.entry.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-900/10 border border-red-500/20"
              >
                <span className="text-2xl">
                  {index === 0 ? '🚨' : index === 1 ? '⚡' : '💢'}
                </span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-semibold text-red-400">
                      {item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-1 text-xs text-slate-400">
                      {Object.entries(item.voteBreakdown).map(([emoji, count]) => (
                        <span key={emoji}>{emoji}{count}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-red-400/70 mt-4">
            {t('leaderboard.controversialDesc')}
          </p>
        </div>
      )}

      {/* Scoring legend */}
      <p className="text-xs text-slate-500 text-center">
        {t('leaderboard.scoring')}: 👍 +1 • 🔥 +2 • 💡 +1 • 👎 -1
      </p>
    </div>
  )
}
