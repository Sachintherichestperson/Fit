import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/MaterialIcons';

const OrderConfirmation = ({ navigation }) => {
  const route = useRoute();
  const { orderId, totalAmount, address } = route.params;
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#BBBBCC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Confirmed</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.successContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="check" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.orderId}>Order ID: #{orderId}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{address.fullName}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              {address.landmark && (
                <Text style={styles.addressText}>Near {address.landmark}</Text>
              )}
              <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.pincode}
              </Text>
              <Text style={styles.addressText}>Phone: {address.mobile}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Method</Text>
                <Text style={styles.paymentValue}>Cash on Delivery</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Amount</Text>
                <Text style={styles.paymentTotal}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Ionicons name="info" size={20} color="#FFAC41" />
            <Text style={styles.noteText}>
              Your order will be delivered within 3-5 business days. You'll receive a confirmation call shortly.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
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
    padding: 16,
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
    backgroundColor: '#FFAC41',
  },
  header: {
    flexDirection: 'row',
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
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderId: {
    fontSize: 16,
    color: '#BBBBCC',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 4,
  },
  paymentCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  paymentValue: {
    fontSize: 14,
    color: '#FDFDFD',
    fontWeight: '500',
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAC41',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(187, 187, 204, 0.1)',
    marginVertical: 12,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 172, 65, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#BBBBCC',
    marginLeft: 8,
    flex: 1,
  },
  continueButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF2E63',
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FDFDFD',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderConfirmation;