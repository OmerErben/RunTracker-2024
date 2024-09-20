import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';


const RouteDetailsScreen = ({ route, navigation }) => {
    const [loading, setLoading] = useState(false);
    const [isNearStart, setIsNearStart] = useState(false);

    const {
        steepness,
        shadow,
        score,
        water_dispenser,
        difficulty,
        view_rating,
        route_name,
        wind_level,
        length,
        activity_type,
        super_user,
        partition_key,
        row_key,
        user_name,
        high_score,
        liked,
        run_count,
        last_run_date,
        start,
        location
    } = route.params;

    useEffect(() => {
        if (location && start) {
            const distance = getDistanceFromLatLonInMeters(
                location.latitude,
                location.longitude,
                start.latitude,
                start.longitude
            );
            setIsNearStart(distance <= 100);
        }
    }, []);

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

    const handleDeleteRoute = () => {
        setLoading(true);
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/RemoveRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partition_key: partition_key,
                row_key: row_key
            }),
        }).then((response) => {
            setLoading(false);
            if (response.status === 200) {
                Alert.alert('Success', 'Route deleted successfully');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            } else {
                Alert.alert('Error', 'Failed to delete the route');
            }
        }).catch((error) => {
            setLoading(false);
            console.error(error);
            Alert.alert('Error', 'An error occurred');
        });
    };

    const handleRateRoute = () => {
        navigation.navigate('UpdateRoute', {
            steepness,
            shadow,
            score,
            water_dispenser,
            difficulty,
            view_rating,
            route_name,
            wind_level,
            length,
            activity_type,
            partition_key,
            row_key,
            super_user,
            user_name,
            high_score,
            liked,
            run_count,
            last_run_date
        });
    };

    const handleStartRoute = () => {
        // Navigate to the route start logic here
        navigation.navigate('RouteTimer', {
            super_user: super_user,
            user_name: user_name,
            route_name: route_name
        });
        Alert.alert('Starting Route', `Starting route ${route_name}`);
    };


    return (
        <View style={styles.container}>

        <View style={styles.titleContainer}>
            <Text style={styles.title}>Name: {route_name}</Text>
        </View>
            <Text style={styles.detail}> <Text style={styles.bolder}>Score: </Text> {score.toFixed(3)} </Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Length: </Text> {length}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Difficulty: </Text> {difficulty}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Activity Type: </Text> {activity_type}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Steepness: </Text> {steepness}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Shadow: </Text> {shadow}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>View Rating: </Text> {view_rating}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Wind Level: </Text> {wind_level}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Water Dispensers: </Text> {water_dispenser}</Text>
           <View style={styles.smallTitleContainer}>
            <Text style={styles.smallTitle}>My Personal Info</Text>
            </View>
            <Text style={styles.detail}><Text style={styles.bolder}>Personal High Score: </Text> {high_score}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>Liked: </Text> {liked !== undefined ? (liked === true ? "True" : "False") : ""}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>My Last Run Date: </Text> {last_run_date}</Text>
            <Text style={styles.detail}><Text style={styles.bolder}>My Run Count: </Text> {run_count}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
                <View style={styles.buttonContainer}>
                    <Button title="Delete Route" onPress={handleDeleteRoute} color="#ff0000" disabled={!super_user} />
                    <Button title="Rate Route" onPress={handleRateRoute} color="#3f43bf" />
                    <Button title="Start Route" onPress={handleStartRoute} color="#32CD32" disabled={!isNearStart}/>
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
    titleContainer: {
        backgroundColor: '#3f43bf',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    smallTitleContainer: {
        backgroundColor: '#3f43bf',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        paddingTop: 2,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom:5,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    contentContainer: {
        padding: 20,
    },
    detail: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    bolder: {
        fontSize: 18,
        marginBottom: 8,
        color: '#333',
        fontWeight: 'bold'
    },
    buttonContainer: {
        marginTop: 16,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallTitle: {
        fontSize: 18,
        marginTop: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#ffffff',
    },
});

export default RouteDetailsScreen;
