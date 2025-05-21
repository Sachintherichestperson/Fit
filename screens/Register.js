import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    Mobile: '',
    password: '',
    referredBy: ''
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!form.username || !form.email || !form.Mobile || !form.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Send the POST request to register the user
      const response = await fetch('http://192.168.105.177:3000/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <Text style={styles.label}>Username*</Text>
      <TextInput
        placeholder="Enter your username"
        placeholderTextColor="#999"
        style={styles.input}
        value={form.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      
      <Text style={styles.label}>Email*</Text>
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#999"
        style={styles.input}
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Text style={styles.label}>Mobile Number*</Text>
      <TextInput
        placeholder="Enter your mobile number"
        placeholderTextColor="#999"
        style={styles.input}
        value={form.Mobile}
        onChangeText={(text) => handleChange('Mobile', text)}
        keyboardType="phone-pad"
      />
      
      <Text style={styles.label}>Password*</Text>
      <TextInput
        placeholder="Create a password"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      
      <Text style={styles.label}>Referred By (Optional)</Text>
      <TextInput
        placeholder="Referral code if any"
        placeholderTextColor="#999"
        style={styles.input}
        value={form.referredBy}
        onChangeText={(text) => handleChange('referredBy', text)}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#aaa',
  },
  loginLink: {
    color: '#4A80F0',
    fontWeight: 'bold',
  },
});