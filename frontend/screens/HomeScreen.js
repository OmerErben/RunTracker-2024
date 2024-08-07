import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Platform } from 'react-native';
import MapView, { Marker, Circle, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { Heatmap } from 'react-native-maps'; // Import Heatmap component
import { getToken } from '../frontend/tokenUtils';

const HomeScreen = ({ navigation, route }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [integerInput, setIntegerInput] = useState('');
    const [circleRadius, setCircleRadius] = useState(0);
    const [routes, setRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [heatCoords, setHeatCoords] = useState([]);
    const [locationWatcher, setLocationWatcher] = useState(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const token = await getToken();

    const { userName, superUser } = route.params;

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation(null);
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);

            const response = await fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/GetRoutes?user_name=${userName}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            });
            const data = await response.json();
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
                high_score: route.high_score,
                liked: route.liked,
                run_count: route.run_count,
                last_run_date: route.last_run_date,
                super_user: superUser,
                user_name: userName
            }));
            setRoutes(newRoutes);
            setFilteredRoutes(newRoutes);

            const heatResponse = await fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/GetHeatMap`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            });
            let heatData = await heatResponse.json();
            setHeatCoords(heatData);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRoutes();
        }, [])
    );

    useEffect(() => {
        const watchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const watcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 1, // Update every 1 meter
                },
                (newLocation) => {
                    setLocation(newLocation.coords);
                }
            );
            setLocationWatcher(watcher);
        };

        watchLocation();

        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
        };
    }, []);


    const handleInputChange = (text) => {
        if (/^\d*$/.test(text)) {
            const radius = parseInt(text, 10);
            setIntegerInput(text);
            setCircleRadius(radius);

            if (location && radius > 0) {
                const filtered = routes.filter(route => {
                    const distance = getDistanceFromLatLonInMeters(
                        location.latitude,
                        location.longitude,
                        route.start.latitude,
                        route.start.longitude
                    );
                    return distance <= radius;
                });
                setFilteredRoutes(filtered);
            } else {
                setFilteredRoutes(routes);
            }
        }
    };

    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Radius of the earth in meters
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    };

    const deg2rad = (deg) => deg * (Math.PI / 180);

    const toggleMapView = () => {
        // Todo: Disable for IOS
        setShowHeatmap(prevState => !prevState); // Toggle heatmap
    };

    const recordNewRoute = () => {
        setCircleRadius(0);
        setIntegerInput('');
        navigation.navigate('Timer', {
            super_user: superUser,
            user_name: userName
        });
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
                {location && (showHeatmap ? (
                    <Heatmap
                        points={(heatCoords.concat(routes)).flatMap(route => route.data)}
                        opacity={0.7}
                        radius={50}
                        gradient={{
                            colors: ['blue', 'cyan', 'lime', 'yellow', 'red'],
                            startPoints: [0.2, 0.5, 0.7, 0.9, 1],
                            colorMapSize: 256,
                    }}/>) : (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Your Location"
                    />
                ))}
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
                {filteredRoutes.map((route, index) => (
                    <React.Fragment key={index}>
                        <Marker
                            coordinate={route.start}
                            pinColor={'#123456'}
                            onPress={() => {
                                setCircleRadius(0);
                                setIntegerInput('');
                                navigation.navigate('RouteDetails', {
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
                                    high_score: route.high_score,
                                    liked: route.liked,
                                    run_count: route.run_count,
                                    last_run_date: route.last_run_date,
                                    start: route.start,
                                    location: location,
                                    super_user: superUser,
                                    user_name: userName
                            })}}
                        >
                            <Callout>
                                <Text>{`Start of ${route.route_name}`}</Text>
                            </Callout>
                        </Marker>
                        <Polyline
                            coordinates={[route.start, ...route.data, route.end]}
                            strokeColor="#32CD32"
                            strokeWidth={3}
                        />
                        <Marker
                            coordinate={route.end}
                            pinColor={'#000090'}
                        >
                            <Callout>
                                <Text>{`End of ${route.route_name}`}</Text>
                            </Callout>
                        </Marker>
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
                <TouchableOpacity style={styles.plusButton} onPress={recordNewRoute}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
                {Platform.OS !== 'ios' &&
                    (showHeatmap ? <TouchableOpacity style={styles.coldButton} onPress={toggleMapView}>
                    <Text style={styles.heatText}>Cold</Text>
                </TouchableOpacity> : <TouchableOpacity style={styles.heatButton} onPress={toggleMapView}>
                    <Text style={styles.heatText}>Hot</Text>
                </TouchableOpacity>)}
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
        right: 40,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        width: '70%',
        backgroundColor: '#fff',
    },
    plusButton: {
        backgroundColor: '#6200ee',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusText: {
        fontSize: 30,
        color: '#fff',
    },
    heatButton: {
        backgroundColor: '#aa0000',
        width: 90,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coldButton: {
        backgroundColor: '#0000aa',
        width: 90,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heatText: {
        fontSize: 20,
        color: '#fff',
    },
});

export default HomeScreen;
