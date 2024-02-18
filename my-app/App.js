import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { StyleSheet } from 'react-native';

// Screen Imports
import ProfileScreen from './screens/profile';
import LoginScreen from './screens/login.screen';
import SignUpScreen from './screens/SignUp';
import ChatScreen from './screens/chat.screen';
import { auth } from './firebaseConfig';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsSignedIn(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn ? (
          // Stack Navigator for Signed In Users
          <>
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          </>
        ) : (
          // Stack Navigator for Authentication Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
            {/* <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} /> */}

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Your StyleSheet definitions are correctly placed here
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
