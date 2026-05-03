export const colors = {
  primary: '#F5C518',
  dark: '#1A1A1A',
  white: '#FFFFFF',
  surface: '#F5F5F5',
  placeholder: '#D9D9D9',
  textSecondary: '#888888',
  danger: '#E53935',
  navy: '#1B2A6B',
  lightGray: '#F7F7F7',
  mediumGray: '#EFEFEF',
  lightBorder: '#E8E8E8',
  gold: '#FFD700',
} as const;

export const theme = {
  colors,
  borderRadius: {
    pill: 30,
    card: 16,
    icon: 24,
  },
  fontWeights: {
    regular: 400 as const,
    semibold: 600 as const,
    bold: 700 as const,
    black: 900 as const,
  },
} as const;
