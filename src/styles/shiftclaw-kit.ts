/**
 * Shiftclaw UI/UX Kit
 * Design system per tutte le applicazioni Shiftclaw
 */

export const colors = {
  // Brand
  brand: {
    primary: '#10B981',      // Emerald 500 - main brand color
    primaryHover: '#059669', // Emerald 600
    primaryLight: '#D1FAE5', // Emerald 100
    primaryDark: '#065F46',  // Emerald 800
    
    secondary: '#8B5CF6',    // Violet 500 - accent
    secondaryHover: '#7C3AED',
    
    accent: '#F59E0B',       // Amber 500 - highlights
  },
  
  // Backgrounds
  bg: {
    dark: '#0F172A',         // Slate 900
    darker: '#020617',       // Slate 950
    card: '#1E293B',         // Slate 800
    cardHover: '#334155',    // Slate 700
    overlay: 'rgba(0,0,0,0.5)',
  },
  
  // Text
  text: {
    primary: '#F8FAFC',      // Slate 50
    secondary: '#94A3B8',    // Slate 400
    muted: '#64748B',        // Slate 500
    inverse: '#0F172A',      // Slate 900
  },
  
  // Semantic
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Borders
  border: {
    default: '#334155',      // Slate 700
    light: '#475569',        // Slate 600
    focus: '#10B981',        // Brand primary
  },
} as const

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), system-ui, sans-serif',
    mono: 'var(--font-geist-mono), monospace',
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgba(16, 185, 129, 0.3)',
  glowStrong: '0 0 30px rgba(16, 185, 129, 0.5)',
} as const

// Tailwind class presets for common patterns
export const presets = {
  // Buttons
  button: {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-lg transition-colors',
  },
  
  // Cards
  card: {
    default: 'bg-slate-800 border border-slate-700 rounded-xl p-6',
    hover: 'bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors',
    highlight: 'bg-slate-800 border border-emerald-500/50 rounded-xl p-6',
  },
  
  // Inputs
  input: {
    default: 'w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors',
    textarea: 'w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none',
  },
  
  // Badges
  badge: {
    default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-900/50 text-amber-400 border border-amber-500/30',
    error: 'bg-red-900/50 text-red-400 border border-red-500/30',
    info: 'bg-blue-900/50 text-blue-400 border border-blue-500/30',
  },
  
  // Layout
  container: 'max-w-6xl mx-auto px-4',
  section: 'py-16',
  
  // Gradients
  gradient: {
    bg: 'bg-gradient-to-b from-slate-900 to-slate-800',
    bgAlt: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    text: 'bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent',
  },
} as const

// Animation classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const
