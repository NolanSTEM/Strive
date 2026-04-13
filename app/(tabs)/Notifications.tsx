import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../app-components/Sidebar';

export default function NotificationsScreen() {
	const router = useRouter();
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
					<Text style={styles.text}>Notifications</Text>
					<TouchableOpacity
						style={styles.button}
						onPress={() => router.replace('/(tabs)')}
						activeOpacity={0.8}
					>
						<Text style={styles.buttonText}>Back to Login</Text>
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
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff',
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 32,
	},
	button: {
		backgroundColor: '#fff',
		borderRadius: 24,
		paddingVertical: 14,
		paddingHorizontal: 32,
		alignItems: 'center',
		marginTop: 12,
		shadowColor: '#010057',
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 2,
	},
	buttonText: {
		color: '#010057',
		fontWeight: 'bold',
		fontSize: 18,
		letterSpacing: 1,
	},
});
