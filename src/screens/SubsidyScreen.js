import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Badge from '../components/Badge';
import backendClient from '../api/backendClient';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY } from '../config/appConfig';

const STEPS = [
  { key: 'allocated',  label: 'Allocated',  icon: 'document-text-outline' },
  { key: 'verified',   label: 'Verified',   icon: 'checkmark-circle-outline' },
  { key: 'pending',    label: 'Processing', icon: 'hourglass-outline' },
  { key: 'disbursed',  label: 'Disbursed',  icon: 'cash-outline' },
];
const stepIndex = { allocated: 0, verified: 1, pending: 2, disbursed: 3 };

function Timeline({ subsidy }) {
  const currentIdx = stepIndex[subsidy.status] ?? 2;
  const dates = [subsidy.allocated_at, subsidy.verified_at, null, subsidy.disbursed_at];
  return (
    <View>
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const color = done ? colors.success : active ? colors.primary : colors.border;
        const dateStr = dates[i] ? new Date(dates[i]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepCircle, { backgroundColor: done || active ? color : colors.borderLight, borderColor: color }]}>
                <Ionicons name={done ? 'checkmark' : step.icon} size={16} color={done || active ? '#fff' : colors.textMuted} />
              </View>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, { backgroundColor: done ? colors.success : colors.border }]} />}
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepLabel, i > currentIdx && { color: colors.textMuted }]}>{step.label}</Text>
              {dateStr && <Text style={styles.stepDate}>{dateStr}</Text>}
              {i === 2 && active && <Text style={styles.stepDate}>Expected within 5 business days</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const PROGRAMMES = [
  { label: 'Planting for Food and Jobs', amount: 350, items: [{ label: 'Fertiliser (2 bags)', value: `${CURRENCY} 180` }, { label: 'Improved seeds (3 packs)', value: `${CURRENCY} 120` }, { label: 'Advisory services', value: `${CURRENCY} 50` }] },
  { label: 'NABCO Agriculture', amount: 200, items: [{ label: 'Seeds & inputs', value: `${CURRENCY} 200` }] },
];

function ApplyModal({ visible, onClose, onApplied, insets }) {
  const [selected, setSelected] = useState(PROGRAMMES[0]);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      const client = await backendClient();
      await client.post('/subsidy/apply', {
        programme: selected.label,
        amount: selected.amount,
        items: selected.items,
      });
      Alert.alert('✅ Application submitted', `Your application for "${selected.label}" has been submitted. Disbursement will be processed via Moolre Transfers.`);
      onApplied();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to submit application. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={typography.h3}>Apply for Subsidy</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
          </View>
          {PROGRAMMES.map(p => (
            <TouchableOpacity
              key={p.label}
              style={[styles.programmeOption, selected.label === p.label && styles.programmeOptionSelected]}
              onPress={() => setSelected(p)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.programmeName, selected.label === p.label && { color: colors.primary }]}>{p.label}</Text>
                <Text style={typography.caption}>{CURRENCY} {p.amount}</Text>
              </View>
              {selected.label === p.label && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.applyBtn, applying && { opacity: 0.4 }]} disabled={applying} onPress={handleApply}>
            {applying
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.applyBtnText}>Submit Application</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SubsidyScreen() {
  const insets = useSafeAreaInsets();
  const { farmer } = useFarmer();
  const [subsidy, setSubsidy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyModal, setApplyModal] = useState(false);

  const fetchSubsidy = useCallback(async () => {
    try {
      const client = await backendClient();
      const { data } = await client.get('/subsidy');
      // Backend returns null if no subsidy found
      if (data) {
        setSubsidy({
          ...data,
          items: Array.isArray(data.items) ? data.items : (typeof data.items === 'string' ? JSON.parse(data.items || '[]') : []),
        });
      } else {
        setSubsidy(null);
      }
    } catch (e) {
      setSubsidy(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSubsidy(); }, [fetchSubsidy]);

  const statusVariant = { allocated: 'primary', verified: 'blue', pending: 'warning', disbursed: 'success' };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Subsidy Tracker" subtitle="Government disbursement status" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubsidy(); }} colors={[colors.primary]} />}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : subsidy ? (
          <>
            <View style={[styles.card, shadow.md]}>
              <View style={styles.programmeRow}>
                <View style={styles.leafIcon}><Ionicons name="leaf-outline" size={22} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.programmeLabel}>Programme</Text>
                  <Text style={styles.programmeName}>{subsidy.programme}</Text>
                </View>
                <Badge label={subsidy.status} variant={statusVariant[subsidy.status] || 'muted'} />
              </View>
              <View style={styles.divider} />
              <Text style={styles.amountLabel}>Total allocation</Text>
              <Text style={styles.amount}>{CURRENCY} {subsidy.amount}</Text>
            </View>

            <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
              <Text style={[typography.h4, { marginBottom: spacing.md }]}>Disbursement progress</Text>
              <Timeline subsidy={subsidy} />
            </View>

            {subsidy.items?.length > 0 && (
              <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
                <Text style={[typography.h4, { marginBottom: spacing.md }]}>Allocation breakdown</Text>
                {subsidy.items.map((item, i) => (
                  <View key={i} style={[styles.breakdownRow, i < subsidy.items.length - 1 && styles.breakdownBorder]}>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={[styles.applyBtn, { marginTop: spacing.md }]} onPress={() => setApplyModal(true)}>
              <Text style={styles.applyBtnText}>Apply for Another Programme</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.card, shadow.md, { alignItems: 'center', paddingVertical: spacing.xxl }]}>
            <Ionicons name="leaf-outline" size={48} color={colors.border} />
            <Text style={[typography.h4, { marginTop: spacing.md, textAlign: 'center' }]}>No subsidy application yet</Text>
            <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs }]}>Apply for a government subsidy programme below.</Text>
            <TouchableOpacity style={[styles.applyBtn, { marginTop: spacing.lg }]} onPress={() => setApplyModal(true)}>
              <Text style={styles.applyBtnText}>Apply for Subsidy</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.infoBanner, shadow.sm]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
          <Text style={styles.infoText}>Subsidy data is stored securely on the AgriPay server and synced via Moolre Transfers.</Text>
        </View>
      </ScrollView>

      <ApplyModal visible={applyModal} onClose={() => setApplyModal(false)} onApplied={fetchSubsidy} insets={insets} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg },
  programmeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  leafIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  programmeLabel: { ...typography.label },
  programmeName: { ...typography.h4, marginTop: 2, flex: 1 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  amountLabel: { ...typography.caption },
  amount: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepLeft: { alignItems: 'center', width: 36 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  stepLine: { width: 2, flex: 1, minHeight: 28 },
  stepContent: { flex: 1, paddingLeft: spacing.sm, paddingBottom: spacing.md, paddingTop: 4 },
  stepLabel: { ...typography.h4 },
  stepDate: { ...typography.caption, marginTop: 2 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  breakdownBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  breakdownLabel: { ...typography.body, color: colors.text },
  breakdownValue: { ...typography.body, fontWeight: '700', color: colors.primary },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.blueMuted, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md },
  infoText: { flex: 1, fontSize: 13, color: colors.blue, lineHeight: 19 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  programmeOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  programmeOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  applyBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
