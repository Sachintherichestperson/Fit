import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/MaterialIcons';

const CartPage = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  const CartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.105.177:3000/Cart/Data');
      const data = await response.json();
      
      const mappedCartItems = data.Cart.map(item => ({
        id: item._id,
        name: item.Title,
        brand: item.Category,
        price: parseFloat(item.Price),
        quantity: 1,
        pointsUsed: 0,
      }));
      
      setCartItems(mappedCartItems);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      Alert.alert('Error', 'Failed to load cart items. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    CartData();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const incrementQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decrementQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const removeItem = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.105.177:3000/Cart/Remove-${id}`);
      if(response.ok){
        const removedItem = cartItems.find(item => item.id === id);
        if (removedItem.pointsUsed > 0) {
          setUserPoints(userPoints + removedItem.pointsUsed);
        }
        setCartItems(cartItems.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotalPointsUsed = () => {
    return cartItems.reduce((sum, item) => sum + item.pointsUsed, 0);
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        
        {item.pointsUsed > 0 && (
          <View style={styles.pointsContainer}>
            <Ionicons name="flash" size={14} color="#FFAC41" />
            <Text style={styles.pointsText}>Used {item.pointsUsed} pts</Text>
          </View>
        )}
        
        <Text style={styles.price}>₹{item.price}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => decrementQuantity(item.id)}
            disabled={item.quantity <= 1}
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
          >
            <Ionicons name="remove" size={18} color={item.quantity <= 1 ? '#BBBBCC' : '#FF2E63'} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => incrementQuantity(item.id)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={18} color="#FF2E63" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeItem(item.id)}
        disabled={loading}
      >
        <Ionicons name="close" size={20} color="#BBBBCC" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1A1A2E', '#0F0F1A']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FF2E63" />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="#BBBBCC" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={styles.pointsContainer}>
              <Ionicons name="flash" size={16} color="#FFAC41" />
              <Text style={styles.pointsText}>{userPoints} pts</Text>
            </View>
          </View>

          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <>
              {cartItems.map(renderCartItem)}
              
              {/* Order Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{calculateSubtotal()}</Text>
                </View>
                
                {calculateTotalPointsUsed() > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Points Used</Text>
                    <Text style={styles.summaryValue}>{calculateTotalPointsUsed()} pts</Text>
                  </View>
                )}
                
                <View style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{calculateSubtotal()}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyCart}>
              <Ionicons name="remove-shopping-cart" size={60} color="#BBBBCC" />
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <TouchableOpacity 
                style={styles.shopButton}
                onPress={() => navigation.navigate('Shop')}
                disabled={loading}
              >
                <Text style={styles.shopButtonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <LinearGradient
            colors={['#FF2E63', '#FFAC41']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButton}
          >
            <TouchableOpacity 
              style={styles.checkoutButtonTouchable}
              onPress={() => navigation.navigate('Checkout', { 
                totalAmount: calculateSubtotal(),
                cartItems: cartItems,
                pointsUsed: calculateTotalPointsUsed()
              })}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
              <Text style={styles.checkoutButtonSubtext}>₹{calculateSubtotal()}</Text>
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
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FDFDFD',
    marginTop: 16,
    fontSize: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(187, 187, 204, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
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
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(187, 187, 204, 0.1)',
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFDFD',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAC41',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    color: '#FDFDFD',
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  summaryContainer: {
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FDFDFD',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(187, 187, 204, 0.1)',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FDFDFD',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAC41',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#BBBBCC',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#FF2E63',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: {
    color: '#FDFDFD',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutButtonTouchable: {
    width: '100%',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CartPage;