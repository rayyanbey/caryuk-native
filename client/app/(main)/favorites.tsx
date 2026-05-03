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
  BackHandler,
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

  React.useEffect(() => {
    const backAction = () => {
      router.push('/home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

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
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
            <Image 
              source={require('../../assets/images/arrow_back.png')} 
              style={styles.backIconImage} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Favorites</Text>
          <View style={{ width: 24 }} />
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
            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const id = item.id || item._id;
                  if (id) {
                    router.push(`/car-detail?id=${id}`);
                  }
                }}
                style={styles.carItem}
              >
                <View style={styles.imageContainer}>
                  {item.image?.startsWith('http') ? (
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.fullItemImage} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <Text style={styles.emoji}>{item.image || '🚗'}</Text>
                  )}
                  
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

                  <View style={styles.carInfo}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>⭐</Text>
                      <Text style={styles.rating}>{(typeof item.rating === 'number' ? item.rating : 5.0).toFixed(1)}</Text>
                    </View>
                    <Text style={styles.carName}>{item.name}</Text>
                    <Text style={styles.price}>${((typeof item.price === 'number' ? item.price : 0) / 1000).toFixed(0)}K</Text>
                  </View>
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
        <View style={{ height: 100 }} />
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
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
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
    paddingBottom: 120,
  },
  carItem: {
    backgroundColor: colors.mediumGray,
    borderRadius: theme.borderRadius.card,
    height: 160, // Slightly taller for premium feel
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
    fontSize: 60,
  },
  fullItemImage: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  carInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // Translucent overlay
    padding: 12,
    paddingBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    color: colors.white,
  },
  carName: {
    fontSize: 18,
    fontWeight: theme.fontWeights.black,
    color: colors.white,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.white,
  },
});
