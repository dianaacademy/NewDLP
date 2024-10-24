import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to set data
export const setItem = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error("Error storing the item", error);
    }
};

// Helper function to get data
export const getItem = async (key: string) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error("Error fetching the item", error);
        return null;
    }
};

// Helper function to remove data
export const removeItem = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing the item", error);
    }
};
