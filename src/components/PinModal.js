import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StorageService } from '../services/StorageService';

export default function PinModal({ visible, onClose, onSuccess, isSettingPin = false }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setPin('');
            setConfirmPin('');
            setError('');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (isSettingPin) {
            if (!confirmPin) {
                return;
            }
            if (pin !== confirmPin) {
                setError('PINs do not match');
                return;
            }
            await StorageService.setPin(pin);
            onSuccess();
        } else {
            const isValid = await StorageService.verifyPin(pin);
            if (isValid) {
                onSuccess();
            } else {
                setError('Incorrect PIN');
                setPin('');
            }
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>{isSettingPin ? 'Set New PIN' : 'Enter PIN'}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter PIN"
                        value={pin}
                        onChangeText={setPin}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={6}
                        autoFocus={true}
                    />

                    {isSettingPin && (
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChangeText={setConfirmPin}
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={6}
                        />
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonContainer}>
                        {!isSettingPin && (
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                            <Text style={styles.textStyle}>{isSettingPin ? 'Save PIN' : 'Unlocking...'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
        borderWidth: 1,
        borderColor: '#333',
    },
    title: {
        fontSize: 20,
        marginBottom: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 5,
        color: '#FFFFFF',
        backgroundColor: '#121212',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: '#4A90E2',
    },
    cancelButton: {
        backgroundColor: '#CF6679',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: '#CF6679',
        marginBottom: 10,
    },
});
