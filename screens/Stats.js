import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

const FitStreakDashboard = ({ navigation }) => {
  // Animation values
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate the progress ring
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [314, 219.8], // 70% of 314 (2πr)
  });

  const [userStats, setuserStats] = useState({
    Stack: null,
    StartDate: null,
    EndDate: null,
  });
  console.log(userStats.Stack);

  const fetchChallengeStatus = async () => {
    try {
      const response = await fetch('http://192.168.244.177:3000/Stats');
      const data = await response.json();
      setuserStats(data);
    } catch (error) {
      console.error('Error fetching challenge status:', error);
    }
  };

   useEffect(() => {
      fetchChallengeStatus();
    }, []);

    const calculateProgress = () => {
      if (!userStats.StartDate || !userStats.EndDate) {
        return {
          daysCompleted: 0,
          daysRemaining: 0,
        };
      }
    
      const start = new Date(userStats.StartDate);
      const end = new Date(userStats.EndDate);
      const now = new Date();
    
      // Calculate total days in challenge
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
      // Calculate current day (minimum 1, maximum totalDays)
      const currentDay = Math.min(
        Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24))),
        totalDays
      );
    
      // Calculate days completed and days remaining
      const daysCompleted = currentDay;
      const daysRemaining = totalDays - daysCompleted;
    
      return {
        daysCompleted,
        daysRemaining,
      };
    };
    
    useEffect(() => {
      const progress = calculateProgress();
      console.log(progress); // For debugging purposes
    }, []);
    

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
          <LinearGradient
            colors={['#FF2E63', '#FFAC41']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logo}>FITSTREAK</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#FF2E63', '#FFAC41']}
            style={styles.profile}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.profileText}>S</Text>
          </LinearGradient>
        </View>

        {/* Stats Hero */}
        <LinearGradient
          colors={['rgba(255,46,99,0.2)', 'rgba(255,172,65,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsHero}
        >
          <View style={styles.statsTitleContainer}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#FF2E63" />
            <Text style={styles.statsTitle}> STEPS DASHBOARD</Text>
          </View>
          <Text style={styles.statsSubtitle}>Your This Week Steps Count</Text>

          {/* Progress Ring */}
          <View style={styles.progressRingContainer}>
            <View style={styles.progressRing}>
              <View style={styles.progressRingBg} />
              <Animated.View
                style={[
                  styles.progressRingFill,
                  { transform: [{ rotate: '-90deg' }] },
                  { strokeDashoffset },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>70%</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard value={`₹ ${userStats.Stack}`} label="At Stake" />
          <StatCard value={calculateProgress().daysCompleted} label="Days Completed" />
          <StatCard value={calculateProgress().daysRemaining} label="Days Remaining" />
          <StatCard value="#89" label="Gym Rank" />
        </View>

        {/* Financial Impact */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="attach-money" size={20} color="#FF2E63" />
          <Text style={styles.sectionTitle}> FINANCIAL IMPACT</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard value="+1,200 Coins" label="Got This Month" positive />
          <StatCard value="-₹500" label="Penalties Paid" negative />
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="history" size={20} color="#FF2E63" />
          <Text style={styles.sectionTitle}> RECENT ACTIVITY</Text>
        </View>

        <View style={styles.activityContainer}>
          <ActivityItem
            icon="check"
            title="Workout Verified"
            amount="+100 Coins"
            time="Today, 7:30 PM"
            positive
          />
          <ActivityItem
            icon="close"
            title="Missed Session"
            amount="-₹200"
            time="Yesterday, 6:00 PM"
            negative
          />
          <ActivityItem
            icon="discount"
            title="Micro Challenge Completed"
            amount="+50 Coins"
            time="Yesterday, 2:30 PM"
            positive
          />
          <ActivityItem
            icon="warning"
            title="Late Check-in Penalty"
            amount="-₹100"
            time="2 days ago"
            negative
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
                    <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => navigation.navigate('Stats')}>
                      <Icon name="trophy" size={20} color="#FF2E63" />
                      <Text style={[styles.navLabel, styles.activeNavLabel]}>Stats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Short-Challenges')}>
                      <Icon name="calendar-check" size={20} color="#BBBBCC" />
                      <Text style={[styles.navLabel]}>Challenges</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                      <Icon name="home" size={20} color="#BBBBCC" />
                      <Text style={[styles.navLabel ]}>Home</Text>
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

const StatCard = ({ value, label, positive, negative }) => (
  <TouchableOpacity
    style={styles.statCard}
    activeOpacity={0.8}
  >
    <Text style={[
      styles.statValue,
      positive && styles.positive,
      negative && styles.negative,
    ]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ icon, title, amount, time, positive, negative }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIcon}>
      {icon === 'check' && <MaterialIcons name="check" size={20} color="#FF2E63" />}
      {icon === 'close' && <MaterialIcons name="close" size={20} color="#FF2E63" />}
      {icon === 'discount' && <MaterialIcons name="discount" size={20} color="#FF2E63" />}
      {icon === 'warning' && <MaterialIcons name="warning" size={20} color="#FF2E63" />}
    </View>
    <View style={styles.activityDetails}>
      <Text style={styles.activityTitle}>
        {title} <Text style={[
          styles.activityAmount,
          positive && styles.positive,
          negative && styles.negative,
        ]}>
          {amount}
        </Text>
      </Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);



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
  },
  glow1: {
    top: -50,
    right: -50,
    backgroundColor: 'rgba(255,46,99,0.3)',
  },
  glow2: {
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255,46,99,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoGradient: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  logo: {
    fontWeight: '800',
    fontSize: 28,
    color: 'transparent',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsHero: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.2)',
    overflow: 'hidden',
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FDFDFD',
  },
  statsSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    color: '#FDFDFD',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressRing: {
    width: 120,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingBg: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressRingFill: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#FF2E63',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressPercent: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '700',
    color: '#FF2E63',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#FDFDFD',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#FDFDFD',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#FF2E63',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FDFDFD',
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FDFDFD',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
    color: '#FDFDFD',
  },
  activityAmount: {
    fontWeight: '700',
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

export default FitStreakDashboard;
