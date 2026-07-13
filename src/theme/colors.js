export const colors = {
  primary: '#0F5132',
  primaryLight: '#1A7A4A',
  primaryMuted: '#E8F5EE',
  accent: '#F2A93B',
  accentMuted: '#FEF3E2',
  blue: '#2563EB',
  blueMuted: '#EFF6FF',
  purple: '#7C3AED',
  purpleMuted: '#F5F3FF',
  coral: '#E05C45',
  coralMuted: '#FEF2F0',
  background: '#F5F7F5',
  card: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#059669',
  successMuted: '#ECFDF5',
  danger: '#DC2626',
  dangerMuted: '#FEF2F2',
  warning: '#D97706',
  warningMuted: '#FFFBEB',
  overlay: 'rgba(0,0,0,0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700', color: '#111827' },
  h4: { fontSize: 15, fontWeight: '600', color: '#111827' },
  body: { fontSize: 14, fontWeight: '400', color: '#374151' },
  bodyMd: { fontSize: 15, fontWeight: '400', color: '#374151' },
  caption: { fontSize: 12, fontWeight: '400', color: '#6B7280' },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 },
  mono: { fontSize: 13, fontFamily: 'monospace', color: '#111827' },
};
