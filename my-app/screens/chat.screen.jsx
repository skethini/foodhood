import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, KeyboardAvoidingView, Button, Image, Platform, Alert, Modal } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const ChatScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('request');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');

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
        id: doc.id,
        type: doc.data().type || 'text' // Default to 'text' if type is not specified
      }));
      setMessages(messagesData.reverse());
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && currentUser) {
      await addDoc(collection(db, 'groupMessages'), {
        text: inputText,
        sender: currentUser.email,
        senderName: currentUserProfile.name, // Use the fetched name
        senderProfilePic: currentUserProfile.imageUrl, // Use the fetched profile picture URL
        groupId: 'your-group-id',
        timestamp: new Date(),
        type: 'text' // Specify message type as 'text'
      });
      setInputText('');
    }
  };

  const handleSendRequest = async () => {
    if (item.trim() && quantity.trim() && currentUser) {
      await addDoc(collection(db, 'groupMessages'), {
        text: `${transactionType.toUpperCase()}: ${item}, Quantity: ${quantity}`,
        sender: currentUser.email,
        senderName: currentUserProfile.name, // Use the fetched name
        senderProfilePic: currentUserProfile.imageUrl, // Use the fetched profile picture URL
        groupId: 'your-group-id',
        timestamp: new Date(),
        type: 'request', // Specify message type as 'request'
        acceptedBy: [] // Initialize acceptedBy array
      });
      setItem('');
      setQuantity('');
      setModalVisible(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    // Get the current message document
    const messageRef = doc(db, 'groupMessages', id);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const data = messageDoc.data();
      // Check if the current user has already accepted the request
      if (!data.acceptedBy.includes(currentUser.uid)) {
        // Update the message document to mark it as accepted by the current user
        await updateDoc(messageRef, {
          acceptedBy: arrayUnion(currentUser.uid)
        });
        console.log(`Request with id ${id} accepted by ${currentUser.uid}`);
      } else {
        console.log(`Request with id ${id} already accepted by ${currentUser.uid}`);
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    if (item.type === 'action') {
      return (
        <View style={styles.messageContainer}>
          {/* Add logic to handle action messages differently if needed */}
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      );
    } else if (item.type === 'request') {
      const isAccepted = item.acceptedBy && item.acceptedBy.includes(currentUser.uid);
      return (
        <View style={styles.messageContainer}>
          {!isAccepted && (
            <TouchableOpacity
              onPress={() => handleAcceptRequest(item.id)}
              style={[styles.acceptButton, isAccepted && styles.acceptButtonDisabled]}
              disabled={isAccepted}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.messageText, isAccepted && styles.acceptedText]}>{item.text}</Text>
        </View>
      );
    }
    const isCurrentUser = item.sender === currentUser.email;
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
        {!isCurrentUser && item.senderProfilePic && (
          <Image source={{ uri: item.senderProfilePic }} style={styles.profilePic} />
        )}
        <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          {!isCurrentUser && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        {isCurrentUser && currentUserProfile.imageUrl && (
          <Image source={{ uri: currentUserProfile.imageUrl }} style={styles.profilePic} />
        )}
      </View>
    );
  };
  // Inside the ChatScreen component
const handleLogout = async () => {
  try {
    await signOut(auth);
    navigation.navigate('Login'); // Ensure 'Login' matches the name used in your Stack.Navigator
  } catch (error) {
    console.error("Logout error:", error);
    Alert.alert("Logout Error", error.message);
  }
};


  const renderRequestModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Item"
            value={item}
            onChangeText={setItem}
            style={styles.modalInput}
          />
          <TextInput
            placeholder="Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
            style={styles.modalInput}
          />
          <Button title="Request" onPress={handleSendRequest} />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#ff5c5c" />
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Request</Text>
        </TouchableOpacity>
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
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
  },
  addButton: {
    padding: 10,
    marginRight: 8,
  },
  addButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  sendButtonText: {
    color: '#fff',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#f1f0f0',
    padding: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    backgroundColor: '#f1f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  messagesList: {
    paddingVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  acceptButtonDisabled: {
    backgroundColor: '#ccc',
  },
  acceptButtonText: {
    color: '#fff',
  },
  acceptedText: {
    color: '#007bff',
  },
});

export default ChatScreen;
