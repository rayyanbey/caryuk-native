import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
import { TabBar } from '@/components/TabBar';

export default function FavoritesScreen() {
  const router = useRouter();
  const { cars, favorites, toggleFavorite } = useCarStore();
  const [activeTab, setActiveTab] = React.useState<'home' | 'search' | 'favorites' | 'profile'>(
    'favorites'
  );

  const favoritedCars = cars.filter((car) => favorites.includes(car.id));

  const handleTabPress = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'home') {
      router.push('/(main)/home');
    } else if (tab === 'search') {
      router.push('/(main)/search');
    } else if (tab === 'profile') {
      router.push('/(main)/profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Favorites</Text>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Car List */}
        {favoritedCars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>No favorites yet</Text>
          </View>
        ) : (
          <FlatList
            data={favoritedCars}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/(main)/car-detail?id=${item.id}`)}
                style={styles.carItem}
              >
                <View style={styles.imageContainer}>
                  <Text style={styles.emoji}>{item.image}</Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={styles.favoriteIcon}
                  >
                    <Text style={styles.heart}>❤️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.carInfo}>
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.carName}>{item.name}</Text>
                  <Text style={styles.price}>${(item.price / 1000).toFixed(0)}K</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        {/* Spacer for tab bar */}
        <View style={{ height: 80 }} />
      </View>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  menuIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 80,
  },
  carItem: {
    backgroundColor: colors.mediumGray,
    borderRadius: theme.borderRadius.card,
    height: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 50,
  },
  favoriteIcon: {
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
  heart: {
    fontSize: 16,
  },
  carInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: colors.white,
    marginRight: 8,
  },
  carName: {
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    color: colors.white,
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: theme.fontWeights.black,
    color: colors.white,
  },
});
