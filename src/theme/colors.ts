// Tropska paleta — vesela i šarena. Pravilo: tekst je uvek beo, pozadina iza
// teksta je uvek neka jarka boja (nikad bela/svetla pozadina sa tamnim tekstom).
export const colors = {
  // Brend boje
  primary: '#FF6F59', // korala
  primaryDark: '#E5503B',
  secondary: '#00BFB3', // tirkizna
  secondaryDark: '#009C92',
  accent: '#FF3E80', // pink
  sun: '#FFC93C', // sunčano žuta (koristi se za akcente, ne za status)

  // Pozadine i površine — sve jarke, nikad bele/kremaste
  background: '#0F8B8D', // duboka tirkizna, platno ekrana
  surface: '#FF6F59', // korala, pozadina kartica/sadržaja
  surfaceAlt: '#E5503B', // tamnija korala, polja za unos i ugnježdeni elementi

  // Tekst — uvek bele nijanse (jer sedi na jarkoj pozadini)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.75)',
  textOnPrimary: '#FFFFFF',

  // Linije/okviri — suptilno beli, rade na bilo kojoj jarkoj pozadini
  border: 'rgba(255,255,255,0.28)',

  // Statusi termina — pune, jarke boje sa belim tekstom
  statusZakazano: '#F5A623', // žuto/ćilibar
  statusPotvrdjeno: '#1FAE6B', // zeleno
  statusOtkazano: '#E5484D', // crveno

  // Slotovi u klijentskom kalendaru (bez imena) — i slobodno i zauzeto ostaju jarki
  slotSlobodan: '#12B886', // živa zelena/tirkizna
  slotSlobodanBorder: '#0CA678',
  slotZauzet: '#5C5470', // prigušena ljubičasta — jarka, ali vizuelno "van upotrebe"

  danger: '#E5484D',
  success: '#1FAE6B',
  warning: '#F5A623',
} as const;

export type AppColors = typeof colors;
