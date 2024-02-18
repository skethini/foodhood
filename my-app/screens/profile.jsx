import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; 
import { getAuth, signOut } from 'firebase/auth';

const Profile = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid; 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Profile Error", "Failed to fetch profile data. Please try again later.");
      }
    };
  
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); 
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", error.message);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Chat')} style={[styles.button, styles.chatButton]}>
          <Text style={styles.buttonText}>Go to Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Media')} style={[styles.button, styles.mediaButton]}>
          <Text style={styles.buttonText}>Go to Media Page</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.button, styles.settingsButton]}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5', // Light grey background
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular image
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#28a745', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10, 
    minWidth: 150, 
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff', 
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#dc3545', 
  },
  chatButton: {
    backgroundColor: '#007bff', 
  },
  mediaButton: {
    backgroundColor: '#ffc107', 
  },
  settingsButton: {
    backgroundColor: '#17a2b8', 
  },
  notificationsButton: {
    backgroundColor: '#6c757d', 
  },
});

export default Profile;
