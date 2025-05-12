/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ChallengesPage = () => {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;

  // Challenge categories
  const [activeCategory, setActiveCategory] = useState('trending');
  const [challengeData, setChallengeData] = useState({
    trending: [],
    new: [],
    popular: [],
    ending: [],
  });
  const [loading, setLoading] = useState(true);

  // Map API data to our expected format
  const mapChallengeData = (apiData) => {
    return apiData.map(challenge => ({
      id: challenge._id,
      title: challenge.ChallengeName,
      description: challenge.ChallengeDes,
      reward: challenge.ChallengeReward,
      difficulty: challenge.ChallengeDifficulty,
      category: challenge.ChallengeCategory.toLowerCase(),
      period: challenge.ChallengePeriod,
      participants: Math.floor(Math.random() * 5000),
      timeLeft: calculateTimeLeft(challenge.ChallengeEndDate),
      image: getRandomIcon(challenge.ChallengeCategory),
      color: getRandomColor(challenge.ChallengeCategory),
    }));
  };

  // Helper function to calculate time left
  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) {return 'Ended';}

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {return `${days} days left`;}
    if (hours > 0) {return `${Math.round(hours)} hours left`;}
    return 'Less than an hour';
  };

  // Helper function to get random icon based on category
  const getRandomIcon = (category) => {
    const icons = {
      workout: ['dumbbell', 'running', 'heartbeat'],
      fitness: ['walking', 'shoe-prints', 'biking'],
      health: ['apple-alt', 'tint', 'bed'],
      other: ['star', 'trophy', 'award'],
    };

    if (category.toLowerCase().includes('workout')) {return icons.workout[Math.floor(Math.random() * icons.workout.length)];}
    if (category.toLowerCase().includes('fitness')) {return icons.fitness[Math.floor(Math.random() * icons.fitness.length)];}
    if (category.toLowerCase().includes('health')) {return icons.health[Math.floor(Math.random() * icons.health.length)];}
    return icons.other[Math.floor(Math.random() * icons.other.length)];
  };

  const getRandomColor = (category) => {
    const colors = {
      workout: ['#FF2E63', '#F44336', '#E91E63'],
      fitness: ['#FFAC41', '#FF5722', '#FF9800'],
      health: ['#4CAF50', '#8BC34A', '#00BCD4'],
      other: ['#9C27B0', '#673AB7', '#3F51B5'],
    };

    if (category.toLowerCase().includes('workout')) {return colors.workout[Math.floor(Math.random() * colors.workout.length)];}
    if (category.toLowerCase().includes('fitness')) {return colors.fitness[Math.floor(Math.random() * colors.fitness.length)];}
    if (category.toLowerCase().includes('health')) {return colors.health[Math.floor(Math.random() * colors.health.length)];}
    return colors.other[Math.floor(Math.random() * colors.other.length)];
  };

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.244.177:3000/ShortChallenge');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // Map the API data to our expected format
      const mappedData = mapChallengeData(data);

      // Categorize the challenges
      const categorized = {
        trending: [],
        new: [],
        popular: [],
        ending: [],
      };

      mappedData.forEach(challenge => {
        const apiCategory = challenge.category.toLowerCase();

        if (categorized.hasOwnProperty(apiCategory)) {
          categorized[apiCategory].push(challenge);
        } else {
          // Simple logic to distribute challenges to categories
          if (challenge.timeLeft.includes('hour') || challenge.timeLeft.includes('day') && parseInt(challenge.timeLeft) <= 2) {
            categorized.ending.push(challenge);
          } else if (challenge.participants > 3000) {
            categorized.popular.push(challenge);
          } else if (challenge.participants < 1000) {
            categorized.new.push(challenge);
          } else {
            categorized.trending.push(challenge);
          }
        }
      });
      setChallengeData(categorized);
    } catch (error) {
      console.error('Fetch error:', error);
      // Fallback to sample data if API fails
      setChallengeData({
        trending: [
          {
            id: 'fallback1',
            title: '7-Day Workout Streak',
            description: 'Complete any workout for 7 days straight',
            reward: '₹300',
            participants: 2451,
            timeLeft: '3 days',
            difficulty: 'Medium',
            period: '7',
            image: 'dumbbell',
            color: '#FF2E63',
          },
        ],
        new: [],
        popular: [],
        ending: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeData();
  }, []);

  const [WorkingChallenge, setActiveChallenge] = useState([]);
  const [ProgressBar, setProgressBar] = useState(0);
  const [DaysCompleted, SetDaysCompleted] = useState(0);


  const UserActiveChallenge = async () => {
    const request = await fetch('http://192.168.244.177:3000/UserActiveShortChallenge');
    const data = await request.json();
    setActiveChallenge(data.ShortActiveChallenge);
    setProgressBar(data.progress);
    SetDaysCompleted(data.daysInProgress);
  };

  useEffect(() => {
    UserActiveChallenge();
  }, []);

  const activeChallenge = () => {
    return WorkingChallenge.map((challenge) => ({
      id: challenge.challengeId._id,
      Name: challenge.challengeId.ChallengeName,
      Description: challenge.challengeId.ChallengeDes,
      Reward: challenge.challengeId.ChallengeReward,
      Difficulty: challenge.challengeId.ChallengeDifficulty,
      Period: challenge.challengeId.ChallengePeriod,
      progress: ProgressBar,
      DaysCompleted: DaysCompleted,
      BigDescription: challenge.challengeId.BigDescription,
      Proof: challenge.challengeId.Proof,
      Instruction: challenge.challengeId.Instruction
    }));
  };



  useEffect(() => {
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
  }, [pulseAnim, blinkAnim]);

  const pulseShadow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const blinkOpacity = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const renderChallengeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() => navigation.navigate('ChallengeDetails', { challenge: item })}
    >
      <View style={styles.challengeHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Icon name={item.image} size={20} color={item.color} />
        </View>
        <View style={[styles.difficultyBadge, {
          backgroundColor:
            item.difficulty === 'Easy' ? '#4CAF5020' :
            item.difficulty === 'Medium' ? '#FFAC4120' :
            '#FF2E6320',
        }]}>
          <Text style={[styles.difficultyText, {
            color:
              item.difficulty === 'Easy' ? '#4CAF50' :
              item.difficulty === 'Medium' ? '#FFAC41' :
              '#FF2E63',
          }]}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.challengeTitle}>{item.title}</Text>
      <Text style={styles.challengeDesc}>{item.description}</Text>

      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color="#BBBBCC" />
          <Text style={styles.statText}>{item.participants.toLocaleString()} joined</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#BBBBCC" />
          <Text style={styles.statText}>{item.timeLeft}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={14} color="#BBBBCC" />
          <Text style={styles.statText}>{item.period} days</Text>
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.rewardAmount}>{item.reward}</Text>
        </View>
        <LinearGradient
          colors={[item.color, item.color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.joinButton}
        >
          <Text style={styles.joinButtonText}>JOIN</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedChallenge = () => {
    // Find a challenge with most participants to feature
    const allChallenges = [
      ...challengeData.trending,
      ...challengeData.new,
      ...challengeData.popular,
      ...challengeData.ending,
    ];

    let featured = allChallenges.reduce((max, challenge) =>
      challenge.participants > (max?.participants || 0) ? challenge : max, null);

    // Fallback featured challenge if no data
    if (!featured) {
      featured = {
        id: 'featured-fallback',
        title: 'SUMMER SHRED CHALLENGE',
        description: '30 days of high-intensity workouts to get ready for summer',
        reward: '₹1,000',
        participants: 5243,
        timeLeft: '15 days',
        period: '30',
        color: '#FF2E63',
      };
    }

    return (
      <Animated.View
        style={[
          styles.featuredCard,
          { shadowOpacity: 0.7, shadowRadius: pulseShadow, shadowColor: '#FF2E63' },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 46, 99, 0.8)', 'rgba(255, 172, 65, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeader}>
              <Animated.Text style={[styles.featuredTitle, { opacity: blinkOpacity }]}>
                {featured.title}
              </Animated.Text>
              <Text style={styles.featuredParticipants}>
                {featured.participants.toLocaleString()} participants • {featured.period} days
              </Text>
            </View>

            <Text style={styles.featuredDesc}>{featured.description}</Text>

            <View style={styles.featuredFooter}>
              <View style={styles.featuredReward}>
                <Text style={styles.featuredRewardLabel}>Grand Prize</Text>
                <Text style={styles.featuredRewardAmount}>{featured.reward}</Text>
              </View>

              <TouchableOpacity
                style={styles.featuredButton}
                onPress={() => navigation.navigate('ChallengeDetails', { challenge: featured })}
              >
                <Text style={styles.featuredButtonText}>JOIN NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={[styles.container, styles.loadingContainer]}
      >
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </LinearGradient>
    );
  }

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
            <Text style={styles.headerTitle}>CHALLENGES</Text>
            <LinearGradient
              colors={['#FF2E63', '#FFAC41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerUnderline}
            />
          </View>

          <View style={styles.pointsContainer}>
            <Ionicons name="flash" size={16} color="#FFAC41" />
            <Text style={styles.pointsText}>2,400 pts</Text>
          </View>
        </View>

        {/* Featured Challenge */}
        {renderFeaturedChallenge()}

        {/* Challenge Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[styles.categoryButton, activeCategory === 'trending' && styles.activeCategoryButton]}
              onPress={() => setActiveCategory('trending')}
            >
              <Ionicons name="trending-up" size={16} color={activeCategory === 'trending' ? '#FF2E63' : '#BBBBCC'} />
              <Text style={[styles.categoryText, activeCategory === 'trending' && styles.activeCategoryText]}>Trending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryButton, activeCategory === 'new' && styles.activeCategoryButton]}
              onPress={() => setActiveCategory('new')}
            >
              <Ionicons name="star" size={16} color={activeCategory === 'new' ? '#FF2E63' : '#BBBBCC'} />
              <Text style={[styles.categoryText, activeCategory === 'new' && styles.activeCategoryText]}>New</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryButton, activeCategory === 'popular' && styles.activeCategoryButton]}
              onPress={() => setActiveCategory('popular')}
            >
              <Ionicons name="flame" size={16} color={activeCategory === 'popular' ? '#FF2E63' : '#BBBBCC'} />
              <Text style={[styles.categoryText, activeCategory === 'popular' && styles.activeCategoryText]}>Popular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryButton, activeCategory === 'ending' && styles.activeCategoryButton]}
              onPress={() => setActiveCategory('ending')}
            >
              <Ionicons name="alarm" size={16} color={activeCategory === 'ending' ? '#FF2E63' : '#BBBBCC'} />
              <Text style={[styles.categoryText, activeCategory === 'ending' && styles.activeCategoryText]}>Ending Soon</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Challenge List */}
        <View style={styles.challengesSection}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'trending' ? 'Trending Challenges' :
             activeCategory === 'new' ? 'New Challenges' :
             activeCategory === 'popular' ? 'Popular Challenges' : 'Ending Soon'}
          </Text>

          {challengeData[activeCategory].length > 0 ? (
            <FlatList
              data={challengeData[activeCategory]}
              renderItem={renderChallengeItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sad-outline" size={40} color="#BBBBCC" />
              <Text style={styles.emptyStateText}>No challenges found in this category</Text>
            </View>
          )}
        </View>

        {/* My Challenges Section */}
        <View style={styles.myChallengesSection}>
  <Text style={styles.sectionTitle}>My Active Challenges</Text>

  {activeChallenge().map((challenge, index) => (
    <View key={index} style={styles.myActiveChallenge}>
      <View style={styles.myActiveChallengeHeader}>
        <View style={styles.myActiveBadge}>
          <Text style={styles.myActiveBadgeText}>Day {challenge.DaysCompleted} of {challenge.Period}</Text>
        </View>
        <Text style={styles.myActiveProgress}>{challenge.progress}% Complete</Text>
      </View>

      <Text style={styles.myActiveTitle}>{challenge.Name}</Text>
      <Text style={styles.myActiveDesc}>{challenge.Description}</Text>

      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#FF2E63', '#FFAC41']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${challenge.progress}%` }]} // optionally make this dynamic
        />
      </View>

      <TouchableOpacity style={styles.checkInButton} onPress={() => navigation.navigate('ShortWorkoutConfirmation', { challenge })}>
        <Ionicons name="checkmark-circle" size={20} color="#FFAC41" />
        <Text style={styles.checkInText}>Check In Today</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Stats')}>
          <Icon name="trophy" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="calendar-check" size={20} color="#FF2E63" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shop')}>
          <Icon name="shopping-bag" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Shop</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(30, 30, 46, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  emptyStateText: {
    color: '#BBBBCC',
    marginTop: 16,
    textAlign: 'center',
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
  headerTitle: {
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -1,
    color: 'white',
  },
  headerUnderline: {
    height: 3,
    width: '100%',
    marginTop: 2,
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
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  featuredGradient: {
    borderRadius: 16,
  },
  featuredContent: {
    padding: 20,
  },
  featuredHeader: {
    marginBottom: 12,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredParticipants: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
  },
  featuredDesc: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredReward: {

  },
  featuredRewardLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 12,
  },
  featuredRewardAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuredButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  featuredButtonText: {
    color: '#FF2E63',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.2)',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  categoryText: {
    color: '#BBBBCC',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FF2E63',
  },
  challengesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '700',
    color: '#FDFDFD',
  },
  challengeCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 12,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#BBBBCC',
    marginLeft: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {

  },
  rewardLabel: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFAC41',
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  myChallengesSection: {
    marginBottom: 24,
  },
  myActiveChallenge: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  myActiveChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myActiveBadge: {
    backgroundColor: 'rgba(255, 46, 99, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  myActiveBadgeText: {
    color: '#FDFDFD',
    fontSize: 12,
    fontWeight: '600',
  },
  myActiveProgress: {
    color: '#FFAC41',
    fontSize: 14,
    fontWeight: '500',
  },
  myActiveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  myActiveDesc: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  checkInButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.3)',
  },
  checkInText: {
    color: '#FFAC41',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
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

export default ChallengesPage;
