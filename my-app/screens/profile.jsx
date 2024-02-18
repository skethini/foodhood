import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Import the Firestore instance

const Profile = ({ userId }) => {
  const [profile, setProfile] = useState(null);

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


  return (
    <View style={styles.container}>
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
