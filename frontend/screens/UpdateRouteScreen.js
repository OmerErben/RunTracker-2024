import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';

const UpdateRouteScreen = ({ route, navigation }) => {
    const { route_name, partition_key, row_key, super_user, user_name } = route.params;
    const [steepness, setSteepness] = useState(String(route.params.steepness));
    const [shadow, setShadow] = useState(String(route.params.shadow));
    const [score, setScore] = useState(String(route.params.score));
    const [water_dispenser, setWaterDispenser] = useState(String(route.params.water_dispenser));
    const [difficulty, setDifficulty] = useState(String(route.params.difficulty));
    const [view_rating, setViewRating] = useState(String(route.params.view_rating));
    const [wind_level, setWindLevel] = useState(String(route.params.wind_level));
    const [length, setLength] = useState(String(route.params.length));
    const [activity_type, setActivityType] = useState(route.params.activity_type);
    const [high_score, setHighScore] = useState(route.params.high_score);
    const [liked, setLiked] = useState(route.params.liked);
    const [run_count, setRunCount] = useState(route.params.run_count);
    const [last_run_date, setLastRunDate] = useState(route.params.last_run_date);
    const [loading, setLoading] = useState(false);

    const validateFloat = (value) => {
        return !isNaN(value) && parseFloat(value) == value;
    };

    const validateInteger = (value) => {
        return !isNaN(value) && Number.isInteger(parseFloat(value));
    };

    const handleUpdateRoute = () => {
        if (!validateFloat(steepness)) {
            Alert.alert('Invalid Input', 'Steepness must be a float');
            return;
        }
        if (!validateFloat(shadow)) {
            Alert.alert('Invalid Input', 'Shadow must be a float');
            return;
        }
        if (!validateFloat(score)) {
            Alert.alert('Invalid Input', 'Score must be a float');
            return;
        }
        if (!validateInteger(water_dispenser)) {
            Alert.alert('Invalid Input', 'Water Dispensers must be an integer');
            return;
        }
        if (!validateFloat(difficulty)) {
            Alert.alert('Invalid Input', 'Difficulty must be a float');
            return;
        }
        if (!validateFloat(view_rating)) {
            Alert.alert('Invalid Input', 'View Rating must be a float');
            return;
        }
        if (!validateFloat(wind_level)) {
            Alert.alert('Invalid Input', 'Wind Level must be a float');
            return;
        }
        if (!validateFloat(length)) {
            Alert.alert('Invalid Input', 'Length must be a float');
            return;
        }
        if (high_score && !validateFloat(high_score)) {
            Alert.alert('Invalid Input', 'Personal High Score must be a float');
            return;
        }
        if (run_count && !validateInteger(run_count)) {
            Alert.alert('Invalid Input', 'Run Count must be an integer');
            return;
        }

        setLoading(true);
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/UpdateRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partition_key: partition_key,
                row_key: row_key,
                user_name: user_name,
                data: {
                    steepness: parseFloat(steepness),
                    shadow: parseFloat(shadow),
                    score: parseFloat(score),
                    water_dispensers: parseInt(water_dispenser, 10),
                    difficulty: parseFloat(difficulty),
                    view: parseFloat(view_rating),
                    wind: parseFloat(wind_level),
                    length: parseFloat(length),
                    activity_type: activity_type,
                },
                personal_data: {
                    high_score: parseFloat(high_score),
                    liked: liked,
                    run_count: parseInt(run_count, 10),
                    last_run_date: last_run_date,
                },
            }),
        }).then((response) => {
            setLoading(false);
            if (response.status === 200) {
                Alert.alert('Success', 'Route updated successfully');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            } else {
                Alert.alert('Error', 'Failed to update the route');
            }
        }).catch((error) => {
            setLoading(false);
            console.error(error);
            Alert.alert('Error', 'An error occurred');
        });
    };
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Update Route: {route_name}</Text>
                <Text style={styles.label}>Steepness</Text>
                <TextInput style={styles.input} placeholder="Steepness" value={steepness} onChangeText={setSteepness} keyboardType="numeric" />
                <Text style={styles.label}>Shadow</Text>
                <TextInput style={styles.input} placeholder="Shadow" value={shadow} onChangeText={setShadow} keyboardType="numeric" />
                <Text style={styles.label}>Score</Text>
                <TextInput style={styles.input} placeholder="Score" value={score} onChangeText={setScore} keyboardType="numeric" />
                <Text style={styles.label}>Water Dispensers</Text>
                <TextInput style={styles.input} placeholder="Water Dispensers" value={water_dispenser} onChangeText={setWaterDispenser} keyboardType="numeric" />
                <Text style={styles.label}>Difficulty</Text>
                <TextInput style={styles.input} placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} keyboardType="numeric" />
                <Text style={styles.label}>View Rating</Text>
                <TextInput style={styles.input} placeholder="View Rating" value={view_rating} onChangeText={setViewRating} keyboardType="numeric" />
                <Text style={styles.label}>Wind Level</Text>
                <TextInput style={styles.input} placeholder="Wind Level" value={wind_level} onChangeText={setWindLevel} keyboardType="numeric" />
                <Text style={styles.label}>Length</Text>
                <TextInput style={styles.input} placeholder="Length" value={length} onChangeText={setLength} keyboardType="numeric" />
                <Text style={styles.label}>Activity Type</Text>
                <TextInput style={styles.input} placeholder="Activity Type" value={activity_type} onChangeText={setActivityType} />
                <Text style={styles.label}>Personal High Score (Minutes)</Text>
                <TextInput style={styles.input} placeholder="Personal High Score" value={high_score} onChangeText={setHighScore} keyboardType="numeric" />
                <Text style={styles.label}>Liked</Text>
                <TextInput style={styles.input} placeholder="Liked" value={liked} onChangeText={setLiked} />
                <Text style={styles.label}>Run Count</Text>
                <TextInput style={styles.input} placeholder="Run Count" value={run_count} onChangeText={setRunCount} keyboardType="numeric" />
                <Text style={styles.label}>Last Run Date</Text>
                <TextInput style={styles.input} placeholder="Last Run Date" value={last_run_date} onChangeText={setLastRunDate} />
                {loading ? (
                    <ActivityIndicator size="large" color="#6200ee" />
                ) : (
                    <Button title="Update Route" onPress={handleUpdateRoute} disabled={loading} />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#0093ee',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default UpdateRouteScreen;
