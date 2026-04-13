import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';

export default function NameWorkoutScreen() {
  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);
  const [workoutName, setWorkoutName] = useState('');
  const router = useRouter();

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: collapsed ? 90 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const isValid = workoutName.trim().length > 0;

  const handleNext = () => {
    if (!isValid) return;
    router.push(`/(tabs)/Select_Exercises?workoutName=${encodeURIComponent(workoutName)}`);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', overflow: 'visible' }}>
      <Animated.View
        style={{
          width: sidebarContainerWidth,
          overflow: 'visible',
          backgroundColor: '#010057',
          flexShrink: 0,
        }}
      >
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      <View style={{ flex: 1, overflow: 'visible' }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
            </View>
            <Text style={styles.cardTitle}>Name Workout</Text>
            <TextInput
              value={workoutName}
              onChangeText={(t) => setWorkoutName(t.slice(0, 25))}
              placeholder={'Enter workout name (max 25 chars) — e.g. Push day'}
              placeholderTextColor="#7f9cbf"
              style={styles.input}
              maxLength={25}
            />
            <Text style={styles.charCount}>{`${workoutName.length}/25`}</Text>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
                activeOpacity={0.9}
                onPress={handleNext}
                disabled={!isValid}
              >
                <Text style={[styles.nextButtonText, !isValid && styles.nextButtonTextDisabled]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010057',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  card: {
    width: '90%',
    backgroundColor: '#0a0f3c',
    borderRadius: 20,
    paddingVertical: 20,
    height: '96%',
    position: 'relative',
    // Glow + shadow
    shadowColor: '#00BFFF',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardTitle: {
    color: '#00BFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#071033',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#E6F6FF',
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.08)',
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 10,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#071033',
    borderWidth: 1.5,
    borderColor: '#00BBFF',
  },
  nextButtonText: {
    color: '#010057',
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#e6f6ff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  progressSegmentFilled: {
    backgroundColor: '#00BFFF',
  },
  charCount: {
    color: '#9FBEDB',
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: -8,
  },
});
