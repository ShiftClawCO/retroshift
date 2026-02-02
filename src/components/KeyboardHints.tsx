'use client'

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyboardHint {
  keys: string[]
  description: string
}

interface KeyboardHintsProps {
  hints: KeyboardHint[]
}

export default function KeyboardHints({ hints }: KeyboardHintsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Toggle with ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsOpen(prev => !prev)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const formatKey = (key: string) => {
    if (key === 'cmd') return isMac ? '⌘' : 'Ctrl'
    if (key === 'shift') return '⇧'
    if (key === 'enter') return '↵'
    if (key === 'esc') return 'Esc'
    return key.toUpperCase()
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-8 w-8 p-0 opacity-50 hover:opacity-100"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-popover border rounded-lg shadow-lg p-4 min-w-[200px] z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Keyboard className="w-4 h-4" />
          Shortcuts
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-2">
        {hints.map((hint, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{hint.description}</span>
            <div className="flex items-center gap-1 ml-4">
              {hint.keys.map((key, j) => (
                <kbd
                  key={j}
                  className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border"
                >
                  {formatKey(key)}
                </kbd>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm pt-2 border-t mt-2">
          <span className="text-muted-foreground">Toggle hints</span>
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">?</kbd>
        </div>
      </div>
    </div>
  )
}
