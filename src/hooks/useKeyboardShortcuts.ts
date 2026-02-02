'use client'

import { useEffect, useCallback } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Cmd/Ctrl+Enter in textareas
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        // Let it through
      } else {
        return
      }
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
      const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey

      // For Cmd/Ctrl shortcuts, accept either
      const modifierMatch = shortcut.meta || shortcut.ctrl
        ? (event.metaKey || event.ctrlKey)
        : (ctrlMatch && metaMatch)

      if (keyMatch && modifierMatch && shiftMatch) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export type { Shortcut }
