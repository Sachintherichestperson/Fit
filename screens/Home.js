/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const FitStreakApp = () => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [challengeStatus, setChallengeStatus] = useState({
    ChallengeExist: false,
    AssignedPresentChallenge: false,
    AssignedChallenge: false,
    SelfChallenge: false,
    skipornot: false,
    SkipEndDate: null,
    StartDate: null,      // Add these
    EndDate: null 
  });
  const [remainingTime, setRemainingTime] = useState('');

  const fetchChallengeStatus = async () => {
    try {
      const response = await fetch('http://192.168.105.177:3000/');
      const data = await response.json();
      setChallengeStatus(data);
    } catch (error) {
      console.error('Error fetching challenge status:', error);
    }
  };

  const updateRemainingTime = (skipEndDate) => {
    if (!skipEndDate) {
      setRemainingTime('Invalid Date');
      return;
    }

    const skipEndTimestamp = new Date(skipEndDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = skipEndTimestamp - currentTime;

    if (timeDiff <= 0) {
      setRemainingTime("Time's up!");
      return;
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setRemainingTime(`${hours}h ${minutes}m ${seconds}s left`);
  };

  useEffect(() => {
    fetchChallengeStatus();

    // Set up interval for countdown
    const timer = setInterval(() => {
      if (challengeStatus.skipornot && challengeStatus.SkipEndDate) {
        updateRemainingTime(challengeStatus.SkipEndDate);
      }
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, [challengeStatus.skipornot, challengeStatus.SkipEndDate]);


  const handleChallengeAction = () => {
    if(challengeStatus.skipornot){
      return;
    }else if (challengeStatus.ChallengeExist) {
      navigation.navigate('Skip-Page');
    } else if (challengeStatus.AssignedPresentChallenge) {
      navigation.navigate('ChallengeConfirmation');
    } else if (challengeStatus.AssignedChallenge) {
      navigation.navigate('Assigned');
    } else if (challengeStatus.SelfChallenge) {
      navigation.navigate('Assigned');
    } else {
      navigation.navigate('Challenges');
    }
  };
  // eslint-disable-next-line react/no-unstable-nested-components
  const SkipButton = () => {
    if(challengeStatus.skipornot){
      return (
        <TouchableOpacity style={styles.penaltyButton}>
            <MaterialCommunityIcons name="qrcode-scan" size={18} color="#FF2E63" />
            <Text style={styles.penaltyButtonText}>Workout is Skipped</Text>
          </TouchableOpacity>
      );
    }else{
      return (
      <TouchableOpacity style={styles.penaltyButton}>
            <MaterialCommunityIcons name="qrcode-scan" size={18} color="#FF2E63" />
            <Text style={styles.penaltyButtonText}>Click To Start</Text>
          </TouchableOpacity>
  );
  }
};

// eslint-disable-next-line react/no-unstable-nested-components
const SkipChallenge = () => {
  if(challengeStatus.skipornot){
    return (
      <TouchableOpacity style={styles.penaltyButton}>
          <MaterialCommunityIcons name="qrcode-scan" size={18} color="#FF2E63" />
          <Text style={styles.penaltyButtonText}>Workout is Skipped</Text>
        </TouchableOpacity>
    );
  }else{
    return (
    <TouchableOpacity style={styles.penaltyButton} onPress={() => navigation.navigate('SubmitProof')}>
          <Text style={styles.penaltyButtonText}>Submit Proof</Text>
        </TouchableOpacity>
);
}
};

  const getButtonContent = () => {
  if(challengeStatus.skipornot){
    return (
        <>
          <Ionicons name="warning-outline" size={20} color="#FF2E63" />
          <Text style={styles.emergencyButtonText}>Workout Skiped. {remainingTime}</Text>
        </>
    );
  }else if (challengeStatus.ChallengeExist) {
      return (
        <>
          <Ionicons name="warning-outline" size={20} color="#FF2E63" />
          <Text style={styles.emergencyButtonText}>Want To Skip Today? PAY ₹50 TO SKIP</Text>
        </>
      );
    } else if (challengeStatus.AssignedPresentChallenge) {
      return (
        <>
          <Ionicons name="flag-outline" size={20} color="#FF2E63" />
          <Text style={styles.emergencyButtonText}>CLEAR THE PAYMENT</Text>
        </>
      );
    } else if (challengeStatus.AssignedChallenge) {
      return (
        <>
          <Ionicons name="flag-outline" size={20} color="#FF2E63" />
          <Text style={styles.emergencyButtonText}>SELECT THE ASSIGNED CHALLENGES</Text>
        </>
      );
    } else if (challengeStatus.SelfChallenge) {
      return (
        <>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.emergencyButtonText}>YOUR SELF CHALLENGE IS ACTIVE</Text>
        </>
      );
    } else {
      return (
        <>
          <Ionicons name="flag-outline" size={20} color="#FF2E63" />
          <Text style={styles.emergencyButtonText}>SET THE CHALLENGE</Text>
        </>
      );
    }
  };

  useEffect(() => {
    fetchChallengeStatus();

    // Pulse animation
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

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Blink animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [blinkAnim, floatingAnim, pulseAnim]);

  const pulseShadow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const floatingTranslation = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const blinkOpacity = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

const calculateProgress = () => {
  if (!challengeStatus.StartDate || !challengeStatus.EndDate) {
    return {
      currentDay: 0,
      totalDays: 0,
      percentage: 0
    };
  }

  const start = new Date(challengeStatus.StartDate);
  const end = new Date(challengeStatus.EndDate);
  const now = new Date();

  // Calculate total days in challenge
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Calculate current day (minimum 1, maximum totalDays)
  const currentDay = Math.min(
    Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24))),
    totalDays
  );

  // Calculate percentage completed
  const percentage = Math.min(
    Math.max(0, ((now - start) / (end - start)) * 100),
    100
  );

  return {
    currentDay,
    totalDays,
    percentage: Math.round(percentage)
  };
};

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F0F1A']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Glow Effects */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>FITSTREAK</Text>
            <LinearGradient
              colors={['#FF2E63', '#FFAC41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoUnderline}
            />
          </View>

          <View style={styles.wallet}>
            <Ionicons name="wallet-outline" size={16} color="#FFAC41" />
            <Text style={styles.walletText}>₹2,400 locked</Text>
          </View>
        </View>

        <Animated.View
          style={[styles.progressSection, { shadowOpacity: 0.7, shadowRadius: pulseShadow, shadowColor: '#FF2E63' }]}>
          <View style={styles.progressTitle}>
            <Text style={styles.progressTitleText}>YOUR 90-DAY CHALLENGE</Text>
            <Text style={styles.progressTitleAmount}>₹5,000 at stake</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={['#FF2E63', '#FFAC41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${calculateProgress().percentage}%` }]}
            />
          </View>

          <View style={styles.progressDays}>
            <Text style={styles.dayText}>Day {calculateProgress().currentDay}</Text>
            <Text style={styles.dayText}>{calculateProgress().percentage}% completed</Text>
            <Text style={styles.dayText}>Day {calculateProgress().totalDays}</Text>
          </View>

          <TouchableOpacity style={styles.emergencyButton} onPress={handleChallengeAction}>
            {getButtonContent()}
          </TouchableOpacity>
        </Animated.View>

        {/* Pressure Zone */}
        <Text style={styles.sectionTitle}>Pressure Zone</Text>

        <View style={styles.pressureCard}>
          <Text style={styles.pressureTitle}>
             <Animated.Text style={[styles.liveCounter, { opacity: blinkOpacity }]}>Complete Your Challenge</Animated.Text>
          </Text>
          <Text style={styles.pressureSub}>Avoid ₹500 weekend penalty fee - Scan before midnight!</Text>
          <SkipChallenge/>
        </View>

        <Animated.View
          style={[
            styles.pressureCard,
            { transform: [{ translateY: floatingTranslation }] },
          ]}
        >
          <Text style={styles.pressureTitle}>
            LAST CHANCE: <Text style={styles.accentText}>3HRS 42MIN LEFT</Text>
          </Text>
          <Text style={styles.pressureSub}>Avoid ₹500 weekend penalty fee - Scan before midnight!</Text>
          <SkipButton/>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#FF2E63', '#FFAC41']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Stats')}>
          <Icon name="trophy" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Short-Challenges')}>
          <Icon name="calendar-check" size={20} color="#BBBBCC" />
          <Text style={[styles.navLabel]}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="home" size={20} color="#FF2E63" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shop')}>
          <Icon name="calendar-check" size={20} color="#BBBBCC" />
          <Text style={[styles.navLabel]}>Shop</Text>
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
  logo: {
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -1,
    color: 'white',
  },
  logoUnderline: {
    height: 3,
    width: '100%',
    marginTop: 2,
  },
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  walletText: {
    color: '#FDFDFD',
    fontSize: 14,
    marginLeft: 6,
  },
  progressSection: {
    backgroundColor: 'rgba(255,46,99,0.2)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  progressTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitleText: {
    color: '#FDFDFD',
    fontSize: 14,
    opacity: 0.9,
  },
  progressTitleAmount: {
    color: '#FFAC41',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayText: {
    color: '#FDFDFD',
    fontSize: 12,
    opacity: 0.8,
  },
  emergencyButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  emergencyButtonText: {
    color: '#FF2E63',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    marginVertical: 16,
    fontWeight: '700',
    color: '#FDFDFD',
  },
  pressureCard: {
    backgroundColor: 'rgba(30,30,46,0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.2)',
    overflow: 'hidden',
  },
  pressureTitle: {
    fontSize: 17,
    marginBottom: 8,
    fontWeight: '600',
    color: '#FDFDFD',
  },
  pressureSub: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    color: '#FDFDFD',
  },
  liveCounter: {
    color: '#FFAC41',
    fontWeight: '700',
  },
  accentText: {
    color: '#FFAC41',
  },
  penaltyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF2E63',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  penaltyButtonText: {
    color: '#FF2E63',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default FitStreakApp;
