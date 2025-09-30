// app/orbCollector.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Platform, ImageBackground } from 'react-native'; 
import { Gyroscope } from 'expo-sensors';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 50;
const ORB_SIZE = 30;

// Tuned Physics/Game Settings
const SENSITIVITY = 20;
const DECAY_FACTOR = 0.95;
const MAX_SPEED = 20;
const UPDATE_INTERVAL = 16; 
const GAME_DURATION_SECONDS = 35;
const WINNING_SCORE = 5;

// Define types
interface Position { x: number; y: number; }
interface GyroData { x: number; y: number; z: number; }
type GameState = 'playing' | 'won' | 'lost';

// --- IMAGE SOURCE ---
// NOTE: Using the relative path fix (../) assuming app/orbCollector.tsx is in 'app/components'
const MR_INCREDIBLE_BG = require('@/assets/images/mr_incredible_bg.jpg');

const generateRandomPosition = (): Position => ({
  x: Math.random() * (width - ORB_SIZE),
  y: Math.random() * (height - ORB_SIZE),
});

export default function OrbCollectorGameScreen() {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: width / 2 - PLAYER_SIZE / 2, y: height / 2 - PLAYER_SIZE / 2 });
  const [orbPosition, setOrbPosition] = useState<Position>(generateRandomPosition());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);

  // Refs for tracking internal game state and sound objects
  const velocity = useRef({ x: 0, y: 0 }); 
  const bgMusic = useRef<Audio.Sound | null>(null);

  const loadSounds = useCallback(async () => {
    try {
      // FIX: Using the relative path fix (../) for audio as well
      const { sound: music } = await Audio.Sound.createAsync(
        require('@/assets/audio/bg_music.mp3'),
        { isLooping: true }
      );
      bgMusic.current = music;

    } catch (e) {
      console.warn("Could not load sounds. Ensure files exist in assets/audio/.", e);
    }
  }, []);

  // Simplified type definition to avoid MutableRefObject dependency
  const playMusic = useCallback(async (soundRef: { current: Audio.Sound | null }, shouldLoop: boolean = true) => {
    await bgMusic.current?.stopAsync(); 
    try {
        await soundRef.current?.setStatusAsync({ isLooping: shouldLoop, positionMillis: 0 });
        await soundRef.current?.playAsync();
    } catch(e) {
        // Handle play error
    }
  }, []);

  const resetGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setPlayerPosition({ x: width / 2 - PLAYER_SIZE / 2, y: height / 2 - PLAYER_SIZE / 2 });
    setOrbPosition(generateRandomPosition());
    velocity.current = { x: 0, y: 0 };
    setGameState('playing');
  };

  // --- 1. INITIAL SETUP & MUSIC CONTROL ---
  useEffect(() => {
    loadSounds();
    return () => {
      bgMusic.current?.unloadAsync();
    };
  }, [loadSounds]);

  useEffect(() => {
    if (gameState === 'playing') {
      // Check if sound is loaded before playing
      bgMusic.current?.getStatusAsync().then(status => {
          if (status.isLoaded && !status.isPlaying) {
              playMusic(bgMusic);
          }
      });
    } else {
        bgMusic.current?.stopAsync();
    }
  }, [gameState, playMusic]);

  // --- 2. GYROSCOPE SUBSCRIPTION ---
  useEffect(() => {
    if (gameState !== 'playing' || Platform.OS === 'web') return; 

    Gyroscope.setUpdateInterval(UPDATE_INTERVAL);

    const subscription = Gyroscope.addListener(gyroscopeData => {
      setGyroData(gyroscopeData);
    });

    return () => subscription.remove();
  }, [gameState]);

  // --- 3. TIMER ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameState('lost'); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // --- 4. PLAYER MOVEMENT & SMOOTHING (FIXED LOOP) ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    const accelerationX = -gyroData.y * SENSITIVITY;
    const accelerationY = -gyroData.x * SENSITIVITY;

    // FIX: Use functional update to remove playerPosition from dependencies
    setPlayerPosition(prevPosition => {
      let vx = velocity.current.x + accelerationX * (UPDATE_INTERVAL / 1000);
      let vy = velocity.current.y + accelerationY * (UPDATE_INTERVAL / 1000);

      vx *= DECAY_FACTOR;
      vy *= DECAY_FACTOR;
      
      vx = Math.min(Math.max(vx, -MAX_SPEED), MAX_SPEED);
      vy = Math.min(Math.max(vy, -MAX_SPEED), MAX_SPEED);

      let newX = prevPosition.x + vx; 
      let newY = prevPosition.y + vy; 

      // Check boundaries
      if (newX < 0) { newX = 0; vx = 0; }
      if (newX > width - PLAYER_SIZE) { newX = width - PLAYER_SIZE; vx = 0; }
      if (newY < 0) { newY = 0; vy = 0; }
      if (newY > height - PLAYER_SIZE) { newY = height - PLAYER_SIZE; vy = 0; }

      velocity.current = { x: vx, y: vy };
      return { x: newX, y: newY };
    });
    
  }, [gyroData, gameState]); // Dependencies are now clean

  // --- 5. COLLISION & SCORE CHECK ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;

    const dx = playerCenterX - orbCenterX;
    const dy = playerCenterY - orbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (PLAYER_SIZE / 2) + (ORB_SIZE / 2)) {
      // Collect sound intentionally removed
      
      setOrbPosition(generateRandomPosition());
      
      setScore(prevScore => {
        const newScore = prevScore + 1;
        if (newScore >= WINNING_SCORE) {
          setGameState('won');
        }
        return newScore;
      });
    }
  }, [playerPosition, orbPosition, gameState]);


  // --- 6. RENDER GAME SCREEN / WIN/LOSS SCREENS ---
  const renderGameContent = () => {
    if (gameState === 'playing') {
      return (
        <>
          <Text style={styles.scoreText}>Score: {score}/{WINNING_SCORE}</Text>
          <Text style={styles.timerText}>Time: {timeLeft}</Text>
          <Text style={styles.instructions}>Collect the blue orb!</Text>
          
          <View
            style={[styles.orb, { left: orbPosition.x, top: orbPosition.y }]}
          />
          
          <View
            style={[styles.player, { left: playerPosition.x, top: playerPosition.y }]}
          />
        </>
      );
    }

    // Win/Loss Screen
    const isWon = gameState === 'won';
    return (
      <View style={styles.endScreen}>
        <Text style={styles.endTitle}>{isWon ? '🥳 YOU WON! 🥳' : '😔 TIME\'S UP! 😔'}</Text>
        <Text style={styles.endScore}>Final Score: {score}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={resetGame}
        >
          <Text style={styles.retryText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={MR_INCREDIBLE_BG} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} /> 
      {renderGameContent()}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 62, 80, 0.5)',
    zIndex: 0,
  },
  scoreText: {
    position: 'absolute',
    top: 30,
    left: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 10,
  },
  timerText: {
    position: 'absolute',
    top: 30,
    right: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 10,
  },
  instructions: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    zIndex: 10,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: 'coral',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 5,
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 5,
  },
  // --- END SCREENS STYLES ---
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  endTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#f1c40f', 
    marginBottom: 20,
    textAlign: 'center',
  },
  endScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
});