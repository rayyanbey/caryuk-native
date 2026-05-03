import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
  Image,
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
      router.push('/home');
    } else if (tab === 'search') {
      router.push('/search');
    } else if (tab === 'profile') {
      router.push('/profile');
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
            <View style={styles.emptyIconWrapper}>
              <Image 
                source={require('../../assets/images/heart_icon_home.png')} 
                style={styles.emptyIconImage} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.emptyText}>No favorites yet</Text>
          </View>
        ) : (
          <FlatList
            data={favoritedCars}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/car-detail?id=${item.id}`)}
                style={styles.carItem}
              >
                <View style={styles.imageContainer}>
                  <Text style={styles.emoji}>{item.image}</Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={styles.favoriteIcon}
                  >
                    <Image 
                      source={require('../../assets/images/heart_icon_home.png')} 
                      style={{ width: 18, height: 18, tintColor: '#FF4444' }} 
                      resizeMode="contain" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.carInfo}>
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.rating}>{(typeof item.rating === 'number' ? item.rating : 5.0).toFixed(1)}</Text>
                  </View>
                  <Text style={styles.carName}>{item.name}</Text>
                  <Text style={styles.price}>${((typeof item.price === 'number' ? item.price : 0) / 1000).toFixed(0)}K</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    paddingBottom: 100,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyIconImage: {
    width: 40,
    height: 40,
    tintColor: colors.white,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.semibold,
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
  carInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
