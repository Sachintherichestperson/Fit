import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


const CompanyChallenges = ({ navigation }) => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const [Assignedchallenge, setAssignedchallenge] = useState({});


  const fetchChallengeStatus = async () => {
    try {
      const response = await fetch('http://192.168.244.177:3000/Automated-Challenge');
      const data = await response.json();
      setAssignedchallenge(data);
    } catch (error) {
      console.error('Error fetching challenge status:', error);
    }
  };

  useEffect(() => {
    fetchChallengeStatus();
  }, []);

  const fetchedChallenges = (Assignedchallenge?.challenges || []).map((item, index) => ({
    id: `fetched-${index}`,
    goal: item.goal,
    description: item.description,
    duration: item.duration ? `${item.duration} days` : 'N/A',
    completionRate: `${item.completionRate}`,
    participants: Number(item.participants),
    difficulty: item.difficulty,
    icon: 'flag',
    rewards: [
      { icon: 'medal', text: 'Earn a badge' },
      { icon: 'coins', text: 'Points upon completion' },
    ],
    Proof: item.Proof,
    Instruction: item.Instruction,
  }));



  // Sample challenges data
  const toggleChallenge = (id) => {
    if (expandedCard === id) {
      setExpandedCard(null);
    } else {
      setExpandedCard(id);
    }
  };

  const selectChallenge = async (challenge) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSelectedChallenge(challenge.id);

      const response = await fetch('http://192.168.244.177:3000/Challenge-Confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: challenge.goal,
          description: challenge.description,
          duration: challenge.duration,
          completionRate: challenge.completionRate,
          participants: challenge.participants,
          difficulty: challenge.difficulty,
          Proof: challenge.Proof,
          Instruction: challenge.Instruction,
        }),
      });

      const data = await response.json();

      if(response.ok){
        navigation.navigate('ChallengeConfirmation');
      }else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to select challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Glow Effects */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>FITSTREAK</Text>
          <TouchableOpacity style={styles.userProfile}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>JS</Text>
            </View>
            <View style={styles.userMenu}>
              <Text style={styles.userName}>John Smith</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Personalized Challenge</Text>
          <Text style={styles.subtitle}>Choose a challenge that fits your goals</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={14} color="#BBBBCC" />
            <Text style={styles.navBtnText}> Back</Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.completed]} />
            <View style={[styles.step, styles.active]} />
            <View style={styles.step} />
          </View>
        </View>

        {/* Challenges Section */}
        <View style={styles.companyChallenge}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="trophy" size={20} color="#FF2E63" />
            <Text style={styles.sectionTitle}> Company Challenge</Text>
          </View>

          <View style={styles.options}>
            {fetchedChallenges.map((challenge) => (
              <View
                key={challenge.id}
                style={[
                  styles.challengeCard,
                  expandedCard === challenge.id && styles.openCard,
                  selectedChallenge === challenge.id && styles.selectedCard,
                ]}
              >
                <TouchableOpacity
                  style={styles.challengeBtn}
                  onPress={() => toggleChallenge(challenge.id)}
                >
                  <View style={styles.challengeName}>
                    <View style={styles.challengeIcon}>
                      <FontAwesome5 name={challenge.icon} size={18} color="#FF2E63" />
                    </View>
                    <Text style={styles.challengeText}>{challenge.goal}</Text>
                  </View>
                </TouchableOpacity>

                {expandedCard === challenge.id && (
                  <View style={styles.challengeDetails}>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>

                    <View style={styles.challengeStats}>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{challenge.completionRate}</Text>
                        <Text style={styles.statLabel}>Completion Rate</Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{challenge.participants}</Text>
                        <Text style={styles.statLabel}>Participants</Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{challenge.difficulty}</Text>
                        <Text style={styles.statLabel}>Difficulty</Text>
                      </View>
                    </View>

                    <View style={styles.challengeRewards}>
                      {challenge.rewards.map((reward, index) => (
                        <View key={index} style={styles.rewardItem}>
                          <FontAwesome5 name={reward.icon} size={14} color="#FFAC41" />
                          <Text style={styles.rewardText}>{reward.text}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.btn,
                        styles.btnPrimary,
                        selectedChallenge === challenge.id && styles.selectedBtn,
                      ]}
                      onPress={() => selectChallenge(challenge)}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <FontAwesome5
                            name={selectedChallenge === challenge.id ? 'check-circle' : 'check'}
                            size={14}
                            color="white"
                          />
                          <Text style={styles.btnText}>
                            {selectedChallenge === challenge.id ? 'Selected' : 'Select'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoHeader}>
            <FontAwesome5 name="lightbulb" size={18} color="#FFAC41" />
            <Text style={styles.infoTitle}>Benefits of Company Challenges</Text>
          </View>

          <View style={styles.benefitsList}>
            {[
              'Enhance your fitness journey',
              'Earn extra rewards and recognition',
              'Improve your overall well-being',
              'Get Rewards On Completion',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <FontAwesome5 name="check-circle" size={14} color="#4CAF50" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navContainer}>
          {['home', 'trophy', 'calendar', 'user'].map((icon, index) => (
            <TouchableOpacity key={index} style={styles.navItem}>
              <FontAwesome5 name={icon} size={20} color="#BBBBCC" />
              <Text style={styles.navLabel}>
                {icon.charAt(0).toUpperCase() + icon.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    borderRadius: 300,
    zIndex: -1,
  },
  glow1: {
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255,46,99,0.3)',
  },
  glow2: {
    bottom: 200,
    left: -100,
    width: 350,
    height: 350,
    backgroundColor: 'rgba(255,172,65,0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  logo: {
    fontWeight: '800',
    fontSize: 28,
    backgroundImage: 'linear-gradient(45deg, #FF2E63, #FFAC41)',
    backgroundClip: 'text',
    textFillColor: 'transparent',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 46, 99, 0.4)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 15,
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
    backgroundColor: 'linear-gradient(45deg, #FF2E63, #FFAC41)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  userMenu: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 4,
  },
  navBtnText: {
    color: '#BBBBCC',
    fontSize: 14,
    marginLeft: 4,
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
  completed: {
    backgroundColor: '#4CAF50',
  },
  active: {
    backgroundColor: '#FF2E63',
  },
  companyChallenge: {
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333344',
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  options: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  openCard: {
    borderColor: '#FF2E63',
  },
  selectedCard: {
    borderColor: '#FF2E63',
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
  },
  challengeBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  challengeDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333344',
  },
  challengeDescription: {
    marginBottom: 16,
    color: '#BBBBCC',
    fontSize: 14,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  challengeRewards: {
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: '#FF2E63',
  },
  selectedBtn: {
    backgroundColor: '#4CAF50',
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  additionalInfo: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333344',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#BBBBCC',
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
  navLabel: {
    fontSize: 12,
    color: '#BBBBCC',
    fontWeight: '500',
  },
});

export default CompanyChallenges;
