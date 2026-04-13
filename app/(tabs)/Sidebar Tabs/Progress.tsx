import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';

export default function ProgressScreen() {
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
                    <Text style={styles.text}>Progress</Text>
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
});
