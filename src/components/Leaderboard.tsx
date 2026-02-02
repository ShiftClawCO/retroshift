'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Entry, Vote, VOTE_SCORES } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

    const top = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 {t('leaderboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEntries.map((item, index) => (
              <div 
                key={item.entry.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-amber-500/10 border border-amber-500/30' 
                    : 'bg-muted/50'
                }`}
              >
                <span className="text-2xl">{getMedalEmoji(index)}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-sm font-semibold ${
                      index === 0 ? 'text-amber-500' : 'text-primary'
                    }`}>
                      +{item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      {Object.entries(item.voteBreakdown).map(([emoji, count]) => (
                        <span key={emoji}>{emoji}{count}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Controversial / Needs Attention */}
      {controversialEntries.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ {t('leaderboard.controversialTitle')}
            </CardTitle>
            <CardDescription>{t('leaderboard.controversialDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {controversialEntries.map((item, index) => (
              <div 
                key={item.entry.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <span className="text-2xl">
                  {index === 0 ? '🚨' : index === 1 ? '⚡' : '💢'}
                </span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-semibold text-destructive">
                      {item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      {Object.entries(item.voteBreakdown).map(([emoji, count]) => (
                        <span key={emoji}>{emoji}{count}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scoring legend */}
      <p className="text-xs text-muted-foreground text-center">
        {t('leaderboard.scoring')}: 👍 +1 • 🔥 +2 • 💡 +1 • 👎 -1
      </p>
    </div>
  )
}
