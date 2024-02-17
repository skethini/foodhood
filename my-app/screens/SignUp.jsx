// screens/SignUpScreen.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Add this line
  const navigation = useNavigation();
  const auth = getAuth();

  const handleSignUp = () => {
    if (password === confirmPassword) { // Check if passwords match
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          console.log(user); // You may want to do something with the user object
          navigation.navigate('Home');
        })
        .catch((error) => {
          const errorMessage = error.message;
          // Show an error message
          Alert.alert("Registration Error", errorMessage); // Use Alert instead of console.error
        });
    } else {
      // If passwords do not match
      Alert.alert("Registration Error", "Passwords do not match.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput // Add this TextInput for confirmPassword
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      marginBottom: 10,
      paddingHorizontal: 15,
      height: 50,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
    },
  });