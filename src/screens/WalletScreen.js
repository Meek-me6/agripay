import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFarmer } from '../context/FarmerContext';
import { depositToWallet, withdrawFromWallet, checkPaymentStatus, checkTransferStatus } from '../api/walletApi';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY } from '../config/appConfig';

const NETWORKS = ['MTN MoMo', 'Telecel Cash', 'AirtelTigo Money', 'Bank Transfer'];

export default function WalletScreen() {
  const { farmer, refreshFarmer } = useFarmer();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState('deposit'); // 'deposit' | 'withdraw'
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(farmer?.phone || '');
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [loading, setLoading] = useState(false);

  const balance = parseFloat(farmer?.wallet_balance || 0).toFixed(2);

  const handleSubmit = useCallback(async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return Alert.alert('Invalid amount', 'Enter a valid amount.');
    if (!phone.trim()) return Alert.alert('Phone required', 'Enter your MoMo phone number.');

    if (tab === 'withdraw' && val > parseFloat(farmer?.wallet_balance || 0)) {
      return Alert.alert('Insufficient balance', `Your wallet balance is ${CURRENCY} ${balance}.`);
    }

    setLoading(true);
    try {
      const currentBalance = parseFloat(farmer?.wallet_balance || 0);
      const fn = tab === 'deposit' ? depositToWallet : withdrawFromWallet;
      const result = await fn(val, phone.trim(), network, currentBalance);

      // Refresh farmer profile from the server to get the updated balance
      refreshFarmer();

      // Poll Moolre for confirmation (up to 3 attempts, 4s apart)
      const ref = result.payment_ref || result.transfer_ref;
      let confirmed = false;
      if (ref) {
        const statusFn = tab === 'deposit' ? checkPaymentStatus : checkTransferStatus;
        for (let i = 0; i < 3; i++) {
          await new Promise(r => setTimeout(r, 4000));
          try {
            const status = await statusFn(ref);
            // txstatus=1 means success per Moolre webhook spec
            if (status?.data?.txstatus === 1 || status?.code === 'P01') {
              confirmed = true;
              break;
            }
          } catch (_) { /* keep polling */ }
        }
      }

      Alert.alert(
        tab === 'deposit' ? '✅ Deposit initiated' : '✅ Withdrawal initiated',
        tab === 'deposit'
          ? `${CURRENCY} ${val} request sent. ${confirmed ? 'Payment confirmed ✓' : 'You will receive a MoMo prompt shortly.'}\nNew balance: ${CURRENCY} ${parseFloat(result.wallet_balance).toFixed(2)}`
          : `${CURRENCY} ${val} sent to ${phone}. ${confirmed ? 'Transfer confirmed ✓' : 'Processing — funds will arrive shortly.'}\nNew balance: ${CURRENCY} ${parseFloat(result.wallet_balance).toFixed(2)}`
      );
      setAmount('');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Something went wrong.';
      Alert.alert('Transaction failed', msg);
    } finally {
      setLoading(false);
    }
  }, [tab, amount, phone, farmer, balance, refreshFarmer]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.heroLabel}>Wallet Balance</Text>
          <Text style={styles.heroBalance}>{CURRENCY} {balance}</Text>
          <Text style={styles.heroSub}>AgriPay Wallet</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {['deposit', 'withdraw'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Ionicons
                name={t === 'deposit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                size={18}
                color={tab === t ? '#fff' : colors.textMuted}
              />
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === 'deposit' ? 'Deposit' : 'Withdraw'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={[styles.card, shadow.sm]}>
          <Text style={styles.formTitle}>
            {tab === 'deposit' ? 'Top up wallet from MoMo' : 'Send wallet funds to MoMo'}
          </Text>

          <Text style={styles.inputLabel}>Amount ({CURRENCY})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>MoMo Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0241234567"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={12}
          />

          <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>Network</Text>
          <View style={styles.networkRow}>
            {NETWORKS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.networkBtn, network === n && styles.networkBtnActive]}
                onPress={() => setNetwork(n)}
              >
                <Text style={[styles.networkBtnText, network === n && styles.networkBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'withdraw' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                Available: <Text style={{ fontWeight: '700', color: colors.primary }}>{CURRENCY} {balance}</Text>
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: tab === 'deposit' ? colors.primary : colors.blue }, (!amount || loading) && { opacity: 0.4 }]}
            onPress={handleSubmit}
            disabled={!amount || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons
                    name={tab === 'deposit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                    size={20} color="#fff"
                  />
                  <Text style={styles.submitBtnText}>
                    {tab === 'deposit' ? 'Deposit to Wallet' : 'Withdraw to MoMo'}
                  </Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* Info note */}
        <View style={[styles.noteBox, shadow.sm]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
          <Text style={styles.noteText}>
            Transactions are processed securely via Moolre. You will receive a MoMo prompt on your phone.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroBalance: { fontSize: 36, fontWeight: '800', color: '#fff', marginTop: 6 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  tabRow: {
    flexDirection: 'row',
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    ...shadow.sm,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: radius.sm,
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  tabBtnTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
  },
  formTitle: { ...typography.h4, marginBottom: spacing.md },
  inputLabel: {
    fontSize: 11, fontWeight: '600', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: 13,
    fontSize: 16, color: colors.text,
  },
  networkRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  networkBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.borderLight,
  },
  networkBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  networkBtnText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  networkBtnTextActive: { color: '#fff' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryMuted, borderRadius: radius.sm,
    padding: spacing.sm, marginTop: spacing.md,
  },
  infoText: { fontSize: 13, color: colors.text },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: radius.sm, paddingVertical: 15, marginTop: spacing.md,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.successMuted, borderRadius: radius.md,
    marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md,
  },
  noteText: { fontSize: 13, color: colors.text, flex: 1, lineHeight: 19 },
});
