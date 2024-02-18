import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Assuming Firebase Authentication is used

const ChatScreen = () => {
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
        sender: currentUser.email, // Displaying the email as the sender
        groupId: 'your-group-id',
        timestamp: new Date(),
      });
      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        inverted // Invert the list to start from the bottom
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble(item.sender === currentUser.email)}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp.toDate()).toLocaleTimeString()}</Text>
          </View>
        )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
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
    borderRadius: 20,
    padding: 10,
    marginVertical: 4,
    marginRight: isCurrentUser ? 0 : 50,
    marginLeft: isCurrentUser ? 50 : 0,
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  }),
  sender: {
    fontWeight: 'bold',
    color: '#fff',
  },
  messageText: {
    marginTop: 4,
    color: '#fff',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 10,
    color: '#fff',
    alignSelf: 'flex-end',
  },
});

export default ChatScreen;
