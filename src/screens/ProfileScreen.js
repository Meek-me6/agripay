import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { USSD_SHORT_CODE, CURRENCY } from '../config/appConfig';

function SettingRow({ icon, label, value, onPress, danger, rightEl }) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, danger && { backgroundColor: colors.dangerMuted }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: colors.danger }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {rightEl ?? null}
        {onPress && !danger ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { farmer, logout } = useFarmer();
  const insets = useSafeAreaInsets();
  const initial = farmer?.name ? farmer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You will need your phone number and PIN to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const stats = [
    { label: 'Credit Score', value: farmer?.credit_score || '—', icon: 'card-outline', color: colors.purple },
    { label: 'Coop Savings', value: `${CURRENCY} ${parseFloat(farmer?.coop_savings || 0).toFixed(0)}`, icon: 'people-outline', color: colors.primary },
    { label: 'Wallet', value: `${CURRENCY} ${parseFloat(farmer?.wallet_balance || 0).toFixed(0)}`, icon: 'wallet-outline', color: colors.blue },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>

        <View style={[styles.heroCard, shadow.md]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{farmer?.name}</Text>
          <Text style={styles.phone}>{farmer?.phone}</Text>
          {farmer?.region ? (
            <View style={styles.regionRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.region}>{farmer.region} Region</Text>
            </View>
          ) : null}
          <Text style={styles.coopGroup}>{farmer?.coop_group}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, shadow.sm]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '1A' }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, shadow.sm]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="person-outline" label="Full name" value={farmer?.name} />
          <SettingRow icon="call-outline" label="Phone" value={farmer?.phone} />
          <SettingRow icon="location-outline" label="Region" value={farmer?.region || '—'} />
          <SettingRow icon="people-outline" label="Cooperative" value={farmer?.coop_group} />
        </View>

        <View style={[styles.section, shadow.sm, { marginTop: spacing.sm }]}>
          <Text style={styles.sectionTitle}>App</Text>
          <SettingRow icon="phone-portrait-outline" label="USSD code" value={USSD_SHORT_CODE} />
          <SettingRow
            icon="shield-checkmark-outline" label="API mode"
            rightEl={<Badge label="Live" variant="success" />}
          />
        </View>

        <View style={[styles.section, shadow.sm, { marginTop: spacing.sm }]}>
          <SettingRow icon="log-out-outline" label="Sign out" onPress={handleLogout} danger />
        </View>

        <Text style={styles.footer}>AgriPay · Powered by Moolre APIs · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: colors.primary, alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: spacing.xs },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  region: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  coopGroup: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  section: { backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: radius.md, overflow: 'hidden', paddingHorizontal: spacing.md },
  sectionTitle: { ...typography.label, paddingTop: spacing.md, paddingBottom: spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  settingIcon: { width: 32, height: 32, borderRadius: radius.xs, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 13, color: colors.textMuted },
  footer: { ...typography.caption, textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
});
