import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

export default function CreateProfile() {
	const router = useRouter();
	const [weight, setWeight] = useState('');
	const [weightUnit, setWeightUnit] = useState('Pounds');
	const [height, setHeight] = useState('');
			const [gender, setGender] = useState('');
		const [age, setAge] = useState('');
	const [selectedColor, setSelectedColor] = useState('#808080');
	const [username, setUsername] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const colors = [
		'#FF4D4D',
		'#FF8C42',
		'#FFD93D',
		'#4DFF88',
		'#4DA6FF',
		'#9B5DE5',
		'#FF66C4',
		'#FFFFFF',
	];

	const handleCreateProfile = () => {
		if (
			!username.trim() ||
			!age.trim() ||
			!gender.trim() ||
			!height.trim() ||
			!weight.trim()
		) {
			setErrorMessage('Please fill out all fields.');
			return;
		}
		setErrorMessage('');
		router.replace('/(tabs)/Sidebar Tabs/Workout');
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.scrollContent}
			keyboardShouldPersistTaps="handled"
		>
			
			{/* BIG ICON */}
			<View style={{ alignSelf: 'center', marginBottom: 25, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
				<View style={{
					position: 'absolute',
					width: 210,
					height: 210,
					borderRadius: 105,
					backgroundColor: selectedColor,
					opacity: 0.2,
					filter: 'blur(24px)', // web only, ignored on native
				}} />
				<View style={{
					width: 150,
					height: 150,
					borderRadius: 87.5,
					borderWidth: 2,
					borderColor: 'black',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
				}}>
					<Ionicons
						name="person-circle"
						size={175}
						color={selectedColor}
					/>
					{/* Pencil circle */}
					<View style={{
						position: 'absolute',
						bottom: 10,
						right: 10,
						width: 38,
						height: 38,
						borderRadius: 19,
						backgroundColor: '#00BFFF',
						justifyContent: 'center',
						alignItems: 'center',
						borderWidth: 1.75,
						borderColor: 'white',
					}}>
						<Feather name="edit-2" size={20} color="white" />
					</View>
				</View>
			</View>

			   {/* COLOR OPTIONS */}
			   <View style={styles.colorContainer}>
				   {colors.map((color, index) => {
					   const isSelected = selectedColor === color;

					   return (
						   <TouchableOpacity
							   key={index}
							   onPress={() => setSelectedColor(color)}
							   style={[
								   styles.iconWrapper,
								   isSelected && [
									   styles.selectedGlow,
									   { shadowColor: color, borderColor: color },
								   ],
							   ]}
						   >
							   <Ionicons
								   name="person-circle"
								   size={62} // 25% bigger (50 → 62)
								   color={color}
							   />
						   </TouchableOpacity>
					   );
				   })}
			   </View>

			   {/* USERNAME INPUT */}
			   <View style={{ width: '100%' }}>
				   <Text style={styles.inputLabel}>Create Username</Text>
			   </View>
			   <TextInput
				   placeholder="Enter username"
				   placeholderTextColor="#888"
				   value={username}
				   onChangeText={setUsername}
				   style={styles.input}
			   />

			   {/* BODY METRICS TITLE */}
			   <View style={{ width: '100%' }}>
				   <Text style={styles.bodyMetricsTitle}>Body Metrics</Text>
				   {/* AGE TITLE */}
				   <Text style={styles.inputLabel}>Age</Text>
				   <TextInput
					   placeholder="Enter your age"
					   placeholderTextColor="#888"
					   value={age}
					   onChangeText={setAge}
					   style={styles.input}
					   keyboardType="numeric"
				   />
				   {/* GENDER TITLE */}
				   <Text style={styles.inputLabel}>Gender</Text>
				   <View style={styles.genderButtonRow}>
					   {['Male', 'Female', 'Prefer not to say', 'Other'].map((option) => (
						   <TouchableOpacity
							   key={option}
							   style={[styles.genderButton, gender === option && styles.genderButtonSelected]}
							   onPress={() => setGender(option)}
						   >
							   <Text style={[styles.genderButtonText, gender === option && styles.genderButtonTextSelected]}>{option}</Text>
						   </TouchableOpacity>
					   ))}
				   </View>
				   {errorMessage ? (
					   <Text style={styles.errorText}>{errorMessage}</Text>
				   ) : null}
				   {/* HEIGHT TITLE */}
				   <Text style={styles.inputLabel}>Height</Text>
				   <TextInput
					   placeholder="Enter your height in centimeters"
					   placeholderTextColor="#888"
					   value={height}
					   onChangeText={setHeight}
					   style={styles.input}
					   keyboardType="numeric"
				   />
				   {/* WEIGHT TITLE */}
				   <Text style={styles.inputLabel}>Weight</Text>
				   <View style={styles.weightRow}>
					   <TextInput
						   placeholder="Enter your weight"
						   placeholderTextColor="#888"
						   value={weight}
						   onChangeText={setWeight}
						   style={styles.weightInput}
						   keyboardType="numeric"
					   />
					   <View style={styles.unitButtonColumn}>
						   {['Pounds', 'Kilograms'].map((unit) => (
							   <TouchableOpacity
								   key={unit}
								   style={[styles.unitButton, weightUnit === unit && styles.unitButtonSelected]}
								   onPress={() => setWeightUnit(unit)}
							   >
								   <Text style={[styles.unitButtonText, weightUnit === unit && styles.unitButtonTextSelected]}>{unit}</Text>
							   </TouchableOpacity>
						   ))}
					   </View>
				   </View>
				   <TouchableOpacity
					   style={styles.createProfileButton}
					   onPress={handleCreateProfile}
				   >
					   <Text style={styles.createProfileButtonText}>Create Profile</Text>
				   </TouchableOpacity>
			   </View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
				genderButtonRow: {
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: 10,
					marginBottom: 20,
				},
				genderButton: {
					backgroundColor: 'rgba(255,255,255,0.08)',
					borderRadius: 8,
					paddingVertical: 8,
					paddingHorizontal: 14,
					marginRight: 8,
					marginTop: 6,
				},
				genderButtonSelected: {
					backgroundColor: '#00BFFF',
				},
				genderButtonText: {
					color: 'white',
					fontSize: 15,
					fontWeight: '500',
				},
				genderButtonTextSelected: {
					color: '#010057',
					fontWeight: 'bold',
				},
			inputLabel: {
				color: 'white',
				fontSize: 16,
				fontWeight: '600',
				marginBottom: 6,
				marginLeft: 2,
				textAlign: 'left',
			},
		   bodyMetricsTitle: {
			   color: '#00BFFF',
			   fontSize: 30,
			   fontWeight: 'bold',
			   marginTop: 10,
			   marginBottom: 40,
			   textAlign: 'left',
		   },
	container: {
		backgroundColor: '#010057',
	},
	scrollContent: {
		flexGrow: 1,
		alignItems: 'center',
		paddingTop: 70,
		paddingHorizontal: 20,
		paddingBottom: 40,
	},

	title: {
		color: '#00BFFF',
		fontSize: 50,
		fontWeight: 'bold',
		marginBottom: 25,
	},


	bigIcon: {
		// No shadow or glow
	},

	input: {
		width: '100%',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 12,
		padding: 15,
		color: 'white',
		fontSize: 16,
		marginBottom: 30,
	},
	weightRow: {
		flexDirection: 'row',
		alignItems: 'stretch',
		gap: 10,
		marginBottom: 30,
	},
	weightInput: {
		width: '80%',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 12,
		padding: 15,
		color: 'white',
		fontSize: 16,
	},
	unitButtonColumn: {
		flex: 1,
		justifyContent: 'space-between',
		gap: 8,
	},
	unitButton: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 8,
		alignItems: 'center',
	},
	unitButtonSelected: {
		backgroundColor: '#00BFFF',
	},
	unitButtonText: {
		color: 'white',
		fontSize: 12,
		fontWeight: '600',
		textAlign: 'center',
	},
	unitButtonTextSelected: {
		color: '#010057',
		fontWeight: '700',
	},
	createProfileButton: {
		width: '100%',
		backgroundColor: '#00BFFF',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		marginTop: 10,
	},
	createProfileButtonText: {
		color: '#010057',
		fontSize: 16,
		fontWeight: '700',
	},
	errorText: {
		color: '#FF7A7A',
		marginTop: 6,
		marginBottom: 16,
		fontSize: 20,
		fontWeight: '700',
		textAlign: 'center',
		alignSelf: 'center',
	},

	   colorContainer: {
		   flexDirection: 'row',
		   flexWrap: 'wrap',
		   justifyContent: 'center',
		   gap: 15,
		   marginBottom: 30,
	   },

	iconWrapper: {
		backgroundColor: 'rgba(255,255,255,0.2)', // 0.2 opacity grey box
		padding: 10,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},

	selectedGlow: {
		shadowOpacity: 0.9,
		shadowRadius: 15,
		elevation: 12,
		borderWidth: 2,
	},
});