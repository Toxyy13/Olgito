// Tropska paleta — vesela i šarena, u duhu Olgičinog stila.
export const colors = {
  // Brend boje
  primary: '#FF6F59', // korala
  primaryDark: '#E5503B',
  secondary: '#00BFB3', // tirkizna
  secondaryDark: '#009C92',
  accent: '#FF3E80', // pink
  sun: '#FFC93C', // sunčano žuta (koristi se za akcente, ne za status)

  // Pozadine i površine
  background: '#FFF8F0', // topla krem
  surface: '#FFFFFF',
  surfaceAlt: '#FFF1E6',

  // Tekst
  textPrimary: '#2D2A26',
  textSecondary: '#8A8078',
  textOnPrimary: '#FFFFFF',

  // Linije/okviri
  border: '#F0E4D8',

  // Statusi termina — nezavisno od brend palete, radi jasnoće
  statusZakazano: '#F5B301', // žuto
  statusZakazanoBg: '#FFF3D6',
  statusPotvrdjeno: '#22B573', // zeleno
  statusPotvrdjenoBg: '#DEF7EC',
  statusOtkazano: '#E74C3C', // crveno
  statusOtkazanoBg: '#FDE8E6',

  // Slotovi u klijentskom kalendaru (bez imena)
  slotSlobodan: '#DFF6EF',
  slotSlobodanBorder: '#00BFB3',
  slotZauzet: '#EDE7E2',
  slotZauzetText: '#B3A99D',

  danger: '#E74C3C',
  success: '#22B573',
  warning: '#F5B301',
} as const;

export type AppColors = typeof colors;
