import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Badge from '../components/Badge';
import backendClient from '../api/backendClient';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY, COOP_MONTHLY_TARGET } from '../config/appConfig';

const medalColors = ['#F59E0B', '#9CA3AF', '#B45309'];

function AvatarCircle({ initials, rank, size = 36 }) {
  const bg = rank <= 3 ? [colors.primaryMuted, '#EEF2FF', '#FEF3C7'][rank - 1] : colors.borderLight;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

export default function CooperativeScreen() {
  const { farmer, refreshFarmer } = useFarmer();
  const [coopData, setCoopData] = useState(null);
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [contributing, setContributing] = useState(false);

  const fetchCoop = useCallback(async () => {
    try {
      const client = await backendClient();
      const { data } = await client.get('/coop');
      setCoopData(data);
    } catch (e) {
      // silently handle — user may not be logged in yet
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCoop(); }, [fetchCoop]);

  const handleContribute = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (!farmer?.phone) return Alert.alert('Error', 'Phone number not found. Please update your profile.');
    setContributing(true);

    try {
      const client = await backendClient();
      await client.post('/coop/contribute', {
        amount: val,
        phone: farmer.phone,
        method: 'MTN MoMo',
      });
      Alert.alert('✅ Contribution submitted', `${CURRENCY} ${val.toFixed(2)} — mobile money prompt sent.`);
      setAmount('');
      await Promise.all([fetchCoop(), refreshFarmer()]);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Contribution failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setContributing(false);
    }
  };

  const leaderboard   = coopData?.leaderboard     || [];
  const myContribs    = coopData?.my_contributions || [];
  const pool          = coopData?.pool             || 0;
  const savings       = farmer?.coop_savings       || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Cooperative" subtitle={coopData?.group || farmer?.coop_group || 'Farmers Cooperative'} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCoop(); }} colors={[colors.primary]} />}
      >
        <View style={[styles.heroCard, shadow.md]}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}><Ionicons name="people-outline" size={24} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Group Pool</Text>
              <Text style={styles.heroAmount}>{CURRENCY} {parseFloat(pool).toLocaleString()}</Text>
            </View>
            <Badge label={`${leaderboard.length} members`} variant="muted" />
          </View>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{CURRENCY} {parseFloat(savings).toFixed(2)}</Text>
              <Text style={styles.statLabel}>Your savings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myContribs.length}</Text>
              <Text style={styles.statLabel}>Contributions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{CURRENCY} {COOP_MONTHLY_TARGET}</Text>
              <Text style={styles.statLabel}>Monthly target</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
          <Text style={typography.h4}>Add contribution</Text>
          <View style={styles.contributeRow}>
            <View style={styles.amountInputWrap}>
              <Text style={styles.ghsPrefix}>{CURRENCY}</Text>
              <TextInput
                style={styles.amountInput} placeholder="0.00"
                placeholderTextColor={colors.textLight} keyboardType="numeric"
                value={amount} onChangeText={setAmount}
              />
            </View>
            <TouchableOpacity
              style={[styles.contributeBtn, (!amount || contributing) && { opacity: 0.4 }]}
              disabled={!amount || contributing} onPress={handleContribute}
            >
              {contributing
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.contributeBtnText}>Pay</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
          <Text style={styles.note}>Processed via Moolre Payments · saved to your cooperative record</Text>
        </View>

        {leaderboard.length > 0 && (
          <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
            <Text style={[typography.h4, { marginBottom: spacing.md }]}>Leaderboard</Text>
            {leaderboard.map((m) => (
              <View key={m.farmer_id} style={styles.leaderRow}>
                <Text style={[styles.rank, m.rank <= 3 && { color: medalColors[m.rank - 1] }]}>
                  {m.rank <= 3 ? ['🥇', '🥈', '🥉'][m.rank - 1] : `#${m.rank}`}
                </Text>
                <AvatarCircle initials={m.avatar || '?'} rank={m.rank} />
                <Text style={styles.memberName}>{m.name}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: pool > 0 ? `${Math.round(m.contributions / pool * 100)}%` : '0%' }]} />
                  </View>
                </View>
                <Text style={styles.memberAmt}>{CURRENCY} {parseFloat(m.contributions).toFixed(0)}</Text>
              </View>
            ))}
          </View>
        )}

        {myContribs.length > 0 && (
          <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
            <Text style={[typography.h4, { marginBottom: spacing.md }]}>Your history</Text>
            {myContribs.map((c, i) => (
              <View key={c.id} style={[styles.histRow, i < myContribs.length - 1 && styles.histBorder]}>
                <View style={styles.histIcon}>
                  <Ionicons name="arrow-up-outline" size={16} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histText}>Contribution · {c.method || 'MTN MoMo'}</Text>
                  <Text style={styles.histDate}>{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Text style={styles.histAmt}>+{CURRENCY} {c.amount}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  heroIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 2 },
  statRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.sm, padding: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg },
  contributeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  amountInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, backgroundColor: colors.background },
  ghsPrefix: { fontSize: 15, fontWeight: '700', color: colors.textMuted, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, paddingVertical: 13 },
  contributeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, borderRadius: radius.sm, paddingVertical: 13 },
  contributeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { ...typography.caption, lineHeight: 17 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rank: { width: 28, fontSize: 16, textAlign: 'center', fontWeight: '700', color: colors.textMuted },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: colors.text },
  memberName: { fontSize: 13, fontWeight: '600', color: colors.text, width: 80 },
  barBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  memberAmt: { fontSize: 12, fontWeight: '700', color: colors.primary, width: 60, textAlign: 'right' },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: spacing.sm },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  histIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.successMuted, alignItems: 'center', justifyContent: 'center' },
  histText: { fontSize: 13.5, color: colors.text },
  histDate: { ...typography.caption, marginTop: 2 },
  histAmt: { fontSize: 14, fontWeight: '800', color: colors.success },
});
