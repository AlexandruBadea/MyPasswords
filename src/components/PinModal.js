import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { StorageService } from '../services/StorageService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

export default function PinModal({ visible, onClose, onSuccess, isSettingPin = false }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(0);


    const shakeAnim = useRef(new Animated.Value(0)).current;

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        if (visible) {
            setPin('');
            setConfirmPin('');
            setError('');
            setStep(0);
        }
    }, [visible]);

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError('');
    };

    const verify = async (inputPin) => {
        const isValid = await StorageService.verifyPin(inputPin);
        if (isValid) {
            onSuccess();
        } else {
            setError('ACCESS DENIED');
            triggerShake();
            setPin('');
        }
    };

    const handleKeypadPress = (val) => {
        if (val === 'del') {
            handleDelete();
            return;
        }

        if (pin.length < 6) {
            const newPin = pin + val;
            setPin(newPin);

            if (!isSettingPin && newPin.length === 6) {
                setTimeout(() => verify(newPin), 100);
            }

            if (isSettingPin) {
                if (step === 0 && newPin.length === 6) {
                    setConfirmPin(newPin);
                    setPin('');
                    setStep(1);
                } else if (step === 1 && newPin.length === 6) {
                    if (newPin === confirmPin) {
                        StorageService.setPin(newPin).then(() => onSuccess());
                    } else {
                        setError('MISMATCH');
                        triggerShake();
                        setPin('');
                        setStep(0);
                        setConfirmPin('');
                    }
                }
            }
        }
    };

    const renderDot = (index) => {
        const filled = index < pin.length;
        return (
            <View key={index} style={[
                styles.dot,
                filled && styles.dotFilled,
                error ? styles.dotError : null
            ]} />
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(18,4,88,0.95)']} style={styles.container}>

                <Text style={styles.title}>
                    {isSettingPin
                        ? (step === 0 ? 'SET PIN' : 'CONFIRM PIN')
                        : 'SECURITY CHECK'}
                </Text>

                <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
                    {[0, 1, 2, 3, 4, 5].map(renderDot)}
                </Animated.View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.keypad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeypadPress(num.toString())}>
                            <Text style={styles.keyText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.key} onPress={onClose}>
                        <Ionicons name="close" size={24} color={Theme.colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleKeypadPress('0')}>
                        <Text style={styles.keyText}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleKeypadPress('del')}>
                        <Ionicons name="backspace-outline" size={24} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.accentCyan,
        marginBottom: 40,
        letterSpacing: 2,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Theme.colors.textSecondary,
        marginHorizontal: 10,
        backgroundColor: 'transparent'
    },
    dotFilled: {
        backgroundColor: Theme.colors.accentCyan,
        borderColor: Theme.colors.accentCyan,
        shadowColor: Theme.colors.accentCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    dotError: {
        borderColor: Theme.colors.error,
        backgroundColor: Theme.colors.error,
    },
    errorText: {
        color: Theme.colors.error,
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 300,
        justifyContent: 'center',
    },
    key: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    keyText: {
        fontSize: 28,
        color: Theme.colors.textPrimary,
        fontWeight: '300',
    }
});
