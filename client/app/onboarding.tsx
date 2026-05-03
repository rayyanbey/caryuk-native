import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Find Your Perfect Ride',
    subtitle: 'Post Your Car in Minutes. Sell Smart. Sell With Speed.',
    emoji: '🚗',
  },
  {
    id: 2,
    title: 'Sell It. Fast & Easy.',
    subtitle: 'Secure Transactions And Real Buyers.',
    emoji: '⚡',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
    } else {
      router.replace('/sign-in');
    }
  };

  const handleSkip = () => {
    router.replace('/sign-in');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== currentStep) {
      setCurrentStep(roundIndex);
    }
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => (
    <View style={styles.slide}>
      {/* Image Area with fixed height to ensure consistency */}
      <View style={styles.imageArea}>
        <Text style={styles.imagePlaceholder}>{item.emoji}</Text>
      </View>

      {/* Bottom Content */}
      <View style={styles.contentSection}>
        {/* Headline */}
        <Text style={styles.headline}>{item.title}</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>{item.subtitle}</Text>
      </View>
    </View>
  );

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

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item) => item.id.toString()}
        scrollEventThrottle={16}
      />

      {/* Fixed Action Row */}
      <View style={styles.footer}>
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
            <Text style={styles.ctaButtonText}>{"Let's Get Started"}</Text>
          </TouchableOpacity>
        )}
      </View>
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
    zIndex: 10,
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
  slide: {
    width: width,
    flex: 1,
  },
  imageArea: {
    height: height * 0.45, // Use fixed height percentage of screen instead of flex
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: theme.borderRadius.card,
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  contentSection: {
    paddingHorizontal: 24,
    minHeight: 120, // Ensure text area has a consistent baseline
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 80, // Lifted up further from 60
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
    textAlign: 'center',
    lineHeight: 22, // Nudged upwards
    includeFontPadding: false,
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
