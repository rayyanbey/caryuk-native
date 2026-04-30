import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, theme } from '@/constants/colors';
import { Car } from '@/store/carStore';
import { useCarStore } from '@/store/carStore';

interface CarCardProps {
  car: Car;
  onPress?: () => void;
  showDetails?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress, showDetails = false }) => {
  const { toggleFavorite, isFavorite } = useCarStore();
  const favorited = isFavorite(car.id);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, showDetails && styles.detailedContainer]}
    >
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>{car.image}</Text>

        {/* Heart Icon */}
        <TouchableOpacity
          onPress={() => toggleFavorite(car.id)}
          style={[styles.heartIcon, favorited && styles.heartIconActive]}
        >
          <Text style={styles.heart}>{favorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </imageContainer>

      {/* Car Info */}
      <View style={styles.infoContainer}>
        {showDetails && (
          <>
            <Text style={styles.category}>{car.category}</Text>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{car.name}</Text>
              <Text style={styles.price}>${(car.price / 1000).toFixed(0)}K</Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>{car.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({car.reviews} reviews)</Text>
            </View>
          </>
        )}

        {!showDetails && (
          <>
            <Text style={styles.nameSimple}>{car.name}</Text>
            <Text style={styles.category}>{car.category}</Text>
            <Text style={styles.priceSimple}>${(car.price / 1000).toFixed(0)}K</Text>
          </>
        )}
      </infoContainer>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: theme.borderRadius.card,
    backgroundColor: colors.mediumGray,
    marginRight: 12,
    overflow: 'hidden',
  },
  detailedContainer: {
    width: '100%',
    marginRight: 0,
    marginBottom: 12,
    flexDirection: 'row',
  },
  imageContainer: {
    height: 110,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 40,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconActive: {
    backgroundColor: '#FFE0E0',
  },
  heart: {
    fontSize: 16,
  },
  infoContainer: {
    padding: 8,
    flex: 1,
  },
  nameSimple: {
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    flex: 1,
  },
  category: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 4,
  },
  priceSimple: {
    fontSize: 12,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginRight: 4,
  },
  reviews: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
