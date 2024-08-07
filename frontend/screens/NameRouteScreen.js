// NameRouteScreen.js
import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import { getToken } from '../frontend/tokenUtils';

const NameRouteScreen = ({ navigation, route }) => {
    const [routeName, setRouteName] = useState('');
    const { user_name, super_user, row_key, partition_key } = route.params;
    const token = await getToken();

    const handleSave = () => {
        if (routeName.trim() === '') {
            alert('Please enter a route name');
            return;
        }
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/UpdateRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                partition_key: partition_key,
                row_key: row_key,
                user_name: user_name,
                data: {
                    name: routeName
                },
            }),
        }).then((response) => {
            if (response.status === 200) {
                Alert.alert('Success', 'Route name set successfully');
                navigation.navigate("UpdateRoute", { super_user: super_user, user_name: user_name,
                    partition_key: partition_key, row_key: row_key, route_name: routeName});
            } else {
                Alert.alert('Error', 'Failed to set the name of the route');
            }
        }).catch((error) => {
            console.error(error);
            Alert.alert('Error', 'An error occurred');
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter Route Name:</Text>
            <TextInput
                style={styles.input}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="Route Name"
                placeholderTextColor="#999"
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
        width: '100%',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#00ff00',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default NameRouteScreen;
