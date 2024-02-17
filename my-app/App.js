import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Button from './components/button.component';

import HomeScreen from './screens/home.screen';
import DetailsScreen from './screens/details.screen';
import LoginScreen from './screens/login.screen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn ? (
          // User is signed in
          <>
            <Stack.Screen name='Home' component={HomeScreen} />
            <Stack.Screen name='Details' component={DetailsScreen} />
            {/* ... other screens ... */}
          </>
        ) : (
          // User is not signed in, show the LoginScreen
          <Stack.Screen
            name='Login'
            component={LoginScreen}
            options={{
              title: 'Login',
              // When user is signed in, update the state
              signIn: () => setIsSignedIn(true),
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    margin: 10,
  },
});
