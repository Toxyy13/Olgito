import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { watchAppointmentsForDate, cancelAppointment } from '../../src/api/appointments';
import { createRescheduleRequest } from '../../src/api/rescheduleRequests';
import { watchAllServices } from '../../src/api/services';
import { todayISO } from '../../src/utils/time';
import type { Appointment, ServiceType } from '../../src/types';

// LocaleConfig se već postavlja u klijentskom kalendaru; ovde je siguran no-op ako je već setovan.
if (!LocaleConfig.locales['sr']) {
  LocaleConfig.locales['sr'] = {
    monthNames: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
    dayNames: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'],
    dayNamesShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
    today: 'Danas',
  };
  LocaleConfig.defaultLocale = 'sr';
}

const TODAY = todayISO();

export default function AdminCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [rescheduleMsg, setRescheduleMsg] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => watchAppointmentsForDate(selectedDate, setAppointments), [selectedDate]);
  useEffect(() => watchAppointmentsForDate(TODAY, setTodayAppointments), []);
  useEffect(() => watchAllServices(setServices), []);

  // Cena za naplatu = zbir cena izabranih usluga × broj osoba (svi dobijaju istu kombinaciju).
  const priceFor = (item: Appointment) => {
    const perPerson = item.serviceIds.reduce((sum, id) => sum + (services.find((s) => s.id === id)?.price ?? 0), 0);
    return perPerson * item.peopleCount;
  };

  const activeAppointments = appointments.filter((a) => a.status !== 'otkazano');
  const activeToday = todayAppointments.filter((a) => a.status !== 'otkazano');

  const handleCancel = (item: Appointment) => {
    Alert.alert('Otkazivanje termina', `Otkazati termin za ${item.clientName}?`, [
      { text: 'Ne', style: 'cancel' },
      {
        text: 'Da, otkaži',
        style: 'destructive',
        onPress: async () => {
          await cancelAppointment(item, 'admin');
          setDetail(null);
        },
      },
    ]);
  };

  const handleSendReschedule = async () => {
    if (!detail || rescheduleMsg.trim().length < 3) return;
    await createRescheduleRequest({ appointmentId: detail.id, clientId: detail.clientId, message: rescheduleMsg.trim() });
    setShowReschedule(false);
    setRescheduleMsg('');
    setDetail(null);
    Alert.alert('Poslato', 'Klijent je obavešten da pomeri termin.');
  };

  // Sve iznad liste termina (header, "Danas" traka, kalendar, ukupan iznos)
  // ide u ListHeaderComponent tako da ceo ekran ima jednog vlasnika skrola —
  // bitno na malim telefonima da se sve može videti/skrolovati.
  return (
    <ScreenContainer>
      <FlatList
        style={{ flex: 1 }}
        data={activeAppointments}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Kalendar" />

            <Text style={styles.sectionTitle}>Danas ({TODAY})</Text>
            {activeToday.length === 0 ? (
              <Text style={styles.empty}>Nema termina za danas.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.todayRow}>
                {activeToday.map((item) => (
                  <Pressable key={item.id} style={[styles.todayCard, statusBorder(item.status)]} onPress={() => setDetail(item)}>
                    <Text style={styles.todayTime}>{item.startTime}</Text>
                    <Text style={styles.todayName} numberOfLines={1}>
                      {item.clientName}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Calendar
              current={selectedDate}
              onDayPress={(d) => setSelectedDate(d.dateString)}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: colors.secondary } }}
              theme={calendarTheme}
              style={styles.calendar}
            />

            <View style={styles.dayTotalRow}>
              <Text style={styles.sectionTitle}>Termini za {selectedDate}</Text>
              {activeAppointments.length > 0 && (
                <Text style={styles.dayTotal}>Ukupno: {activeAppointments.reduce((sum, a) => sum + priceFor(a), 0)} RSD</Text>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nema termina za ovaj dan.</Text>}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, statusBorder(item.status)]} onPress={() => setDetail(item)}>
            <View style={styles.cardRow}>
              <Text style={styles.time}>
                {item.startTime}–{item.endTime}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.services}>
                {item.serviceNames.join(', ')}
                {item.peopleCount > 1 ? ` • ${item.peopleCount} osobe` : ''}
              </Text>
              <Text style={styles.price}>{priceFor(item)} RSD</Text>
            </View>
          </Pressable>
        )}
      />

      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {detail && (
              <>
                <Text style={styles.modalTitle}>{detail.clientName}</Text>
                <Text style={styles.modalPhone}>{detail.clientPhone}</Text>
                <StatusBadge status={detail.status} />
                <Text style={styles.modalLine}>
                  {detail.date} • {detail.startTime}–{detail.endTime}
                </Text>
                <Text style={styles.modalLine}>{detail.serviceNames.join(', ')}</Text>
                <Text style={styles.modalLine}>{detail.peopleCount} osoba/e</Text>
                {!!detail.note && <Text style={styles.modalNote}>Napomena: {detail.note}</Text>}
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Za naplatu</Text>
                  <Text style={styles.priceBoxValue}>{priceFor(detail)} RSD</Text>
                </View>

                {showReschedule ? (
                  <View style={{ gap: spacing.sm }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Poruka klijentu (npr. možeš li u 14h umesto 15h?)"
                      placeholderTextColor={colors.textSecondary}
                      value={rescheduleMsg}
                      onChangeText={setRescheduleMsg}
                      multiline
                    />
                    <Button title="Pošalji zahtev za pomeranje" onPress={handleSendReschedule} />
                  </View>
                ) : (
                  detail.status !== 'otkazano' && (
                    <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                      <Button title="Zatraži pomeranje termina" variant="secondary" onPress={() => setShowReschedule(true)} />
                      <Button title="Otkaži termin" variant="danger" onPress={() => handleCancel(detail)} />
                    </View>
                  )
                )}

                <Button
                  title="Zatvori"
                  variant="outline"
                  onPress={() => {
                    setDetail(null);
                    setShowReschedule(false);
                    setRescheduleMsg('');
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function statusBorder(status: Appointment['status']) {
  const color =
    status === 'zakazano' ? colors.statusZakazano : status === 'potvrdjeno' ? colors.statusPotvrdjeno : colors.statusOtkazano;
  return { borderLeftWidth: 5, borderLeftColor: color };
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  dayTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayTotal: { ...typography.bodyBold, color: colors.sun },
  calendar: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.md },
  empty: { color: colors.textSecondary, ...typography.body, marginBottom: spacing.sm },
  todayRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 100,
  },
  todayTime: { ...typography.bodyBold, color: colors.textPrimary },
  todayName: { color: colors.textSecondary, ...typography.small },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { ...typography.bodyBold, color: colors.textPrimary },
  clientName: { ...typography.body, color: colors.textPrimary },
  services: { color: colors.textSecondary, ...typography.small, flex: 1 },
  price: { color: colors.textOnPrimary, ...typography.small, fontWeight: '800' },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  priceBoxLabel: { color: colors.textPrimary, ...typography.bodyBold },
  priceBoxValue: { color: colors.textOnPrimary, ...typography.h3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalPhone: { color: colors.textSecondary, ...typography.small, marginBottom: spacing.xs },
  modalLine: { color: colors.textPrimary, ...typography.body },
  modalNote: { color: colors.textSecondary, ...typography.small, fontStyle: 'italic' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 70,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
});
