/**
 * EvalPrompts Design System - Grayscale Tokens
 * Centralized design constants for consistent UI
 */

// Spacing System (Tailwind compatible)
export const spacing = {
  xs: '2px',   // 0.5
  sm: '4px',   // 1
  md: '8px',   // 2
  lg: '12px',  // 3
  xl: '16px',  // 4
  '2xl': '24px', // 6
  '3xl': '32px', // 8
  '4xl': '48px', // 12
  '5xl': '64px', // 16
} as const

// Typography Scale
export const typography = {
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
} as const

// Component Sizing
export const components = {
  card: {
    padding: spacing['2xl'],      // p-6
    borderRadius: '8px',          // rounded-lg
    border: '1px solid',
  },
  button: {
    height: {
      sm: '32px',                 // h-8
      md: '40px',                 // h-10
      lg: '44px',                 // h-11
    },
    padding: {
      sm: `${spacing.sm} ${spacing.lg}`,      // px-3 py-1
      md: `${spacing.md} ${spacing.xl}`,      // px-4 py-2
      lg: `${spacing.lg} ${spacing['2xl']}`,  // px-6 py-3
    }
  },
  badge: {
    padding: `${spacing.xs} ${spacing.md}`,   // px-2 py-0.5
    fontSize: typography.fontSize.xs,
    borderRadius: '4px',                      // rounded
  },
  input: {
    height: '40px',                           // h-10
    padding: `${spacing.md} ${spacing.lg}`,  // px-3 py-2
    borderRadius: '6px',                      // rounded-md
  }
} as const

// Grayscale Color Mappings
export const colors = {
  // Core Grayscale
  black: '#000000',
  white: '#ffffff',
  
  // Mono Scale (matches Tailwind config)
  mono: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Status Indicators (Grayscale)
  status: {
    high: {
      DEFAULT: colors.mono?.[900] || '#171717',
      subtle: colors.mono?.[50] || '#fafafa',
      border: colors.mono?.[800] || '#262626',
    },
    medium: {
      DEFAULT: colors.mono?.[600] || '#525252',
      subtle: colors.mono?.[100] || '#f5f5f5',
      border: colors.mono?.[500] || '#737373',
    },
    low: {
      DEFAULT: colors.mono?.[400] || '#a3a3a3',
      subtle: colors.mono?.[50] || '#fafafa',
      border: colors.mono?.[300] || '#d4d4d4',
    }
  }
} as const

// Animation & Transitions
export const animation = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
} as const

// Shadow System (Grayscale)
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

// Common UI Patterns
export const patterns = {
  // Card variants
  cardDefault: 'bg-white border border-mono-200 rounded-lg p-6',
  cardSubtle: 'bg-mono-50 border border-mono-200 rounded-lg p-6',
  cardElevated: 'bg-white border border-mono-200 rounded-lg p-6 shadow-md',
  
  // Button variants
  buttonPrimary: 'bg-mono-900 text-white hover:bg-mono-800 focus:ring-2 focus:ring-mono-900 focus:ring-offset-2',
  buttonSecondary: 'bg-white border border-mono-300 text-mono-700 hover:bg-mono-50 focus:ring-2 focus:ring-mono-500 focus:ring-offset-2',
  buttonGhost: 'text-mono-700 hover:bg-mono-100 focus:ring-2 focus:ring-mono-500 focus:ring-offset-2',
  
  // Badge variants
  badgeDefault: 'bg-mono-100 text-mono-700 border border-mono-300',
  badgeSubtle: 'bg-mono-50 text-mono-600 border border-mono-200',
  badgeStrong: 'bg-mono-900 text-white border border-mono-900',
  
  // Status indicators
  statusHigh: 'bg-status-high-subtle text-mono-900 border border-mono-800',
  statusMedium: 'bg-status-medium-subtle text-mono-700 border border-mono-600',
  statusLow: 'bg-status-low-subtle text-mono-500 border border-mono-400',
} as const

// Utility functions
export const utils = {
  // Get appropriate text color for background
  getTextColor: (bgShade: keyof typeof colors.mono) => {
    const darkShades: (keyof typeof colors.mono)[] = [600, 700, 800, 900, 950]
    return darkShades.includes(bgShade) ? colors.white : colors.mono[900]
  },
  
  // Get hover state for a color
  getHoverColor: (baseShade: keyof typeof colors.mono) => {
    const shadeNumber = parseInt(baseShade.toString())
    if (shadeNumber <= 100) return colors.mono[200]
    if (shadeNumber <= 300) return colors.mono[400]
    if (shadeNumber <= 500) return colors.mono[600]
    if (shadeNumber <= 700) return colors.mono[800]
    return colors.mono[950]
  }
} as const

export default {
  spacing,
  typography,
  components,
  colors,
  animation,
  shadows,
  patterns,
  utils
}