'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Entry, Vote } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react'

interface LeaderboardProps {
  entries: Entry[]
  votes: Vote[]
}

interface ScoredEntry {
  entry: Entry
  score: number
  upvotes: number
  downvotes: number
  totalVotes: number
}

export default function Leaderboard({ entries, votes }: LeaderboardProps) {
  const t = useTranslations()

  const { topEntries, controversialEntries } = useMemo(() => {
    const scored: ScoredEntry[] = entries.map(entry => {
      const entryVotes = votes.filter(v => v.entryId === entry._id)
      
      let upvotes = 0
      let downvotes = 0
      
      for (const vote of entryVotes) {
        if (vote.value > 0) upvotes++
        else if (vote.value < 0) downvotes++
      }
      
      const score = upvotes - downvotes
      
      return { entry, score, upvotes, downvotes, totalVotes: entryVotes.length }
    })

    const top = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const controversial = scored
      .filter(s => s.score < 0 || s.downvotes > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)

    return { topEntries: top, controversialEntries: controversial }
  }, [entries, votes])

  if (topEntries.length === 0 && controversialEntries.length === 0) {
    return null
  }

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-amber-500" />
      case 1: return <Medal className="w-6 h-6 text-slate-400" />
      case 2: return <Award className="w-6 h-6 text-amber-700" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-muted-foreground">#{index + 1}</span>
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Top Feedback */}
      {topEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {t('leaderboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEntries.map((item, index) => (
              <div 
                key={item.entry._id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-amber-500/10 border border-amber-500/30' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="shrink-0 mt-0.5">{getMedalIcon(index)}</div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-sm font-semibold ${
                      index === 0 ? 'text-amber-500' : 'text-primary'
                    }`}>
                      +{item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {item.upvotes > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {item.upvotes}
                        </span>
                      )}
                      {item.downvotes > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          {item.downvotes}
                        </span>
                      )}
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
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('leaderboard.controversialTitle')}
            </CardTitle>
            <CardDescription>{t('leaderboard.controversialDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {controversialEntries.map((item) => (
              <div 
                key={item.entry._id}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{item.entry.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-semibold text-destructive">
                      {item.score} {t('leaderboard.points')}
                    </span>
                    
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {item.upvotes > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {item.upvotes}
                        </span>
                      )}
                      {item.downvotes > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          {item.downvotes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scoring legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>{t('leaderboard.scoring')}:</span>
        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> +1</span>
        <span className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> -1</span>
      </div>
    </div>
  )
}
