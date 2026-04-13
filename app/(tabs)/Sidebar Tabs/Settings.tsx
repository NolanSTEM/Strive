import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';

export default function SettingsScreen() {
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
    <View style={styles.root}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebarContainer, { width: sidebarContainerWidth }]}>
        <Sidebar width={width} collapsed={collapsed} onToggle={toggleSidebar} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>

        {/* Floating Card */}
        <View style={styles.card}>
            <ScrollView
              style={styles.cardScroll}
              contentContainerStyle={styles.cardScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.cardTitle}>Settings</Text>
              <View style={{ height: 20 }} />
              <Divider />
              <SettingItem icon="user" label="Account" />
              <Divider />

              <SettingItem icon="message-alert-outline" label="Feedback" onPress={() => router.push('/(tabs)/SettingsTabs/Feedback')} />
              <Divider />

              <SettingItem icon="eye" label="Appearance" />
              <Divider />

              <SettingItem icon="lock" label="Privacy and Security" />
              <Divider />

              <SettingItem icon="help-circle" label="Help and Support" />
              <Divider />

              <SettingItem icon="credit-card-outline" label="Billing and Licensing" />
              <Divider />

              <SettingItem
                icon="tune"
                label="App customization"
                onPress={() => router.push('/(tabs)/SettingsTabs/App Customization/App_customization')}
              />
            </ScrollView>
        </View>

      </View>
    </View>
  );
}

/* 🔹 Setting Item */
function SettingItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.left}>
        {icon === 'weight-lifter' ? (
          <MaterialCommunityIcons name="weight-lifter" size={20} color="#00BFFF" />
        ) : icon === 'help-circle' ? (
          <MaterialCommunityIcons name="help-circle" size={20} color="#00BFFF" />
        ) : icon === 'credit-card-outline' ? (
          <MaterialCommunityIcons name="credit-card-outline" size={20} color="#00BFFF" />
        ) : icon === 'tune' ? (
          <MaterialCommunityIcons name="tune" size={20} color="#00BFFF" />
        ) : icon === 'message-alert-outline' ? (
          <MaterialCommunityIcons name="message-alert-outline" size={20} color="#00BFFF" />
        ) : (
          <FontAwesome name={icon as any} size={20} color="#00BFFF" />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      <FontAwesome name="angle-right" size={22} color="#00BFFF" />
    </TouchableOpacity>
  );
}

/* 🔹 Divider */
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
    // Glow + shadow
    shadowColor: '#00BFFF',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  cardScroll: {
    flex: 1,
  },

  cardScrollContent: {
    paddingBottom: 20,
  },

  cardTitle: {
    color: '#00BFFF',
    fontSize: 35,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 0,
    letterSpacing: 1.5,
  },

  /* Items */
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,191,255,0.15)',
    marginHorizontal: 20,
    marginVertical: dividerSpacing,
  },
});