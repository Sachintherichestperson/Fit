import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ConfettiCannon from 'react-native-confetti-cannon';

const ChallengeConfirmationScreen = ({ navigation }) => {

  const confettiRef = useRef(null);
  const [ SelectedChallenge, SetSelectedChallenge ] = React.useState({});
  const FetchData = async () => {
    try {
      const response = await fetch('http://192.168.105.177:3000/challenge-confirmation-page');
      const data = await response.json();
      SetSelectedChallenge(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  };

  useEffect(() => {
      FetchData();
    }, []);
    useEffect(() => {
      const timer = setTimeout(() => {
        fireConfetti();
      }, 500);
      return () => clearTimeout(timer);
    }, []);

    if (!SelectedChallenge || !SelectedChallenge.challenge) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      );
    }
    const Short =  SelectedChallenge.challenge;

  const challenge = {
    goal: Short.goal,
    difficulty: Short.difficulty,
    participants: Short.participants,
    description: Short.description,
    duration: Short.duration,
    type: Short.type || 'Fitness',
    Proof: Short.Proof || 'Video',
    Instruction: Short.Instruction
  };

  const handleShare = async (platform) => {
    const shareUrl = 'https://fitstreak.app/challenge';
    const message = `I just signed up for the "${challenge.goal}" challenge on FitStreak! Join me in this ${challenge.duration}-month journey to better health.`;

    try {
      if (platform === 'facebook') {
        await Share.share({
          message: `${message} ${shareUrl}`,
        });
      } else if (platform === 'twitter') {
        await Share.share({
          message: `${message} #FitStreakChallenge ${shareUrl}`,
        });
      } else if (platform === 'whatsapp') {
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(`${message} ${shareUrl}`)}`);
      } else if (platform === 'instagram') {
        await Linking.openURL(`instagram://share?text=${encodeURIComponent(`${message} ${shareUrl}`)}`);
      } else {
        await Share.share({
          message: `${message} ${shareUrl}`,
          title: 'Check out this challenge!',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartChallenge = () => {
    fireConfetti();
    navigation.navigate('Payment');
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F0F1A']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
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
              <Text style={styles.userInitials}>JS</Text>
            </LinearGradient>
            <View style={styles.userMenu}>
              <Text style={styles.userName}>John Smith</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title Container */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Challenge Confirmation</Text>
          <Text style={styles.subtitle}>Review your selected challenge details</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={14} color="#BBBBCC" />
            <Text style={styles.navButtonText}> Back</Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.completedStep]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={[styles.step, styles.completedStep]}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={[styles.step, styles.activeStep]}>
              <Text style={styles.stepText}>3</Text>
            </View>
          </View>
        </View>

        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={50}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          fadeOut={true}
          autoStart={false}
        />

        {/* Confirmation Card */}
        <View style={styles.confirmationCard}>
          <View style={styles.successIcon}>
            <Icon name="check" size={36} color="#4CAF50" />
          </View>
          <Text style={styles.confirmationHeading}>Challenge Selected Successfully!</Text>

          {/* Selected Challenge */}
          <View style={styles.selectedChallenge}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Icon name="dumbbell" size={18} color="#FF2E63" />
              </View>
              <Text style={styles.challengeTitle}>{challenge.goal}</Text>
            </View>

            <View style={styles.challengeInfo}>
              <View style={styles.infoBadge}>
                <Icon name="calendar-alt" size={12} color="#FFAC41" />
                <Text style={styles.infoBadgeText}> {challenge.duration} Months</Text>
              </View>
              <View style={styles.infoBadge}>
                <Icon name="signal" size={12} color="#FFAC41" />
                <Text style={styles.infoBadgeText}> {challenge.difficulty}</Text>
              </View>
              <View style={styles.infoBadge}>
                <Icon name="users" size={12} color="#FFAC41" />
                <Text style={styles.infoBadgeText}> {challenge.participants} Participants</Text>
              </View>
            </View>

            <Text style={styles.challengeDescription}>{challenge.description}</Text>

            <View style={styles.startDate}>
                <Text style={styles.dateLabelText}> Start Date:</Text>
              <Text style={styles.dateValue}>1 day After Payment Is Made</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Next Steps */}
          <View style={styles.nextSteps}>
            <View style={styles.nextStepsTitle}>
              <Icon name="list-ol" size={16} color="#FFAC41" />
              <Text style={styles.nextStepsTitleText}> Next Steps</Text>
            </View>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Pay The Subscription Fee</Text>
                  <Text style={styles.stepDescription}>Pay The subscription Fee Of The Challenge</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Upload Daily Photo Of The Challenge</Text>
                  <Text style={styles.stepDescription}>Upload Daily Photo Of doing Challenge as per instruction</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Connect Fitness Tracker</Text>
                  <Text style={styles.stepDescription}>Link your fitness devices to automatically track your progress.</Text>
                </View>
              </View>

              {challenge.goal === 'No Fap' && (
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>All Access of Your Google Search</Text>
                    <Text style={styles.stepDescription}>Allow Access To The Google Search, History for Next {challenge.duration} Months</Text>
                  </View>
                </View>
              )}

              {challenge.type === 'Diet' && (
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{challenge.goal === 'No Fap' ? '5' : '4'}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>upload Photo of the food you eat</Text>
                    <Text style={styles.stepDescription}>It Is Mandatory To Upload Photo Of The Food You Eat. Else You Will Lose The Challenge</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Reminders */}
          {/* <View style={styles.reminders}>
            <View style={styles.remindersTitle}>
              <Icon name="bell" size={16} color="#FFAC41" />
              <Text style={styles.remindersTitleText}> Important Reminders</Text>
            </View>

            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={14} color="#FFAC41" />
              <Text style={styles.reminderText}> Check in daily to mark your progress</Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={14} color="#FFAC41" />
              <Text style={styles.reminderText}> {challenge.Instruction} </Text>
            </View>
            <View style={styles.reminderItem}>
              <Icon name="check-circle" size={14} color="#FFAC41" />
              <Text style={styles.reminderText}> It Is Mandatory To follow The Instruction </Text>
            </View>
          </View> */}


          <View style={styles.instructionsProofSection}>
  {/* Important Instructions */}
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Icon name="info-circle" size={16} color="#FF2E63" />
      <Text style={styles.sectionTitle}> Important Instructions</Text>
    </View>
    
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsHeading}>Follow these guidelines carefully:</Text>
      <View style={styles.instructionItem}>
        <Icon name="check" size={14} color="#FFAC41" />
        <Text style={styles.instructionText}>{challenge.Instruction}</Text>
      </View>
      {challenge.type === 'Fitness' && (
        <>
          <View style={styles.instructionItem}>
            <Icon name="check" size={14} color="#FFAC41" />
            <Text style={styles.instructionText}>Complete your workout during the specified time window</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="check" size={14} color="#FFAC41" />
            <Text style={styles.instructionText}>Maintain proper form for all exercises</Text>
          </View>
        </>
      )}
      {challenge.type === 'Diet' && (
        <>
          <View style={styles.instructionItem}>
            <Icon name="check" size={14} color="#FFAC41" />
            <Text style={styles.instructionText}>Log all meals and snacks daily</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="check" size={14} color="#FFAC41" />
            <Text style={styles.instructionText}>Take photos of all meals before consuming</Text>
          </View>
        </>
      )}
      <View style={styles.instructionItem}>
        <Icon name="check" size={14} color="#FFAC41" />
        <Text style={styles.instructionText}>Missing consecutive days will result in challenge failure</Text>
      </View>
      <View style={styles.instructionItem}>
        <Icon name="check" size={14} color="#FFAC41" />
        <Text style={styles.instructionText}>Failure to provide proof will result in disqualification</Text>
      </View>
    </View>
  </View>

  {/* Proof Requirements */}
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Icon name="camera" size={16} color="#FF2E63" />
      <Text style={styles.sectionTitle}> Proof Requirements</Text>
    </View>
    
    <View style={styles.proofContainer}>
      <Text style={styles.proofHeading}>Required proof: {challenge.Proof}</Text>
      
      {challenge.Proof === 'Video' || challenge.Proof === 'Video Permission' && (
        <>
          <View style={styles.proofItem}>
            <Icon name="video" size={14} color="#4CAF50" />
            <Text style={styles.proofText}>Record a short video (15-60 seconds) of your daily activity</Text>
          </View>
          <View style={styles.proofItem}>
            <Icon name="clock" size={14} color="#4CAF50" />
            <Text style={styles.proofText}>Videos must include timestamp and clear view of activity</Text>
          </View>
        </>
      )}
      
      {challenge.Proof === 'Photo' && (
        <>
          <View style={styles.proofItem}>
            <Icon name="camera" size={14} color="#4CAF50" />
            <Text style={styles.proofText}>Take clear photos of your activity/meal</Text>
          </View>
          <View style={styles.proofItem}>
            <Icon name="image" size={14} color="#4CAF50" />
            <Text style={styles.proofText}>Photos must be taken from multiple angles when applicable</Text>
          </View>
        </>
      )}
      
      {challenge.Proof === 'Permission' || challenge.Proof === 'Video Permission' && (
        <View style={styles.proofItem}>
          <Icon name="heartbeat" size={14} color="#4CAF50" />
          <Text style={styles.proofText}>Connect fitness tracker to automatically log workout metrics</Text>
        </View>
      )}
      
      <View style={styles.proofItem}>
        <Icon name="calendar-check" size={14} color="#4CAF50" />
        <Text style={styles.proofText}>Daily submission is required before midnight your local time</Text>
      </View>
      
      <View style={styles.proofWarning}>
        <Icon name="exclamation-triangle" size={14} color="#FF2E63" />
        <Text style={styles.proofWarningText}>Failing to provide adequate proof will result in losing your challenge progress!</Text>
      </View>
    </View>
  </View>
</View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartChallenge}>
            <Icon name="play" size={16} color="white" />
            <Text style={styles.startButtonText}> Start Challenge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shareSection}>
          <View style={styles.shareTitle}>
            <Icon name="share-alt" size={16} color="#FFAC41" />
            <Text style={styles.shareTitleText}> Share Your Challenge</Text>
          </View>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={[styles.shareButton, styles.facebook]} onPress={() => handleShare('facebook')}>
              <Icon name="facebook-f" size={16} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, styles.twitter]} onPress={() => handleShare('twitter')}>
              <Icon name="twitter" size={16} color="#1da1f2" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, styles.instagram]} onPress={() => handleShare('instagram')}>
              <Icon name="instagram" size={16} color="#e1306c" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, styles.whatsapp]} onPress={() => handleShare('whatsapp')}>
              <Icon name="whatsapp" size={16} color="#25d366" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="trophy" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="calendar-check" size={20} color="#FF2E63" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="user" size={20} color="#BBBBCC" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View> */}
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logo: {
    fontWeight: '800',
    fontSize: 28,
    color: 'transparent',
    backgroundColor: 'transparent',
    letterSpacing: -0.5,
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
  userInitials: {
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
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  navButtonText: {
    fontSize: 14,
    color: '#BBBBCC',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  activeStep: {
    backgroundColor: '#FF2E63',
  },
  stepText: {
    position: 'absolute',
    top: -20,
    fontSize: 10,
    color: '#BBBBCC',
  },
  confirmationCard: {
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333344',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  confirmationHeading: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: 'white',
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
    flexWrap: 'wrap',
    flexShrink: 1,
    fontWeight: '600',
    color: 'white',
  },
  challengeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 16,
  },
  startDate: {
    backgroundColor: 'rgba(255, 172, 65, 0.1)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabelText: {
    fontSize: 14,
    color: '#BBBBCC',
    marginLeft: -7,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#333344',
    marginVertical: 20,
  },
  nextSteps: {
    marginTop: 20,
  },
  nextStepsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nextStepsTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    backgroundColor: '#FF2E63',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  reminders: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 172, 65, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.3)',
  },
  remindersTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  remindersTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#BBBBCC',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 30,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  shareTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  shareTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebook: {
    backgroundColor: 'rgba(59, 89, 152, 0.2)',
  },
  twitter: {
    backgroundColor: 'rgba(29, 161, 242, 0.2)',
  },
  instagram: {
    backgroundColor: 'rgba(225, 48, 108, 0.2)',
  },
  whatsapp: {
    backgroundColor: 'rgba(37, 211, 102, 0.2)',
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
    justifyContent: 'space-around',
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
  instructionsProofSection: {
    marginTop: 30,
    gap: 20,
  },
  sectionContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333344',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  instructionsContainer: {
    gap: 12,
  },
  instructionsHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  instructionText: {
    fontSize: 14,
    color: '#BBBBCC',
    flex: 1,
  },
  proofContainer: {
    gap: 12,
  },
  proofHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  proofText: {
    fontSize: 14,
    color: '#BBBBCC',
    flex: 1,
  },
  proofWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  proofWarningText: {
    fontSize: 14,
    color: '#FF8DA1',
    flex: 1,
    fontWeight: '500',
  },
});

export default ChallengeConfirmationScreen;
