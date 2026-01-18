import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const LIST_KEY = 'passwords_list';
const PIN_KEY = 'user_pin';

export const StorageService = {
  async getItems() {
    try {
      const jsonValue = await AsyncStorage.getItem(LIST_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Error reading items", e);
      return [];
    }
  },

  async addItem(serviceName, username, password) {
    try {
      const id = uuidv4();
      const newItem = { id, serviceName, username };

      const existingItems = await this.getItems();
      const newItems = [...existingItems, newItem];

      await AsyncStorage.setItem(LIST_KEY, JSON.stringify(newItems));

      await SecureStore.setItemAsync(`password_${id}`, password);

      return newItem;
    } catch (e) {
      console.error("Error adding item", e);
      throw e;
    }
  },

  async getPassword(id) {
    try {
      return await SecureStore.getItemAsync(`password_${id}`);
    } catch (e) {
      console.error("Error getting password", e);
      throw e;
    }
  },

  async deleteItem(id) {
    try {
      const existingItems = await this.getItems();
      const newItems = existingItems.filter(item => item.id !== id);
      await AsyncStorage.setItem(LIST_KEY, JSON.stringify(newItems));
      await SecureStore.deleteItemAsync(`password_${id}`);
    } catch (e) {
      console.error("Error deleting item", e);
      throw e;
    }
  }
};
