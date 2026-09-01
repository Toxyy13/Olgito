// Papagaj/džungla paleta — vesela i šarena kao papagajsko perje. Pravilo:
// tekst je uvek beo, pozadina iza teksta je uvek neka jarka boja (nikad
// bela/svetla pozadina sa tamnim tekstom).
export const colors = {
  // Brend boje — primary (dugmad/akcije) namerno druga nijansa od surface
  // (kartice), inače se dugme "utopi" u karticu iza sebe.
  primary: '#E91E63', // magenta perje — glavne akcije (dugmad)
  primaryDark: '#B0134B',
  secondary: '#00B4D8', // papagajsko plavo (ara)
  secondaryDark: '#0086A8',
  accent: '#FFD23F', // papagajsko žuto perje, za posebne isticanja (hitno i sl.)
  sun: '#FFD23F',

  // Pozadine i površine — sve jarke, nikad bele/kremaste
  background: '#0B6E4F', // duboko džunglasto zeleno, platno ekrana
  surface: '#FF5E3A', // papagajsko narandžasto-crveno, pozadina kartica/sadržaja
  surfaceAlt: '#D6431C', // tamnija narandžasta, polja za unos i ugnježdeni elementi

  // Tekst — uvek bele nijanse (jer sedi na jarkoj pozadini)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.75)',
  textOnPrimary: '#FFFFFF',

  // Linije/okviri — suptilno beli, rade na bilo kojoj jarkoj pozadini
  border: 'rgba(255,255,255,0.28)',

  // Statusi termina — pune, jarke boje sa belim tekstom
  statusZakazano: '#FFB703', // žuto/ćilibar
  statusPotvrdjeno: '#2DC653', // zeleno
  statusOtkazano: '#E63946', // crveno

  // Slotovi u klijentskom kalendaru (bez imena) — i slobodno i zauzeto ostaju jarki
  slotSlobodan: '#2DC653', // živa lisnata zelena
  slotSlobodanBorder: '#1B9E44',
  slotZauzet: '#5C5470', // prigušena ljubičasta — jarka, ali vizuelno "van upotrebe"

  danger: '#E63946',
  success: '#2DC653',
  warning: '#FFB703',
} as const;

export type AppColors = typeof colors;
