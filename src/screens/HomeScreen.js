import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Clipboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from '../services/StorageService';
import PinModal from '../components/PinModal';

export default function HomeScreen({ navigation }) {
    const [items, setItems] = useState([]);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadData = async () => {
        const data = await StorageService.getItems();
        setItems(data);

        const hasPin = await StorageService.hasPin();
        if (!hasPin) {
            setIsSettingPin(true);
            setPinModalVisible(true);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleItemPress = (item) => {
        setSelectedItem(item);
        setIsSettingPin(false);
        setPinModalVisible(true);
    };

    const handlePinSuccess = async () => {
        setPinModalVisible(false);
        if (isSettingPin) {
            Alert.alert("Success", "PIN set successfully!");
            setIsSettingPin(false);
        } else if (selectedItem) {
            try {
                const password = await StorageService.getPassword(selectedItem.id);
                Alert.alert(
                    selectedItem.serviceName,
                    `Username: ${selectedItem.username}\nPassword: ${password}`,
                    [
                        { text: "Copy Password", onPress: () => Clipboard.setString(password) },
                        { text: "OK" }
                    ]
                );
            } catch (e) {
                Alert.alert("Error", "Could not retrieve password");
            }
            setSelectedItem(null);
        }
    };

    const handlePinClose = () => {
        if (isSettingPin) {
            Alert.alert("Requirement", "You must set a PIN to use this app.");
            return;
        }
        setPinModalVisible(false);
        setSelectedItem(null);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)}>
            <View>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.username}>{item.username}</Text>
            </View>
            <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            {items.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No passwords saved yet.</Text>
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
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <PinModal
                visible={pinModalVisible}
                onClose={handlePinClose}
                onSuccess={handlePinSuccess}
                isSettingPin={isSettingPin}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    list: {
        padding: 20,
    },
    item: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    username: {
        fontSize: 14,
        color: '#B3B3B3',
        marginTop: 5,
    },
    arrow: {
        fontSize: 20,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#4A90E2',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: 'white',
        fontSize: 32,
        marginTop: -2,
    },
});
