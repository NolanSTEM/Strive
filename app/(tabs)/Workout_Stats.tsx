import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';
import { exercises as exercisesDB } from '../Databases/Exercise_db';

export default function WorkoutStatsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const workoutParam = params?.workout as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);
  const toggleSidebar = () => {
    Animated.timing(width, { toValue: collapsed ? 90 : 0, duration: 200, useNativeDriver: false }).start();
    setCollapsed(!collapsed);
  };

  const parseJSONParam = (p?: string | undefined) => {
    if (!p) return null;
    try {
      return JSON.parse(p as string);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(p as string));
      } catch {
        return null;
      }
    }
  };

  const workout = parseJSONParam(workoutParam) || null;
  const formState = useMemo(() => workout?.formState ?? (workout as any)?.form_state ?? {}, [workout]);

  const items = useMemo(() => {
    if (!workout || !Array.isArray(workout.exercises)) return [];
    return workout.exercises.map((ex: any) => {
      if (typeof ex === 'string') {
        const found = exercisesDB.find((e) => e.id === ex) || { id: ex, name: ex };
        const fs = formState && formState[ex] ? formState[ex] : {};
        const sets = Number(fs.sets || 1);
        const repsMin = Number(fs.repsMin || fs.reps || 0);
        const repsMax = Number(fs.repsMax || 0);
        const weight = Number(fs.weight || 0);
        return { id: found.id, name: found.name, sets, repsMin, repsMax, weight };
      }

      // ex is object
      const id = ex.id || ex.baseId || ex.name;
      const found = exercisesDB.find((e) => e.id === id) || { id, name: ex.name || id };
      const fs = formState && formState[id] ? formState[id] : {};
      const sets = Number(fs.sets ?? ex.sets ?? 1);
      const repsMin = Number(fs.repsMin ?? ex.repsMin ?? 0);
      const repsMax = Number(fs.repsMax ?? ex.repsMax ?? 0);
      const weight = Number(fs.weight ?? ex.weight ?? 0);
      return { id: found.id, name: found.name, sets, repsMin, repsMax, weight };
    });
  }, [workout, formState]);

  const totals = useMemo(() => {
    const totalSetsFromItems = items.reduce((acc: number, it: any) => acc + (Number(it.sets) || 0), 0);
    const totalSetsFromWorkout = Number((workout as any)?.total_sets ?? (workout as any)?.totalSets ?? 0);
    const totalSets = totalSetsFromWorkout > 0 ? totalSetsFromWorkout : totalSetsFromItems;
    const totalRepsMin = items.reduce((acc: number, it: any) => acc + (Number(it.repsMin || 0) * (Number(it.sets) || 1)), 0);
    const totalRepsMax = items.reduce((acc: number, it: any) => acc + ((Number(it.repsMax) || Number(it.repsMin) || 0) * (Number(it.sets) || 1)), 0);
    const totalWeight = items.reduce((acc: number, it: any) => acc + ((Number(it.weight) || 0) * (Number(it.sets) || 1)), 0);
    return { totalSets, totalRepsMin, totalRepsMax, totalWeight };
  }, [items, workout]);

  const handleEdit = () => {
    try {
      const params: Record<string, string> = {};
      if (workout?.exercises) params.exercises = encodeURIComponent(JSON.stringify(workout.exercises));
      if (Object.keys(formState || {}).length > 0) params.formState = encodeURIComponent(JSON.stringify(formState));
      if (workout?.name) params.workoutName = encodeURIComponent(String(workout.name));
      router.push({ pathname: '/(tabs)/Configure_Workout', params } as any);
    } catch (err) {
      console.warn('Failed to navigate to edit', err);
    }
  };

  const handleStart = () => {
    try {
      const params: Record<string, string> = { workout: encodeURIComponent(JSON.stringify(workout || {})) };
      router.push({ pathname: '/WorkingOut', params } as any);
    } catch (err) {
      console.warn('Failed to start workout', err);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Animated.View style={{ width: sidebarContainerWidth, backgroundColor: '#010057' }}>
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              try {
                router.push('/(tabs)/Sidebar Tabs/Workout');
              } catch (err) {
                console.warn('Failed to navigate back to Workouts', err);
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{workout?.name || 'Workout Stats'}</Text>
        </View>

        <View style={styles.statsBox}>
          <View style={styles.statsItem}>
            <MaterialIcons name="format-list-numbered" size={20} color="#00BFFF" />
            <Text style={styles.statValue}>{totals.totalSets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>

          <View style={[styles.statsItem, styles.statsDivider]}>
            <MaterialIcons name="repeat" size={20} color="#00BFFF" />
            <Text style={styles.statValue}>{totals.totalRepsMin}{totals.totalRepsMax && totals.totalRepsMax !== totals.totalRepsMin ? ` - ${totals.totalRepsMax}` : ''}</Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>

          <View style={[styles.statsItem, styles.statsDivider]}>
            <MaterialIcons name="fitness-center" size={20} color="#00BFFF" />
            <Text style={styles.statValue}>{totals.totalWeight}</Text>
            <Text style={styles.statLabel}>Total Weight</Text>
          </View>

          <View style={[styles.statsItem, styles.statsDivider]}>
            <MaterialIcons name="timer" size={20} color="#00BFFF" />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          {items.map((it: any) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{it.name}</Text>
              <Text style={styles.itemSets}>{`Sets: ${it.sets}`}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.9} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010057',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  backText: {
    color: '#8AB7FF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  itemRow: {
    backgroundColor: 'rgba(4, 79, 159, 0.55)',
    borderRadius: 16,
    borderColor: '#00BFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    color: '#E6F6FF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
    marginRight: 12,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    color: '#9FBEDB',
    marginRight: 12,
  },
  itemSets: {
    color: '#E6F6FF',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'right',
    minWidth: 80,
  },
  statsBox: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: 'rgba(0,191,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.04)',
  },
  statValue: {
    color: '#E6F6FF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  statLabel: {
    color: '#9FBEDB',
    fontSize: 12,
    marginTop: 4,
  },
  totalsCard: {
    marginTop: 24,
    backgroundColor: 'rgba(0,191,255,0.06)',
    borderRadius: 12,
    padding: 14,
  },
  totalsTitle: {
    color: '#00BFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalsText: {
    color: '#E6F6FF',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  editButton: {
    flex: 0.48,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#00BFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#00BFFF',
    fontWeight: '700',
  },
  startButton: {
    flex: 0.48,
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#010057',
    fontWeight: '700',
  },
});
