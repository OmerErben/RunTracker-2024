import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        return token;
    } catch (error) {
        console.error('Failed to retrieve token from storage:', error);
        return null;
    }
};
