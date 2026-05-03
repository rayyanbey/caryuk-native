module.exports = {
  extends: ['expo', 'expo/web'],
  ignorePatterns: ['/dist', '/.expo', '/build', 'node_modules'],
  rules: {
    'import/no-unresolved': 0,
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-native/no-unused-styles': 'off',
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['app/**/car-detail.tsx', 'app/**/profile.tsx'],
      rules: {
        'import/no-unresolved': 0,
      },
    },
  ],
};
