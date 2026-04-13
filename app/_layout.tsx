import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Root container */}
      <View style={styles.root}>
        {/* Main content */}
        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { overflow: 'visible' },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'visible', // important so arrow is not clipped
  },
  sidebarContainer: {
    flexDirection: 'row',
    position: 'relative', // allows absolute positioning of arrow
    zIndex: 10,
  },
  toggleArrow: {
    position: 'absolute',
    right: -15,       // sits outside the sidebar
    top: '50%',       // vertically center
    transform: [{ translateY: -12 }], // adjust based on arrow height
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // optional: makes arrow visible
    borderRadius: 12,
    shadowColor: '#000',      // optional shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    overflow: 'visible',
  },
});