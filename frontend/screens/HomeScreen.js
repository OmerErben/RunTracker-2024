import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const HomeScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [integerInput, setIntegerInput] = useState('');
    const [circleRadius, setCircleRadius] = useState(0);
    const [routes, setRoutes] = useState([]);

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

            fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/GetRoutes`, {
                method: 'GET',
            }).then(response => response.json()).then(
                data => {
                    let i = 0;
                    const newRoutes = data.filter(route => route.end && route.end.latitude).map(route => ({
                        start: route.start,
                        end: route.end,
                        steepness: route.steepness,
                        shadow: route.shadow,
                        score: route.score,
                        water_dispenser: route.water_dispenser,
                        difficulty: route.difficulty,
                        view_rating: route.view_rating,
                        wind_level: route.wind_level,
                        length: route.length,
                        route_name: `Route ${i + 1}`
                    }));
                    i = i + 1;
                    setRoutes(newRoutes);
                }).catch(error => console.log(error));
        })();
    }, []);

    const handleInputChange = (text) => {
        // Ensure the input is an integer
        if (/^\d*$/.test(text)) {
            setIntegerInput(text);
            setCircleRadius(parseInt(text, 10));
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
                {circleRadius > 0 && location && (
                    <Circle
                        center={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        radius={circleRadius}
                        fillColor="rgba(255, 0, 0, 0.1)"
                        strokeColor="rgba(255, 0, 0, 0.5)"
                        strokeWidth={1}
                    />
                )}
                {routes.map((route, index) => (
                    <React.Fragment key={index}>
                        <Marker
                            coordinate={route.start}
                            title={`Start of ${route.route_name}`}
                            pinColor={'#123456'}
                            onPress={() => navigation.navigate('RouteDetails', {
                                steepness: route.steepness,
                                shadow: route.shadow,
                                score: route.score,
                                difficulty: route.difficulty,
                                view_rating: route.view_rating,
                                water_dispenser: route.water_dispenser,
                                route_name: route.route_name,
                                length: route.length,
                                wind_level: route.wind_level
                            })}
                        />
                        <Polyline
                            coordinates={[route.start, route.end]}
                            strokeColor="#000" // black
                            strokeWidth={3}
                        />
                    </React.Fragment>
                ))}
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
