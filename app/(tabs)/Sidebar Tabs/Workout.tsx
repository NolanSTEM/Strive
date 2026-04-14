import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';
import WorkoutLoader from '../../app-components/WorkoutLoader';
import { supabase } from '../../supabaseClient';

import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Header from '../../../components/ui/Header';
import ListItem from '../../../components/ui/ListItem';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import Section from '../../../components/ui/Section';
import theme from '../../../constants/theme';

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
    <View style={styles.root}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebarWrap, { width: sidebarContainerWidth }]}> 
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      {/* Main Content */}
      <ScreenContainer style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Header title="My Workouts" />

          <Section title="">
            <Button
              onPress={() => router.push('/(tabs)/Name_Workout')}
              style={styles.createButton}
              textStyle={styles.createButtonText}
            >
              ＋ Create Workout
            </Button>
          </Section>

          {createdWorkouts.length > 0 ? (
            <Section title="Saved Workouts">
              {createdWorkouts.map((w, i) => (
                <Card key={`${w.name}-${i}`} variant="glass" style={styles.workoutCard}>
                  <ListItem
                    title={w.name}
                    onPress={() => {
                      try {
                        const params: Record<string, string> = { workout: encodeURIComponent(JSON.stringify(w)) };
                        router.push({ pathname: '/(tabs)/Workout_Stats', params } as any);
                      } catch (err) {
                        console.warn('Failed to open workout stats', err);
                      }
                    }}
                    rightElement={
                      <View style={styles.actionsRow}>
                        <Button
                          variant="secondary"
                          onPress={() => handleDelete(w, i)}
                          style={[styles.iconButton, styles.deleteButton]}
                          textStyle={styles.smallIconText}
                        >
                          <MaterialIcons name="delete" size={18} color={theme.colors.accent} />
                        </Button>

                        <Button
                          variant="primary"
                          onPress={() => {
                            try {
                              const params: Record<string, string> = { workout: encodeURIComponent(JSON.stringify(w)) };
                              router.push({ pathname: '/(tabs)/Workout_Stats', params } as any);
                            } catch (e) {
                              console.warn('Failed to open workout stats', e);
                            }
                          }}
                          style={styles.arrowButton}
                        >
                          <MaterialIcons name="chevron-right" size={20} color={theme.colors.textPrimary} />
                        </Button>
                      </View>
                    }
                  />
                </Card>
              ))}
            </Section>
          ) : (
            <Card style={styles.emptyCard}>
              <ListItem title="No Workouts Yet" subtitle="Create your first workout to start tracking your progress." />
            </Card>
          )}
        </ScrollView>

        {isLoading && <WorkoutLoader />}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  sidebarWrap: {
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  workoutCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.r16,
    padding: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    minWidth: 44,
    borderRadius: theme.radii.r12,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  deleteButton: {
    marginRight: theme.spacing.sm,
  },
  emptyCard: {
    marginTop: theme.spacing.xxl,
    borderRadius: theme.radii.r16,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    width: '100%',
    borderRadius: theme.radii.r20,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.primaryButtonGradientStart,
    borderColor: theme.colors.primaryButtonGradientEnd,
    borderWidth: 1,
    shadowColor: theme.colors.primaryButtonGlow2,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section.fontSize,
    fontWeight: theme.typography.section.fontWeight as any,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryButtonGradientEnd,
    shadowColor: theme.colors.primaryButtonGlow1,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  smallIconText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body.fontSize,
  },
});