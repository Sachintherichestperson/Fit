import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';

const CreateChallengeScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    challengeName: '',
    challengeType: '',
    timelineValue: '',
    weightType: '',
    weightValue: '',
    BMIVALUE: '',
    transformationValue: '',
    gender: '',
    currentWeight: '',
    height: '',
    BMI: '',
    difficultyLevel: '',
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const pulseAnim = React.useRef(new Animated.Value(0)).current;
  const floatingAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
  }, [floatingAnim, pulseAnim]);

  const pulseShadow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const floatingTranslation = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const requestPhotoPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Photo Library Permission',
          message: 'We need access to your photos to upload images',
          buttonPositive: 'OK',
        }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      try {
        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        const status = await check(permission);

        if (status === RESULTS.GRANTED) {
          return true;
        } else if (status === RESULTS.DENIED) {
          const requestStatus = await request(permission);
          return requestStatus === RESULTS.GRANTED;
        } else if (status === RESULTS.BLOCKED) {
          Alert.alert(
            'Permission Required',
            'Please enable photo library access in settings',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPhotoPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable photo library access in settings',
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        setError('Failed to select image: ' + result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        handleChange('photo', uri);
      }

    } catch (err) {
      console.warn(err);
      setError('Failed to access photo library');
    }
  };

  const validateForm = () => {
    if (!formData.challengeName.trim()) {
      setError('Please enter a challenge name');
      return false;
    }

    if (!formData.challengeType) {
      setError('Please select a challenge type');
      return false;
    }

    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }

    if (!formData.photo) {
      setError('Please upload a full body photo');
      return false;
    }

    switch (formData.challengeType) {
      case 'timeline':
        if (!formData.timelineValue) {
          setError('Please select a timeline option');
          return false;
        }
        break;
      case 'weight':
        if (!formData.weightValue || isNaN(formData.weightValue)) {
          setError('Please enter a valid target weight');
          return false;
        }
        break;
      case 'transformation':
        if (!formData.transformationValue) {
          setError('Please select a transformation type');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log(formData);
    setError('');
    if (!validateForm()) {return;}

    const response = await fetch('http://192.168.105.177:3000/personalized-Challenge', {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if(response.ok){
      navigation.replace('Assigned');
      console.log('Success:', data);
    }else {
      setError(data.message || 'Something went wrong');
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.step,
              activeStep === step && styles.activeStep,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F0F1A']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>FITSTREAK</Text>
        </View>

        <Text style={styles.pageTitle}>Create Your Challenge</Text>
        <Text style={styles.warning}>
          Once Made It cannot be Changed Until Challenge Completed
        </Text>

        {renderStepIndicator()}

        {/* Challenge Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Challenge Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a motivating name for your challenge"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={formData.challengeName}
            onChangeText={(text) => handleChange('challengeName', text)}
          />
        </View>

        {/* Timeline */}
        <View style={styles.timelineDeadline}>
          <TouchableOpacity
            style={styles.deadLine}
            onPress={() => setActiveStep(0)}
          >
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
            <Text style={styles.deadLineText}>Timeline</Text>
          </TouchableOpacity>
        </View>

        {activeStep === 0 && (
          <Animated.View
            style={[
              styles.timelineWrapper,
              { shadowOpacity: 0.7, shadowRadius: pulseShadow },
            ]}
          >
            <View style={styles.optionsGrid}>
              {['3', '6', '12'].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionButton,
                    formData.timelineValue === value && styles.activeOptionButton,
                  ]}
                  onPress={() => {
                    handleChange('timelineValue', value);
                    setActiveStep(1);
                  }}
                >
                  <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.optionButtonText}>
                    {value} {value === '12' ? 'Months' : 'Months'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Challenge Type */}
        {activeStep === 1 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Challenge Type</Text>
            <View style={styles.choice}>
              {[
                { value: 'diet', icon: 'fast-food-outline', label: 'Diet' },
                { value: 'weight', icon: 'barbell-outline', label: 'Weight' },
                {
                  value: 'transformation',
                  icon: 'swap-vertical-outline',
                  label: 'Transform',
                },
                {
                  value: 'consistency',
                  icon: 'repeat-outline',
                  label: 'Consistency',
                },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.choiceButton,
                    formData.challengeType === type.value && styles.activeChoiceButton,
                    type.value === 'consistency' && styles.fullWidthButton,
                  ]}
                  onPress={() => {
                    handleChange('challengeType', type.value);
                    setActiveStep(2);
                  }}
                >
                  <Ionicons name={type.icon} size={16} color="#FFFFFF" />
                  <Text style={styles.choiceButtonText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Weight Options */}
        {activeStep === 2 && formData.challengeType === 'weight' && (
          <Animated.View
            style={[
              styles.weightWrapper,
              { transform: [{ translateY: floatingTranslation }] },
            ]}
          >
            <View style={styles.optionsGrid}>
              {[
                {
                  value: 'weightloss',
                  icon: 'trending-down-outline',
                  label: 'Weight Loss',
                },
                {
                  value: 'weightgain',
                  icon: 'trending-up-outline',
                  label: 'Weight Gain',
                },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.weightType === option.value && styles.activeOptionButton,
                  ]}
                  onPress={() => handleChange('weightType', option.value)}
                >
                  <Ionicons name={option.icon} size={16} color="#FFFFFF" />
                  <Text style={styles.optionButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.weightInput}>
              <TextInput
                style={styles.weightInputField}
                placeholder="Enter Your Target Weight"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                value={formData.weightValue}
                onChangeText={(text) => handleChange('weightValue', text)}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </Animated.View>
        )}

        {/* Transformation Options */}
        {activeStep === 2 && formData.challengeType === 'transformation' && (
          <Animated.View
            style={[
              styles.transformationWrapper,
              { transform: [{ translateY: floatingTranslation }] },
            ]}
          >
            <View style={styles.optionsGrid}>
              {[
                { value: 'bulk', icon: 'add-outline', label: 'Bulk' },
                { value: 'cut', icon: 'remove-outline', label: 'Cut' },
                { value: 'athlete', icon: 'fitness-outline', label: 'Athlete' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.transformationValue === option.value && styles.activeOptionButton,
                  ]}
                  onPress={() => handleChange('transformationValue', option.value)}
                >
                  <Ionicons name={option.icon} size={16} color="#FFFFFF" />
                  <Text style={styles.optionButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Profile Section */}
        {activeStep === 2 && (
          <View style={styles.formGroup}>
            <View style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={20} color="#FFAC41" />
              <Text style={styles.sectionTitleText}>Your Profile</Text>
              <TouchableOpacity style={styles.tooltip} onPress={() =>
                Alert.alert(
                  'Info',
                  'We use this information to create a personalized challenge for you'
                )
              }>
                <View style={styles.tooltipIcon}>
                  <Text style={styles.tooltipIconText}>i</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Photo Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Body Photo</Text>
              <TouchableOpacity
                style={styles.fileInputLabel}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={24} color="#FF2E63" />
                <Text style={styles.fileInputText}>
                  {formData.photo ? 'Photo Selected' : 'Upload a photo'}
                </Text>
              </TouchableOpacity>
              {formData.photo && (
                <Image
                  source={{ uri: formData.photo }}
                  style={styles.previewImage}
                />
              )}
            </View>

            {/* Gender */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOption}>
                {[
                  { value: 'men', icon: 'male-outline', label: 'Men' },
                  { value: 'women', icon: 'female-outline', label: 'Women' },
                  { value: 'lgbtq', icon: 'people-outline', label: 'LGBTQ+' },
                ].map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.genderButton,
                      formData.gender === gender.value && styles.activeGenderButton,
                    ]}
                    onPress={() => handleChange('gender', gender.value)}
                  >
                    <Ionicons name={gender.icon} size={16} color="#FFFFFF" />
                    <Text style={styles.genderButtonText}>{gender.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Current Weight */}
            <View style={styles.weightInput}>
              <TextInput
                style={styles.weightInputField}
                placeholder="Enter Your Current Weight"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                value={formData.currentWeight}
                onChangeText={(text) => handleChange('currentWeight', text)}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>

            {/* BMI */}
            <View style={styles.weightInput}>
              <TextInput
                style={styles.weightInputField}
                placeholder="Enter Your Body Mass Index"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                value={formData.BMI}
                onChangeText={(text) => handleChange('BMI', text)}
              />
            </View>

            {/* Height */}
            <View style={styles.weightInput}>
              <TextInput
                style={styles.weightInputField}
                placeholder="Enter Your Height"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => handleChange('height', text)}
              />
              <Text style={styles.weightUnit}>cm</Text>
            </View>

            {/* Difficulty Level */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.difficultyOptions}>
                {[
                  {
                    value: 'Beginner',
                    icon: 'add-outline',
                    label: 'Beginner',
                  },
                  {
                    value: 'Intermediate',
                    icon: 'remove-outline',
                    label: 'Intermediate',
                  },
                  {
                    value: 'Advanced',
                    icon: 'fitness-outline',
                    label: 'Advanced',
                  },
                ].map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.difficultyButton,
                      formData.difficultyLevel === level.value && styles.activeDifficultyButton,
                    ]}
                    onPress={() => handleChange('difficultyLevel', level.value)}
                  >
                    <Ionicons name={level.icon} size={16} color="#FFFFFF" />
                    <Text style={styles.difficultyButtonText}>{level.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Submit Button */}
        {activeStep === 2 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create My Challenge</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#FFAC41',
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
    color: '#FF2E63',
  },
  pageTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  warning: {
    fontSize: 16,
    marginBottom: 30,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  step: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginHorizontal: 6,
  },
  activeStep: {
    backgroundColor: '#FF2E63',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333344',
    borderRadius: 12,
    fontSize: 16,
  },
  timelineDeadline: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deadLine: {
    padding: 10,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deadLineText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  timelineWrapper: {
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333344',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 172, 65, 0.1)',
    borderWidth: 1,
    borderColor: '#FFAC41',
    borderRadius: 10,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeOptionButton: {
    backgroundColor: 'rgba(255, 172, 65, 0.25)',
    borderColor: '#FFAC41',
    shadowColor: '#FFAC41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  choice: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    borderRadius: 12,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthButton: {
    flex: 0,
    width: '100%',
  },
  activeChoiceButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.5)',
    borderColor: '#FF2E63',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  choiceButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  weightWrapper: {
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333344',
    padding: 16,
    marginBottom: 16,
  },
  transformationWrapper: {
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333344',
    padding: 16,
    marginBottom: 16,
  },
  weightInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 26, 0.4)',
    borderWidth: 1,
    borderColor: '#FFAC41',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  weightInputField: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  weightUnit: {
    color: '#FFAC41',
    fontWeight: '500',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 20,
    color: '#FFAC41',
    fontWeight: '600',
  },
  fileInputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333344',
    borderRadius: 12,
  },
  fileInputText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  genderOption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genderButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    borderRadius: 12,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeGenderButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.5)',
    borderColor: '#FF2E63',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  genderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  difficultyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  difficultyButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    borderRadius: 12,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeDifficultyButton: {
    backgroundColor: 'rgba(255, 46, 99, 0.5)',
    borderColor: '#FF2E63',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  difficultyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  tooltip: {
    position: 'relative',
    marginLeft: 5,
  },
  tooltipIcon: {
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipIconText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  submitButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FF2E63',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateChallengeScreen;
