import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getToken } from '../frontend/tokenUtils';

const TimerScreen = ({ navigation, route }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    const locationIntervalRef = useRef(null);
    const currentIndexRef = useRef(0);
    const currentHeatIndexRef = useRef(0);
    const rowKeyRef = useRef(null);
    const heatRowKeyRef = useRef(null);
    const finishState = useRef(false);
    const partitionKeyRef = useRef(null);
    const heatPartitionKeyRef = useRef(null);
    const token = await getToken();

    useEffect(() => {
        return () => {
            clearInterval(timerIntervalRef.current);
            clearInterval(locationIntervalRef.current);
        };
    }, []);

    const { user_name, super_user } = route.params;

    const startTimer = () => {
        setIsRunning(true);

        timerIntervalRef.current = setInterval(() => {
            setTime(prevTime => prevTime + 1);
        }, 1000);

        locationIntervalRef.current = setInterval(() => {
            sendLocationData();
            sendHeatMapLocation();
        }, 5000);
    };

    const stopTimer = () => {
        setIsRunning(false);
        clearInterval(timerIntervalRef.current);
        clearInterval(locationIntervalRef.current);
    };

    const resetTimer = () => {
        setTime(0);
        setIsRunning(false);
        clearInterval(timerIntervalRef.current);
        clearInterval(locationIntervalRef.current);
        currentIndexRef.current = 0; // Reset currentIndex when timer is reset
    };

    const handleFail = () => {
        if (!partitionKeyRef.current || !rowKeyRef.current) {
            navigation.navigate("Home", { superUser: super_user, userName: user_name });
        }
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/RemoveRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                partition_key: partitionKeyRef.current,
                row_key: rowKeyRef.current
            }),
        }).then((response) => {
            if (response.status === 200) {
                Alert.alert('Success', 'Route deleted successfully');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            } else {
                Alert.alert('Error', 'Failed to delete the route');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            }
        }).catch((error) => {
            console.error(error);
            Alert.alert('Error', 'An error occurred');
            navigation.navigate("Home", { superUser: super_user, userName: user_name });
        });
    };


    const sendHeatMapLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Location permission not granted');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/CreateHeatMap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_name,
                    super_user,
                    index: currentHeatIndexRef.current,
                    data: {
                        coordination: { latitude: latitude, longitude: longitude }
                    },
                    row_key: heatRowKeyRef.current,
                    partition_key: heatPartitionKeyRef.current
                }),
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        heatRowKeyRef.current = data["row_key"];
                        heatPartitionKeyRef.current = data["partition_key"];
                        currentHeatIndexRef.current = data["index"] + 1;
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

    const sendLocationData = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Location permission not granted');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/CollectCoordination`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_name,
                    super_user,
                    index: currentIndexRef.current,
                    finish_status: finishState,
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
                    if (finishState.current) {
                        finishState.current = false;
                        navigation.navigate("NameRoute", { super_user: super_user, user_name: user_name,
                            partition_key: partitionKeyRef.current, row_key: rowKeyRef.current});
                        resetTimer();
                    }
                }
                else {
                    console.error('Internal Error');
                    handleFail();
                    resetTimer();
                }
            }).catch(error => {
                console.error('Error sending location:', error);
                if (finishState.current) {
                    finishState.current = false;
                    handleFail();
                    resetTimer();
                }
            });
        } catch (error) {
            console.error('Error getting location:', error);
            handleFail();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.timerText}>{time}s</Text>
            {isRunning ? (
                <Button title="Stop" onPress={stopTimer} color="#ff0000" />
            ) : (
                <Button title="Start" onPress={startTimer} color="#00ff00" />
            )}
            {!isRunning && time > 0 && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={() => {
                        finishState.current = true;
                        sendLocationData();
                    }}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        handleFail();
                        resetTimer();
                    }}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    timerText: {
        fontSize: 48,
        marginBottom: 24,
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: '#00ff00',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#ff0000',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default TimerScreen;
