import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, theme } from '@/constants/colors';
import { Car } from '@/store/carStore';
import { useCarStore } from '@/store/carStore';

const { width } = Dimensions.get('window');
export const CARD_SPACING = 16;
export const CARD_WIDTH = (width - 56) / 2;

interface CarCardProps {
  car: Car;
  onPress?: () => void;
  showDetails?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress, showDetails = false }) => {
  const { toggleFavorite, favorites } = useCarStore();
  const favorited = favorites.includes(car.id);

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
          <Image 
            source={require('../assets/images/heart_icon_home.png')} 
            style={{ width: 24, height: 24, tintColor: favorited ? '#FF4444' : colors.white }} 
            resizeMode="contain" 
          />
        </TouchableOpacity>

        {/* Arrow Icon */}
        {!showDetails && (
          <View style={styles.arrowIcon}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>➔</Text>
          </View>
        )}
      </View>

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
            <Text style={styles.category}>
              {car.color ? `${car.color} ${car.category || ''}`.trim() : car.category || 'Standard'}
            </Text>
            <Text style={styles.priceSimple}>${(car.price / 1000).toFixed(0)}K</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
  detailedContainer: {
    width: '100%',
    marginRight: 0,
    marginBottom: 12,
    flexDirection: 'row',
  },
  imageContainer: {
    height: 120,
    borderRadius: theme.borderRadius.card || 20,
    backgroundColor: colors.placeholder || '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 40,
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameSimple: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    flex: 1,
  },
  category: {
    fontSize: 11,
    color: colors.textSecondary || '#666',
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 4,
  },
  priceSimple: {
    fontSize: 16,
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
