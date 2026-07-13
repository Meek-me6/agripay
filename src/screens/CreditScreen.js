import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Badge from '../components/Badge';
import backendClient from '../api/backendClient';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY, CREDIT } from '../config/appConfig';

const MAX_SCORE = CREDIT.MAX_SCORE;

function getScoreColor(score) {
  if (score >= 700) return colors.success;
  if (score >= 550) return colors.primary;
  if (score >= 400) return colors.accent;
  return colors.danger;
}
function getScoreLabel(score) {
  if (score >= 700) return 'Excellent';
  if (score >= 550) return 'Good';
  if (score >= 400) return 'Fair';
  return 'Building';
}

function ScoreRing({ score }) {
  const pct = Math.min(score / MAX_SCORE, 1);
  const col = getScoreColor(score);
  return (
    <View style={styles.ringWrap}>
      <View style={[styles.ringOuter, { borderColor: colors.borderLight }]}>
        <View style={[styles.ringInner, { borderColor: col }]}>
          <Text style={[styles.ringScore, { color: col }]}>{score || '—'}</Text>
          <Text style={[styles.ringLabel, { color: col }]}>{getScoreLabel(score)}</Text>
          <Text style={styles.ringMax}>/ {MAX_SCORE}</Text>
        </View>
      </View>
      <View style={styles.ringBar}>
        <View style={[styles.ringFill, { width: `${pct * 100}%`, backgroundColor: col }]} />
      </View>
      <Text style={typography.caption}>Credit score</Text>
    </View>
  );
}

export default function CreditScreen() {
  const { farmer, refreshFarmer } = useFarmer();
  const [creditData, setCreditData] = useState(null);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(3);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState(false);

  const fetchCredit = useCallback(async () => {
    try {
      const client = await backendClient();
      const { data } = await client.get('/credit');
      setCreditData(data);
    } catch (e) {
      // silently fail — show local data from farmer context
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCredit(); }, [fetchCredit]);

  const score    = creditData?.credit_score ?? farmer?.credit_score ?? 0;
  const maxLoan  = creditData?.max_loan     ?? Math.round(score * CREDIT.LOAN_MULTIPLIER);
  const loans    = creditData?.loans        ?? [];
  const monthly  = amount && term ? ((parseFloat(amount) || 0) * (1 + CREDIT.INTEREST_RATE) / term).toFixed(2) : null;

  const handleApply = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (val > maxLoan) return Alert.alert('Exceeds limit', `Based on your score of ${score}, maximum loan is ${CURRENCY} ${maxLoan}.`);
    setApplying(true);

    try {
      const client = await backendClient();
      await client.post('/credit/apply', {
        amount: val,
        term_months: term,
        purpose: 'Agricultural inputs',
      });
      Alert.alert('✅ Application submitted', `${CURRENCY} ${val} loan application submitted. Approval decision will be communicated shortly.`);
      setAmount('');
      await Promise.all([fetchCredit(), refreshFarmer()]);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Application failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Credit" subtitle="Your history is your collateral" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCredit(); }} colors={[colors.primary]} />}
      >
        <View style={[styles.scoreCard, shadow.md]}>
          <ScoreRing score={score} />
          <View style={styles.scoreMeta}>
            <Text style={[typography.h4, { color: '#fff' }]}>Your credit profile</Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Max loan: <Text style={{ fontWeight: '800', color: '#fff' }}>{CURRENCY} {maxLoan.toLocaleString()}</Text>
            </Text>
          </View>
        </View>

        <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
          <Text style={[typography.h4, { marginBottom: spacing.md }]}>Loan calculator</Text>

          <Text style={styles.inputLabel}>Amount ({CURRENCY})</Text>
          <TextInput
            style={styles.input} placeholder={`Max: ${CURRENCY} ${maxLoan}`}
            placeholderTextColor={colors.textLight} keyboardType="numeric"
            value={amount} onChangeText={setAmount}
          />

          <Text style={[styles.inputLabel, { marginTop: spacing.sm }]}>Term (months)</Text>
          <View style={styles.termRow}>
            {[3, 6, 12].map(t => (
              <TouchableOpacity key={t} style={[styles.termBtn, term === t && styles.termBtnActive]} onPress={() => setTerm(t)}>
                <Text style={[styles.termBtnText, term === t && styles.termBtnTextActive]}>{t}mo</Text>
              </TouchableOpacity>
            ))}
          </View>

          {monthly && (
            <View style={styles.calcResult}>
              <Ionicons name="calculator-outline" size={18} color={colors.primary} />
              <Text style={styles.calcText}>Monthly repayment: <Text style={{ fontWeight: '800', color: colors.primary }}>{CURRENCY} {monthly}</Text>{'  '}({(CREDIT.INTEREST_RATE * 100).toFixed(0)}% p.a.)</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.applyBtn, (!amount || applying) && { opacity: 0.4 }]}
            disabled={!amount || applying} onPress={handleApply}
          >
            {applying
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.applyBtnText}>Apply for credit</Text>
            }
          </TouchableOpacity>
        </View>

        {loans.length > 0 && (
          <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
            <Text style={[typography.h4, { marginBottom: spacing.md }]}>Loan history</Text>
            {loans.map((loan, i) => (
              <View key={loan.id} style={[styles.loanRow, i < loans.length - 1 && styles.loanBorder]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.loanTitleRow}>
                    <Text style={styles.loanAmount}>{CURRENCY} {loan.amount}</Text>
                    <Badge
                      label={loan.status === 'repaid' ? 'Repaid' : loan.status === 'active' ? 'Active' : 'Pending'}
                      variant={loan.status === 'repaid' ? 'success' : loan.status === 'active' ? 'blue' : 'warning'}
                    />
                  </View>
                  <Text style={typography.caption}>{loan.purpose || 'Agricultural inputs'} · {new Date(loan.created_at).toLocaleDateString('en-GB')}</Text>
                  {loan.status === 'active' && (
                    <Text style={[typography.caption, { marginTop: 2, color: colors.primary }]}>
                      {loan.paid_installments}/{loan.term_months} installments · {CURRENCY} {loan.monthly_payment}/mo
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringWrap: { alignItems: 'center', gap: 6 },
  ringOuter: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  ringScore: { fontSize: 22, fontWeight: '800' },
  ringLabel: { fontSize: 9, fontWeight: '700', marginTop: 1 },
  ringMax: { fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  ringBar: { width: 90, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  ringFill: { height: 4, borderRadius: 2 },
  scoreMeta: { flex: 1 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: 16, color: colors.text },
  termRow: { flexDirection: 'row', gap: spacing.sm },
  termBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm, backgroundColor: colors.borderLight, borderWidth: 1, borderColor: colors.border },
  termBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  termBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  termBtnTextActive: { color: '#fff' },
  calcResult: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primaryMuted, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md },
  calcText: { fontSize: 14, color: colors.text },
  applyBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', marginTop: spacing.md },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loanRow: { paddingVertical: spacing.sm },
  loanBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  loanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  loanAmount: { fontSize: 16, fontWeight: '800', color: colors.text },
});
