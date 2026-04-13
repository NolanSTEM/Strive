import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../../app-components/Sidebar';
import { supabase } from '../../../supabaseClient';

export default function MyFitnessProfileScreen() {
            // Load profile on mount
            useEffect(() => {
                const loadProfile = async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    const { data, error } = await supabase
                        .from('fitness_profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    if (data) {
                        setPrimaryGoal(data.primary_goal ?? null);
                        setSecondaryGoal(data.secondary_goal ?? null);
                        setExperienceLevel(data.experience_level ?? null);
                        setTrainingStyleSelected(
                            Array.isArray(data.training_style)
                                ? data.training_style
                                : (typeof data.training_style === 'string' && data.training_style.length > 0)
                                    ? data.training_style.split(',').map((s: string) => s.trim())
                                    : []
                        );
                        setAvailableEquipmentSelected(data.available_equipment ?? []);
                    }
                };
                loadProfile();
            }, []);
        // Save Fitness Profile handler
        const handleSaveProfile = async () => {
            // Validate that primary and secondary goals are not the same
            if (primaryGoal && secondaryGoal && primaryGoal === secondaryGoal) {
                setErrorMessage('Primary goal and secondary goal must be different.');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in to save your profile.');
                return;
            }
            // Fetch existing profile to get the id
            const { data: existing, error: fetchError } = await supabase
                .from('fitness_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            const profileData = {
                user_id: user.id,
                primary_goal: primaryGoal ?? null,
                secondary_goal: secondaryGoal ?? null,
                experience_level: experienceLevel ?? null,
                training_style: trainingStyleSelected.length ? trainingStyleSelected.join(', ') : null,
                available_equipment: availableEquipmentSelected.length ? availableEquipmentSelected : null,
                ...(existing && { id: existing.id })
            };
            const { error } = await supabase
                .from('fitness_profiles')
                .upsert([profileData]);
            if (error) {
                alert('Error saving profile: ' + error.message);
                return;
            }
            setHasSaved(true);
            setIsDirty(false);
            setErrorMessage(null);
        };
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);
    const [primaryGoalOpen, setPrimaryGoalOpen] = useState(false);
    const [secondaryGoal, setSecondaryGoal] = useState<string | null>(null);
    const [secondaryGoalOpen, setSecondaryGoalOpen] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
    const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
    const markDirty = () => setIsDirty(true);
    const [trainingStyleSelected, setTrainingStyleSelected] = useState<string[]>([]);
    const trainingOptions = ['Gym', 'Calisthenics', 'Hybrid', 'Home workouts'];
    const toggleTrainingStyle = (opt: string) => {
        setTrainingStyleSelected((prev) =>
            prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]
        );
        markDirty();
    };
    const [availableEquipmentSelected, setAvailableEquipmentSelected] = useState<string[]>([]);
    const equipmentOptions = [
        'Dumbbells',
        'Barbell / Barbell weights',
        'Bench',
        'Pull-up bar',
        'Dip bar',
        'Resistance bands',
        'Kettlebells',
        'Jump rope',
    ];
    const toggleEquipment = (opt: string) => {
        setAvailableEquipmentSelected((prev) =>
            prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]
        );
        markDirty();
    };
    const width = useRef(new Animated.Value(90)).current;
    const sidebarContainerWidth = Animated.add(width, 60);
    const primaryGoalOptions = [
        'Build muscle',
        'Build strength',
        'Lose fat',
        'Increase endurance',
        'Explosive power',
        'Lean muscle',
        'Toned',
    ];

    const toggleSidebar = () => {
        Animated.timing(width, {
            toValue: collapsed ? 90 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setCollapsed(!collapsed);
    };

    useEffect(() => {
        if (errorMessage) setErrorMessage(null);
    }, [primaryGoal, secondaryGoal]);

    const isSaved = hasSaved && !isDirty;

    return (
        <View style={styles.root}>
            {/* Sidebar */}
            <Animated.View style={[styles.sidebarContainer, { width: sidebarContainerWidth }]}>
                <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
            </Animated.View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Floating Card */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="angle-left" size={28} color="#00BFFF" />
                    </TouchableOpacity>
                    {errorMessage && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{errorMessage}</Text>
                        </View>
                    )}
                    <ScrollView
                        style={styles.cardScroll}
                        contentContainerStyle={styles.cardScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.cardTitle}>My Fitness Profile</Text>
                        <View style={{ height: 20 }} />

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Primary goal</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setPrimaryGoalOpen((prev) => !prev)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dropdownButtonText}>
                                    {primaryGoal ?? 'Select a goal'}
                                </Text>
                                <FontAwesome
                                    name={primaryGoalOpen ? 'angle-up' : 'angle-down'}
                                    size={20}
                                    color="#00BFFF"
                                />
                            </TouchableOpacity>

                            {primaryGoalOpen && (
                                <View style={styles.dropdownList}>
                                    {primaryGoalOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setPrimaryGoal(option);
                                                setPrimaryGoalOpen(false);
                                                markDirty();
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    primaryGoal === option &&
                                                        styles.dropdownOptionTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                            {primaryGoal === option && (
                                                <FontAwesome
                                                    name="check"
                                                    size={16}
                                                    color="#00BFFF"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Secondary goal</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setSecondaryGoalOpen((prev) => !prev)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dropdownButtonText}>
                                    {secondaryGoal ?? 'Select a goal'}
                                </Text>
                                <FontAwesome
                                    name={secondaryGoalOpen ? 'angle-up' : 'angle-down'}
                                    size={20}
                                    color="#00BFFF"
                                />
                            </TouchableOpacity>

                            {secondaryGoalOpen && (
                                <View style={styles.dropdownList}>
                                    {primaryGoalOptions.map((option) => (
                                        <TouchableOpacity
                                            key={`secondary-${option}`}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSecondaryGoal(option);
                                                setSecondaryGoalOpen(false);
                                                markDirty();
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    secondaryGoal === option &&
                                                        styles.dropdownOptionTextSelected,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                            {secondaryGoal === option && (
                                                <FontAwesome
                                                    name="check"
                                                    size={16}
                                                    color="#00BFFF"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Experience level</Text>
                            <View style={styles.experienceButtons}>
                                {experienceOptions.map((opt) => {
                                    const selected = experienceLevel === opt;
                                    return (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[
                                                styles.experienceButton,
                                                selected && styles.experienceButtonSelected,
                                            ]}
                                            onPress={() => {
                                                setExperienceLevel(opt);
                                                markDirty();
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.experienceButtonText,
                                                    selected && styles.experienceButtonTextSelected,
                                                ]}
                                            >
                                                {opt}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Training style</Text>
                            <View style={styles.trainingButtons}>
                                {trainingOptions.map((opt) => {
                                    const selected = trainingStyleSelected.includes(opt);
                                    return (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[
                                                styles.trainingButton,
                                                selected && styles.trainingButtonSelected,
                                            ]}
                                            onPress={() => toggleTrainingStyle(opt)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.trainingButtonText,
                                                    selected && styles.trainingButtonTextSelected,
                                                ]}
                                            >
                                                {opt}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {trainingStyleSelected.includes('Home workouts') && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Available equipment</Text>
                                <View style={styles.equipmentList}>
                                    {equipmentOptions.map((eq) => {
                                        const checked = availableEquipmentSelected.includes(eq);
                                        return (
                                            <TouchableOpacity
                                                key={eq}
                                                style={styles.equipmentRow}
                                                onPress={() => toggleEquipment(eq)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.equipmentLabel}>{eq}</Text>
                                                <View
                                                    style={[
                                                        styles.equipmentCheckbox,
                                                        checked && styles.equipmentCheckboxChecked,
                                                    ]}
                                                >
                                                    {checked && (
                                                        <Text style={styles.equipmentCheckboxTick}>✓</Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                    </ScrollView>

                    <View style={styles.cardFooter}>
                        <TouchableOpacity
                            style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
                            activeOpacity={0.85}
                            onPress={handleSaveProfile}
                        >
                            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextSaved]}>
                                {isSaved ? 'Saved' : 'Save Fitness Profile'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

/* Divider */
function Divider() {
    return <View style={styles.divider} />;
}

const dividerSpacing = Dimensions.get('window').height * 0.025;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#010057',
        overflow: 'visible',
    },

    sidebarContainer: {
        overflow: 'visible',
        backgroundColor: '#010057',
        flexShrink: 0,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    /* Card */
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
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 2,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardScroll: {
        flex: 1,
    },

    cardScrollContent: {
        paddingBottom: 120,
        paddingHorizontal: 20,
    },

    cardTitle: {
        color: '#00BFFF',
        fontSize: 35,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 0,
        letterSpacing: 1.5,
    },

    section: {
        marginTop: 10,
    },
    sectionLabel: {
        color: '#00BFFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        right: -5,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#00BFFF',
        backgroundColor: '#0f1a55',
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownButtonText: {
        color: '#E6F6FF',
        fontSize: 20,
        fontWeight: '400',
    },
    dropdownList: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#0b2b6b',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#0f1a55',
    },
    dropdownOption: {
        paddingVertical: 15,
        paddingHorizontal: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,191,255,0.12)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownOptionText: {
        color: '#B5C8FF',
        fontSize: 20,
    },
    dropdownOptionTextSelected: {
        color: '#00BFFF',
        fontWeight: '700',
    },

    experienceButtons: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    experienceButton: {
        flexBasis: '32%',
        backgroundColor: '#0f1a55',
        borderWidth: 1,
        borderColor: '#00BFFF',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    experienceButtonSelected: {
        backgroundColor: '#00BFFF',
    },
    experienceButtonText: {
        color: '#E6F6FF',
        fontSize: 15,
        fontWeight: '600',
    },
    experienceButtonTextSelected: {
        color: '#010057',
        fontWeight: '700',
    },
    trainingButtons: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trainingButton: {
        flexBasis: '23%',
        backgroundColor: '#0f1a55',
        borderWidth: 1,
        borderColor: '#00BFFF',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    trainingButtonSelected: {
        backgroundColor: '#00BFFF',
    },
    trainingButtonText: {
        color: '#E6F6FF',
        fontSize: 14,
        fontWeight: '600',
    },
    trainingButtonTextSelected: {
        color: '#010057',
        fontWeight: '700',
    },
    equipmentList: {
        marginTop: 10,
    },
    equipmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,191,255,0.06)',
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#0f1a55',
    },
    equipmentLabel: {
        color: '#E6F6FF',
        fontSize: 15,
    },
    equipmentCheckbox: {
        width: 22,
        height: 22,
        borderWidth: 1.5,
        borderColor: '#00BFFF',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    equipmentCheckboxChecked: {
        backgroundColor: '#00BFFF',
    },
    equipmentCheckboxTick: {
        color: '#010057',
        fontWeight: '700',
    },

    cardFooter: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 20,
        zIndex: 3,
    },
    saveButton: {
        backgroundColor: '#00BFFF',
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#008BCA',
    },
    saveButtonSaved: {
        backgroundColor: '#000A3C',
        borderColor: '#00BFFF',
    },
    saveButtonText: {
        color: '#010057',
        fontSize: 16,
        fontWeight: '700',
    },
    saveButtonTextSaved: {
        color: '#00BFFF',
        fontWeight: '700',
    },

    /* Inline error banner (top-right of card) */
    errorBanner: {
        position: 'absolute',
        top: 40,
        right: 40,
        zIndex: 4,
        backgroundColor: '#2b0a0f',
        borderColor: '#FF6B6B',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        maxWidth: '58%',
    },
    errorBannerText: {
        color: '#FFB3B3',
        fontSize: 13,
        fontWeight: '600',
    },

    /* Divider */
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,191,255,0.15)',
        marginHorizontal: 20,
        marginVertical: dividerSpacing,
    },
});
