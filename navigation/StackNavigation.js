import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignedScreen from '../screens/Assigned-Page';
import HomeScreen from '../screens/Home';
import Challenges from '../screens/Challenges';
import RegisterScreen from '../screens/Register';
import ChallengeConfirmationScreen from '../screens/ChallengeConfirmation';
import PaymentScreen from '../screens/Payment';
import SkipPage from '../screens/Skip-Page';
import ProfileScreen from '../screens/Profile';
import StatsScreen from '../screens/Stats';
import ChallengeDetailsScreen from '../screens/ChallengeDetailsPage';
import ShortChallengesScreen from '../screens/Short-Challenges';
import ShopScreen from '../screens/ShopScreen';
import ProductPage from '../screens/Product-Page';
import CartScreen from '../screens/AddToCart';
import SubmitProof from '../screens/SubmitProof';
import CheckoutPage from '../screens/Checkout';
import OrderConfirmation from '../screens/OrderConfirmation';
import ShortWorkoutConfirmation from '../screens/ShortWorkoutConfirmation';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const response = await fetch('http://192.168.105.177:3000/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial check
    checkAuthState();

    // Set up interval to periodically check auth state
    const interval = setInterval(checkAuthState, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Challenges" component={Challenges} />
            <Stack.Screen name="Assigned" component={AssignedScreen} />
            <Stack.Screen name="ChallengeConfirmation" component={ChallengeConfirmationScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Skip-Page" component={SkipPage} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Short-Challenges" component={ShortChallengesScreen} />
            <Stack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="ProductDetails" component={ProductPage} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="ShortWorkoutConfirmation" component={ShortWorkoutConfirmation} />
            <Stack.Screen name="Checkout" component={CheckoutPage} />
            <Stack.Screen name="SubmitProof" component={SubmitProof} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
          </>
        ) : (
          <Stack.Screen name="Register" component={RegisterScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
