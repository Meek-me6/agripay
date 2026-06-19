import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius } from '../theme/colors';
// import { disburseToFarmer } from '../api/transfersApi';
// import { getTransactionHistory } from '../api/accountApi';

export default function CreditScreen() {
  const { farmer } = useFarmer();
  const [requested, setRequested] = useState('');

  const handleApply = () => {
    const value = parseFloat(requested);
    if (!value || value <= 0) return;
    // Real flow: pull getTransactionHistory(farmer.id) to compute/confirm
    // creditScore, then if approved call disburseToFarmer({...}) via
    // Moolre's Transfers API to pay out the loan.
    Alert.alert(
      'Application submitted',
      `Requested GHS ${value}. Your score (${farmer.creditScore}) is based on your platform transaction history — price checks, marketplace sales, and coop contributions all count toward it.`
    );
    setRequested('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Credit" subtitle="Your transaction history is your collateral" />

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Your credit score</Text>
        <Text style={styles.score}>{farmer.creditScore || '—'}</Text>
        <Text style={styles.scoreNote}>
          Built from Price Board usage, Marketplace sales, and Cooperative contributions over time.
        </Text>
      </View>

      <View style={styles.applyCard}>
        <Text style={styles.label}>Request an amount (GHS)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 500"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={requested}
          onChangeText={setRequested}
        />
        <TouchableOpacity style={styles.button} onPress={handleApply}>
          <Text style={styles.buttonText}>Apply for credit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: '#8C6A5B',
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  scoreLabel: { color: '#F1E5DF', fontSize: 12.5 },
  score: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  scoreNote: { color: '#F1E5DF', fontSize: 12, textAlign: 'center', marginTop: spacing.sm, lineHeight: 17 },
  applyCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: spacing.md,
  },
  button: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
