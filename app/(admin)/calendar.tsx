import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { watchAppointmentsForDate, cancelAppointment } from '../../src/api/appointments';
import { createRescheduleRequest } from '../../src/api/rescheduleRequests';
import { todayISO } from '../../src/utils/time';
import type { Appointment } from '../../src/types';

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

export default function AdminCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [rescheduleMsg, setRescheduleMsg] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);

  useEffect(() => watchAppointmentsForDate(selectedDate, setAppointments), [selectedDate]);

  const activeAppointments = appointments.filter((a) => a.status !== 'otkazano');

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

  return (
    <ScreenContainer>
      <Text style={styles.title}>Kalendar</Text>
      <Calendar
        current={selectedDate}
        onDayPress={(d) => setSelectedDate(d.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: colors.secondary } }}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <FlatList
        data={activeAppointments}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xl }}
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
            <Text style={styles.services}>{item.serviceNames.join(', ')}</Text>
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
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  calendar: { borderRadius: radius.md, overflow: 'hidden' },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { ...typography.bodyBold, color: colors.textPrimary },
  clientName: { ...typography.body, color: colors.textPrimary },
  services: { color: colors.textSecondary, ...typography.small },
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
