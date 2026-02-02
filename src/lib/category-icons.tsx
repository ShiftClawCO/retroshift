import {
  Rocket,
  StopCircle,
  RefreshCw,
  Flame,
  CloudRain,
  Smile,
  Heart,
  Lightbulb,
  HelpCircle,
  LucideIcon,
} from 'lucide-react'

export interface CategoryConfig {
  icon: LucideIcon
  border: string
  bg: string
  iconColor: string
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Start/Stop/Continue
  start: {
    icon: Rocket,
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-500',
  },
  stop: {
    icon: StopCircle,
    border: 'border-l-rose-500',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-500',
  },
  continue: {
    icon: RefreshCw,
    border: 'border-l-sky-500',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-500',
  },
  // Mad/Sad/Glad
  mad: {
    icon: Flame,
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    iconColor: 'text-orange-500',
  },
  sad: {
    icon: CloudRain,
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-500',
  },
  glad: {
    icon: Smile,
    border: 'border-l-teal-500',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconColor: 'text-teal-500',
  },
  // Liked/Learned/Lacked
  liked: {
    icon: Heart,
    border: 'border-l-pink-500',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    iconColor: 'text-pink-500',
  },
  learned: {
    icon: Lightbulb,
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-500',
  },
  lacked: {
    icon: HelpCircle,
    border: 'border-l-slate-500',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    iconColor: 'text-slate-500',
  },
}

// Default fallback
export const DEFAULT_CONFIG: CategoryConfig = {
  icon: HelpCircle,
  border: 'border-l-gray-500',
  bg: 'bg-gray-500/10 dark:bg-gray-500/20',
  iconColor: 'text-gray-500',
}

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] || DEFAULT_CONFIG
}
