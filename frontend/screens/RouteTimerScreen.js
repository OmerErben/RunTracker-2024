import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button, ActivityIndicator, Alert} from 'react-native';
import * as Location from 'expo-location';

const RouteTimerScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const locationIntervalRef = useRef(null);
    const currentIndexRef = useRef(0);
    const rowKeyRef = useRef(null);
    const partitionKeyRef = useRef(null);

    const { user_name, super_user, route_name } = route.params;

    useEffect(() => {
        const fetchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            setLoading(false);
            // Start timer
            locationIntervalRef.current = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
                sendLocation();
            }, 1000);

            return () => clearInterval(locationIntervalRef.current);
        };

        fetchLocation();


    }, []);

    const sendLocation = async (location) => {
        try {
            let location = await Location.getCurrentPositionAsync({});
            if (!location) {
                console.log("No location yet");
                return;
            }
            const { latitude, longitude } = location.coords;

            fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/CreateHeatMap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name,
                    super_user,
                    index: currentIndexRef.current,
                    data: {
                        coordination: { latitude: latitude, longitude: longitude }
                    },
                    row_key: rowKeyRef.current,
                    partition_key: partitionKeyRef.current
                }),
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        rowKeyRef.current = data["row_key"];
                        partitionKeyRef.current = data["partition_key"];
                        currentIndexRef.current = data["index"] + 1; // Update currentIndexRef
                    });
                }
            }).catch(error => {
                console.error('Error sending location:', error);
                Alert.alert("Error sending location", error);
                navigation.navigate('Home', {
                    superUser: super_user,
                    userName: user_name
                })
            });
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert("Error getting location", error);
        }
    };

    const handleEndRoute = () => {
        // Clear interval
        clearInterval(locationIntervalRef.current);
        Alert.alert(`Thanks for running in ${route_name}!`);
        navigation.navigate('Home', {
            superUser: super_user,
            userName: user_name
        })
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
            <Text style={styles.timer}>Timer: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</Text>
            <Button title="End" onPress={handleEndRoute} color="#ff0000" />
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
    timer: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default RouteTimerScreen;
