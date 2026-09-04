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
  xl: 24,
  pill: 999,
} as const;

// Space Grotesk za naslove/telo teksta, JetBrains Mono za "eyebrow" oznake,
// bedževe i brojeve — učitano u app/_layout.tsx preko @expo-google-fonts.
export const fonts = {
  heading: 'SpaceGrotesk_700Bold',
  headingSemibold: 'SpaceGrotesk_600SemiBold',
  bodyMedium: 'SpaceGrotesk_500Medium',
  body: 'SpaceGrotesk_400Regular',
  mono: 'JetBrainsMono_500Medium',
  monoSemibold: 'JetBrainsMono_600SemiBold',
  monoRegular: 'JetBrainsMono_400Regular',
} as const;

export const typography = {
  h1: { fontFamily: fonts.heading, fontSize: 30 },
  h2: { fontFamily: fonts.headingSemibold, fontSize: 22 },
  h3: { fontFamily: fonts.headingSemibold, fontSize: 18 },
  body: { fontFamily: fonts.body, fontSize: 16 },
  bodyBold: { fontFamily: fonts.headingSemibold, fontSize: 16 },
  small: { fontFamily: fonts.body, fontSize: 13 },
  smallMedium: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  label: { fontFamily: fonts.monoSemibold, fontSize: 13 },
  // Mala, razmaknuta, VELIKIM SLOVIMA "kicker" oznaka iznad naslova (npr. "PREGLED").
  eyebrow: { fontFamily: fonts.monoSemibold, fontSize: 11, letterSpacing: 1.5 },
  // Za brojeve u statistikama i cene.
  statNumber: { fontFamily: fonts.monoSemibold, fontSize: 22 },
  mono: { fontFamily: fonts.monoRegular, fontSize: 12 },
  monoBold: { fontFamily: fonts.monoSemibold, fontSize: 12 },
};

// Deljena tema za react-native-calendars — kartica ostaje jarka (korala) sa belim tekstom,
// u skladu sa ostatkom aplikacije.
export const calendarTheme = {
  calendarBackground: 'transparent',
  dayTextColor: colors.textPrimary,
  monthTextColor: colors.textPrimary,
  textSectionTitleColor: colors.textSecondary,
  textDisabledColor: 'rgba(255,255,255,0.35)',
  todayTextColor: colors.sun,
  arrowColor: colors.textOnPrimary,
  selectedDayBackgroundColor: colors.secondary,
  selectedDayTextColor: colors.textOnPrimary,
  textDayFontFamily: fonts.body,
  textMonthFontFamily: fonts.headingSemibold,
  textDayHeaderFontFamily: fonts.monoSemibold,
};

export const theme = { colors, spacing, radius, typography, fonts, calendarTheme };
export { colors };
export type Theme = typeof theme;
