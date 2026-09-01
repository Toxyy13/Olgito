import { colors } from '../theme';

// Zajedničko bojenje kalendara: dani kad Olgica ne radi (ceo dan) dobijaju
// prigušenu boju (ista kao "zauzet" slot — signalizira "nije dostupno"),
// izabrani dan uvek ima prioritet ako se poklope.
export function buildClosedDayMarks(closedDates: string[], selectedDate: string): Record<string, any> {
  const marks: Record<string, any> = {};
  for (const d of closedDates) {
    marks[d] = {
      customStyles: {
        container: { backgroundColor: colors.slotZauzet, borderRadius: 8 },
        text: { color: colors.textPrimary },
      },
    };
  }
  marks[selectedDate] = {
    customStyles: {
      container: { backgroundColor: colors.secondary, borderRadius: 8 },
      text: { color: colors.textOnPrimary, fontWeight: '700' },
    },
  };
  return marks;
}
