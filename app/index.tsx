import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, type Href } from 'expo-router';

interface MenuButtonProps {
  title: string; // The title is text (string)
  href: string;  // The route path is text (string)
}

const MenuButton = ({ title, href }: MenuButtonProps) => (
  <Link href={href as Href} asChild>
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  </Link>
);

export default function IndexScreen() {
  return (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Gyroscope Demos</Text>
      
      <MenuButton 
        title="1. Raw Sensor Reading" 
        // Use an absolute path /components/gyroReader
        href="components/gyroReader" 
      />
      <MenuButton 
        title="2. Floating Orb" 
        // Use an absolute path /components/floatingOrb
        href="components/floatingOrb" 
      />
      <MenuButton 
        title="3. Game: Collect the Orb" 
        // Use an absolute path /components/orbCollector
        href="components/orbCollector" 
      />
      
      <Text style={styles.footer}>PDM Project 09/19</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#bdc3c7',
    fontSize: 14,
  }
});