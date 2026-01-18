import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StorageService } from '../services/StorageService';

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
            Alert.alert("Success", "Password saved successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert("Error", "Failed to save password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.label}>Service Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Google, Facebook"
                    value={serviceName}
                    onChangeText={setServiceName}
                    autoFocus
                />

                <Text style={styles.label}>Username / Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. user@example.com"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Required"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.disabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Password"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scroll: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#B3B3B3',
    },
    input: {
        height: 50,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: '#1E1E1E',
    },
    button: {
        backgroundColor: '#4A90E2',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
    },
    disabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
