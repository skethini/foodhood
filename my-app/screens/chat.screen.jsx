import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, KeyboardAvoidingView, Button } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth'; // Import signOut for logout functionality

const ChatScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
    if (inputText.trim()) {
      await addDoc(collection(db, 'groupMessages'), {
        text: inputText,
        sender: currentUser.email,
        groupId: 'your-group-id',
        timestamp: new Date(),
      });
      setInputText('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login'); // Make sure 'Login' matches the name used in your Stack.Navigator
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#ff5c5c" />
      <FlatList
        inverted
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble(item.sender === currentUser.email)}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
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

// Adjust styles as necessary
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
    padding: 8,
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
  messageBubble: isCurrentUser => ({
    backgroundColor: isCurrentUser ? '#007bff' : '#f1f0f0',
    padding: 10,
    borderRadius: 20,
    marginVertical: 4,
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  }),
  messageText: {
    color: '#fff',
  },
});

export default ChatScreen;
