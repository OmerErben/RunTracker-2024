import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector'

const UpdateRouteScreen = ({ route, navigation }) => {
    const { route_name, partition_key, row_key, super_user, user_name } = route.params;
    const [steepness, setSteepness] = useState(route.params.steepness ? String(route.params.steepness) : null);
    const [shadow, setShadow] = useState(route.params.shadow ? String(route.params.shadow) : null);
    const [score, setScore] = useState(route.params.score ? String(route.params.score.toFixed(3)) : null);
    const [water_dispenser, setWaterDispenser] = useState(route.params.water_dispenser ? String(route.params.water_dispenser) : null);
    const [difficulty, setDifficulty] = useState(route.params.difficulty ? String(route.params.difficulty) : null);
    const [view_rating, setViewRating] = useState(route.params.view_rating ? String(route.params.view_rating) : null);
    const [wind_level, setWindLevel] = useState(route.params.wind_level ? String(route.params.wind_level) : null);
    const [length, setLength] = useState(route.params.length ? String(route.params.length) : null);
    const [activity_type, setActivityType] = useState(route.params.activity_type || "Jogging");
    const [high_score, setHighScore] = useState(route.params.high_score ? String(route.params.high_score) : null);
    const [liked, setLiked] = useState(route.params.liked ? "True" : "False");
    const [run_count, setRunCount] = useState(route.params.run_count ? String(route.params.run_count) : null);
    const [last_run_date, setLastRunDate] = useState(new Date(route.params.last_run_date));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const validateDate = (date) => {
            const newDate = new Date(date);
            return newDate instanceof Date && !isNaN(newDate);
        };
        if (!validateDate(last_run_date)) {
            setLastRunDate(new Date());
        }
    }, [last_run_date]);

    const validateFloat = (value) => {
        return !isNaN(value) && parseFloat(value) == value;
    };

    const validateInteger = (value) => {
        return !isNaN(value) && Number.isInteger(parseFloat(value));
    };

    const validateRange = (value) => {
        return 0 <= parseFloat(value) && 5 >= parseFloat(value)
    }

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

        if (!validateRange(steepness)) {
            Alert.alert('Invalid Input', 'Steepness value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(shadow)) {
            Alert.alert('Invalid Input', 'Shadow value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(score)) {
            Alert.alert('Invalid Input', 'Score value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(water_dispenser)) {
            Alert.alert('Invalid Input', 'Water Dispensers value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(difficulty)) {
            Alert.alert('Invalid Input', 'Difficulty value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(view_rating)) {
            Alert.alert('Invalid Input', 'View Rating value isn\'t between 0 to 5');
            return;
        }
        if (!validateRange(wind_level)) {
            Alert.alert('Invalid Input', 'Wind Level value isn\'t between 0 to 5');
            return;
        }
        if (!validateDate(last_run_date)) {
            Alert.alert('Invalid Input', 'Last Run Date must be a past date');
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
                    liked: liked === "True",
                    run_count: parseInt(run_count, 10),
                    last_run_date: last_run_date.toISOString().slice(0, 10),
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

    const validateDate = (value) => {
        return (new Date() >= value);
    }

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || last_run_date;
        setShowDatePicker(false);
        setLastRunDate(currentDate);
    };

    let activity_index = 0;
    const activity_options = [
        { key: activity_index++, label: 'Jogging' },
        { key: activity_index++, label: 'Cycling' },
        { key: activity_index++, label: 'Other' },
    ];


    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                <Text style={styles.title}>Update Route: {route_name}</Text>
                </View>
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
                <TextInput style={styles.label} editable={false} placeholder="Activity Type" value={`Activity Type: ${activity_type}`}></TextInput>
                <View style={styles.pickerContainer}>
                    <ModalSelector
                        data={activity_options}
                        initValue="Change Activity Type"
                        onChange={(option) => { setActivityType(option.label) }}
                        >
                    </ModalSelector>
                </View>
                <Text style={styles.label}>Personal High Score (Minutes)</Text>
                <TextInput style={styles.input} placeholder="Personal High Score" value={high_score} onChangeText={setHighScore} keyboardType="numeric" />
                <TextInput style={styles.label} editable={false} placeholder="Liked" value={`Liked: ${liked}`}></TextInput>
                <View style={styles.pickerContainer}>
                    <ModalSelector
                        data={[{key: 0, label: 'True'}, {key: 1, label: 'False'}]}
                        initValue="Change Like Status"
                        onChange={(option) => { setLiked(option.label) }}
                    >
                    </ModalSelector>
                </View>
                <Text style={styles.label}>Run Count</Text>
                <TextInput style={styles.input} placeholder="Run Count" value={run_count} onChangeText={setRunCount} keyboardType="numeric" />
                <Text style={styles.label}>Last Run Date</Text>
                <View style={styles.datePicker}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                        <Text>{last_run_date.toDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={last_run_date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#3f43bf" />
                ) : (
                    <Button title="Update Route" onPress={handleUpdateRoute} color ='#3f43bf' disabled={loading} />
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
    titleContainer: {
        backgroundColor: '#3f43bf',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        paddingTop: 10,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom:0,
        marginBottom: 16,
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
        color: '#ffffff',
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
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    datePicker: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default UpdateRouteScreen;
