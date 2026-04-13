import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';
import { exercises as exercisesDB } from '../Databases/Exercise_db';

export default function SelectExercisesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const workoutName = (params?.workoutName as string) || '';

  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: collapsed ? 90 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const handleNext = () => {
    if (selectedIds.length === 0) return;
    const encodedPayload = encodeURIComponent(JSON.stringify(selectedIds));
    const encodedWorkoutName = workoutName ? `&workoutName=${encodeURIComponent(workoutName)}` : '';
    router.push(`/(tabs)/Add_Reps?exercises=${encodedPayload}${encodedWorkoutName}`);
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
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
            </View>

            <Text style={styles.cardTitle}>Select Exercises</Text>
            <Text style={styles.cardSubtitle}>Select exercises to include in your workout</Text>
            <ScrollView style={styles.listContainer}>
              {exercisesDB.map((ex) => {
                const selected = selectedIds.includes(ex.id);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    activeOpacity={0.8}
                    onPress={() => toggleSelect(ex.id)}
                    style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
                  >
                    <Text style={[styles.exerciseName, selected && styles.exerciseNameSelected]}>{ex.name}</Text>
                    <Text style={styles.exerciseMeta}>{ex.loadType === 'bodyweight' ? 'BW' : 'W'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  activeOpacity={0.9}
                  onPress={() => router.push('/(tabs)/Name_Workout')}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextButton, selectedIds.length === 0 && styles.nextButtonDisabled]}
                  activeOpacity={0.9}
                  onPress={handleNext}
                  disabled={selectedIds.length === 0}
                >
                  <Text style={[styles.nextButtonText, selectedIds.length === 0 && styles.nextButtonTextDisabled]}>Next</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    color: '#9FBEDB',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
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
  listContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 60,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.04)',
    marginBottom: 10,
  },
  exerciseRowSelected: {
    backgroundColor: 'rgba(0,191,255,0.12)',
    borderColor: '#00BFFF',
  },
  exerciseName: {
    color: '#E6F6FF',
    fontSize: 14,
  },
  exerciseNameSelected: {
    color: '#E6F6FF',
    fontWeight: '700',
  },
  exerciseMeta: {
    color: '#9FBEDB',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
  },
  buttonRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: '50%',
    backgroundColor: '#071033',
    borderWidth: 1.5,
    borderColor: '#00BFFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 10,
    borderRadius: 10,
    width: '50%',
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
});
