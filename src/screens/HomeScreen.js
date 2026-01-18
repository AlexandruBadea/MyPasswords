import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Clipboard, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from '../services/StorageService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import * as LocalAuthentication from 'expo-local-authentication';

export default function HomeScreen({ navigation }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                Alert.alert("Notice", "This device does not support biometric authentication.");
            }
        })();
    }, []);

    const loadData = async () => {
        const data = await StorageService.getItems();
        setItems(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleItemPress = async (item) => {
        try {
            const hasAuth = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasAuth || !isEnrolled) {
                Alert.alert("Security", "Please enable device security (PIN/Biometrics) to use this app.");
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to view password',
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                revealPassword(item);
            } else {
                // Authentication failed or cancelled - do nothing
            }
        } catch (e) {
            Alert.alert("Error", "Authentication failed");
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            "Delete Password",
            `Are you sure you want to delete the password for ${item.serviceName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await StorageService.deleteItem(item.id);
                            loadData();
                            Alert.alert("Success", "Password deleted");
                        } catch (e) {
                            Alert.alert("Error", "Could not delete item");
                        }
                    }
                }
            ]
        );
    };

    const revealPassword = async (item) => {
        try {
            const password = await StorageService.getPassword(item.id);
            Alert.alert(
                item.serviceName,
                `Username: ${item.username}\nPassword: ${password}`,
                [
                    { text: "Copy Password", onPress: () => Clipboard.setString(password) },
                    { text: "Delete", style: "destructive", onPress: () => handleDelete(item) },
                    { text: "OK", style: "cancel" }
                ]
            );
        } catch (e) {
            Alert.alert("Error", "Could not retrieve password");
        }
    };

    const renderItem = ({ item, index }) => {
        return <FadeInView index={index} item={item} onPress={handleItemPress} />
    };

    return (
        <LinearGradient colors={Theme.colors.backgroundGradient} style={styles.container}>
            <StatusBar style="light" />
            {items.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="shield-checkmark-outline" size={80} color={Theme.colors.accentCyan} style={{ opacity: 0.5 }} />
                    <Text style={styles.emptyText}>No passwords secured yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddPassword')}
            >
                <LinearGradient
                    colors={[Theme.colors.accentCyan, Theme.colors.accentPink]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={32} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}


const FadeInView = ({ index, item, onPress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, translateY, index]);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: translateY }]
            }}
        >
            <TouchableOpacity onPress={() => onPress(item)}>
                <LinearGradient
                    colors={Theme.colors.cardGradient}
                    style={styles.item}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="key-outline" size={24} color={Theme.colors.accentCyan} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.serviceName}>{item.serviceName}</Text>
                        <Text style={styles.username}>{item.username}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Theme.colors.accentPink} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    item: {
        padding: 20,
        borderRadius: Theme.borderRadius.m,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 243, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    username: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Theme.colors.textSecondary,
        marginTop: 20,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        elevation: 8,
        shadowColor: Theme.colors.accentCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
