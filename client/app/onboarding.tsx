import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';

const onboardingData = [
  {
    id: 1,
    title: 'Find Your Perfect Ride',
    subtitle: 'Post Your Car in Minutes. Sell Smart. Sell With Speed.',
    badge: 'Frame 1',
  },
  {
    id: 2,
    title: 'Sell It. Fast & Easy.',
    subtitle: 'Secure Transactions And Real Buyers.',
    badge: 'Frame 2',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/sign-in');
  };

  const data = onboardingData[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index === currentStep ? styles.activeBar : styles.inactiveBar,
            ]}
          />
        ))}
      </View>

      {/* Image Area */}
      <View style={styles.imageArea}>
        <Text style={styles.imagePlaceholder}>
          {currentStep === 0 ? '🚗' : '⚡'}
        </Text>
      </View>

      {/* Bottom Content */}
      <View style={styles.contentSection}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.badge}</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>{data.title}</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>{data.subtitle}</Text>

        {/* Bottom Action Row */}
        {currentStep === 0 ? (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>Let's Get Started</Text>
          </TouchableOpacity>
        )}
      </contentSection>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  activeBar: {
    backgroundColor: colors.primary,
  },
  inactiveBar: {
    backgroundColor: colors.placeholder,
  },
  imageArea: {
    flex: 1,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: theme.borderRadius.card,
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
  },
  headline: {
    fontSize: 28,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: theme.fontWeights.semibold,
  },
  nextButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
});
