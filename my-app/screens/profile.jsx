import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Post from '../components/post.component';
import Button from '../components/button.component';
import { getAuth, signOut } from 'firebase/auth';


const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
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

  if (!profile) {
    return <Text>Loading profile...</Text>;
  }

  return (
    <View style={styles.container}>
      {profile.imageUrl && (
        <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
      )}
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  button: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    margin: 10,
  },
});
