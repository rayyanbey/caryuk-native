/* eslint-disable import/no-unresolved */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
import { useCartStore } from '@/store/cartStore';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 40;
const DESCRIPTION_LIMIT = 150;

export default function CarDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const carIdParam = params.id as string | string[] | undefined;
  const carId = Array.isArray(carIdParam) ? carIdParam[0] : (carIdParam || '');
  const { cars, isFavorite, toggleFavorite } = useCarStore();
  const { items, addToCart } = useCartStore();
  const car = cars.find((c) => c.id === carId || c._id === carId);
  const isInCart = car ? items.some(item => {
    const itemId = item.car.id || item.car._id;
    const currentId = car.id || car._id;
    return itemId === currentId;
  }) : false;
  
  const [selectedTab, setSelectedTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const favorited = car ? isFavorite(car.id || car._id || '') : false;

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Car not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const specItems = [
    { icon: require('../../assets/images/milage_icon.png'), label: car.mileage || 'N/A' },
    { icon: require('../../assets/images/seat_icon.png'), label: `${car.seats || 4} Seat` },
    { icon: require('../../assets/images/gas_icon.png'), label: car.fuelType || 'Petrol' },
    { icon: require('../../assets/images/transmission_icon.png'), label: car.transmission || 'Auto' },
  ];

  const carouselImages = car.images && car.images.length > 0 
    ? car.images 
    : [car.image || '🚗'];

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${car.name} on Caryuk! Price: $${(car.price / 1000).toFixed(0)}K`,
        url: car.image?.startsWith('http') ? car.image : undefined,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCall = () => {
    const phone = car.seller?.phone || '1234567890';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make a call. Please try again.');
    });
  };

  const handleChat = () => {
    Alert.alert('Chat', `Connecting you with ${car.owner?.name || 'the seller'}...`);
  };

  const ratingValue = (car.reviews ?? 0) === 0 ? 0.0 : (car.rating ?? 5.0);
  const description = car.description || 'No description available for this vehicle.';
  const showReadMore = description.length > DESCRIPTION_LIMIT;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
            <Image 
              source={require('../../assets/images/arrow_back.png')} 
              style={styles.headerIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Car Detail</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Image Carousel */}
          <View style={styles.carouselContainer}>
            <View style={styles.carousel}>
              <FlatList
                data={carouselImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={{ width: CAROUSEL_WIDTH, height: 240, justifyContent: 'center', alignItems: 'center' }}>
                    {item?.startsWith('http') ? (
                      <Image 
                        source={{ uri: item }} 
                        style={styles.fullCarouselImage} 
                        resizeMode="cover" 
                      />
                    ) : (
                      <Text style={styles.carouselEmoji}>{item || '🚗'}</Text>
                    )}
                  </View>
                )}
              />
              
              <TouchableOpacity style={styles.shareIcon} onPress={handleShare}>
                <Image 
                  source={require('../../assets/images/share_icon.png')} 
                  style={styles.actionIconImage} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pagination}>
              {carouselImages.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.dot, activeImageIndex === index && styles.dotActive]} 
                />
              ))}
            </View>
          </View>

          {/* Car Info Header */}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.carName}>{car.name}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.rating}>{ratingValue.toFixed(1)}</Text>
                  <Text style={styles.reviews}>({car.reviews || 0} reviews)</Text>
                </View>
              </View>
              <Text style={styles.price}>${(car.price / 1000).toFixed(0)}K</Text>
            </View>

            {/* Specifications */}
            <View style={styles.specGrid}>
              {specItems.map((spec, index) => (
                <View key={index} style={styles.specItem}>
                  <View style={styles.specIconContainer}>
                    <Image source={spec.icon} style={styles.specIcon} resizeMode="contain" />
                  </View>
                  <Text style={styles.specValue}>{spec.label}</Text>
                </View>
              ))}
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              {['description', 'specification', 'review'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={[styles.tab, selectedTab === tab && styles.activeTab]}
                >
                  <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {selectedTab === 'description' && (
                <View>
                  <Text style={styles.descriptionText}>
                    {isExpanded ? description : `${description.slice(0, DESCRIPTION_LIMIT)}${showReadMore ? '...' : ''}`}
                  </Text>
                  {showReadMore && (
                    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                      <Text style={styles.readMoreText}>{isExpanded ? 'Read Less' : 'Read More'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {selectedTab === 'specification' && (
                <Text style={styles.tabPlaceholder}>Detailed technical specifications for {car.name} will appear here.</Text>
              )}
              {selectedTab === 'review' && (
                <Text style={styles.tabPlaceholder}>User reviews and community ratings for this model will appear here.</Text>
              )}
            </View>

            {/* Seller Info */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.avatarText}>{car.owner?.name?.charAt(0) || 'S'}</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{car.owner?.name || 'Authorized Dealer'}</Text>
                <Text style={styles.sellerRole}>Official Seller</Text>
              </View>
              <View style={styles.sellerActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <Image source={require('../../assets/images/call_icon.png')} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
                  <Image source={require('../../assets/images/chat_icon.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.cartButton, favorited && styles.cartButtonFavorited]} 
            onPress={() => toggleFavorite(car.id || car._id || '')}
          >
            <Image 
              source={require('../../assets/images/heart_icon_home.png')} 
              style={[styles.cartIconImage, favorited && { tintColor: colors.white }]} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buyButton, isInCart && styles.buyButtonDisabled]}
            onPress={() => {
              if (isInCart) return;
              addToCart(car);
              Alert.alert('Cart', `${car.name} added to cart!`, [
                { text: 'View Cart', onPress: () => router.push('/payment') },
                { text: 'Continue Shopping' }
              ]);
            }}
            disabled={isInCart}
          >
            <Text style={styles.buyButtonText}>
              {isInCart ? 'Booked' : 'Book Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 16,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  title: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  carouselContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  carousel: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  fullCarouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselEmoji: {
    fontSize: 80,
  },
  shareIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.dark,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mediumGray,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 24,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  specItem: {
    alignItems: 'center',
    width: '22%',
  },
  specIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specIcon: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  specValue: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.dark,
  },
  tabContent: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  sellerRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sellerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
    elevation: 2,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 54 : 44,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    alignItems: 'center',
    gap: 16,
  },
  cartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonFavorited: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cartIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  buyButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonDisabled: {
    backgroundColor: colors.mediumGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  buyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
