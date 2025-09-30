// app/floatingOrb.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 40;

export default function FloatingOrbScreen() {
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 });

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);

    const subscription = Gyroscope.addListener(gyroscopeData => {
      setGyroData(gyroscopeData);
    });
    
    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    const sensitivity = 10; 
    
    let newX = position.x - gyroData.y * sensitivity;
    let newY = position.y - gyroData.x * sensitivity;

    if (newX < 0) newX = 0;
    if (newX > width - BALL_SIZE) newX = width - BALL_SIZE;
    if (newY < 0) newY = 0;
    if (newY > height - BALL_SIZE) newY = height - BALL_SIZE;

    setPosition({ x: newX, y: newY });
  }, [gyroData]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Move the phone!</Text>
      <View
        style={[
          styles.ball,
          {
            left: position.x,
            top: position.y,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    position: 'absolute',
    top: 50,
    fontSize: 18,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: 'coral',
  },
});