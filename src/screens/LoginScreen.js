import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../theme/colors';
import { useFarmer } from '../context/FarmerContext';
import { PHONE_COUNTRY_CODE } from '../config/appConfig';

export default function LoginScreen({ navigation }) {
  const { login } = useFarmer();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = phone.trim().length >= 9 && pin.length >= 4;

  const handleLogin = async () => {
    if (submitting) return;
    if (!canSubmit) {
      Alert.alert('Missing info', 'Enter your phone number and PIN.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ phone: phone.trim(), pin });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Login failed. Check your phone and PIN.';
      Alert.alert('Login failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, {
        paddingTop: insets.top + spacing.xxl,
        paddingBottom: insets.bottom + spacing.xl,
      }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}><Text style={{ fontSize: 28 }}>🌾</Text></View>
        <Text style={styles.logo}>AgriPay</Text>
      </View>
      <Text style={styles.sub}>Sign in to your account</Text>

      <View style={[styles.form, shadow.md]}>
        <Text style={styles.label}>Phone number</Text>
        <View style={[styles.phoneRow, { marginBottom: spacing.md }]}>
          <View style={styles.dialCode}>
            <Text style={{ fontSize: 15, color: colors.text }}>🇬🇭 {PHONE_COUNTRY_CODE}</Text>
          </View>
          <TextInput
            style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }]}
            placeholder="0241234567"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            autoCorrect={false}
          />
        </View>

        <Text style={styles.label}>PIN</Text>
        <TextInput
          style={[styles.input, { marginBottom: spacing.lg }]}
          placeholder="••••"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.6 }]}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
          {!submitting && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: spacing.xs }} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={goToRegister}
          activeOpacity={0.6}
        >
          <Text style={styles.linkText}>
            New farmer?{'  '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Create account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  brandIcon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary },
  sub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl },
  form: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: 15, color: colors.text, backgroundColor: colors.background },
  phoneRow: { flexDirection: 'row' },
  dialCode: { borderWidth: 1, borderColor: colors.border, borderRightWidth: 0, borderTopLeftRadius: radius.sm, borderBottomLeftRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, backgroundColor: colors.borderLight },
  button: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.sm },
  linkText: { fontSize: 14, color: colors.textMuted },
});
