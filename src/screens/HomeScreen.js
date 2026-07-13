import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../context/FarmerContext';
import backendClient from '../api/backendClient';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY, USSD_SHORT_CODE, HOME_FEED_LIMIT } from '../config/appConfig';

const QUICK_ACTIONS = [
  { icon: 'cart-outline',        label: 'Market',    screen: 'Marketplace',  color: colors.blue },
  { icon: 'cash-outline',        label: 'Subsidy',   screen: 'Subsidy',      color: colors.accent },
  { icon: 'people-outline',      label: 'Coop',      screen: 'Cooperative',  color: '#16A34A' },
  { icon: 'card-outline',        label: 'Credit',    screen: 'Credit',       color: colors.purple },
  { icon: 'wallet-outline',      label: 'Wallet',    screen: 'Wallet',       color: colors.blue },
  { icon: 'person-outline',      label: 'Profile',   screen: 'Profile',      color: colors.coral },
];

function ScoreRing({ score }) {
  const label = score >= 700 ? 'Excellent' : score >= 550 ? 'Good' : score >= 400 ? 'Fair' : 'Building';
  const col = score >= 700 ? colors.success : score >= 550 ? colors.primary : colors.accent;
  return (
    <View style={styles.scoreWrap}>
      <View style={[styles.scoreRing, { borderColor: col }]}>
        <Text style={[styles.scoreNum, { color: col }]}>{score || '—'}</Text>
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
      <Text style={styles.scoreSub}>Credit score</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { farmer, refreshFarmer } = useFarmer();
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      const client = await backendClient();
      const { data } = await client.get('/activity');
      setActivity(Array.isArray(data) ? data : []);
    } catch (e) {
      // silently fall back to empty — user isn't logged in yet or offline
      setActivity([]);
    }
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchActivity(), refreshFarmer()]);
    setRefreshing(false);
  };

  const firstName = farmer?.name?.split(' ')[0] || 'Farmer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning 👋' : hour < 18 ? 'Good afternoon 👋' : 'Good evening 👋';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor="#fff" />}
    >
      {/* Hero header */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.heroName}>{firstName}</Text>
            {farmer?.region ? <Text style={styles.heroRegion}>{farmer.region} Region</Text> : null}
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={36} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.balanceCard} onPress={() => navigation.navigate('Wallet')} activeOpacity={0.8}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceAmount}>{CURRENCY} {parseFloat(farmer?.wallet_balance || 0).toFixed(2)}</Text>
            <View style={styles.coopRow}>
              <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.coopText}>{farmer?.coop_group}</Text>
            </View>
          </TouchableOpacity>
          <ScoreRing score={farmer?.credit_score || 0} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity key={a.screen} style={styles.actionItem} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '1A' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Feed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {activity.length > 0 ? (
          <View style={[styles.feedCard, shadow.sm]}>
            {activity.slice(0, HOME_FEED_LIMIT).map((item, i) => {
              const timeAgo = getTimeAgo(item.created_at);
              return (
                <View key={item.id} style={[styles.feedRow, i < Math.min(activity.length, HOME_FEED_LIMIT) - 1 && styles.feedRowBorder]}>
                  <View style={styles.feedIconWrap}>
                    <Ionicons name={item.icon || 'information-circle-outline'} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feedText}>{item.text}</Text>
                    <Text style={styles.feedTime}>{timeAgo}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.feedCard, shadow.sm, { padding: spacing.lg, alignItems: 'center' }]}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>No activity yet. Start using the app!</Text>
          </View>
        )}
      </View>

      <View style={[styles.ussdBanner, shadow.sm]}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
        <Text style={styles.ussdText}>
          Fellow farmers without smartphones can dial{' '}
          <Text style={{ fontWeight: '700', color: colors.primary }}>{USSD_SHORT_CODE}</Text>
          {' '}for prices & USSD banking.
        </Text>
      </View>
    </ScrollView>
  );
}

function getTimeAgo(isoDate) {
  const secs = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 172800) return 'Yesterday';
  return `${Math.floor(secs / 86400)} days ago`;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  heroName: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 2 },
  heroRegion: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  notifBtn: { padding: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  balanceCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.md, padding: spacing.md },
  balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 4 },
  coopRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  coopText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  scoreWrap: { alignItems: 'center', gap: 6 },
  scoreRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  scoreNum: { fontSize: 18, fontWeight: '800' },
  scoreLabel: { fontSize: 9, color: '#fff', fontWeight: '600' },
  scoreSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)' },
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  sectionTitle: { ...typography.h4, marginBottom: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionItem: { alignItems: 'center', width: '14%', flex: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' },
  feedCard: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' },
  feedRow: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, gap: spacing.sm },
  feedRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  feedIconWrap: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  feedText: { fontSize: 13.5, color: colors.text, flex: 1, lineHeight: 19 },
  feedTime: { fontSize: 11.5, color: colors.textMuted, marginTop: 3 },
  ussdBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.primaryMuted, borderRadius: radius.md, marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md },
  ussdText: { fontSize: 13, color: colors.text, flex: 1, lineHeight: 19 },
});
