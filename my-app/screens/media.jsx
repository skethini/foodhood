import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebaseConfig';



const SocialMediaPage = () => {
  const auth = getAuth();
  const storage = getStorage();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Assuming you have a "users" collection in Firestore with user data
      const userDocRef = doc(collection(db, 'users'), auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUser(userDocSnap.data());
      } else {
        console.log('No such document for user!');
      }
    };

    fetchUser();
    fetchPhotos(); // Fetch existing photos
  }, []);


  const fetchPhotos = async () => {
    try {
      const storage = getStorage();
  
      // Assuming you have a reference to the 'images' folder in Firebase Storage
      const imagesFolderRef = ref(storage, 'images');
  
      // List all items (images) in the 'images' folder
      const items = await listAll(imagesFolderRef);
  
      // Initialize an empty array to store photo data
      const photosData = [];
  
      // Iterate over each item in the 'images' folder
      for (const item of items.items) {
        try {
          const downloadURL = await getDownloadURL(item);
  
          // Assuming you have a unique identifier for each image (e.g., the item's name)
          photosData.push({ id: item.name, imageUrl: downloadURL });
        } catch (error) {
          console.error('Error getting download URL:', error);
        }
      }
  
      // Set the state with the collected photo data
      setPhotos(photosData);
  
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };
  
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const uploadImage = async () => {
    try {
      if (imageUri) {
        const imageRef = ref(storage, `images/${auth.currentUser.uid}/${Date.now()}.jpg`);
        const snapshot = await uploadBytes(imageRef, await fetch(imageUri));
        const downloadURL = await getDownloadURL(snapshot.ref);

        const photosCollection = collection(db, 'photos');
        await addDoc(photosCollection, { userId: auth.currentUser.uid, imageUrl: downloadURL });

        setImageUri(null);

        fetchPhotos();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.displayName || 'User'}!</Text>
      <TouchableOpacity onPress={pickImage}>
        <Text>Choose a photo</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <TouchableOpacity onPress={uploadImage}>
        <Text>Upload</Text>
      </TouchableOpacity>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  photoContainer: {
    marginVertical: 10,
  },
  photoImage: {
    width: 200,
    height: 200,
  },
});

export default SocialMediaPage;
