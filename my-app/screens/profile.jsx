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
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((response) => response.json())
      .then((json) => setPosts(json))
      .catch((error) => console.error(error));
  }, []);

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
      {/* <Button
        title='Go to Chat'
        onPress={() => navigation.navigate('Chat')}
        style={styles.button}
      /> */}
      <FlatList 
        data={posts}
        renderItem={({ item }) => <Post title={item.title} body={item.body} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <StatusBar style='auto' />
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
