import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, KeyboardAvoidingView, Button, Image, Platform, Alert } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const ChatScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState({});
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserProfile(userDocSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]); // Re-run when currentUser changes

  useEffect(() => {
    const messagesCollectionRef = collection(db, 'groupMessages');
    const q = query(messagesCollectionRef, where('groupId', '==', 'your-group-id'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setMessages(messagesData.reverse());
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && currentUser) {
      const nameIn = currentUserProfile.name;
      const imageUr = currentUserProfile.imageUrl;
      if (currentUserProfile == undefined) {
        nameIn = "default name";
        imageUr = "";
      }
      console.log(currentUserProfile);
      await addDoc(collection(db, 'groupMessages'), {
        text: inputText,
        sender: currentUser.email,
        senderName: currentUserProfile.name, // Use the fetched name
        senderProfilePic: currentUserProfile.imageUrl, // Use the fetched profile picture URL
        groupId: 'your-group-id',
        timestamp: new Date(),
      });
      setInputText('');
    }
  };

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#ff5c5c" />
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isCurrentUser = item.sender === currentUser.email;
          return (
            <View style={[styles.messageContainer, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
              {item.senderProfilePic && (
                <Image source={{ uri: item.senderProfilePic }} style={styles.profilePic} />
              )}
              <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                <Text style={styles.senderName}>{item.senderName}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 10,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 4, // Adjusted padding
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  sendButtonText: {
    color: '#fff',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageBubble: isCurrentUser => ({
    backgroundColor: isCurrentUser ? '#007bff' : '#f1f0f0',
    padding: 10,
    borderRadius: 20,
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  }),
  messageText: {
    color: '#000', // Adjusted for visibility
  },
  senderName: {
    fontWeight: 'bold',
    color: '#000', // Adjust as needed
    marginBottom: 2,
  },
});

export default ChatScreen;
