import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';

const FitQuestApp = () => {
  const [activeTab, setActiveTab] = useState('steps');
  const [activeMetric, setActiveMetric] = useState('steps');
  const [showAd, setShowAd] = useState(true);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartData = {
    steps: [5200, 7800, 6500, 8100, 9300, 10500, 8700],
    calories: [800, 1200, 1000, 1400, 1600, 1800, 1500],
    bpm: [68, 72, 70, 75, 71, 73, 69],
  };

  const trendData = {
    steps: {
      trend: 'up',
      text: 'You improved by 12% this week!',
    },
    calories: {
      trend: 'up',
      text: 'You burned 18% more calories!',
    },
    bpm: {
      trend: 'neutral',
      text: 'Your heart rate is stable',
    },
  };

  const challenges = [
    { id: '1', title: '30-Day Plank', description: 'Win Elite Membership', progress: '12/30', color: ['#8A2BE2', '#FF00FF'] },
    { id: '2', title: '100 Pushups', description: 'Earn 500 points', progress: '63/100', color: ['#FF8C00', '#FFD700'] },
    { id: '3', title: '5K Steps Daily', description: 'Get FitQuest merch', progress: '3/7', color: ['#00CED1', '#00FA9A'] },
    { id: '4', title: 'Hydration Week', description: 'Discount on gear', progress: '4/7', color: ['#FF1493', '#FF6347'] },
  ];

  const exercises = [
    { id: '1', name: 'Push-ups', sets: '3x12', icon: 'hand-paper-o' },
    { id: '2', name: 'Squats', sets: '3x15', icon: 'user-o' },
    { id: '3', name: 'Plank', sets: '3x30s', icon: 'clock-o' },
    { id: '4', name: 'Lunges', sets: '3x10', icon: 'arrow-up' },
  ];

  const blogs = [
    {
      id: '1',
      title: '5 Essential Exercises for Beginners',
      excerpt: 'Start your fitness journey with these fundamental moves that build strength and endurance...',
      category: 'Training',
      author: 'By FitQuest Team',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '2',
      title: 'Pre-Workout Nutrition: What to Eat',
      excerpt: 'Optimize your performance with these scientifically-backed pre-workout meal ideas...',
      category: 'Nutrition',
      author: 'By Dr. Sarah Chen',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveMetric(tab);
    updateTrendIndicator(tab);
  };

  const updateTrendIndicator = (tab) => {
    // This would update the UI based on the trend data
    // Implemented directly in the render method
  };

  const renderMetricIcon = (metric) => {
    switch(metric) {
      case 'steps':
        return <Icon name="walking" size={12} color="#00A8FF" />;
      case 'calories':
        return <Icon name="fire" size={12} color="#00A8FF" />;
      case 'bpm':
        return <Icon name="heartbeat" size={12} color="#00A8FF" />;
      default:
        return null;
    }
  };

  const renderTrendIcon = () => {
    const trend = trendData[activeTab].trend;

    if (trend === 'up') {
      return <Icon name="arrow-up" size={12} color="#00FF9D" style={styles.trendIcon} />;
    } else if (trend === 'down') {
      return <Icon name="arrow-down" size={12} color="#FF6B6B" style={styles.trendIcon} />;
    } else {
      return <Icon name="equals" size={12} color="#aaa" style={styles.trendIcon} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, Sachin!</Text>
          </View>
          <View style={styles.profileAvatar}>
            <Icon name="user" size={20} color="#ccc" />
          </View>
        </View>

        {/* Health Metrics Section */}
        <View style={styles.healthMetrics}>
          {['steps', 'calories', 'bpm'].map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricCard,
                activeMetric === metric && styles.metricCardActive,
              ]}
              onPress={() => handleTabChange(metric)}
            >
              <View style={styles.metricIcon}>
                {renderMetricIcon(metric)}
              </View>
              <Text style={styles.metricValue}>
                {metric === 'steps' ? '8,542' :
                 metric === 'calories' ? '1,248' : '72'}
              </Text>
              <Text style={styles.metricLabel}>
                {metric === 'steps' ? 'Steps' :
                 metric === 'calories' ? 'Calories' : 'Avg BPM'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Graph Container */}
        <View style={styles.healthGraphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>Weekly Activity</Text>
            <Text style={styles.graphTime}>Last 7 Days</Text>
          </View>

          <View style={styles.graphTabs}>
            {['steps', 'calories', 'bpm'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.graphTab,
                  activeTab === tab && styles.graphTabActive,
                ]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={activeTab === tab ? styles.graphTabTextActive : styles.graphTabText}>
                  {tab === 'steps' ? 'Steps' :
                   tab === 'calories' ? 'Calories' : 'Heart Rate'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.graphContent}>
            <LineChart
              data={{
                labels: days,
                datasets: [
                  {
                    data: chartData[activeTab],
                    color: (opacity = 1) => {
                      return activeTab === 'steps' ? '#00FF9D' :
                             activeTab === 'calories' ? '#00A8FF' : '#FF6B6B';
                    },
                    strokeWidth: 2,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 70}
              height={200}
              withVerticalLines={false}
              withHorizontalLines={true}
              chartConfig={{
                backgroundColor: '#1E1E1E',
                backgroundGradientFrom: '#1E1E1E',
                backgroundGradientTo: '#1E1E1E',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#fff',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.trendIndicator}>
            {renderTrendIcon()}
            <Text style={styles.trendText}>{trendData[activeTab].text}</Text>
          </View>
        </View>

        {/* Featured Challenge Card */}
        <View style={styles.featuredChallenge}>
          <Text style={styles.featuredChallengeTitle}>ON: Run 5km in 2 Days</Text>
          <Text style={styles.featuredChallengeSubtitle}>Get 50% off on Protein Powder</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressText}>
              <Text style={styles.progressTextLeft}>200 participants</Text>
              <Text style={styles.progressTextRight}>250 needed</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join Now</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Section */}
        {showAd && (
          <View style={styles.adSection}>
            <View style={styles.adHeader}>
              <Text style={styles.adLabel}>Sponsored</Text>
              <TouchableOpacity onPress={() => setShowAd(false)}>
                <Icon name="times" size={14} color="#777" />
              </TouchableOpacity>
            </View>
            <View style={styles.adContent}>
              <Text style={styles.adTitle}>TRY OUR NEW PROTEIN BAR</Text>
              <Text style={styles.adText}>30g protein, zero sugar, delicious taste</Text>
              <TouchableOpacity style={styles.adBtn}>
                <Text style={styles.adBtnText}>Learn More</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.adReward}>
              <Icon name="coins" size={11} color="#00FF9D" />
              <Text style={styles.adRewardText}>Earn 10 FitCoins by watching this ad</Text>
            </View>
          </View>
        )}

        {/* Active Challenges Section */}
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <FlatList
          horizontal
          data={challenges}
          renderItem={({ item }) => (
            <View style={[styles.challengeCard, {
              backgroundColor: item.color[0],
              backgroundGradientFrom: item.color[0],
              backgroundGradientTo: item.color[1],
            }]}>
              <View>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.challengeDescription}>{item.description}</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>{item.progress}</Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.challengesScroll}
          showsHorizontalScrollIndicator={false}
        />

        {/* Daily Workout Suggestion */}
        <View style={styles.workoutSuggestion}>
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutTitle}>Daily Workout</Text>
            <View style={styles.workoutTime}>
              <Text style={styles.workoutTimeText}>20 MIN</Text>
            </View>
          </View>

          <FlatList
            horizontal
            data={exercises}
            renderItem={({ item }) => (
              <View style={styles.exercise}>
                <View style={styles.exerciseIcon}>
                  <Icon name={item.icon} size={16} color="#121212" />
                </View>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseSets}>{item.sets}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.workoutExercises}
            showsHorizontalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.startWorkout}>
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Blog Section */}
        <Text style={styles.sectionTitle}>Fitness Articles</Text>
        <FlatList
          data={blogs}
          renderItem={({ item }) => (
            <View style={styles.blogCard}>
              <View style={styles.blogImage}>
                <Image source={{ uri: item.image }} style={styles.blogImage} />
                <View style={styles.blogCategory}>
                  <Text style={styles.blogCategoryText}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.blogContent}>
                <Text style={styles.blogTitle}>{item.title}</Text>
                <Text style={styles.blogExcerpt}>{item.excerpt}</Text>
                <View style={styles.blogMeta}>
                  <Text style={styles.blogMetaText}>{item.author}</Text>
                  <Text style={styles.blogMetaText}>{item.readTime}</Text>
                </View>
                <Text style={styles.readMore}>Read More →</Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.blogSection}
        />
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        {['home', 'trophy', 'shopping-bag', 'dumbbell', 'user'].map((icon, index) => (
          <TouchableOpacity key={icon} style={styles.navItem}>
            <Icon
              name={icon}
              size={20}
              color={index === 0 ? '#00A8FF' : '#aaa'}
              style={styles.navIcon}
            />
            <Text style={[
              styles.navText,
              index === 0 && styles.navTextActive,
            ]}>
              {icon === 'home' ? 'Home' :
               icon === 'trophy' ? 'Challenges' :
               icon === 'shopping-bag' ? 'Store' :
               icon === 'dumbbell' ? 'GYM' : 'Profile'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingBottom: 70, // Space for nav bar
  },
  scrollView: {
    flex: 1,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  profileAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#00FF9D',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Health Metrics
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  metricCardActive: {
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 2,
    borderBottomColor: '#00FF9D',
  },
  metricIcon: {
    width: 25,
    height: 25,
    backgroundColor: '#333',
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FF9D',
    marginVertical: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Health Graph
  healthGraphContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  graphTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  graphTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  graphTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 15,
  },
  graphTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  graphTabActive: {
    borderBottomColor: '#00A8FF',
  },
  graphTabText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  graphTabTextActive: {
    fontSize: 13,
    color: '#00A8FF',
  },
  graphContent: {
    height: 200,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  trendIcon: {
    marginRight: 5,
  },
  trendText: {
    fontSize: 12,
    color: 'white',
  },
  // Featured Challenge
  featuredChallenge: {
    backgroundColor: '#0066FF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  featuredChallengeTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: '700',
    marginBottom: 5,
  },
  featuredChallengeSubtitle: {
    color: '#00FF9D',
    fontWeight: '500',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressTextLeft: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressTextRight: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF9D',
    borderRadius: 3,
  },
  joinBtn: {
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
  },
  joinBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  // Ad Section
  adSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#444',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adLabel: {
    fontSize: 12,
    color: '#00A8FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adContent: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  adTitle: {
    fontSize: 16,
    color: '#00FF9D',
    marginBottom: 5,
    fontWeight: '700',
  },
  adText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  adBtn: {
    backgroundColor: '#00A8FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  adBtnText: {
    color: '#121212',
    fontWeight: '600',
    fontSize: 12,
  },
  adReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adRewardText: {
    fontSize: 11,
    color: '#00FF9D',
    marginLeft: 5,
  },
  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Challenges
  challengesScroll: {
    paddingBottom: 10,
    marginBottom: 20,
  },
  challengeCard: {
    width: 150,
    height: 180,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    justifyContent: 'space-between',
  },
  challengeTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  progressCircleText: {
    fontWeight: '700',
    fontSize: 14,
    color: 'white',
  },
  // Workout Suggestion
  workoutSuggestion: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  workoutTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  workoutTime: {
    backgroundColor: '#00A8FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  workoutTimeText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '600',
  },
  workoutExercises: {
    paddingBottom: 10,
  },
  exercise: {
    width: 120,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#00FF9D',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'center',
  },
  exerciseSets: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  startWorkout: {
    backgroundColor: '#00A8FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  startWorkoutText: {
    color: '#121212',
    fontWeight: '700',
  },
  // Blog Section
  blogSection: {
    paddingBottom: 15,
  },
  blogCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  blogImage: {
    height: 120,
    backgroundColor: '#333',
  },
  blogCategory: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#00A8FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15,
  },
  blogCategoryText: {
    color: '#121212',
    fontSize: 10,
    fontWeight: '600',
  },
  blogContent: {
    padding: 15,
  },
  blogTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 18,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blogMetaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  readMore: {
    color: '#00A8FF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  // Navigation Bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    color: '#aaa',
  },
  navTextActive: {
    color: '#00A8FF',
  },
});

export default FitQuestApp;
