import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const Checkout = ({ navigation }) => {
  const route = useRoute();
  const { totalAmount, cartItems, pointsUsed } = route.params;
  console.log(totalAmount, cartItems, pointsUsed);
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const handlePlaceOrder = async () => {
    // Validate all fields
    if (!address.fullName || !address.mobile || !address.street || 
        !address.city || !address.state || !address.pincode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(address.mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(address.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        totalAmount,
        items: cartItems,
        pointsUsed,
        shippingAddress: address,
        orderDate: new Date().toISOString(),
      };
      
      const response = await fetch('http://192.168.244.177:3000/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        navigation.navigate('OrderConfirmation', { 
          orderId: result.orderId,
          totalAmount,
          address
        });
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={address.fullName}
          onChangeText={(text) => setAddress({...address, fullName: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          value={address.mobile}
          onChangeText={(text) => setAddress({...address, mobile: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="House No, Building, Street"
          value={address.street}
          onChangeText={(text) => setAddress({...address, street: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Landmark (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nearby landmark"
          value={address.landmark}
          onChangeText={(text) => setAddress({...address, landmark: text})}
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={address.city}
            onChangeText={(text) => setAddress({...address, city: text})}
          />
        </View>
        
        <View style={[styles.inputContainer, {flex: 1}]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter state"
            value={address.state}
            onChangeText={(text) => setAddress({...address, state: text})}
          />
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pincode *</Text>
        <TextInput
          style={styles.input}
          placeholder="6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
          value={address.pincode}
          onChangeText={(text) => setAddress({...address, pincode: text})}
        />
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>FREE</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.placeOrderButton}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF2E63',
  },
  placeOrderButton: {
    backgroundColor: '#FF2E63',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Checkout;