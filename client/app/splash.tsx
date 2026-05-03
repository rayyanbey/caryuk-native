import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Background Ghost Text */}
      <Text style={styles.ghostText}>CARYUK</Text>

      {/* Main Brand Text */}
      <Text style={styles.brandText}>CARYUK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 52,
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.white,
    letterSpacing: 2,
    zIndex: 10,
  },
  ghostText: {
    fontSize: 80,
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.white,
    opacity: 0.15,
    position: 'absolute',
    letterSpacing: 2,
  },
});
