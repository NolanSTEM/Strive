import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function parseJSONParam(p?: string | undefined) {
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
}

export default function WorkingOutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const workoutParam = params?.workout as string | undefined;
  const workout = parseJSONParam(workoutParam) || null;

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const formState = workout?.formState ?? (workout as any)?.form_state ?? {};

  const totalSets = useMemo(() => {
    const totalFromWorkout = Number((workout as any)?.total_sets ?? (workout as any)?.totalSets ?? 0);
    if (totalFromWorkout > 0) return totalFromWorkout;
    if (!workout || !Array.isArray((workout as any).exercises)) return 0;
    let sum = 0;
    for (const ex of (workout as any).exercises) {
      if (typeof ex === 'string') {
        const fs = formState && formState[ex] ? formState[ex] : {};
        sum += Number(fs.sets || 1);
      } else {
        const id = ex.id || ex.baseId || ex.name;
        const fs = formState && formState[id] ? formState[id] : {};
        sum += Number(fs.sets ?? ex.sets ?? 1);
      }
    }
    return sum;
  }, [workout]);

  const [completedSets, setCompletedSets] = useState(0);
  useEffect(() => {
    if (completedSets > totalSets) setCompletedSets(totalSets);
  }, [totalSets]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000) as unknown as number;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleExit = () => {
    try {
      router.back();
    } catch (err) {
      router.push('/(tabs)/Sidebar Tabs/Workout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout?.name || 'Working Out'}</Text>
        <TouchableOpacity
          style={[styles.pauseButton, isRunning ? styles.pauseButtonRunning : styles.pauseButtonPaused]}
          onPress={() => setIsRunning((r) => !r)}
          activeOpacity={0.9}
        >
          <MaterialIcons name={isRunning ? 'pause' : 'play-arrow'} size={28} color={isRunning ? '#020035' : '#00BFFF'} />
        </TouchableOpacity>
      </View>

      {totalSets > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            {Array.from({ length: totalSets }).map((_, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => setCompletedSets(idx + 1)}
                style={[
                  styles.segment,
                  idx < completedSets && styles.segmentActive,
                  idx === totalSets - 1 ? { marginRight: 0 } : null,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.content} />

      <TouchableOpacity style={styles.exitButton} onPress={handleExit} activeOpacity={0.8}>
        <Text style={styles.exitText}>Exit</Text>
      </TouchableOpacity>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020035',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  exitButton: {
    position: 'absolute',
    left: 20,
    bottom: 28,
    backgroundColor: '#FF6B6B',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  exitText: {
    color: '#020035',
    fontWeight: '700',
  },
  timerContainer: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    backgroundColor: '#00BFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#020035',
    fontWeight: '700',
    fontSize: 16,
  },
  
  pauseButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  pauseButtonRunning: {
    backgroundColor: '#00BFFF',
    borderColor: '#00BFFF',
  },
  pauseButtonPaused: {
    backgroundColor: 'transparent',
    borderColor: '#00BFFF',
  },
  progressWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    marginRight: 6,
  },
  segmentActive: {
    backgroundColor: '#00BFFF',
  },
});
