import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';
import { exercises as exercisesDB } from '../Databases/Exercise_db';
import { supabase } from '../supabaseClient';

type GoalKey =
  | 'Build Muscle'
  | 'Build Strength'
  | 'Lose Fat'
  | 'Endurance'
  | 'Explosive Power'
  | 'Lean Muscle'
  | 'Toned';

const BASE_VALUES: Record<GoalKey, { reps: [number, number]; rest: [number, number] }> = {
  'Build Muscle': { reps: [8, 12], rest: [75, 75] },
  'Build Strength': { reps: [3, 6], rest: [180, 180] },
  'Lose Fat': { reps: [10, 15], rest: [45, 45] },
  'Endurance': { reps: [12, 20], rest: [30, 30] },
  'Explosive Power': { reps: [1, 5], rest: [210, 210] },
  'Lean Muscle': { reps: [10, 15], rest: [60, 60] },
  'Toned': { reps: [12, 18], rest: [45, 45] },
};

const SECONDARY_MODIFIERS: Record<GoalKey, { reps: [number, number]; rest: [number, number] }> = {
  'Build Muscle': { reps: [2, 2], rest: [-10, -10] },
  'Build Strength': { reps: [-2, -2], rest: [30, 30] },
  'Lose Fat': { reps: [3, 3], rest: [-15, -15] },
  'Endurance': { reps: [5, 5], rest: [-20, -20] },
  'Lean Muscle': { reps: [2, 2], rest: [-10, -10] },
  'Toned': { reps: [3, 3], rest: [-10, -10] },
  'Explosive Power': { reps: [-2, -2], rest: [45, 45] },
};

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeGoal = (goal?: string | null): GoalKey | null => {
  if (!goal) return null;
  const key = goal.trim().toLowerCase();
  if (key === 'build muscle') return 'Build Muscle';
  if (key === 'build strength') return 'Build Strength';
  if (key === 'lose fat') return 'Lose Fat';
  if (key === 'endurance' || key === 'increase endurance') return 'Endurance';
  if (key === 'explosive power') return 'Explosive Power';
  if (key === 'aesthetic focus') return 'Lean Muscle';
  if (key === 'lean muscle') return 'Lean Muscle';
  if (key === 'toned') return 'Toned';
  return null;
};

const computeSuggestionNumbers = (primaryGoal?: string | null, secondaryGoal?: string | null) => {
  const primaryKey = normalizeGoal(primaryGoal);
  if (!primaryKey) return null;

  const base = BASE_VALUES[primaryKey];
  const secondaryKey = normalizeGoal(secondaryGoal);
  const modifier = secondaryKey ? SECONDARY_MODIFIERS[secondaryKey] : null;

  let repsMin = base.reps[0];
  let repsMax = base.reps[1];
  let restMin = base.rest[0];
  let restMax = base.rest[1];

  if (modifier) {
    repsMin += modifier.reps[0];
    repsMax += modifier.reps[1];
    restMin += modifier.rest[0];
    restMax += modifier.rest[1];
  }

  repsMin = clampValue(Math.round(repsMin), 3, 20);
  repsMax = clampValue(Math.round(repsMax), 3, 20);
  restMin = clampValue(Math.round(restMin), 30, 300);
  restMax = clampValue(Math.round(restMax), 30, 300);

  if (repsMin > repsMax) [repsMin, repsMax] = [repsMax, repsMin];
  if (restMin > restMax) [restMin, restMax] = [restMax, restMin];

  return { repsMin, repsMax, restMin, restMax };
};

export default function AddRepsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const exercisesParam = params?.exercises as string | undefined;
  const workoutName = params?.workoutName as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);

  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [formState, setFormState] = useState<Record<string, { repsMin: string; repsMax: string }>>({});
  const [suggestionRange, setSuggestionRange] = useState<{ repsMin: number; repsMax: number; restMin: number; restMax: number } | null>(null);

  useEffect(() => {
    if (!exercisesParam) return;
    try {
      let parsed: any = null;
      try { parsed = JSON.parse(exercisesParam); } catch { parsed = JSON.parse(decodeURIComponent(exercisesParam)); }

      if (Array.isArray(parsed)) {
        const idList = parsed.every((p: any) => p && typeof p === 'object' && 'id' in p)
          ? parsed.map((p: any) => p.id)
          : parsed;

        const found = exercisesDB.filter((e) => idList.includes(e.id));
        const initial: Record<string, { repsMin: string; repsMax: string }> = {};
        found.forEach((ex) => {
          initial[ex.id] = { repsMin: '', repsMax: '' };
        });
        setSelectedExercises(found);
        setFormState(initial);
      }
    } catch (e) {
      console.warn('Failed to parse exercises param in Add_Reps', e);
    }
  }, [exercisesParam]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('fitness_profiles')
          .select('primary_goal, secondary_goal')
          .eq('user_id', user.id)
          .single();

        if (error || !data) return;
        const range = computeSuggestionNumbers(data.primary_goal, data.secondary_goal);
        if (range) setSuggestionRange(range);
      } catch (err) {
        console.warn('Failed to load suggestions in Add_Reps', err);
      }
    };

    loadGoals();
  }, []);

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: collapsed ? 90 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const updateField = (id: string, field: 'repsMin' | 'repsMax', value: string) => {
    setFormState((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const applySuggestedReps = () => {
    if (!suggestionRange) return;
    setFormState((prev) => {
      const next = { ...prev } as Record<string, { repsMin: string; repsMax: string }>;
      selectedExercises.forEach((ex) => {
        const existing = next[ex.id] || { repsMin: '', repsMax: '' };
        next[ex.id] = { ...existing, repsMin: String(suggestionRange.repsMin), repsMax: String(suggestionRange.repsMax) };
      });
      return next;
    });
  };

  const allFilled = selectedExercises.length > 0 && selectedExercises.every((ex) => {
    const s = formState[ex.id];
    return !!s && (s.repsMin || '').toString().trim().length > 0 && (s.repsMax || '').toString().trim().length > 0;
  });

  const handleBack = () => router.push('/(tabs)/Select_Exercises');

  const handleNext = () => {
    // Prepare payload and formState compatible with Create_Workout
    const payload = selectedExercises.map((ex) => ({ id: ex.id, name: ex.name }));
    const encodedPayload = encodeURIComponent(JSON.stringify(payload.map((p) => p.id)));

    const formForCreate: Record<string, { repsMin: string; repsMax: string; weight: string; sets: string }> = {};
    Object.keys(formState).forEach((k) => {
      formForCreate[k] = { repsMin: formState[k].repsMin || '', repsMax: formState[k].repsMax || '', weight: '', sets: '' };
    });
    const encodedForm = encodeURIComponent(JSON.stringify(formForCreate));

    const workoutNameParam = workoutName ? `&workoutName=${encodeURIComponent(workoutName)}` : '';
    router.push(`/(tabs)/Configure_Workout?exercises=${encodedPayload}&formState=${encodedForm}${workoutNameParam}`);
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

            <TouchableOpacity style={styles.useSuggestedButton} activeOpacity={0.9} onPress={applySuggestedReps}>
              <Text style={styles.useSuggestedButtonText}>Use suggested reps</Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={styles.progressSegment} />
              <View style={styles.progressSegment} />
            </View>
            <Text style={styles.cardTitle}>Add Rep Ranges</Text>

            <ScrollView style={styles.listContainer}>
              {selectedExercises.map((ex) => (
                <View key={ex.id} style={styles.exerciseBox}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <View style={styles.repsRow}>
                    <TextInput
                      value={formState[ex.id]?.repsMin}
                      onChangeText={(v) => updateField(ex.id, 'repsMin', v)}
                      placeholder={suggestionRange ? String(suggestionRange.repsMin) : 'Min'}
                      placeholderTextColor="#7f9cbf"
                      keyboardType="numeric"
                      style={[styles.input, styles.repsInput]}
                    />
                    <Text style={styles.rangeDash}>—</Text>
                    <TextInput
                      value={formState[ex.id]?.repsMax}
                      onChangeText={(v) => updateField(ex.id, 'repsMax', v)}
                      placeholder={suggestionRange ? String(suggestionRange.repsMax) : 'Max'}
                      placeholderTextColor="#7f9cbf"
                      keyboardType="numeric"
                      style={[styles.input, styles.repsInput]}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextButton, !allFilled && styles.nextButtonDisabled]}
                  activeOpacity={0.9}
                  onPress={handleNext}
                  disabled={!allFilled}
                >
                  <Text style={[styles.nextButtonText, !allFilled && styles.nextButtonTextDisabled]}>Next</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  exerciseBox: {
  backgroundColor: 'rgba(0,191,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(0,191,255,0.25)',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,

  },
  exerciseName: {
    color: '#E6F6FF',
    fontSize: 16,
    marginBottom: 8,
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#071033',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#E6F6FF',
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.08)',
  },
  repsInput: {
    flex: 0.4,
    textAlign: 'center',
  },
  rangeDash: {
    color: '#7FBFFF',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 6,
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
  nextButtonText: {
    color: '#010057',
    fontWeight: '700',
  },
  nextButtonDisabled: {
    backgroundColor: '#071033',
    borderWidth: 1.5,
    borderColor: '#00BBFF',
  },
  nextButtonTextDisabled: {
    color: '#e6f6ff',
  },
  useSuggestedButton: {
    position: 'absolute',
    top: 40,
    left: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#00BFFF',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  useSuggestedButtonText: {
    color: '#00BFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
