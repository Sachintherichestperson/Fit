import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/MaterialIcons';

const ProductPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const [selectedImage, setSelectedImage] = useState(0);
  const [userPoints, setUserPoints] = useState(2400);
  const fadeAnim = useRef(new Animated.Value(0)).current;


  // Sample product images
  const productImages = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5', // Alternate angle
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', // Detail shot
    'https://images.unsplash.com/photo-1576678927484-cc907957088c', // Packaging
  ];

  const [relateddata, setrelateddata] = useState([]);
  const [isInCart, setIsInCart] = useState(false);

  const related = () => {
    return relateddata.map(challenge => ({
      id: challenge._id,
      name: challenge.Title,
      price: challenge.Price,
      imageUrl: challenge.Image,
    }));
  };

 const CartBtn = async () => {
  try {
    const response = await fetch(`http://192.168.105.177:3000/Cart/${product.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      navigation.navigate('Cart');
      setIsInCart(data.Cart === 'true');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Failed to add to cart');
  }
}


  const fetchProducts = async () => {
    const response = await fetch('http://192.168.105.177:3000/Products');
    const data = await response.json();
     const filteredProducts = data.Products.filter(
      prod => prod._id !== product.id 
    );
    setrelateddata(filteredProducts)
  }

  useEffect(() => {
    fetchProducts();
  })


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const canUsePoints = userPoints >= product.pointsRequired;
  const discountedPrice = canUsePoints
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;


  const renderRelatedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedItem}
      onPress={() => navigation.replace('ProductDetails', { product: {
        name: item.Title || item.name,
        price: item.Price || item.price,
        brand: item.brand || "Unknown Brand",
        category: item.category || "General",
        pointsRequired: item.pointsRequired || 0,
        discount: item.discount || 0,
        rating: item.rating || 4.0,
        stock: item.stock || 10 
      }
    })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} />
      <Text style={styles.relatedName} numberOfLines={1}>{item.Title}</Text>
      <Text style={styles.relatedPrice}>₹{item.Price}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={[styles.glow, styles.glow1]} />
        <View style={[styles.glow, styles.glow2]} />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="Home" size={24} color="#BBBBCC" />
            </TouchableOpacity>
            <View style={styles.pointsContainer}>
              <Ionicons name="flash" size={16} color="#FFAC41" />
              <Text style={styles.pointsText}>{userPoints} pts</Text>
            </View>
          </View>

          {/* Product Images */}
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: productImages[selectedImage] }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['rgba(255, 46, 99, 0.2)', 'rgba(255, 172, 65, 0.2)']}
              style={styles.imageOverlay}
            />
          </View>

          <View style={styles.imageThumbnails}>
            {productImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.selectedThumbnail,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFAC41" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            </View>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.price]}>
                ₹{product.price}
              </Text>
            </View>

            <View style={styles.pointsContainer}>
              <Ionicons name="flash" size={14} color="#FFAC41" />
              <Text style={styles.pointsText}>
                Use {product.pointsRequired} pts for {product.discount}% off
              </Text>
            </View>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              Premium quality {product.name.toLowerCase()} from {product.brand}. {product.category === 'Protein'
                ? 'Perfect for post-workout recovery and muscle growth. Contains essential amino acids and is easy to digest.'
                : product.category === 'Equipment'
                ? 'Durable construction designed for long-term use. Ergonomic design for maximum comfort and performance.'
                : 'Clinically tested formula that delivers proven results. Manufactured in FDA-approved facilities.'}
            </Text>

            {/* Related Products */}
            <Text style={styles.sectionTitle}>You May Also Like</Text>
            <FlatList
              data={relateddata}
              renderItem={renderRelatedItem}
              keyExtractor={(item) => item._id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        </ScrollView>

        {/* Buy Button */}
       
  {isInCart ? (
  <LinearGradient
    colors={canUsePoints ? ['#28a745', '#FFAC41'] : ['#BBBBCC', '#BBBBCC']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.buyButton}
  >
    <TouchableOpacity style={styles.buyButtonTouchable} onPress={CartBtn}>
      <Text style={styles.buyButtonText}>
        Item Added To Cart
      </Text>
    </TouchableOpacity>
  </LinearGradient>
) : (
  <LinearGradient
    colors={canUsePoints ? ['#FF2E63', '#FFAC41'] : ['#BBBBCC', '#BBBBCC']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.buyButton}
  >
    <TouchableOpacity 
      style={styles.buyButtonTouchable} 
      onPress={CartBtn}
      disabled={product.stock <= 0}
    >
      <Text style={styles.buyButtonText}>
        {product.stock > 0 ? `ADD TO CART` : 'OUT OF STOCK'}
      </Text>
    </TouchableOpacity>
  </LinearGradient>
)}


      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
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
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 172, 65, 0.15)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.3)',
  },
  pointsText: {
    color: '#FDFDFD',
    fontSize: 14,
    marginLeft: 6,
  },
  mainImageContainer: {
    width: '100%',
    height: Dimensions.get('window').width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  mainImage: {
    width: '80%',
    height: '80%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  imageThumbnails: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.2)',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#FF2E63',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginLeft: 12,
  },
  ratingText: {
    color: '#FFAC41',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#BBBBCC',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FDFDFD',
    marginRight: 12,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFAC41',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FF2E63',
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginTop: 24,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#BBBBCC',
    lineHeight: 22,
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#FDFDFD',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  quantityValue: {
    fontSize: 16,
    color: '#FDFDFD',
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  relatedList: {
    paddingBottom: 16,
  },
  relatedItem: {
    width: 120,
    marginRight: 16,
  },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 14,
    color: '#FDFDFD',
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 14,
    color: '#FFAC41',
    fontWeight: '600',
  },
  buyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buyButtonTouchable: {
    width: '100%',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProductPage;
