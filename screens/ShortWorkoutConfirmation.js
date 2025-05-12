import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const CheckInPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challenge } = route.params || {};

  const [activeChallenge, setActiveChallenge] = useState(challenge || {});
  const [DaysCompleted, setDaysCompleted] = useState(0);
  const [BarProgress, setBarProgress] = useState();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [Status, SetStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Motivational messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = [
    "Great job! You're one step closer to your goal!",
    'Consistency is key! Keep it up!',
    "You're making progress every day!",
    'Success is the sum of small efforts repeated daily!',
    'Your future self will thank you for this!',
    'Every workout counts! Amazing work!',
    "You're stronger than you think!",
    "One day at a time - you've got this!",
    "The only bad workout is the one that didn't happen!",
    "You're building habits that last a lifetime!",
  ];

  const FetchPeriod = async () => {
    try{
      const response = await fetch(`http://192.168.244.177:3000/ShortActiveChallenge/${activeChallenge.id}`);
      const data = await response.json();
      setDaysCompleted(data.daysInProgress);
      setBarProgress(data.progress);
      SetStatus(data.Status);
      
      // If status is rejected, set isCheckedIn to false
      if (data.Status === 'Rejected') {
        setIsCheckedIn(false);
      }
    }catch(error){
      console.error('Error fetching active challenge:', error);
    }
  };

  useEffect(() => {
    FetchPeriod();
  }, []);

  // Check if user is already checked in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUserCheckedInStatus = async () => {
    try {
      const response = await fetch(`http://192.168.244.177:3000/CheckInDate/Check/${activeChallenge.id}`);
      const data = await response.json();
      
      // Only set isCheckedIn to true if it's not rejected
      if (Status !== 'Rejected') {
        setIsCheckedIn(data.isCheckedIn);
      }
    } catch (error) {
      console.error('Error checking check-in status:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        cameraType: 'back',
      };

      const result = await launchCamera(options);

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setMediaUri(result.assets[0].uri);
        setMediaType('photo');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const options = {
        mediaType: 'video',
        quality: Platform.OS === 'android' ? 1 : 0.8,
        videoQuality: Platform.OS === 'android' ? 'high' : 'medium',
        durationLimit: 60, // 1 minute max
        saveToPhotos: true,
      };

      const result = await launchCamera(options);

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setMediaUri(result.assets[0].uri);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const handleMediaSelect = async (type) => {
    try {
      const options = {
        mediaType: type,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setMediaUri(result.assets[0].uri);
        setMediaType(type);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  const uploadMedia = async () => {
    if (!mediaUri && (activeChallenge.Proof === 'Photo' || activeChallenge.Proof === 'Video')) {
      Alert.alert('Error', 'Please provide proof first');
      return;
    }

    setIsSubmitting(true);

    try {
      let formData = new FormData();
      formData.append('challengeId', activeChallenge.id);

      if (mediaUri) {

        const fileName = mediaUri.split('/').pop();
        // Determine the MIME type
        const mimeType = mediaType === 'photo' 
          ? 'image/jpeg' 
          : 'video/mp4';

        formData.append('proof', {
          uri: mediaUri,
          type: mimeType,
          name: `proof_${Date.now()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}  || filename`,
        });
      }

      const response = await fetch(`http://192.168.244.177:3000/UploadCheckIn/Proof/${activeChallenge.id}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setIsCheckedIn(true);
        setDaysCompleted(data.DaysCompleted);
        setBarProgress(data.CompleteRate);
        animateCheckmark();
        SetStatus(data.Status);

        FetchPeriod();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    if (isCheckedIn && Status !== 'Rejected') {
      return;
    }

    if (activeChallenge.Proof === 'Photo' || activeChallenge.Proof === 'Video') {
      if (!mediaUri) {
        Alert.alert('Proof Required', `Please provide ${activeChallenge.Proof.toLowerCase()} proof first`);
        return;
      }
    }

    await uploadMedia();
  };

  const handleAutomatedCheckIn = async () => {
    if (isCheckedIn && Status !== 'Rejected') {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://192.168.244.177:3000/CheckIn/${activeChallenge.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsCheckedIn(true);
        setDaysCompleted(data.DaysCompleted);
        setBarProgress(data.CompleteRate);
        animateCheckmark();
        Alert.alert('Success', 'Check-in successful!');
      } else {
        throw new Error(data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', error.message || 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const animateCheckmark = () => {
    Animated.sequence([
      Animated.timing(checkmarkScale, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Set a random motivational message
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  }, [challenge, messages]);

  useEffect(() => {
    if (activeChallenge.id) {
      checkUserCheckedInStatus();
    }
  }, [activeChallenge, checkUserCheckedInStatus]);

  const renderCheckInButton = () => {
    if (isCheckedIn && Status !== 'Rejected') {
      return null;
    }

    if (activeChallenge.Proof === 'Photo') {
      return (
        <View style={styles.proofContainer}>
          {!mediaUri ? (
            <>
              <TouchableOpacity
                style={styles.proofButton}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FFAC41']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.proofButtonGradient}
                >
                  <Icon name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.proofButtonText}>TAKE PHOTO</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryProofButton}
                onPress={() => handleMediaSelect('photo')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryProofButtonText}>CHOOSE FROM GALLERY</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.previewButton}
              >
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewOverlay}>
                  <Icon name="eye" size={24} color="#FFFFFF" />
                  <Text style={styles.previewText}>VIEW PHOTO</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={handleCheckIn}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FFAC41']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkInButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkInButtonText}>SUBMIT CHECK-IN</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setMediaUri(null)}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.secondaryButtonText}>TAKE NEW PHOTO</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    } else if (activeChallenge.Proof === 'Video') {
      return (
        <View style={styles.proofContainer}>
          {!mediaUri ? (
            <>
              <TouchableOpacity
                style={styles.proofButton}
                onPress={handleRecordVideo}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FFAC41']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.proofButtonGradient}
                >
                  <Icon name="video" size={24} color="#FFFFFF" />
                  <Text style={styles.proofButtonText}>RECORD VIDEO</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryProofButton}
                onPress={() => handleMediaSelect('video')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryProofButtonText}>CHOOSE FROM GALLERY</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.previewButton}
              >
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewOverlay}>
                  <Icon name="play" size={24} color="#FFFFFF" />
                  <Text style={styles.previewText}>VIEW VIDEO</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={handleCheckIn}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#FF2E63', '#FFAC41']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkInButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkInButtonText}>SUBMIT CHECK-IN</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setMediaUri(null)}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.secondaryButtonText}>RECORD NEW VIDEO</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    } else {
      // Automated check-in
      return (
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={handleAutomatedCheckIn}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#FF2E63', '#FFAC41']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkInButtonGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkInButtonText}>CHECK IN NOW</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#BBBBCC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CHECK IN TODAY</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Challenge Info */}
        <View style={styles.challengeInfoContainer}>
          <Text style={styles.challengeName}>{activeChallenge.Name}</Text>
          <Text style={styles.challengeDescription}>{activeChallenge.Description}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Day {DaysCompleted}</Text>
              <Text style={styles.statLabel}>Current Day</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeChallenge.Period} days</Text>
              <Text style={styles.statLabel}>Total Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeChallenge.Reward}</Text>
              <Text style={styles.statLabel}>Reward</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {BarProgress}% Complete
            </Text>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={['#FF2E63', '#FFAC41']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  {
                    width: `${BarProgress}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Check In Card */}
        <View style={styles.checkInCard}>
          <Text style={styles.checkInTitle}>Today's Check-In</Text>

          {Status === 'Rejected' ? (
            <>
              <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
                <Icon name="close-circle" size={80} color="#FF2E63" />
              </Animated.View>
              <Text style={styles.checkedInText}>Proof Rejected</Text>
              <Text style={[styles.motivationalText, {color: '#FF2E63'}]}>
                Your submission didn't meet the requirements. Please try again.
              </Text>

              <Text style={styles.checkInPrompt}>
                {activeChallenge.Proof === 'Photo' ? 'Submit a new photo as proof' :
                activeChallenge.Proof === 'Video' ? 'Submit a new video as proof' :
                'Confirm your check-in for today'}
              </Text>

              {renderCheckInButton()}
            </>
          ) : isCheckedIn ? (
            <View style={styles.checkedInContainer}>
              {Status === 'Pending' ? (
                <>
                  <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
                    <Image
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/14630/14630152.png' }}
                      style={{ width: 80, height: 80 }}
                    />
                  </Animated.View>
                  <Text style={styles.checkedInText}>You're checked in for today!</Text>
                  <Text style={styles.motivationalText}>{motivationalMessage}</Text>

                  <View style={styles.achievementContainer}>
                    <Icon name="medal" size={24} color="#FFAC41" />
                    <Text style={styles.achievementText}>We Will Analyze your Proof And Notify You</Text>
                  </View>
                </>
              ) : Status === 'Approved' ? (
                <>
                  <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
                    <Image
                      source={{ uri: 'https://img.freepik.com/free-vector/green-double-circle-check-mark_78370-1749.jpg' }}
                      style={{ width: 80, height: 80 }}
                    />
                  </Animated.View>
                  <Text style={styles.checkedInText}>You're checked in for today!</Text>
                  <Text style={styles.motivationalText}>{motivationalMessage}</Text>
                  <View style={styles.achievementContainer}>
                    <Icon name="medal" size={24} color="#FFAC41" />
                    <Text style={styles.achievementText}>+10 Points Earned</Text>
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <>
              <Text style={styles.checkInPrompt}>
                {activeChallenge.Proof === 'Photo' ? 'Take a photo to check in' :
                 activeChallenge.Proof === 'Video' ? 'Record a video to check in' :
                 'Confirm your check-in for today'}
              </Text>

              {renderCheckInButton()}

              <Text style={styles.checkInNote}>
                Check in before midnight to maintain your streak!
              </Text>
            </>
          )}
        </View>

        {/* Daily Task (shown only when not checked in or when rejected) */}
        {(!isCheckedIn || Status === 'Rejected') && activeChallenge.BigDescription && (
          <View style={styles.taskContainer}>
            <Text style={styles.sectionTitle}>Today's Task</Text>

            <View style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Icon name="dumbbell" size={20} color="#FF2E63" />
                <Text style={styles.taskName}>30-Minute Workout</Text>
              </View>

              <Text style={styles.taskDescription}>
                {activeChallenge.BigDescription}
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  challengeInfoContainer: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  challengeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#BBBBCC',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    color: '#FFAC41',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'right',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  checkInCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
    alignItems: 'center',
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  checkInPrompt: {
    fontSize: 16,
    color: '#BBBBCC',
    marginBottom: 24,
    textAlign: 'center',
  },
  checkInButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  checkInButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkInNote: {
    fontSize: 12,
    color: '#BBBBCC',
    textAlign: 'center',
  },
  checkedInContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  checkedInText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 16,
    color: '#BBBBCC',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 172, 65, 0.15)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 172, 65, 0.3)',
  },
  achievementText: {
    color: '#FFAC41',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FDFDFD',
    marginBottom: 16,
  },
  taskContainer: {
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(187, 187, 204, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFDFD',
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#BBBBCC',
    marginBottom: 16,
  },
  proofContainer: {
    width: '100%',
    marginBottom: 16,
  },
  proofButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  proofButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  proofButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  secondaryProofButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBBBCC',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryProofButtonText: {
    color: '#BBBBCC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBBBCC',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#BBBBCC',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CheckInPage;