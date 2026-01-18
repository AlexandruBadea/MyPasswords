import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { StorageService } from '../services/StorageService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

const AnimatedInput = ({ delay, children }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, translateY, delay]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    )
}

export default function AddPasswordScreen({ navigation }) {
    const [serviceName, setServiceName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!serviceName || !username || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await StorageService.addItem(serviceName, username, password);
            setTimeout(() => {
                Alert.alert("Success", "Password secured successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }, 500);
        } catch (e) {
            Alert.alert("Error", "Failed to save password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <LinearGradient colors={Theme.colors.backgroundGradient} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>

                    <AnimatedInput delay={100}>
                        <Text style={styles.label}>Service Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="globe-outline" size={20} color={Theme.colors.accentCyan} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Google, Facebook"
                                placeholderTextColor={Theme.colors.textSecondary}
                                value={serviceName}
                                onChangeText={setServiceName}
                                autoFocus
                                selectionColor={Theme.colors.accentCyan}
                            />
                        </View>
                    </AnimatedInput>

                    <AnimatedInput delay={200}>
                        <Text style={styles.label}>Username / Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Theme.colors.accentCyan} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. user@example.com"
                                placeholderTextColor={Theme.colors.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                selectionColor={Theme.colors.accentCyan}
                            />
                        </View>
                    </AnimatedInput>

                    <AnimatedInput delay={300}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.accentCyan} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Required"
                                placeholderTextColor={Theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                selectionColor={Theme.colors.accentCyan}
                            />
                        </View>
                    </AnimatedInput>

                    <AnimatedInput delay={400}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[Theme.colors.accentCyan, Theme.colors.accentPink]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.button, loading && styles.disabled]}
                            >
                                <Text style={styles.buttonText}>{loading ? "Encrypting..." : "Save Password"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </AnimatedInput>

                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        padding: 20,
        paddingTop: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: Theme.colors.accentCyan,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 55,
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    button: {
        height: 55,
        borderRadius: Theme.borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        shadowColor: Theme.colors.accentPink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
