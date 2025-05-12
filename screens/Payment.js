import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { challengeDetails } = route.params || {};
  
  // Default values if not passed
  const basePayment = challengeDetails?.basePayment || 2000;
  const processingFee = challengeDetails?.processingFee || 100;
  const duration = challengeDetails?.duration || 3;
  const totalPayment = basePayment + processingFee;
  const firstInstallment = Math.ceil(totalPayment / duration);

  const [selectedPlan, setSelectedPlan] = useState('one-time');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [installments, setInstallments] = useState([]);

  useEffect(() => {
    generateInstallments();
  }, [generateInstallments]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateInstallments = () => {
    const baseInstallment = Math.floor(totalPayment / duration);
    let remainder = totalPayment % duration;
    const today = new Date();
    const installmentsArray = [];

    for (let i = 0; i < duration; i++) {
      let amount = baseInstallment + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);
      const label = i === 0 ? 'Today' : dueDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      installmentsArray.push({ label, amount });
    }

    setInstallments(installmentsArray);
  };

  const handlePayment = async () => {
    if (!RazorpayCheckout) {
      Alert.alert('Error', 'Payment gateway not available');
      return;
    }
    
    const chargeAmount = selectedPlan === 'installment' ? firstInstallment : totalPayment;
    // const description = selectedPlan === 'installment' ? 'First Installment Payment' : 'Full One-Time Payment';
  
    // const options = {
    //   description,
    //   image: 'https://your-logo-url.png',
    //   currency: 'INR',
    //   key: 'rzp_test_HPAKSJHzTmYhop', // Replace with your live key in production
    //   amount: chargeAmount * 100,
    //   name: 'FitStreak',
    //   prefill: {
    //     email: 'user@example.com',
    //     contact: '9999999999',
    //     name: 'John Smith',
    //   },
    //   theme: { color: '#FF2E63' },
    // };
    try {
      const response = await fetch('http://192.168.244.177:3000/Payment-Challenge-Confirmed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPaid: chargeAmount,
        }),
      });
  
      // Optionally handle the response from your backend here
      const responseData = await response.json();
      console.log(responseData);
  
      if (response.ok) {
        navigation.navigate('Home');
      }else{
        Alert.alert('Error', responseData.message || 'Something went wrong');
      }
  
    } catch (error) {
      // Handle payment failure or cancellation
      console.log(error);
      Alert.alert('Payment Failed', error.description || 'Payment was cancelled');
    }
  };
  

  const renderPaymentMethod = (method, icon, name, description) => (
    <TouchableOpacity
      style={[
        styles.methodOption,
        selectedMethod === method && styles.methodOptionActive,
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.methodIcon}>
        <Icon name={icon} size={20} color="#FFAC41" />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodName}>{name}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </View>
      <View style={styles.methodRadio}>
        {selectedMethod === method && <View style={styles.methodRadioSelected} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F0F1A']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#FF2E63', '#FFAC41']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.logo}>FITSTREAK</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.userProfile}>
            <LinearGradient
              colors={['#FF2E63', '#FFAC41']}
              style={styles.userAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.userAvatarText}>JS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Complete Your Payment</Text>
          <Text style={styles.subtitle}>Secure payment for your challenge</Text>
        </View>

        <View style={styles.progressContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="#BBBBCC" />
            <Text style={styles.navButtonText}> Back</Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.stepCompleted]} />
            <View style={[styles.step, styles.stepCompleted]} />
            <View style={[styles.step, styles.stepActive]} />
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentHeading}>Payment Details</Text>

          <View style={styles.selectedChallenge}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Icon name="dumbbell" size={18} color="#FF2E63" />
              </View>
              <Text style={styles.challengeTitle}>Hardcore Workout</Text>
            </View>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPlan === 'one-time' && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPlan('one-time')}
              >
                <Text style={styles.paymentOptionTitle}>Pay Full Amount</Text>
                <Text style={styles.paymentOptionSubtitle}>One-time payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPlan === 'installment' && styles.paymentOptionActive,
                ]}
                onPress={() => setSelectedPlan('installment')}
              >
                <Text style={styles.paymentOptionTitle}>Pay in Installments</Text>
                <Text style={styles.paymentOptionSubtitle}>{duration} monthly payments</Text>
              </TouchableOpacity>
            </View>

            {selectedPlan === 'one-time' ? (
              <View style={styles.paymentSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Challenge Fee</Text>
                  <Text style={styles.summaryValue}>₹{basePayment}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Processing Fee</Text>
                  <Text style={styles.summaryValue}>₹{processingFee}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={[styles.summaryValue, { color: '#FFAC41' }]}>₹{totalPayment}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.installmentPlan}>
                <View style={styles.installmentTitle}>
                  <Icon name="calendar-alt" size={16} color="#FFAC41" />
                  <Text style={styles.installmentTitleText}>Installment Plan ({duration} payments)</Text>
                </View>
                {installments.map((item, index) => (
                  <View key={index} style={styles.installmentItem}>
                    <Text>{item.label}</Text>
                    <Text style={styles.amount}>₹{item.amount}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethodsTitle}>
              <Icon name="credit-card" size={16} color="#FFAC41" />
              <Text style={styles.paymentMethodsTitleText}>Payment Method</Text>
            </View>

            <View style={styles.methodOptions}>
              {renderPaymentMethod('upi', 'mobile-alt', 'UPI Payment', 'Pay instantly using any UPI app')}
              {renderPaymentMethod('card', 'credit-card', 'Credit/Debit Card', 'Visa, Mastercard, Rupay, etc.')}
              {renderPaymentMethod('netbanking', 'university', 'Net Banking', 'All major Indian banks')}
              {renderPaymentMethod('wallet', 'wallet', 'Wallet', 'Paytm, PhonePe, etc.')}
            </View>
          </View>

          <View style={styles.termsCheckbox}>
            <TouchableOpacity
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              {termsAccepted && <Icon name="check" size={12} color="white" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => Linking.openURL('https://your-terms-url')}>
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={() => Linking.openURL('https://your-refund-policy-url')}>
                Refund Policy
              </Text>
              . I understand that my payment will be forfeited if I fail to complete the challenge.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, !termsAccepted && styles.actionButtonDisabled]}
            onPress={handlePayment}
            disabled={!termsAccepted}
          >
            <Icon name="lock" size={16} color="white" />
            <Text style={styles.actionButtonText}>
              Pay ₹{selectedPlan === 'installment' ? firstInstallment : totalPayment} Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoGradient: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  logo: {
    fontWeight: '800',
    fontSize: 24,
    color: 'transparent',
    backgroundColor: 'transparent',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  userAvatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBBBCC',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  navButtonText: {
    color: '#BBBBCC',
    fontSize: 14,
  },
  stepIndicator: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  step: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginHorizontal: 6,
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stepActive: {
    backgroundColor: '#FF2E63',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  paymentCard: {
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333344',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    marginBottom: 30,
  },
  paymentHeading: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
  },
  selectedChallenge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF2E63',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  paymentOptions: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  paymentOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: '#FF2E63',
  },
  paymentOptionTitle: {
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  paymentSummary: {
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333344',
  },
  summaryLabel: {
    color: '#BBBBCC',
  },
  summaryValue: {
    fontWeight: '500',
    color: 'white',
  },
  installmentPlan: {
    backgroundColor: 'rgba(255, 172, 65, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  installmentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  installmentTitleText: {
    fontWeight: '600',
    color: 'white',
  },
  installmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333344',
  },
  amount: {
    fontWeight: '600',
    color: '#9c9c9c',
  },
  paymentMethods: {
    marginBottom: 30,
  },
  paymentMethodsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodsTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  methodOptions: {
    gap: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodOptionActive: {
    borderColor: '#FF2E63',
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333344',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  methodRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF2E63',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333344',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FF2E63',
    borderColor: '#FF2E63',
  },
  termsText: {
    fontSize: 14,
    color: '#BBBBCC',
    flex: 1,
  },
  termsLink: {
    color: '#FFAC41',
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FF2E63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 46, 99, 0.5)',
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
  },
  navLabel: {
    fontSize: 12,
    color: '#BBBBCC',
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelActive: {
    color: 'white',
  },
});

export default PaymentScreen;