import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Import the Firestore instance
import { UserInfo } from 'firebase/auth';

const Profile = ({ userId }) => {
  
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
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

  if (!profile) {
    return <Text>Loading profile...</Text>;
  }

  const handleInputChange = (event) => {
    setNewItem(onchange.target.value);
  };

  const handleAddItem = async () => {
    try {
      await setDoc(doc(getFirestore(), "inventories", userId), {
        userId,
        items,
      }, { merge: true });
      setMyList([...myList, newItem]);
      setNewItem('');
    } catch (error) {
      console.error(error);
      Alert.alert("Add Item Error", error.message);
    }
  }


  return (
    <View style={styles.container}>
      {profile.imageUrl && (
        <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
      )}
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>
      <Text style={styles.title}>Add to Inventory</Text>
      <TextInput
        style={styles.input}
        placeholder="New Item"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Add Item" onPress={handleAddItem} />
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

