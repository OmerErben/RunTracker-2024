// TimerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const TimerScreen = ({ navigation }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    const startTimer = () => {
        setIsRunning(true);
        const id = setInterval(() => {
            setTime(prevTime => prevTime + 1);
        }, 1000);
        setIntervalId(id);
    };

    const stopTimer = () => {
        setIsRunning(false);
        if (intervalId) clearInterval(intervalId);
        setIntervalId(null);
    };

    const resetTimer = () => {
        setTime(0);
        setIsRunning(false);
        if (intervalId) clearInterval(intervalId);
        setIntervalId(null);
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
                        resetTimer();
                        navigation.goBack();
                    }}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        resetTimer();
                        navigation.goBack();
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