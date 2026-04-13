import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

type SidebarProps = {
  width?: Animated.Value;
  collapsed?: boolean;
  onToggle?: () => void;
};

const Sidebar = ({ width, collapsed, onToggle }: SidebarProps) => {
  const router = useRouter();
  const iconSize = 30;
  const iconColor = '#00BFFF';

  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [localWidth] = useState(new Animated.Value(90)); // increased initial width

  const isCollapsed = collapsed ?? localCollapsed;
  const animatedWidth = width ?? localWidth;

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    Animated.timing(localWidth, {
      toValue: localCollapsed ? 90 : 0, // match new width
      duration: 200,
      useNativeDriver: false,
    }).start();
    setLocalCollapsed(!localCollapsed);
  };

  return (
    <Animated.View style={[styles.sidebar, { width: animatedWidth }]}> 
      {!isCollapsed && (
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <FontAwesome name="cog" size={iconSize} color={iconColor} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Settings')}></FontAwesome>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Workout')}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="dumbbell" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/FindWorkouts')}>
            <View style={styles.iconCircle}>
              <FontAwesome name="search" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/FormFix')}>
            <View style={styles.iconCircle}>
              <FontAwesome name="wrench" size={iconSize} color={iconColor} style={{ opacity: 0.5 }} />
              <FontAwesome5 name="lock" size={16} color="#4FD1FF" style={styles.lockIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Nutrition')}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="apple-alt" size={iconSize} color={iconColor} style={{ opacity: 0.5 }} />
              <FontAwesome5 name="lock" size={16} color="#4FD1FF" style={styles.lockIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Progress')}>
            <View style={styles.iconCircle}>
              <FontAwesome name="bullseye" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Calendar')}>
            <View style={styles.iconCircle}>
              <FontAwesome name="calendar" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Rewards')}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="medal" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/Sidebar Tabs/Notifications')}>
            <View style={styles.iconCircle}>
              <FontAwesome name="bell" size={iconSize} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {/* Arrow Button */}
      <TouchableOpacity style={styles.arrowButton} onPress={toggleSidebar}>
        <FontAwesome
          name={isCollapsed ? 'angle-right' : 'angle-left'}
          size={35}
          color="#00BFFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    iconCircle: {
      backgroundColor: 'rgba(79, 209, 255, 0.13)',
      borderRadius: 40,
      width: 54,
      height: 54,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    lockIcon: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.0)',
      zIndex: 2,
    },
  sidebar: {
    backgroundColor: '#00011f',
    height: '100%',
    flexDirection: 'row', // arrow on the right
    alignItems: 'center',
    minWidth: 15,
    maxWidth: 150,
    overflow: 'visible',
  },
  iconsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    marginVertical: Dimensions.get('window').height * 0.0275,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    position: 'absolute',
    right: -30, // pushes it OUTSIDE the sidebar
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 24,
    height: 40,
    borderRadius: 25, // makes it oval
    backgroundColor: '#00011f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00bfffd4',
  },
  },
);

export default Sidebar;