import React, { useId, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { User } from 'firebase/auth';
import { Auth } from 'firebase/auth';
import { auth } from '../firebaseConfig';


export default function SignUpAndCreateProfile() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert("Registration Error", "Passwords do not match.");
      return;
    }
    if (!/^\d{5}$/.test(zipCode)) {
      Alert.alert("Registration Error", "Invalid zip code format.");
      return;
    }
    // Assuming validation passes, proceed to profile creation
    setStep(2);
  };

  const handleProfileSetup = async () => {
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
      const storage = getStorage();
      const imagePath = `profileImages/${userId}`;
      const storageRef = ref(storage, imagePath);
      const imgResponse = await fetch(image);
      const imgBlob = await imgResponse.blob();
      
      await uploadBytes(storageRef, imgBlob);
      const imageUrl = await getDownloadURL(storageRef);

      await setDoc(doc(getFirestore(), "users", userId), {
        name,
        bio,
        imageUrl,
      }, { merge: true });

      Alert.alert("Profile Created", "Your profile has been successfully created!", [
        { text: "OK", onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Profile Creation Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            keyboardType="numeric"
            maxLength={5}
            value={zipCode}
            onChangeText={setZipCode}
          />
          <Button title="Next" onPress={handleSignUp} />
        </>
      )}
      {step === 2 && (
        <>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Bio" value={bio} onChangeText={setBio} style={styles.input} multiline />
          <Button title="Pick an Image" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.profileImage} />}
          <Button title="Complete Profile" onPress={handleProfileSetup} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
});
