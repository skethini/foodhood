import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Import the Firestore instance

import Post from '../components/post.component';
import Button from '../components/button.component';
import { getAuth, signOut } from 'firebase/auth';



const Profile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login'); // Ensure 'Login' matches the name used in your Stack.Navigator
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
    <Text>Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} color="#ff5c5c" style={styles.button}/>
      <Button
        title="Go to Chat" onPress={() => navigation.navigate('Chat')} style={styles.button}/>
      {profile && profile.imageUrl && (
        <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
      )}
      {profile && profile.name && (
        <Text style={styles.name}>{profile.name}</Text>
      )}
      {profile && profile.bio && (
        <Text style={styles.bio}>{profile.bio}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Profile;