import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const HomeScreen = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [integerInput, setIntegerInput] = useState('');

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation(null);
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);
            setLoading(false);
        })();
    }, []);

    const handleInputChange = (text) => {
        // Ensure the input is an integer
        if (/^\d*$/.test(text)) {
            setIntegerInput(text);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.latitude : 37.78825,
                    longitude: location ? location.longitude : -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Your Location"
                    />
                )}
            </MapView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Please select a radius in meters"
                    value={integerInput}
                    onChangeText={handleInputChange}
                    keyboardType="numeric"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    inputContainer: {
        position: 'absolute',
        top: 20,
        left: 10,
        right: 10,
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        width: '100%',
        backgroundColor: '#fff',
    },
});

export default HomeScreen;
