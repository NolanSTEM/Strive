/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/* Centralized theme for the UI system.
   Follow the project's design rules: use these values throughout the app.
*/

export const theme = {
  colors: {
    primary: '#3B82F6',
    // Background gradient stops (use these when rendering gradients)
    background: '#0a1628',
    backgroundGradientStart: '#0a1628',
    backgroundGradientMid: '#0d2847',
    backgroundGradientEnd: '#051427',
    card: '#111827',
    cardGlass: 'rgba(255,255,255,0.05)',

    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',

    border: 'rgba(255,255,255,0.08)',
    accent: '#60A5FA',

    // Primary button gradients + hover + glows
    primaryButtonGradientStart: '#0ea5e9',
    primaryButtonGradientEnd: '#06b6d4',
    primaryButtonHoverStart: '#0284c7',
    primaryButtonHoverEnd: '#0891b2',
    primaryButtonGlow1: 'rgba(6,182,212,0.3)', // cyan-500 @ 30%
    primaryButtonGlow2: 'rgba(34,211,238,0.5)', // cyan-400 @ 50%

    // Workout stats icon colors
    statsExercises: '#38bdf8',
    statsDuration: '#7dd3fc',
    statsCalories: '#22d3ee',

    // Card hover border
    cardHoverBorder: 'rgba(34,211,238,0.3)',
  },

  typography: {
    title: { fontSize: 28, fontWeight: '700' },
    section: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radii: {
    r12: 12,
    r16: 16,
    r20: 20,
  },
} as const;

export type Theme = typeof theme;

export default theme;
