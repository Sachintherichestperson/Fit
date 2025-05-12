import React, { Component } from 'react';
import { NativeModules, View, Text, Button, Linking, Platform, Alert } from 'react-native';

const UsageStats = NativeModules.UsageStats;

console.log('NativeModules:', NativeModules);

const openUsageAccessSettings = () => {
  if (Platform.OS === 'android') {
    Linking.openSettings(); // Opens the app's settings page
  }
};

export default class SampleApp extends Component {
  state = {
    usageTime: null,
    hasPermission: false,
  };

  componentDidMount() {
    this.checkUsageStatsPermission();
  }

  checkUsageStatsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await UsageStats.checkUsageStatsPermission();
        this.setState({ hasPermission });
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'This app needs usage access permission to track app usage. Please grant permission in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openUsageAccessSettings },
            ]
          );
        }
      } catch (error) {
        console.error('Error checking usage stats permission:', error);
      }
    }
  };

  getUsageTime = async () => {
    if (!this.state.hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant usage access permission in settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openUsageAccessSettings },
        ]
      );
      return;
    }

    try {
      const usageTime = await UsageStats.getUsageTime();
      this.setState({ usageTime });
    } catch (error) {
      console.error('Error fetching usage time:', error);
      Alert.alert('Error', 'Failed to fetch usage time. Please try again.');
    }
  };

  testModule = () => {
    if (!this.state.hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant usage access permission in settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openUsageAccessSettings },
        ]
      );
      return;
    }

    UsageStats.testModule()
      .then((message) => {
        console.log(message);
        Alert.alert('Success', message);
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to test module. Please try again.');
      });
  };

  render() {
    const { usageTime, hasPermission } = this.state;

    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Usage Stats Sample</Text>
        <Text style={{ marginBottom: 10 }}>
          Permission Status: {hasPermission ? 'Granted' : 'Not Granted'}
        </Text>
        <Button title="Get Usage Time" onPress={this.getUsageTime} />
        <View style={{ height: 10 }} />
        <Button title="Test Module" onPress={this.testModule} />
        {usageTime !== null && (
          <Text style={{ marginTop: 20 }}>
            Phone Usage Time: {Math.round(usageTime / 1000 / 60)} minutes
          </Text>
        )}
      </View>
    );
  }
}
