import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { mockSubsidyStatus } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';

export default function SubsidyScreen() {
  const s = mockSubsidyStatus;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Subsidy Tracker" subtitle="Direct government disbursement status" />
      <View style={styles.card}>
        <Ionicons name="leaf-outline" size={28} color={colors.primary} />
        <Text style={styles.programme}>{s.programme}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{s.status}</Text>
        </View>
        <Text style={styles.amount}>GHS {s.amount}</Text>
        <Text style={styles.eta}>Expected: {s.expectedDate}</Text>
      </View>
      <Text style={styles.note}>
        Once approved, funds are sent straight to your verified Agripay profile via Moolre's
        Transfers API — no waiting at a district office.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  programme: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
  statusPill: {
    backgroundColor: '#FCEFD9',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  statusText: { color: colors.accent, fontWeight: '700', fontSize: 12.5 },
  amount: { fontSize: 26, fontWeight: '800', color: colors.primary, marginTop: spacing.md },
  eta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  note: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg, lineHeight: 18 },
});
