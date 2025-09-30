// app/gyroReader.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Gyroscope, GyroscopeMeasurement } from 'expo-sensors';

// Define the type for the state data to ensure type safety
interface GyroData {
  x: number;
  y: number;
  z: number;
}

export default function GyroscopeReaderScreen() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [isSupported, setIsSupported] = useState(true); // Assume supported initially

  useEffect(() => {
    // 1. Check if the module is available for the current platform
    if (Platform.OS === 'web' || !Gyroscope.addListener) {
      setIsSupported(false);
      return;
    }

    // 2. If supported, set interval and add listener
    Gyroscope.setUpdateInterval(300);

    const subscription = Gyroscope.addListener(gyroscopeData => {
      setData(gyroscopeData);
    });

    // 3. Clean up
    return () => {
      subscription.remove();
    };
  }, []);

  const formatValue = (value: number): number | string => {
    const fixedString = value.toFixed(1);
    if (fixedString === "-0.0") {
      return 0;
    }
    return fixedString;
  };

  const { x, y, z } = data;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raw Gyroscope Reading</Text>
      
      {isSupported ? (
        <>
          <Text style={styles.text}>x: {formatValue(x)}</Text>
          <Text style={styles.text}>y: {formatValue(y)}</Text>
          <Text style={styles.text}>z: {formatValue(z)}</Text>
        </>
      ) : (
        <Text style={styles.text}>
          ⚠️ Gyroscope is not available on this platform (likely Web).
          Please run on a physical device.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    color: '#ecf0f1',
    marginTop: 10,
  },
}); 