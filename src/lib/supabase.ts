import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Retro {
  id: string
  title: string
  format: 'start-stop-continue' | 'mad-sad-glad' | 'liked-learned-lacked'
  created_at: string
  closes_at: string | null
  is_closed: boolean
  owner_email: string | null
  access_code: string
}

export interface Entry {
  id: string
  retro_id: string
  category: string
  content: string
  created_at: string
}

export const FORMATS = {
  'start-stop-continue': {
    name: 'Start / Stop / Continue',
    categories: ['start', 'stop', 'continue'],
    labels: {
      start: '🚀 Start',
      stop: '🛑 Stop', 
      continue: '✅ Continue'
    },
    colors: {
      start: 'bg-green-100 border-green-300',
      stop: 'bg-red-100 border-red-300',
      continue: 'bg-blue-100 border-blue-300'
    }
  },
  'mad-sad-glad': {
    name: 'Mad / Sad / Glad',
    categories: ['mad', 'sad', 'glad'],
    labels: {
      mad: '😠 Mad',
      sad: '😢 Sad',
      glad: '😊 Glad'
    },
    colors: {
      mad: 'bg-red-100 border-red-300',
      sad: 'bg-blue-100 border-blue-300',
      glad: 'bg-green-100 border-green-300'
    }
  },
  'liked-learned-lacked': {
    name: 'Liked / Learned / Lacked',
    categories: ['liked', 'learned', 'lacked'],
    labels: {
      liked: '❤️ Liked',
      learned: '💡 Learned',
      lacked: '🤔 Lacked'
    },
    colors: {
      liked: 'bg-pink-100 border-pink-300',
      learned: 'bg-yellow-100 border-yellow-300',
      lacked: 'bg-gray-100 border-gray-300'
    }
  }
} as const

export type FormatKey = keyof typeof FORMATS
