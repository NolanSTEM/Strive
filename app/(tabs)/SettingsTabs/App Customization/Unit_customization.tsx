import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../../app-components/Sidebar';
import { supabase } from '../../../supabaseClient';

export default function UnitCustomizationScreen() {
	const router = useRouter();
	const [collapsed, setCollapsed] = useState(false);
	const width = useRef(new Animated.Value(90)).current;
	const sidebarContainerWidth = Animated.add(width, 60);

	// Height unit state
	const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
	const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('lb');
	const [exerciseWeightUnit, setExerciseWeightUnit] = useState<'kg' | 'lb'>('lb');
	const [hasSaved, setHasSaved] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const markDirty = () => {
		setIsDirty(true);
		setHasSaved(false);
	};

	useEffect(() => {
		const loadPreferences = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { data } = await supabase
				.from('unit_preferences')
				.select('height_unit, weight_unit, exercise_weight_unit')
				.eq('user_id', user.id)
				.single();
			if (data) {
				if (data.height_unit === 'cm' || data.height_unit === 'ft') setHeightUnit(data.height_unit);
				if (data.weight_unit === 'kg' || data.weight_unit === 'lb') setWeightUnit(data.weight_unit);
				if (data.exercise_weight_unit === 'kg' || data.exercise_weight_unit === 'lb') setExerciseWeightUnit(data.exercise_weight_unit);
			}
			// mark as saved because these values came from the backend
			if (data) {
				setHasSaved(true);
				setIsDirty(false);
			}
		};
		loadPreferences();
	}, []);

	const toggleSidebar = () => {
		Animated.timing(width, {
			toValue: collapsed ? 90 : 0,
			duration: 200,
			useNativeDriver: false,
		}).start();
		setCollapsed(!collapsed);
	};

	const handleSaveUnitSelection = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			alert('You must be logged in to save your preferences.');
			return;
		}

		const { error } = await supabase
			.from('unit_preferences')
			.upsert([
				{
					user_id: user.id,
					height_unit: heightUnit,
					weight_unit: weightUnit,
					exercise_weight_unit: exerciseWeightUnit,
				},
			]);

		if (error) {
			alert('Error saving preferences: ' + error.message);
			return;
		}

		setHasSaved(true);
		setIsDirty(false);
	};

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
					<ScrollView
						style={styles.cardScroll}
						contentContainerStyle={styles.cardScrollContent}
						showsVerticalScrollIndicator={false}
					>
						<Text style={styles.cardTitle}>Unit Customization</Text>
						<View style={{ height: 20 }} />

						{/* Height */}
						<View style={styles.section}>
							<Text style={styles.sectionLabel}>Height</Text>
							<View style={styles.unitToggle}>
								<TouchableOpacity
										style={[styles.unitOption, heightUnit === 'cm' && styles.unitOptionSelected]}
										onPress={() => { setHeightUnit('cm'); markDirty(); }}
									activeOpacity={0.8}
								>
									<Text style={[styles.unitOptionText, heightUnit === 'cm' && styles.unitOptionTextSelected]}>Centimeters</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.unitOption, heightUnit === 'ft' && styles.unitOptionSelected]}
									onPress={() => { setHeightUnit('ft'); markDirty(); }}
									activeOpacity={0.8}
								>
									<Text style={[styles.unitOptionText, heightUnit === 'ft' && styles.unitOptionTextSelected]}>Feet / Inches</Text>
								</TouchableOpacity>
							</View>
							</View>
							<Text style={styles.helperText}>{heightUnit === 'cm' ? "e.g. 160cm tall" : "e.g. 5' 3\" tall"}</Text>
							{/* Weight */}
							<View style={styles.section}>
								<Text style={styles.sectionLabel}>Weight</Text>
								<View style={styles.unitToggle}>
									<TouchableOpacity
										style={[styles.unitOption, weightUnit === 'lb' && styles.unitOptionSelected]}
										onPress={() => { setWeightUnit('lb'); markDirty(); }}
										activeOpacity={0.8}
									>
										<Text style={[styles.unitOptionText, weightUnit === 'lb' && styles.unitOptionTextSelected]}>Pounds</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.unitOption, weightUnit === 'kg' && styles.unitOptionSelected]}
										onPress={() => { setWeightUnit('kg'); markDirty(); }}
										activeOpacity={0.8}
									>
										<Text style={[styles.unitOptionText, weightUnit === 'kg' && styles.unitOptionTextSelected]}>Kilograms</Text>
									</TouchableOpacity>
								</View>
								<Text style={styles.helperText}>{weightUnit === 'kg' ? 'e.g. they weigh 73kg' : 'e.g. they weigh 160lbs'}</Text>
								</View>
								{/* Exercise weight */}
								<View style={styles.section}>
									<Text style={styles.sectionLabel}>Exercise weight</Text>
									<View style={styles.unitToggle}>
										<TouchableOpacity
											style={[styles.unitOption, exerciseWeightUnit === 'lb' && styles.unitOptionSelected]}
											onPress={() => { setExerciseWeightUnit('lb'); markDirty(); }}
											activeOpacity={0.8}
										>
											<Text style={[styles.unitOptionText, exerciseWeightUnit === 'lb' && styles.unitOptionTextSelected]}>Pounds</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={[styles.unitOption, exerciseWeightUnit === 'kg' && styles.unitOptionSelected]}
											onPress={() => { setExerciseWeightUnit('kg'); markDirty(); }}
											activeOpacity={0.8}
										>
											<Text style={[styles.unitOptionText, exerciseWeightUnit === 'kg' && styles.unitOptionTextSelected]}>Kilograms</Text>
										</TouchableOpacity>
									</View>
									<Text style={styles.helperText}>{exerciseWeightUnit === 'kg' ? 'e.g. 9.1kg dumbbells' : 'e.g. 20lbs dumbbells'}</Text>
								</View>
							</ScrollView>

							<View style={styles.cardFooter}>
									<TouchableOpacity
										style={[styles.saveButton, hasSaved && !isDirty && styles.saveButtonSaved]}
										onPress={handleSaveUnitSelection}
										activeOpacity={0.85}
									>
										<Text style={[styles.saveButtonText, hasSaved && !isDirty && styles.saveButtonTextSaved]}>{hasSaved && !isDirty ? 'Saved' : 'Save Unit Selection'}</Text>
									</TouchableOpacity>
							</View>
						</View>
					</View>
		</View>
	);
}

/* Divider removed (unused) */

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
		right: -40,
	},
	unitToggle: {
		flexDirection: 'row',
	},
	unitOption: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: '#00BFFF',
		backgroundColor: '#0f1a55',
		borderRadius: 12,
		marginRight: 8,
		right: -30,
		marginBottom: 8,
	},
	unitOptionSelected: {
		backgroundColor: '#00BFFF',
	},
	unitOptionText: {
		color: '#E6F6FF',
		fontSize: 14,
		fontWeight: '600',
	},
	unitOptionTextSelected: {
		color: '#010057',
		fontWeight: '700',
	},
	helperText: {
		color: '#B0B0B0',
		fontSize: 13,
		marginTop: 6,
		marginBottom: 40,
		right: -50,
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
	saveButtonText: {
		color: '#010057',
		fontSize: 16,
		fontWeight: '700',
	},
	saveButtonSaved: {
		backgroundColor: '#000A3C',
		borderColor: '#00BFFF',
	},
	saveButtonTextSaved: {
		color: '#00BFFF',
		fontWeight: '700',
	},

	/* Divider */
	divider: {
		height: 1,
		backgroundColor: 'rgba(0,191,255,0.15)',
		marginHorizontal: 20,
		marginVertical: dividerSpacing,
	},
});
