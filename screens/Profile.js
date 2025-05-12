import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ProfilePage = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileLevel, setProfileLevel] = useState(null);
  const [streakLevel, setStreakLevel] = useState(null);
  const [challengeNumber, setChallengeNumber] = useState(null);
  const [payment, setPayment] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.105.177:3000/Profile');
      const data = await response.json();

      if(response.ok) {
        setProfileData(data.user);
        setProfileLevel(data.Level);
        setStreakLevel(data.Streak);
        setPayment(data.Payment);
        setChallengeNumber(data.Number);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  // Mock user data
  const user = {
    name: profileData?.username || 'Loading...',
    email: profileData?.email || 'loading@example.com',
    streak: streakLevel || 0,
    // level: profileLevel || 1,
    totalChallenges: challengeNumber || 0,
    walletBalance: payment || 0,
    profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  const stats = [
    { icon: 'fire', label: 'Current Streak', value: loading ? '--' : `${streakLevel} days`, color: '#FF2E63' },
    { icon: 'trophy', label: 'Level', value: loading ? '--' : `${profileLevel}`, color: '#FFAC41' },
    { icon: 'flag-checkered', label: 'Challenge Participated', value: loading ? '--' : `${challengeNumber}`, color: '#4CAF50' },
    { icon: 'wallet', label: 'Balance', value: loading ? '--' : `₹${payment}`, color: '#2196F3' },
  ];

  let achievements = [];

  if (challengeNumber === 0) {
    achievements.push({
      icon: 'flame',
      title: 'Joined First Challenge',
      desc: 'Started The Beast Journey',
      unlocked: false
    });
  } else if (challengeNumber === 1) {
    achievements.push({
      icon: 'flame',
      title: 'Joined First Challenge',
      desc: 'Started The Beast Journey',
      unlocked: true
    });
  } else if (challengeNumber < 7) {
    achievements.push({
      icon: 'flame',
      title: 'Streak Maintained',
      desc: 'You Have a Good Streak Maintained',
      unlocked: true
    });
  } else if (challengeNumber >= 7) {
    achievements.push({
      icon: 'flame',
      title: '7-Day Streak',
      desc: 'Completed a week',
      unlocked: true
    });
  }

  // Skeleton component
  const SkeletonLoader = ({ width, height, style }) => (
    <View style={[styles.skeleton, { width, height }, style]} />
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Header Skeleton */}
        <View style={styles.header}>
          <SkeletonLoader width={24} height={24} style={styles.backButton} />
          <SkeletonLoader width={100} height={24} />
          <SkeletonLoader width={24} height={24} style={styles.settingsButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section Skeleton */}
          <View style={styles.profileSection}>
            <View style={styles.profilePicContainer}>
              <SkeletonLoader width={100} height={100} style={{ borderRadius: 50 }} />
            </View>

            <View style={styles.profileInfo}>
              <SkeletonLoader width={150} height={24} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={200} height={16} style={{ marginBottom: 16 }} />
            </View>

            <SkeletonLoader width={120} height={40} style={{ borderRadius: 20 }} />
          </View>

          {/* Stats Grid Skeleton */}
          <View style={styles.sectionTitleContainer}>
            <SkeletonLoader width={100} height={24} />
          </View>
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.statCard}>
                <SkeletonLoader width={36} height={36} style={{ borderRadius: 18, marginBottom: 12 }} />
                <SkeletonLoader width={100} height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader width={60} height={24} />
              </View>
            ))}
          </View>

          {/* Achievements Section Skeleton */}
          <View style={styles.sectionTitleContainer}>
            <SkeletonLoader width={120} height={24} />
            <SkeletonLoader width={60} height={24} />
          </View>
          <View style={styles.achievementsGrid}>
            {[1, 2].map((item) => (
              <View key={item} style={styles.achievementCard}>
                <SkeletonLoader width={44} height={44} style={{ borderRadius: 22, marginRight: 14 }} />
                <View style={styles.achievementText}>
                  <SkeletonLoader width={150} height={20} style={{ marginBottom: 4 }} />
                  <SkeletonLoader width={200} height={16} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Nav Skeleton */}
        <View style={styles.bottomNav}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.navItem}>
              <SkeletonLoader width={24} height={24} style={{ borderRadius: 12 }} />
              <SkeletonLoader width={40} height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FDFDFD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#FDFDFD" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profilePicContainer}>
            <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                <Icon name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <View style={[
                styles.achievementIconContainer,
                { backgroundColor: achievement.unlocked ? `${stats[index % stats.length].color}20` : 'rgba(255,255,255,0.1)' },
              ]}>
                <MaterialCommunityIcons
                  name={achievement.icon}
                  size={24}
                  color={achievement.unlocked ? stats[index % stats.length].color : 'rgba(255,255,255,0.3)'}
                />
              </View>
              <View style={styles.achievementText}>
                <Text style={[
                  styles.achievementTitle,
                  { color: achievement.unlocked ? '#FDFDFD' : 'rgba(255,255,255,0.5)' },
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              </View>
              {achievement.unlocked ? (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              ) : (
                <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.3)" />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Stats')}>
          <Icon name="trophy" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Short-Challenges')}>
          <Icon name="calendar-check" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shop')}>
          <Icon name="calendar-check" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => navigation.navigate('Profile')}>
          <Icon name="user" size={20} color="#FF2E63" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Profile</Text>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFDFD',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 46, 99, 0.5)',
  },
  profileLevelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  profileLevelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 4,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.5)',
  },
  editProfileButtonText: {
    color: '#FF2E63',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#FDFDFD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#FFAC41',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    width: width * 0.43,
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#BBBBCC',
    fontSize: 13,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementsGrid: {
    paddingHorizontal: 16,
    marginBottom: 88,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
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
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
});

export default ProfilePage;