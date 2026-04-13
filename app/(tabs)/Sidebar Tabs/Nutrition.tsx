import { FontAwesome } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';

export default function NutritionScreen() {
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
					<View style={styles.lockedContainer}>
						<FontAwesome name="lock" size={45} color="#00BFFF" />
						<Text style={styles.lockedTitle}>This Feature is Currently Locked</Text>
						<Text style={styles.lockedDescription}>
							Snap a photo of your meals and let AI analyze your nutrition instantly. Track calories, macros, and stay on top of your goals—all in one place with Strive+.
						</Text>
						<TouchableOpacity style={styles.requiresButton} activeOpacity={0.85}>
							<Text style={styles.requiresButtonText}>Requires Strive+</Text>
						</TouchableOpacity>
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
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff',
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 32,
	},
	lockedContainer: {
		width: '86%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 24,
		paddingHorizontal: 12,
	},
	lockedTitle: {
		color: '#00BFFF',
		fontSize: 25,
		fontWeight: '700',
		marginTop: 12,
		textAlign: 'center',
	},
	lockedDescription: {
		color: '#FFFFFF',
		fontSize: 16,
		marginTop: 20,
		marginBottom: 18,
		textAlign: 'center',
		lineHeight: 22,
	},
	requiresButton: {
		marginTop: 18,
		backgroundColor: '#00BFFF',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 10,
		alignSelf: 'center',
	},
	requiresButtonText: {
		color: '#010057',
		fontWeight: '700',
		fontSize: 16,
	},
});
