import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import RegisterScreen from '../screens/Register';
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
          </>
        ) : (
          <Stack.Screen name="Register" component={RegisterScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
