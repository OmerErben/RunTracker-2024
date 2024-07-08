import React, { useState, useEffect } from 'react';
import {View, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text} from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const HomeScreen = ({ navigation, route }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [integerInput, setIntegerInput] = useState('');
    const [circleRadius, setCircleRadius] = useState(0);
    const [routes, setRoutes] = useState([]);

    const user_details = route.params
    console.log(user_details)

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
                        data: route.data,
                        steepness: route.steepness,
                        shadow: route.shadow,
                        activity_type: route.activity_type,
                        score: route.score,
                        water_dispenser: route.water_dispensers,
                        difficulty: route.difficulty,
                        view_rating: route.view,
                        wind_level: route.wind,
                        length: route.length,
                        route_name: route.name,
                        partition_key: route.partition_key,
                        row_key: route.row_key,
                        super_user: user_details.superUser
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

    const showFeatureAlert = () => {
        Alert.alert(
            "Feature Not Available",
            "This feature is not yet developed. It will be available soon!",
            [
                { text: "OK", onPress: () => console.log("OK Pressed") }
            ]
        );
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
                                activity_type: route.activity_type,
                                water_dispenser: route.water_dispenser,
                                route_name: route.route_name,
                                length: route.length,
                                wind_level: route.wind_level,
                                partition_key: route.partition_key,
                                row_key: route.row_key,
                                super_user: user_details.superUser
                            })}
                        />
                        <Polyline
                            coordinates={[route.start, ...route.data, route.end]}
                            strokeColor="#32CD32"
                            strokeWidth={3}
                        />
                        <Marker
                            coordinate={route.end}
                            title={`End of ${route.route_name}`}
                            pinColor={'#000090'}
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
                <TouchableOpacity style={styles.plusButton} onPress={showFeatureAlert}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 20,
        left: 10,
        right: 100,
    },
    inputWrapper: {
        flex: 1,
        marginRight: 10,
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
    plusButton: {
        backgroundColor: '#6200ee',
        width: 40,
        height: 40,
        left: 30,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusText: {
        fontSize: 30,
        color: '#fff',
    },
});

export default HomeScreen;
