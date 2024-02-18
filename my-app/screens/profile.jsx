import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const auth = getAuth();
  const firestore = getFirestore();
  const userId = auth.currentUser?.uid; // Get the current user's ID

  useEffect(() => {
    if (userId) {
      const userDocRef = doc(firestore, "users", userId);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log("No such user profile!");
          }
        })
        .catch((error) => {
          console.error("Error getting user profile:", error);
          Alert.alert("Error", error.message);
        });
    }
  }, [userId]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error("Logout error:", error);
        Alert.alert("Logout Error", error.message);
      });
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: userProfile.imageUrl }} style={styles.profileImage} />
      <Text style={styles.name}>{userProfile.name}</Text>
      {userProfile.bio && <Text style={styles.bio}>{userProfile.bio}</Text>}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default ProfileScreen;
