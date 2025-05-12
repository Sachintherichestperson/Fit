/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ChallengeDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Map challenge image names to valid FontAwesome5 icons
  const getIconName = (image) => {
    const iconMap = {
      'dumbbell': 'dumbbell',
      'running': 'running',
      'sunrise': 'sun',
      'shoe-prints': 'shoe-prints',
      'tint': 'tint',
      'peace': 'peace',
      'heartbeat': 'heartbeat',
    };
    return iconMap[image] || 'dumbbell'; // Fallback to dumbbell if icon not found
  };

  // Sample instructions (since not provided in original challenge data)
  const instructions = [
    'Follow the challenge guidelines as outlined in the description.',
    'Use the app to track your progress daily.',
    'Submit proof of completion if required.',
  ];

  const handleJoin = async () => {
    const response = await fetch('http://192.168.244.177:3000/ShortChallenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge
      }),
    })

    if(response.ok){
      setIsJoined(true);
    }else{
      console.log(response);
    }
  }

  const [isJoined, setIsJoined] = useState(false);
  const [progress, setProgress] = useState(0);

  const IsUserIn = async () => {
   try{
    const response = await fetch(`http://192.168.244.177:3000/UserShortChallenge/${challenge.id}`);
    const data = await response.json();
    if(response.ok){
      setIsJoined(data.isInChallenge);
      setProgress(data.progress)
    }else{
      console.log(data);
    }
   }catch(err){
    console.log(err);
   }
  };
  

  useEffect(() => {
    IsUserIn();
  }, []);

  useEffect(() => {
    // Pulse animation for join button
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FDFDFD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{challenge.title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Challenge Info */}
        <View style={styles.challengeInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${challenge.color}20` }]}>
            <Icon name={getIconName(challenge.image)} size={30} color={challenge.color} />
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#BBBBCC" />
              <Text style={styles.statText}>{challenge.participants} joined</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#BBBBCC" />
              <Text style={styles.statText}>{challenge.timeLeft} left</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="signal-cellular-2" size={16} color="#BBBBCC" />
              <Text style={styles.statText}>{challenge.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <Text style={styles.sectionTitle}>Reward</Text>
          <LinearGradient
            colors={[challenge.color, `${challenge.color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rewardCard}
          >
            <Text style={styles.rewardAmount}>{challenge.reward}</Text>
            <Text style={styles.rewardLabel}>Prize for Completion</Text>
          </LinearGradient>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressStatus}>{isJoined ? 'In Progress' : 'Not Started'}</Text>
              <Text style={styles.progressPercentage}>{progress}% Complete</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={['#FF2E63', '#FFAC41']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Challenge Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>

          {/* Description Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailHeader}>Description</Text>
            <Text style={styles.detailText}>{challenge.description}</Text>
          </View>

          {/* Instructions Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailHeader}>Instructions</Text>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFAC41" />
                <Text style={styles.ruleText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Rules Card */}
          <View style={styles.detailCard}>
            <Text style={styles.detailHeader}>Rules</Text>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFAC41" />
              <Text style={styles.ruleText}>Complete the required activities as described</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFAC41" />
              <Text style={styles.ruleText}>Track progress through the app</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFAC41" />
              <Text style={styles.ruleText}>Meet the deadline to claim reward</Text>
            </View>
          </View>
        </View>

        {/* Join Button */}
        <Animated.View
          style={[
            styles.joinButtonContainer,
            { shadowRadius: pulseShadow, shadowColor: challenge.color }
          ]}
        >
          <TouchableOpacity style={styles.joinButton} onPress={!isJoined ? handleJoin : null } disabled={isJoined}>
            <LinearGradient
              colors={isJoined ? ['#4CAF50', '#388E3C'] : [challenge.color, `${challenge.color}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinButtonGradient}
            >
              <Text style={styles.joinButtonText}>{isJoined ? 'CHALLENGE JOINED' : 'JOIN CHALLENGE'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );

};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: '#FF2E63',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: -1,
    color: '#FDFDFD',
  },
  placeholder: {
    width: 24,
  },
  challengeInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#BBBBCC',
    marginLeft: 4,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  detailHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFDFD',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#BBBBCC',
    marginLeft: 8,
  },
  rewardSection: {
    marginBottom: 24,
  },
  rewardCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#FDFDFD',
    opacity: 0.8,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressStatus: {
    fontSize: 14,
    color: '#FFAC41',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  joinButtonContainer: {
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    elevation: 5,
  },
  joinButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FDFDFD',
  },
});

export default ChallengeDetails;