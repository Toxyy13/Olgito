import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
};

export const theme = { colors, spacing, radius, typography };
export { colors };
export type Theme = typeof theme;
