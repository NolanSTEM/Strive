import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    AppState,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DumbbellFallingAni from '../app-components/DumbbellFallingAni';
import StriveIntro from '../app-components/StriveIntro';
import { supabase } from '../supabaseClient';

export default function AuthScreen() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;

    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at && isSignUp) {
        router.replace('/(tabs)/CreateProfile');
      }
    };

    if (verificationSent && isSignUp) {
      subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          checkVerification();
        }
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [verificationSent, isSignUp, router]);

  // Handler for sign up
  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: Linking.createURL('/CreateProfile'),
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setVerificationSent(true);
    }
    setLoading(false);
  };

  // Handler for login
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setShowIntro(true);
      setLoading(false);
    }
  };

  if (verificationSent && isSignUp) {
    return (
      <View style={{ flex: 1, backgroundColor: '#010057', justifyContent: 'center', alignItems: 'center' }}>
        {/* Dumbbell animation background */}
        <DumbbellFallingAni />
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 24,
            paddingVertical: 32,
            paddingHorizontal: 28,
            alignItems: 'center',
            maxWidth: 500,
            width: '100%',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 16,
              letterSpacing: 1,
              textShadowColor: '#000',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}>
              🎉 Account Created!
            </Text>
            <Text style={{
              color: '#fff',
              fontSize: 20,
              textAlign: 'center',
              opacity: 0.92,
              marginBottom: 8,
              lineHeight: 30,
              textShadowColor: '#000',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}>
              {`Please check your email (${email}) inbox to verify your account and start your fitness journey!`}
            </Text>
              <Text style={{
              color: '#FFD700',
              fontSize: 16,
              textAlign: 'center',
              marginTop: 12,
              opacity: 0.85,
            }}>
              (Don&apos;t get the email? Check your spam folder.)
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (showIntro) {
    return <StriveIntro onFinish={() => {
      setShowIntro(false);
      router.replace('/(tabs)/Sidebar Tabs/Workout');
    }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Dumbbell animation background */}
      <DumbbellFallingAni />
      {/* Portal content overlays the animation */}
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#222"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#222"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />

            {error ? (
              <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.85 },
                loading && { opacity: 0.6 },
              ]}
              onPress={isSignUp ? handleSignUp : handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? (isSignUp ? 'Signing Up...' : 'Logging In...') : (isSignUp ? 'Create Account' : 'Login')}
              </Text>
            </Pressable>

            <TouchableOpacity
              onPress={() => {
                setMode(isSignUp ? 'login' : 'signup');
                setEmail('');
                setPassword('');
                setError('');
                // Removed setVerificationCode
              }}
              style={styles.toggleLinkContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleLink}>
                {isSignUp
                  ? 'Already have an account? Login'
                  : 'Don&apos;t have an account? Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#010057',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 36,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 18,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#010057',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#010057',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  toggleLinkContainer: {
    marginTop: 8,
  },
  toggleLink: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    opacity: 0.85,
    fontWeight: '500',
  },
});
