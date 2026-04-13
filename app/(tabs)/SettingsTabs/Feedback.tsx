import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Sidebar from '../../app-components/Sidebar';

export default function FeedbackScreen() {
    const router = useRouter();
    const MAX_CHARS = 1500;
    const MAX_WORDS = 200;
    const [feedback, setFeedback] = useState('');
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
                        <Text style={styles.cardTitle}>Feedback</Text>
                        <View style={{ height: 20 }} />

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                multiline
                                placeholder="Write your feedback..."
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={feedback}
                                onChangeText={(text) => {
                                    let truncated = text.slice(0, MAX_CHARS);
                                    const words = truncated.match(/\S+/g) || [];
                                    if (words.length <= MAX_WORDS) {
                                        setFeedback(truncated);
                                        return;
                                    }
                                    const limited = words.slice(0, MAX_WORDS).join(' ');
                                    setFeedback(limited.slice(0, MAX_CHARS));
                                }}
                                textAlignVertical="top"
                                maxLength={MAX_CHARS}
                            />
                            <Text style={styles.counter}>
                                {(feedback.match(/\S+/g) || []).length} / {MAX_WORDS} words · {feedback.length} / {MAX_CHARS} chars
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

/* Divider */
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

    inputWrapper: {
        paddingHorizontal: 20,
        marginTop: 8,
    },

    textInput: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(0,191,255,0.12)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        minHeight: 160,
        fontSize: 16,
    },

    counter: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        alignSelf: 'flex-end',
        marginTop: 8,
        marginRight: 8,
    },

    /* Divider */
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,191,255,0.15)',
        marginHorizontal: 20,
        marginVertical: dividerSpacing,
    },
});
