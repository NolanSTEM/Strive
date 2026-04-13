import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Sidebar from '../../app-components/Sidebar';
import WorkoutLoader from '../../app-components/WorkoutLoader';
import { supabase } from '../../supabaseClient';

export default function WorkoutScreen() {
  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const router = useRouter();
  const params = useLocalSearchParams();
  const createdWorkoutParam = params?.createdWorkout as string | undefined;

  const [createdWorkouts, setCreatedWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!createdWorkoutParam) return;
    try {
      const decoded = decodeURIComponent(createdWorkoutParam);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.name) {
        const normalized = {
          ...parsed,
          exercises: parsed.exercises ?? [],
          formState: parsed.formState ?? parsed.form_state ?? {},
          restTimes: parsed.restTimes ?? parsed.rest_times ?? [],
        };
        setCreatedWorkouts((prev) => {
          const matchIndex = normalized.id
            ? prev.findIndex((p) => p.id === normalized.id)
            : prev.findIndex((p) => p.name === normalized.name);
          if (matchIndex === -1) return [normalized, ...prev];
          const next = [...prev];
          next[matchIndex] = { ...prev[matchIndex], ...normalized };
          return next;
        });
      }
    } catch (err) {
      console.warn('Failed to parse createdWorkout param', err);
    }
  }, [createdWorkoutParam]);

  useEffect(() => {
    const loadSavedWorkouts = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Failed to load workouts', error);
          return;
        }

        const mapped = (data || []).map((d: any) => ({
          ...d,
          exercises: d.exercises ?? [],
          formState: d.form_state ?? d.formState ?? {},
          restTimes: d.rest_times ?? d.restTimes ?? [],
        }));

        setCreatedWorkouts(mapped);
      } catch (err) {
        console.warn('Failed to fetch workouts', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedWorkouts();
  }, []);

  const handleDelete = async (w: any, idx: number) => {
    try {
      if (w?.id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('No authenticated user for delete');
          return;
        }

        const { error } = await supabase
          .from('workouts')
          .delete()
          .match({ id: w.id, user_id: user.id });

        if (error) {
          console.warn('Failed to delete workout', error);
          return;
        }

        setCreatedWorkouts((prev) => prev.filter((p) => p.id !== w.id));
      } else {
        setCreatedWorkouts((prev) => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      console.warn('Error deleting workout', err);
    }
  };

  const sidebarContainerWidth = Animated.add(width, 60);

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: collapsed ? 90 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Sidebar */}
      <Animated.View
        style={{
          width: sidebarContainerWidth,
          backgroundColor: '#010057',
        }}
      >
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Workouts</Text>
          </View>

          {/* Create Workout Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/Name_Workout')}
          >
            <Text style={styles.createButtonText}>＋ Create Workout</Text>
          </TouchableOpacity>

          {/* Created Workouts List */}
          {createdWorkouts.length > 0 && (
            <View style={{ marginTop: 16 }}>
              {createdWorkouts.map((w, i) => (
                <View key={`${w.name}-${i}`} style={styles.workoutRow}>
                  <TouchableOpacity
                    style={styles.leftStrip}
                    activeOpacity={0.9}
                    onPress={() => handleDelete(w, i)}
                  >
                    <MaterialIcons name="delete" size={32} color="#010057" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.workoutContent}
                    activeOpacity={0.9}
                    onPress={() => {
                      try {
                        const params: Record<string, string> = { workout: encodeURIComponent(JSON.stringify(w)) };
                        router.push({ pathname: '/(tabs)/Workout_Stats', params } as any);
                      } catch (err) {
                        console.warn('Failed to open workout stats', err);
                      }
                    }}
                  >
                    <Text style={styles.workoutRowText}>{w.name}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.workoutRowBg}
                    activeOpacity={0.9}
                    hitSlop={{ left: 16, right: 8, top: 8, bottom: 8 }}
                    onPress={() => {
                      try {
                        const params: Record<string, string> = { workout: encodeURIComponent(JSON.stringify(w)) };
                        router.push({ pathname: '/(tabs)/Workout_Stats', params } as any);
                      } catch (e) {
                        console.warn('Failed to open workout stats', e);
                      }
                    }}
                  >
                    <View style={styles.workoutRowTriangle} pointerEvents="none" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {createdWorkouts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>

              <Text style={styles.emptySubtitle}>
                Create your first workout to start tracking your progress.
              </Text>
            </View>
          )}

        </ScrollView>
        {isLoading && <WorkoutLoader />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010057',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  addButton: {
    backgroundColor: '#00BFFF',
    width: 120,
    height: 55,
    borderRadius: 20,
    borderWidth: 1.75,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  createButton: {
    marginTop: 25,
    backgroundColor: '#00BFFF',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#00BFFF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },

  createButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    marginTop: 80,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },

  emptySubtitle: {
    color: '#8A9BFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  workoutRow: {
    marginHorizontal: 0,
    marginTop: 8,
    backgroundColor: '#transparent',
    paddingVertical: 20,
    paddingLeft: '6%',
    paddingRight: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00BBFF',
    shadowColor: '#00BFFF',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'visible',
  },
  leftStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4%',
    backgroundColor: '#ff3b30',
    borderTopLeftRadius: 7.5,
    borderBottomLeftRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  workoutContent: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    zIndex: 1,
  },
  workoutRowText: {
    color: '#00BFFF',
    fontSize: 24,
    fontWeight: '700',
    zIndex: 1,
  },
  workoutRowBg: {
    position: 'absolute',
    right: -3,
    top: 0,
    bottom: 0,
    width: '4%',
    backgroundColor: '#00BBFF',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  workoutRowTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#010057',
  },
  workoutTip: {
    backgroundColor: '#00BBFF',
    width: '5%',
    height: 60,
    top: -50,
    left: 50,
  },
  workoutTipIcon: {
    color: '#010057',
    fontSize: 16,
    fontWeight: '700',
  },
});