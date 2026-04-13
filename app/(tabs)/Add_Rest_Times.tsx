import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const BASE_REST_SECONDS: Record<GoalKey, number> = {
  'Build Strength': 180,
  'Explosive Power': 210,
  'Build Muscle': 75,
  'Lean Muscle': 60,
  'Toned': 45,
  'Lose Fat': 45,
  'Endurance': 30,
};

const SECONDARY_REST_MODIFIERS: Record<GoalKey, number> = {
  'Build Strength': 30,
  'Explosive Power': 45,
  'Build Muscle': -10,
  'Lean Muscle': -10,
  'Toned': -10,
  'Lose Fat': -15,
  'Endurance': -20,
};

const clampRestSeconds = (value: number) => Math.min(300, Math.max(30, Math.round(value)));

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

const computeSuggestedRestSeconds = (primaryGoal?: string | null, secondaryGoal?: string | null) => {
  const primaryKey = normalizeGoal(primaryGoal);
  if (!primaryKey) return null;
  let rest = BASE_REST_SECONDS[primaryKey];
  const secondaryKey = normalizeGoal(secondaryGoal);
  if (secondaryKey) rest += SECONDARY_REST_MODIFIERS[secondaryKey];
  return clampRestSeconds(rest);
};

export default function AddRestTimesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const exercisesParam = params?.exercises as string | undefined;
  const formStateParam = params?.formState as string | undefined;
  const placedParam = params?.placed as string | undefined;
  const workoutName = params?.workoutName as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);

  const toggleSidebar = () => {
    Animated.timing(width, { toValue: collapsed ? 90 : 0, duration: 200, useNativeDriver: false }).start();
    setCollapsed(!collapsed);
  };

  const [items, setItems] = useState<any[]>([]);
  const [rests, setRests] = useState<(number | null)[]>([]);
  const [suggestedRest, setSuggestedRest] = useState(60);

  useEffect(() => {
    // build ordered items list from placed param (best) or exercises param
    let placed: any = null;
    try {
      if (placedParam) {
        try { placed = JSON.parse(placedParam); } catch { placed = JSON.parse(decodeURIComponent(placedParam)); }
      }
    } catch (e) {
      placed = null;
    }

    let parsedExercises: any = null;
    try {
      if (exercisesParam) {
        try { parsedExercises = JSON.parse(exercisesParam); } catch { parsedExercises = JSON.parse(decodeURIComponent(exercisesParam)); }
      }
    } catch (e) {
      parsedExercises = null;
    }

    // parse formState to read sets per exercise
    let parsedForm: Record<string, any> = {};
    try {
      if (formStateParam) {
        try { parsedForm = JSON.parse(formStateParam); } catch { parsedForm = JSON.parse(decodeURIComponent(formStateParam)); }
      }
    } catch (e) {
      parsedForm = {};
    }

    const list: any[] = [];
    if (Array.isArray(placed) && placed.length > 0) {
      placed.forEach((p: any) => {
        const id = p.baseId || p.id;
        const sets = parsedForm && parsedForm[id] ? Number(parsedForm[id].sets || 1) : 1;
        list.push({ id, name: p.name || 'Exercise', weight: p.weight || '', sets });
      });
    } else if (Array.isArray(parsedExercises)) {
      // parsedExercises may be an array of ids or objects
      const ids = parsedExercises.every((x: any) => x && typeof x === 'object' && 'id' in x) ? parsedExercises.map((x: any) => x.id) : parsedExercises;
      ids.forEach((id: string) => {
        const ex = exercisesDB.find((e) => e.id === id) || { id, name: 'Exercise' };
        const sets = parsedForm && parsedForm[id] ? Number(parsedForm[id].sets || 1) : 1;
        list.push({ id: ex.id, name: ex.name, weight: parsedForm[id]?.weight || '', sets });
      });
    }

    setItems(list);
  }, [exercisesParam, placedParam, formStateParam]);

  useEffect(() => {
    setRests(Array(Math.max(0, items.length - 1)).fill(null));
  }, [items.length]);

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
        const restSeconds = computeSuggestedRestSeconds(data.primary_goal, data.secondary_goal);
        if (restSeconds != null) setSuggestedRest(restSeconds);
      } catch (err) {
        console.warn('Failed to load rest suggestion', err);
      }
    };

    loadGoals();
  }, []);

  const applySuggestedRests = () => {
    const count = Math.max(0, items.length - 1);
    setRests(Array(count).fill(suggestedRest));
  };
  const setRestValue = (i: number, text: string) => {
    const digits = (text || '').replace(/\D/g, '');
    const val = digits === '' ? null : Math.min(999, parseInt(digits.slice(0, 3), 10));
    setRests((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  };

  const handleBack = () => router.back();

  const handleNext = async () => {
    // build restTimes array for Create_Workout and compute totals
    const formState = (() => {
      try { return formStateParam ? (JSON.parse(formStateParam) || {}) : {}; } catch { try { return JSON.parse(decodeURIComponent(formStateParam || '')) || {}; } catch { return {}; } }
    })();

    const setCounts: Record<string, number> = {};
    items.forEach((it) => {
      const id = String(it.id);
      setCounts[id] = (setCounts[id] || 0) + 1;
    });

    const mergedFormState: Record<string, any> = { ...formState };
    Object.keys(setCounts).forEach((id) => {
      mergedFormState[id] = { ...(mergedFormState[id] || {}), sets: String(setCounts[id]) };
    });

    const totalSets = items.length;
    const setsArr: number[] = items.map(() => 1);

    const restArray: number[] = [];
    for (let i = 0; i < items.length; i++) {
      const sets = setsArr[i] || 1;
      for (let s = 0; s < sets; s++) {
        const isLastOverall = (i === items.length - 1) && (s === sets - 1);
        if (isLastOverall) break;
        // if still inside the same exercise
        if (s < sets - 1) {
          restArray.push(suggestedRest);
        } else {
          // s === sets -1, move to next exercise
          const restBetween = rests[i] ?? suggestedRest;
          restArray.push(restBetween);
        }
      }
    }

    // prepare created workout payload
    const createdWorkout: any = {
      name: workoutName || 'My Workout',
      exercises: exercisesParam ? (() => { try { return JSON.parse(decodeURIComponent(exercisesParam)); } catch { try { return JSON.parse(exercisesParam); } catch { return items.map((it) => it.id); } } })() : items.map((it) => it.id),
      formState: mergedFormState,
      restTimes: restArray,
    };

    // compute totals (sets, reps min/max, weight)
    let totalRepsMin = 0;
    let totalRepsMax = 0;
    let totalWeight = 0;
    items.forEach((it, idx) => {
      const id = it.id;
      const sets = setsArr[idx] || 1;
      const fs = mergedFormState[id] || {};
      const repsMin = Number(fs.repsMin ?? fs.reps ?? it.repsMin ?? 0);
      const repsMax = Number(fs.repsMax ?? it.repsMax ?? repsMin ?? 0);
      const weight = Number(fs.weight ?? it.weight ?? 0) || 0;
      totalRepsMin += repsMin * sets;
      totalRepsMax += (repsMax || repsMin) * sets;
      totalWeight += weight * sets;
    });

    createdWorkout.total_sets = totalSets;
    createdWorkout.totalSets = totalSets;

    // try to save to Supabase under `workouts` for the signed-in user
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const payload: Record<string, any> = {
          user_id: user.id,
          name: createdWorkout.name,
          exercises: createdWorkout.exercises,
          form_state: createdWorkout.formState,
          rest_times: createdWorkout.restTimes,
          total_sets: totalSets,
          total_reps_min: totalRepsMin,
          total_reps_max: totalRepsMax,
          total_weight: totalWeight,
        };

        const { data, error } = await supabase.from('workouts').insert([payload]).select().single();
        if (error) {
          console.warn('Failed to save workout', error);
        } else if (data && data.id) {
          // attach id to payload for navigation display
          createdWorkout.id = data.id;
        }
      }
    } catch (err) {
      console.warn('Error saving workout to Supabase', err);
    }

    const nextParams: Record<string, string> = {
      createdWorkout: encodeURIComponent(JSON.stringify(createdWorkout)),
    };

    router.push({ pathname: '/(tabs)/Sidebar Tabs/Workout', params: nextParams } as any);
  };

  // track occurrence counts while rendering so repeated exercises get Set 1, Set 2, ...
  const occurrence: Record<string, number> = {};

  const allRestsFilled = useMemo(() => {
    const required = Math.max(0, items.length - 1);
    if (required === 0) return true;
    if (rests.length < required) return false;
    return rests.slice(0, required).every((r) => typeof r === 'number' && !Number.isNaN(r));
  }, [rests, items.length]);

  return (
    <View style={{ flex: 1, flexDirection: 'row', overflow: 'visible' }}>
      <Animated.View style={{ width: sidebarContainerWidth, overflow: 'visible', backgroundColor: '#010057', flexShrink: 0 }}>
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      <View style={{ flex: 1, overflow: 'visible' }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
            </View>

            <TouchableOpacity style={styles.useSuggestedButton} activeOpacity={0.9} onPress={applySuggestedRests}>
              <Text style={styles.useSuggestedButtonText}>Use Suggested Rest Times</Text>
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Add Rest Times</Text>
            <Text style={styles.cardSubtitle}>
              Set your rest time between exercises, or click the Suggested Rest Times button to apply the optimal rest time based off your fitness goals
            </Text>

            <ScrollView style={styles.listContainer} contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}>
              <Text style={styles.startLabel}>Start of Workout</Text>
              {items.map((it, idx) => {
                const key = it.id || `${it.name}-${idx}`;
                const setNumber = (occurrence[key] || 0) + 1;
                occurrence[key] = setNumber;
                return (
                  <React.Fragment key={`${it.id}-${idx}`}>
                    <View style={styles.restItemBox}>
                      <Text style={styles.placedBoxText}>{it.name}</Text>
                      <Text style={{ color: '#9FBEDB' }}>{`Set ${setNumber}`}</Text>
                    </View>

                    {idx < items.length - 1 && (
                      <View style={styles.restControlRow}>
                        <TouchableOpacity style={styles.arrowContainer} activeOpacity={0.8}>
                          <Text style={styles.arrowIcon}>↓</Text>
                        </TouchableOpacity>

                        <TextInput
                          style={styles.restInput}
                          value={rests[idx] == null ? '' : String(rests[idx])}
                          onChangeText={(t) => setRestValue(idx, t)}
                          keyboardType="numeric"
                          maxLength={3}
                          placeholder={String(suggestedRest)}
                          placeholderTextColor="rgba(230,246,255,0.4)"
                        />

                        <TouchableOpacity style={styles.arrowContainer} activeOpacity={0.8}>
                          <Text style={styles.arrowIcon}>↓</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}

              <Text style={styles.endLabel}>End of Workout</Text>
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.nextButton, !allRestsFilled && styles.nextButtonDisabled]}
                    activeOpacity={0.9}
                    onPress={handleNext}
                    disabled={!allRestsFilled}
                  >
                    <Text style={[styles.nextButtonText, !allRestsFilled && styles.nextButtonTextDisabled]}>Finish Workout</Text>
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
  container: { flex: 1, backgroundColor: '#010057', paddingHorizontal: 20, paddingTop: 30 },
  card: { width: '90%', backgroundColor: '#0a0f3c', borderRadius: 20, paddingVertical: 20, height: '96%', position: 'relative', shadowColor: '#00BFFF', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 12 },
  progressSegment: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginHorizontal: 4 },
  progressSegmentFilled: { backgroundColor: '#00BFFF' },
  cardTitle: { color: '#00BFFF', fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  listContainer: { flex: 1, marginHorizontal: 12, marginBottom: 52, marginTop: -10 },
  restItemBox: { width: '70%', backgroundColor: '#07103a', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#00BBFF', marginVertical: 8, alignItems: 'center' },
  placedBoxText: { color: '#E6F6FF', marginBottom: 6, fontSize: 16 },
  cardSubtitle: { color: 'rgba(230,246,255,0.8)', fontSize: 12, textAlign: 'center', marginBottom: 16, paddingHorizontal: 80 },
  restControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  arrowContainer: { backgroundColor: 'rgba(0,191,255,0.04)', padding: 8, borderRadius: 8, marginHorizontal: 8 },
  arrowIcon: { color: '#00BFFF', fontSize: 18, fontWeight: '700' },
  restInput: { minWidth: 72, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', color: '#E6F6FF', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,191,255,0.06)' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' },
  buttonRow: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: '48%', backgroundColor: '#071033', borderWidth: 1.5, borderColor: '#00BFFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: '#FFFFFF', fontWeight: '700' },
  nextButton: { width: '48%', backgroundColor: '#00BFFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nextButtonDisabled: { backgroundColor: '#071033', borderWidth: 1.5, borderColor: '#00BBFF' },
  nextButtonText: { color: '#010057', fontWeight: '700' },
  nextButtonTextDisabled: { color: '#e6f6ff' },
  useSuggestedButton: {
    position: 'absolute',
    top: 40,
    left: 24,
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
  startLabel: { color: '#00BFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },

  endLabel: {
    color: '#00BFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12 
    },
});
