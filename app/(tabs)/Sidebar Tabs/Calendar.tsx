import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';

export default function CalendarScreen() {
	const [collapsed, setCollapsed] = useState(false);
	const width = useRef(new Animated.Value(90)).current;
	const sidebarContainerWidth = Animated.add(width, 60);

	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(new Date());

	const toggleSidebar = () => {
		Animated.timing(width, {
			toValue: collapsed ? 90 : 0,
			duration: 200,
			useNativeDriver: false,
		}).start();
		setCollapsed(!collapsed);
	};

	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const firstDayIndex = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const cells: (number | null)[] = [];
	for (let i = 0; i < firstDayIndex; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);

	const weeks: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

	const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
	const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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
					<View style={styles.headerRow}>
						<Text style={styles.header}>Calendar</Text>
					</View>

					<View style={styles.calendarContainer}>
						<View style={styles.calendarHeader}>
							<TouchableOpacity onPress={goPrevMonth} style={styles.navButton}>
								<Text style={styles.navButtonText}>{'<'}</Text>
							</TouchableOpacity>
							<Text style={styles.monthText}>{monthNames[month]} {year}</Text>
							<TouchableOpacity onPress={goNextMonth} style={styles.navButton}>
								<Text style={styles.navButtonText}>{'>'}</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.weekDaysRow}>
							{weekDayNames.map((d) => (
								<Text key={d} style={styles.weekDayText}>{d}</Text>
							))}
						</View>

						<View style={styles.weeksContainer}>
							{weeks.map((week, wi) => (
								<View key={wi} style={styles.weekRow}>
									{week.map((day, di) => {
										const today = new Date();
										const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
										const isSelected = day !== null && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

										return (
											<TouchableOpacity
												key={di}
												onPress={() => day && setSelectedDate(new Date(year, month, day))}
												style={[styles.dayCell, isSelected && styles.selectedDay]}
												activeOpacity={day ? 0.7 : 1}
											>
												<Text style={[styles.dayText, isToday && styles.todayText]}>{day ? String(day) : ''}</Text>
											</TouchableOpacity>
										);
									})}
								</View>
							))}
						</View>
					</View>

					<View style={styles.workoutContainer}>
						<Text style={styles.workoutTitle}>Workout for {selectedDate.toDateString()}</Text>
						<View style={styles.workoutBody}>
							<Text style={styles.noWorkoutText}>No workout scheduled for this day.</Text>
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
		paddingHorizontal: 18,
		paddingTop: 24,
		paddingBottom: 36,
	},
	headerRow: {
		alignItems: 'center',
		marginBottom: 12,
	},
	header: {
		color: '#00BFFF',
		fontSize: 22,
		fontWeight: '700',
	},
	calendarContainer: {
		backgroundColor: 'rgba(0,191,255,0.04)',
		borderColor: '#00BFFF',
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
	},
	calendarHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	navButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	navButtonText: {
		color: '#9FBEDB',
		fontSize: 18,
	},
	monthText: {
		color: '#E6F6FF',
		fontSize: 16,
		fontWeight: '700',
	},
	weekDaysRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	weekDayText: {
		color: '#9FBEDB',
		width: 36,
		textAlign: 'center',
		fontSize: 12,
		fontWeight: '700',
	},
	weeksContainer: {},
	weekRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	dayCell: {
		width: 36,
		height: 36,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dayText: {
		color: '#E6F6FF',
		fontSize: 13,
	},
	todayText: {
		color: '#00BFFF',
		fontWeight: '800',
	},
	selectedDay: {
		backgroundColor: '#00BFFF',
	},
	workoutContainer: {
		marginTop: 18,
		backgroundColor: 'rgba(0,191,255,0.03)',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: 'rgba(0,191,255,0.08)'
	},
	workoutTitle: {
		color: '#00BFFF',
		fontWeight: '700',
		marginBottom: 8,
	},
	workoutBody: {
		minHeight: 80,
		justifyContent: 'center',
	},
	noWorkoutText: {
		color: '#9FBEDB',
	},
});
