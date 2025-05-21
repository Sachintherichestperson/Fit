import React, { useEffect, useState } from 'react';
import { Button, Text, View, Platform } from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [steps, setSteps] = useState(0);

  // Request permission to access Google Fit data
  const requestPermissions = async () => {
    try {
      const options = {
        scopes: [Scopes.FITNESS_ACTIVITY_READ], // Scope for accessing steps
      };

      const authResult = await GoogleFit.authorize(options);
      if (authResult.success) {
        setIsAuthorized(true);
        console.log('Authorization successful');
      } else {
        console.log('Authorization failed', authResult);
      }
    } catch (error) {
      console.log('Authorization error:', error);
    }
  };

  // Fetch step data after authorization
  const getStepsData = async () => {
    if (!isAuthorized) {
      console.log('Please authorize first');
      return;
    }

    try {
      const today = new Date().toISOString().slice(0, 10); // Get today's date in yyyy-mm-dd format
      const stepsData = await GoogleFit.getDailyStepCountSamples({
        startDate: `${today}T00:00:00.000Z`, // Start of today
        endDate: `${today}T23:59:59.999Z`, // End of today
      });
      
      const totalSteps = stepsData.reduce((total, item) => total + item.steps, 0);
      setSteps(totalSteps);
      console.log('Steps data:', stepsData);
    } catch (error) {
      console.log('Error fetching step data:', error);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      GoogleFit.isAuthorized()
        .then((res) => {
          if (res) {
            setIsAuthorized(true);
            getStepsData();
          } else {
            requestPermissions();
          }
        })
        .catch((err) => console.log('Error checking authorization', err));
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Steps today: {steps}</Text>
      <Button title="Get Steps Data" onPress={getStepsData} />
    </View>
  );
};

export default App;
