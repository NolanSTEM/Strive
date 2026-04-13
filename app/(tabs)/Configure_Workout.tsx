import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';
import { exercises as exercisesDB } from '../Databases/Exercise_db';
import { supabase } from '../supabaseClient';

export default function ConfigureWorkoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const exercisesParam = params?.exercises as string | undefined;
  const formStateParam = params?.formState as string | undefined;
  const workoutName = params?.workoutName as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(90)).current;
  const sidebarContainerWidth = Animated.add(width, 60);

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: collapsed ? 90 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const [selectedExercisesList, setSelectedExercisesList] = useState<any[]>([]);

  // drag & drop state
  const [placedExercises, setPlacedExercises] = useState<any[]>([]);
  const dragPan = useRef(new Animated.ValueXY()).current;
  const draggingExerciseRef = useRef<any>(null);
  const dropAreaRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<any>(null);
  const cardOffsetRef = useRef({ px: 0, py: 0 });
  const [dropAreaWidth, setDropAreaWidth] = useState(0);
  const [exerciseWeightUnit, setExerciseWeightUnit] = useState<'kg' | 'lb'>('kg');
  const BOX_HALF_HEIGHT = 28;
  const BOX_INNER_WIDTH = 280;
  const BOX_PADDING_HORIZONTAL = 10;
  const BOX_OUTER_WIDTH = BOX_INNER_WIDTH + BOX_PADDING_HORIZONTAL * 2;
  const BOX_HALF_WIDTH = BOX_OUTER_WIDTH / 2;
  const LINE_HEIGHT = 20;
  const TOP_OFFSET = 32;

  const panResponderMap = useRef(new Map<string, any>());

  const webMoveHandlerRef = useRef<any>(null);
  const webUpHandlerRef = useRef<any>(null);

  const getChipPanHandlers = (ex: any) => {
    if (!panResponderMap.current.has(ex.id)) {
      const pr = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e, gestureState) => {
          draggingExerciseRef.current = ex;
          setIsDragging(true);
          if (cardRef.current && cardRef.current.measure) {
            cardRef.current.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
              cardOffsetRef.current = { px, py };
              const { pageX, pageY } = e.nativeEvent;
              dragPan.setValue({ x: pageX - px - 40, y: pageY - py - 20 });
            });
          } else {
            const { pageX, pageY } = e.nativeEvent;
            dragPan.setValue({ x: pageX - 40, y: pageY - 20 });
          }
        },
        onPanResponderMove: (e, gestureState) => {
          const { pageX, pageY } = e.nativeEvent;
          const px = cardOffsetRef.current.px || 0;
          const py = cardOffsetRef.current.py || 0;
          dragPan.setValue({ x: pageX - px - 40, y: pageY - py - 20 });
        },
        onPanResponderRelease: (e, gestureState) => {
          const { pageX, pageY } = e.nativeEvent;
          setIsDragging(false);
          try {
            if (dropAreaRef.current) {
                dropAreaRef.current.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
                  if (pageX >= px && pageX <= px + w && pageY >= py && pageY <= py + h) {
                      setPlacedExercises((prev) => {
                        const BOX_HEIGHT = BOX_HALF_HEIGHT * 2;
                        const spacing = 20;
                        const top = TOP_OFFSET + prev.length * (BOX_HEIGHT + spacing);
                        const centerRaw = Math.round(w / 2 - BOX_HALF_WIDTH);
                        const centerX = Math.max(12, centerRaw);
                        const newPlaced = {
                          id: `${ex.id || `p-${Date.now()}`}-${Date.now()}`,
                          baseId: ex.id || null,
                          name: ex.name || 'Exercise',
                          x: centerX,
                          y: top,
                          weight: '',
                        };
                        return [...prev, newPlaced];
                      });
                    }
                });
              }
          } catch (err) {
            console.warn('Drop measure failed', err);
          }
          draggingExerciseRef.current = null;
          dragPan.setValue({ x: 0, y: 0 });
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: () => {
          draggingExerciseRef.current = null;
          setIsDragging(false);
          dragPan.setValue({ x: 0, y: 0 });
        },
      });
      panResponderMap.current.set(ex.id, pr);
    }
    return panResponderMap.current.get(ex.id).panHandlers;
  };

  // startDrag handled by per-chip PanResponder

  const startWebDrag = (ex: any, evt: any) => {
    draggingExerciseRef.current = ex;
    setIsDragging(true);

    // compute card offset for coordinate transforms
    if (cardRef.current && typeof (cardRef.current as any).getBoundingClientRect === 'function') {
      try {
        const rect = (cardRef.current as any).getBoundingClientRect();
        cardOffsetRef.current = { px: rect.left, py: rect.top };
      } catch (err) {
        // ignore
      }
    } else if (cardRef.current && cardRef.current.measure) {
      try {
        cardRef.current.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
          cardOffsetRef.current = { px, py };
        });
      } catch (err) {
        // ignore
      }
    }

    const pageX = evt?.nativeEvent?.pageX ?? evt?.pageX ?? evt?.clientX ?? 0;
    const pageY = evt?.nativeEvent?.pageY ?? evt?.pageY ?? evt?.clientY ?? 0;
    const px = cardOffsetRef.current.px || 0;
    const py = cardOffsetRef.current.py || 0;
    dragPan.setValue({ x: pageX - px - 40, y: pageY - py - 20 });

    const onMove = (domEvent: any) => {
      const clientX = domEvent.clientX ?? domEvent.pageX ?? 0;
      const clientY = domEvent.clientY ?? domEvent.pageY ?? 0;
      const px2 = cardOffsetRef.current.px || 0;
      const py2 = cardOffsetRef.current.py || 0;
      dragPan.setValue({ x: clientX - px2 - 40, y: clientY - py2 - 20 });
    };

    const onUp = (domEvent: any) => {
      const clientX = domEvent.clientX ?? domEvent.pageX ?? 0;
      const clientY = domEvent.clientY ?? domEvent.pageY ?? 0;
      setIsDragging(false);
      try {
        if (dropAreaRef.current) {
            if (typeof (dropAreaRef.current as any).getBoundingClientRect === 'function') {
            const r = (dropAreaRef.current as any).getBoundingClientRect();
                if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
              setPlacedExercises((prev) => {
                const BOX_HEIGHT = BOX_HALF_HEIGHT * 2;
                const spacing = 20;
                const top = TOP_OFFSET + prev.length * (BOX_HEIGHT + spacing);
                const centerRaw = Math.round(r.width / 2 - BOX_HALF_WIDTH);
                const centerX = Math.max(12, centerRaw);
                const newPlaced = {
                  id: `${ex.id || `p-${Date.now()}`}-${Date.now()}`,
                  baseId: ex.id || null,
                  name: ex.name || 'Exercise',
                  x: centerX,
                  y: top,
                  weight: '',
                };
                return [...prev, newPlaced];
              });
            }
          } else if ((dropAreaRef.current as any).measure) {
            (dropAreaRef.current as any).measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
              if (clientX >= px && clientX <= px + w && clientY >= py && clientY <= py + h) {
                setPlacedExercises((prev) => {
                  const BOX_HEIGHT = BOX_HALF_HEIGHT * 2;
                  const spacing = 20;
                  const top = TOP_OFFSET + prev.length * (BOX_HEIGHT + spacing);
                  const centerRaw = Math.round(w / 2 - BOX_HALF_WIDTH);
                  const centerX = Math.max(12, centerRaw);
                  const newPlaced = {
                    id: `${ex.id || `p-${Date.now()}`}-${Date.now()}`,
                    baseId: ex.id || null,
                    name: ex.name || 'Exercise',
                    x: centerX,
                    y: top,
                    weight: '',
                  };
                  return [...prev, newPlaced];
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn('web drop failed', err);
      }
      draggingExerciseRef.current = null;
      dragPan.setValue({ x: 0, y: 0 });
      if (webMoveHandlerRef.current) document.removeEventListener('mousemove', webMoveHandlerRef.current);
      if (webUpHandlerRef.current) document.removeEventListener('mouseup', webUpHandlerRef.current);
      webMoveHandlerRef.current = null;
      webUpHandlerRef.current = null;
    };

    webMoveHandlerRef.current = onMove;
    webUpHandlerRef.current = onUp;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const updatePlacedWeight = (index: number, text: string) => {
    // allow only digits and limit to 4 characters
    const digitsOnly = (text || '').replace(/\D/g, '');
    const limited = digitsOnly.slice(0, 4);
    setPlacedExercises((prev) => {
      const copy = [...prev];
      if (index >= 0 && index < copy.length) copy[index] = { ...copy[index], weight: limited };
      return copy;
    });
  };

  const removePlaced = (id: string) => {
    setPlacedExercises((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const BOX_HEIGHT = BOX_HALF_HEIGHT * 2;
      const spacing = LINE_HEIGHT;
      const centerX = dropAreaWidth > 0
        ? Math.max(12, Math.round(dropAreaWidth / 2 - BOX_HALF_WIDTH))
        : null;
      return next.map((p, index) => ({
        ...p,
        x: centerX === null ? p.x : centerX,
        y: TOP_OFFSET + index * (BOX_HEIGHT + spacing),
      }));
    });
  };

  React.useEffect(() => {
    if (!exercisesParam) return;
    try {
      let parsed: any = null;
      try { parsed = JSON.parse(exercisesParam); } catch { parsed = JSON.parse(decodeURIComponent(exercisesParam)); }
      const idList = Array.isArray(parsed) ? parsed : [];
      const found = exercisesDB.filter((e) => idList.includes(e.id));
      setSelectedExercisesList(found);
    } catch (err) {
      console.warn('Failed to parse exercises param in Configure_Workout', err);
    }
  }, [exercisesParam]);

  React.useEffect(() => {
    const loadExerciseUnit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('unit_preferences')
          .select('exercise_weight_unit')
          .eq('user_id', user.id)
          .single();
        if (!error && data && (data.exercise_weight_unit === 'kg' || data.exercise_weight_unit === 'lb')) {
          setExerciseWeightUnit(data.exercise_weight_unit);
        }
      } catch (error) {
        console.warn('Failed to load exercise weight unit', error);
      }
    };
    loadExerciseUnit();
  }, []);

  const handleBack = () => {
    // go back to Add_Reps with the same params so state is preserved
    const backParams: Record<string, string> = {
      exercises: encodeURIComponent(exercisesParam || ''),
    };
    if (formStateParam) backParams.formState = encodeURIComponent(formStateParam);
    if (workoutName) backParams.workoutName = encodeURIComponent(workoutName);
    router.push({ pathname: '/(tabs)/Add_Reps', params: backParams });
  };

  const handleNext = () => {
    // forward to Create_Workout, merging placed weights into formState
    let newFormStateParam = formStateParam;
    try {
      const parsed = formStateParam ? (JSON.parse(decodeURIComponent(formStateParam)) || {}) : {};
      placedExercises.forEach((pe) => {
        const key = pe.baseId || pe.id;
        if (!parsed[key]) parsed[key] = {};
        parsed[key].weight = pe.weight || '';
      });
      newFormStateParam = encodeURIComponent(JSON.stringify(parsed));
    } catch (err) {
      console.warn('Failed to merge placed weights into formState', err);
    }

    const nextParams: Record<string, string> = {
      exercises: encodeURIComponent(exercisesParam || ''),
    };
    if (newFormStateParam) nextParams.formState = newFormStateParam;
    // include placed exercises and route to Add_Rest_Times for rest configuration
    try {
      nextParams.placed = encodeURIComponent(JSON.stringify(placedExercises || []));
    } catch (e) {
      nextParams.placed = encodeURIComponent('[]');
    }
    if (workoutName) nextParams.workoutName = encodeURIComponent(workoutName);
    router.push({ pathname: '/(tabs)/Add_Rest_Times', params: nextParams } as any);
  };

  const allWeightsFilled = useMemo(() => {
    return placedExercises.length > 0 && placedExercises.every((p) => typeof p.weight === 'string' && p.weight.trim().length > 0);
  }, [placedExercises]);

  const GUIDE_BOX_HEIGHT = BOX_HALF_HEIGHT * 2;
  const GUIDE_STEP = GUIDE_BOX_HEIGHT + LINE_HEIGHT;
  const guideSlotCount = placedExercises.length + 1;
  const lastGuideBoxTop = TOP_OFFSET + (guideSlotCount - 1) * GUIDE_STEP;
  const endLabelTop = lastGuideBoxTop + GUIDE_BOX_HEIGHT + 8;
  const dropContentHeight = Math.max(
    endLabelTop + 24,
    300
  );

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
          <View ref={cardRef} style={styles.card}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={[styles.progressSegment, styles.progressSegmentFilled]} />
              <View style={styles.progressSegment} />
            </View>

            <Text style={styles.cardTitle}>Configure Workout</Text>
            <Text style={styles.cardSubtitle}>
              Drag-and-Drop exercises into the blanck space to determine what order they appear when working out. Make sure to add weights!
            </Text>

            <View style={styles.listContainer}>
              <View
                ref={dropAreaRef}
                style={styles.dropArea}
                onLayout={(e) => setDropAreaWidth(e.nativeEvent.layout.width)}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ height: dropContentHeight, position: 'relative', paddingBottom: 12 }}
                >
                {dropAreaWidth > 0 && Array.from({ length: guideSlotCount }).map((_, idx) => {
                  const top = TOP_OFFSET + idx * GUIDE_STEP;
                  const centerX = Math.max(12, Math.round(dropAreaWidth / 2 - BOX_HALF_WIDTH));
                  const showGuideBox = idx >= placedExercises.length;
                  const isFirstGuide = placedExercises.length === 0 && idx === 0;
                  return (
                    <React.Fragment key={`guide-${idx}`}>
                      {idx > 0 && (
                        <View
                          style={[
                            styles.guideLine,
                            {
                              left: centerX + BOX_HALF_WIDTH - 1,
                              top: top - LINE_HEIGHT,
                              height: LINE_HEIGHT,
                            },
                          ]}
                        />
                      )}
                      {showGuideBox && (
                        <View
                          style={[
                            styles.guideBox,
                            {
                              left: centerX,
                              top,
                              width: Math.max(BOX_OUTER_WIDTH, 120),
                              paddingHorizontal: BOX_PADDING_HORIZONTAL,
                            },
                          ]}
                        >
                          <Text style={styles.guideBoxText}>
                            {isFirstGuide ? 'Place First Exercise Here' : 'Place Next Exercise'}
                          </Text>
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
                {dropAreaWidth > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      left: Math.max(12, Math.round(dropAreaWidth / 2 - BOX_HALF_WIDTH)),
                      top: -5,
                      width: Math.max(BOX_OUTER_WIDTH, 120),
                      alignItems: 'center',
                      zIndex: 3,
                    }}
                  >
                    <Text style={styles.startLabel}>Start of Workout</Text>
                  </View>
                )}
                {placedExercises.map((p, idx) => (
                  <View
                    key={`${p.id}-${idx}`}
                    style={[
                      styles.placedBox,
                      { left: p.x, top: p.y, width: Math.max(BOX_OUTER_WIDTH, 120), minWidth: 120, paddingHorizontal: BOX_PADDING_HORIZONTAL },
                    ]}
                  >
                    <Text style={styles.placedBoxText}>{p.name}</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={p.weight}
                      onChangeText={(t) => updatePlacedWeight(idx, t)}
                      placeholder={exerciseWeightUnit}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholderTextColor="rgba(230,246,255,0.4)"
                    />
                    <TouchableOpacity style={styles.deleteButton} onPress={() => removePlaced(p.id)}>
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {/* End of Workout label below the last guide box */}
                {dropAreaWidth > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      left: Math.max(12, Math.round(dropAreaWidth / 2 - BOX_HALF_WIDTH)),
                      top: endLabelTop,
                      width: Math.max(BOX_OUTER_WIDTH, 120),
                      alignItems: 'center',
                      zIndex: 1,
                    }}
                  >
                    <Text style={styles.endLabel}>End of Workout</Text>
                  </View>
                )}
                </ScrollView>
              </View>
            </View>

            <View style={styles.selectedBox}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedBoxContent}>
                {selectedExercisesList.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.chip}
                    activeOpacity={0.8}
                    {...getChipPanHandlers(ex)}
                    onPressIn={(e) => {
                      if (Platform.OS === 'web') startWebDrag(ex, e);
                    }}
                  >
                    <Text style={styles.chipText}>{ex.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {isDragging && (
              <View style={styles.dragOverlay}>
                <Animated.View style={[styles.dragPreview, { transform: dragPan.getTranslateTransform() }]}> 
                  <Text style={styles.chipText}>{draggingExerciseRef.current?.name}</Text>
                </Animated.View>
              </View>
            )}

            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextButton, !allWeightsFilled && styles.nextButtonDisabled]}
                  activeOpacity={0.9}
                  onPress={handleNext}
                  disabled={!allWeightsFilled}
                >
                  <Text style={[styles.nextButtonText, !allWeightsFilled && styles.nextButtonTextDisabled]}>Next</Text>
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
    color: 'rgba(230,246,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
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
    marginBottom: 4,
    marginTop: - 20,
    overflow: 'hidden',
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
  selectedBox: {
    marginHorizontal: 12,
    marginBottom: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.06)',
    backgroundColor: 'rgba(0,191,255,0.02)',
    paddingVertical: 8,
  },
  selectedBoxContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,191,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.08)',
    marginRight: 8,
  },
  chipText: {
    color: '#E6F6FF',
    fontSize: 13,
  },
  dropArea: {
    minHeight: 255,
    minWidth: 300,
    marginVertical: 25,
    position: 'relative',
    borderWidth: 0,
    borderColor: '#00BFFF',
    flex: 1,
  },
  placedBox: {
    position: 'absolute',
    backgroundColor: '#07103a',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    zIndex: 2,
  },
  guideBox: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.4)',
    height: 56,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBoxText: {
    color: 'rgba(230,246,255,0.6)',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  guideLine: {
    position: 'absolute',
    width: 0.5,
    backgroundColor: '#00BFFF',
    opacity: 0.7,
    zIndex: 1,
  },
  placedBoxText: {
    color: '#E6F6FF',
    marginRight: 8,
  },
  weightInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#E6F6FF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 50,
    maxWidth: 50,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  dragOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  dragPreview: {
    position: 'absolute',
    backgroundColor: 'rgba(0,191,255,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,191,255,0.1)',
  },
  startLabel: {
    color: '#00BFFF',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 3,
  },
  endLabel: {
    color: '#00BFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
