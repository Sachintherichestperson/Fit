/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ShopPage = () => {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState('all');
  const [userPoints, setUserPoints] = useState(2400);
  const [products, setProducts] = useState({
    all: [],
    protein: [],
    equipment: [],
    supplements: [],
    accessories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://192.168.244.177:3000/Products', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Fixed: Check for data.Products (capital P) as seen in the console log
      const productsArray = Array.isArray(data)
        ? data
        : data.Products || data.products || data.data || [];

      if (!productsArray.length) {
        throw new Error('No products found in response');
      }

      // Transform the data to match your frontend structure
      const transformedProducts = productsArray.map(item => ({
        id: item._id || Math.random().toString(36).substr(2, 9),
        name: item.Title || 'Unnamed Product',
        category: item.Category ? item.Category.toLowerCase() : 'all',
        price: parseInt(item.Price, 10) || 0,
        discount: '10' || 0,
        pointsRequired: Math.floor((parseInt(item.Price, 10) || 0) / 7),
        imageUrl: item.Image && item.Image.toString
          ? `data:image/jpeg;base64,${item.Image.toString('base64')}`
          : 'https://via.placeholder.com/150',
        brand: item.brand || 'FitStreak',
        rating: item.rating || 4.5,
        stock: item.Quantity || 50,
        description: item.Description || 'Premium quality product',
      }));

      // Categorize products
      const categorizedProducts = {
        all: transformedProducts,
        protein: transformedProducts.filter(p => p.category === 'protein'),
        equipment: transformedProducts.filter(p => p.category === 'equipment'),
        supplements: transformedProducts.filter(p => p.category === 'supplements'),
        accessories: transformedProducts.filter(p => p.category === 'accessories'),
      };

      setProducts(categorizedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      // Set some default products if the fetch fails
      setProducts({
        all: [],
        protein: [],
        equipment: [],
        supplements: [],
        accessories: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const pulseShadow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const renderProductItem = ({ item }) => {
    const canUsePoints = userPoints >= item.pointsRequired;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          <LinearGradient
            colors={['rgba(255, 46, 99, 0.2)', 'rgba(255, 172, 65, 0.2)']}
            style={styles.imageOverlay}
          />
        </View>
        <View style={styles.productDetails}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFAC41" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Ionicons name="flash" size={14} color="#FFAC41" />
            <Text style={styles.pointsText}>
              Use {item.pointsRequired} pts for {item.discount}% off
            </Text>
          </View>
          <LinearGradient
            colors={canUsePoints ? ['#FF2E63', '#FFAC41'] : ['#BBBBCC', '#BBBBCC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButton}
          >
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { product: item })} disabled={item.stock === 0}>
              <Text style={[styles.buyButtonText, item.stock === 0 && styles.disabledText]}>
                {item.stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedProduct = () => {
    if (loading) {
      return (
        <View style={[styles.featuredCard, { justifyContent: 'center', alignItems: 'center', height: 300 }]}>
          <ActivityIndicator size="large" color="#FF2E63" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.featuredCard, { justifyContent: 'center', alignItems: 'center', height: 100 }]}>
          <Text style={{ color: 'white' }}>Error loading featured products</Text>
        </View>
      );
    }

    // Use the first product as featured or create a default
    const featured = products.all[0] || {
      id: 'default',
      name: 'Featured Product',
      category: 'Equipment',
      price: 25000,
      discount: 20,
      pointsRequired: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      brand: 'FitStreak',
      rating: 4.9,
      stock: 10,
      description: 'Premium quality product',
    };

    const canUsePoints = userPoints >= featured.pointsRequired;

    return (
      <Animated.View
        style={[
          styles.featuredCard,
          { shadowOpacity: 0.7, shadowRadius: pulseShadow, shadowColor: '#FF2E63' },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 46, 99, 0.8)', 'rgba(255, 172, 65, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredImageContainer}>
              <Image source={{ uri: featured.imageUrl }} style={styles.featuredImage} />
              <LinearGradient
                colors={['rgba(255, 46, 99, 0.2)', 'rgba(255, 172, 65, 0.2)']}
                style={styles.imageOverlay}
              />
            </View>
            <Text style={styles.featuredTitle}>{featured.name}</Text>
            <Text style={styles.featuredBrand}>{featured.brand}</Text>
            <Text style={styles.featuredDesc}>
              {featured.category} - {featured.description}
            </Text>
            <View style={styles.featuredPriceContainer}>
              <Text style={[styles.featuredPrice]}>
                ₹{featured.price}
              </Text>
            </View>
            <View style={styles.featuredPointsContainer}>
              <Ionicons name="flash" size={14} color="#FFAC41" />
              <Text style={styles.featuredPointsText}>
                Use {featured.pointsRequired} pts for {featured.discount}% off
              </Text>
            </View>
            <TouchableOpacity
              style={styles.featuredButton}
              onPress={() => navigation.navigate('ProductDetails', { product: featured })}
            >
              <Text style={styles.featuredButtonText}>
                {featured.stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color="#FF2E63" />
        <Text style={{ color: 'white', marginTop: 20 }}>Loading products...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ color: 'white', marginBottom: 20 }}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchProducts();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F0F1A']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SHOP</Text>
            <LinearGradient
              colors={['#FF2E63', '#FFAC41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerUnderline}
            />
          </View>
          <View style={styles.pointsContainer}>
            <Ionicons name="flash" size={16} color="#FFAC41" />
            <Text style={styles.pointsText}>{userPoints} pts</Text>
          </View>
        </View>
        {renderFeaturedProduct()}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {['all', 'protein', 'equipment', 'supplements', 'accessories'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.activeCategoryButton,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Ionicons
                  name={
                    category === 'all' ? 'grid' :
                    category === 'protein' ? 'nutrition' :
                    category === 'equipment' ? 'barbell' :
                    category === 'supplements' ? 'medkit' :
                    'watch'
                  }
                  size={16}
                  color={activeCategory === category ? '#FF2E63' : '#BBBBCC'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category && styles.activeCategoryText,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Products
          </Text>
          {products[activeCategory]?.length > 0 ? (
            <FlatList
              data={products[activeCategory]}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noProducts}>
              <Text style={styles.noProductsText}>No products found in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Stats')}>
          <Icon name="trophy" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Short-Challenges')}>
          <Icon name="calendar-check" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="shopping-bag" size={20} color="#FF2E63" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="user" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    zIndex: -1,
    opacity: 0.3,
  },
  glow1: {
    top: -50,
    right: -50,
    backgroundColor: '#FF2E63',
  },
  glow2: {
    bottom: 100,
    left: -50,
    backgroundColor: '#FF2E63',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -1,
    color: 'white',
  },
  headerUnderline: {
    height: 3,
    width: '100%',
    marginTop: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 172, 65, 0.15)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.3)',
    marginBottom: 12,
  },
  pointsText: {
    color: '#FDFDFD',
    fontSize: 14,
    marginLeft: 6,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  featuredGradient: {
    borderRadius: 16,
  },
  featuredContent: {
    padding: 20,
  },
  featuredImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredBrand: {
    color: '#BBBBCC',
    fontSize: 14,
    marginBottom: 8,
  },
  featuredDesc: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  featuredDiscountedPrice: {
    color: '#FFAC41',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredPointsText: {
    color: '#FDFDFD',
    fontSize: 12,
    marginLeft: 4,
  },
  featuredButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#FF2E63',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.2)',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  categoryText: {
    color: '#BBBBCC',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FF2E63',
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '700',
    color: '#FDFDFD',
  },
  productCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
    top: -16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFDFD',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 172, 65, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFAC41',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#BBBBCC',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FDFDFD',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFAC41',
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledText: {
    opacity: 0.6,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 26, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#333344',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
  },
  navLabel: {
    fontSize: 12,
    color: '#BBBBCC',
    fontWeight: '500',
    marginTop: 4,
  },
  activeNavLabel: {
    color: 'white',
  },
  noProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noProductsText: {
    color: '#BBBBCC',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FF2E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ShopPage;
