import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { useFarmer } from '../context/FarmerContext';
// import { sendOtp } from '../api/smsApi'; // wire up once Moolre keys are in place

export default function RegisterScreen({ navigation }) {
  const { registerFarmer } = useFarmer();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 9;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Real flow: await sendOtp(phone), navigate to an OTP screen,
      // then call registerFarmer only after verifyOtp() succeeds.
      // Skipping OTP here so the demo works before keys are added.
      await registerFarmer({ name: name.trim(), phone: phone.trim(), region: region.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🌾 Agripay</Text>
        <Text style={styles.tagline}>One platform for prices, credit, subsidies & savings</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kwame Asante"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 024XXXXXXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Region</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bono East"
            placeholderTextColor={colors.textMuted}
            value={region}
            onChangeText={setRegion}
          />

          <TouchableOpacity
            style={[styles.button, !canSubmit && { opacity: 0.5 }]}
            disabled={!canSubmit || submitting}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>{submitting ? 'Creating profile…' : 'Get started'}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            No smartphone? Tell farmers nearby they can dial *XXX# from any phone to use Agripay
            over USSD instead.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md, lineHeight: 17 },
});
