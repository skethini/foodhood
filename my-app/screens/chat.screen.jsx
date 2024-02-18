import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Button,
  Image,
  Platform,
  Alert,
  Modal,
  StyleSheet
} from 'react-native';
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
  }, [currentUser]);

  useEffect(() => {
    const messagesCollectionRef = collection(db, 'groupMessages');
    const q = query(messagesCollectionRef, where('groupId', '==', 'your-group-id'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        type: doc.data().type || 'text'
      })).reverse();
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && currentUser) {
      await addDoc(collection(db, 'groupMessages'), {
        text: inputText,
        sender: currentUser.email,
        senderName: currentUserProfile.name,
        senderProfilePic: currentUserProfile.imageUrl,
        groupId: 'your-group-id',
        timestamp: new Date(),
        type: 'text'
      });
      setInputText('');
    }
  };

  const handleSendRequest = async () => {
    if (item.trim() && quantity.trim() && currentUser) {
      const requestText = `${transactionType.toUpperCase()}: ${item}, Quantity: ${quantity}`;
      await addDoc(collection(db, 'groupMessages'), {
        text: requestText,
        sender: currentUser.email,
        senderName: currentUserProfile.name,
        senderProfilePic: currentUserProfile.imageUrl,
        groupId: 'your-group-id',
        timestamp: new Date(),
        type: 'request',
        acceptedBy: []
      });
      setItem('');
      setQuantity('');
      setModalVisible(false);
      Alert.alert('Request Sent', 'Your request has been sent successfully.');
    } else {
      Alert.alert('Error', 'Please fill in all the fields.');
    }
  };

  const handleAcceptRequest = async (id) => {
    const messageRef = doc(db, 'groupMessages', id);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const data = messageDoc.data();
      if (!data.acceptedBy.includes(currentUser.uid)) {
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
    const isCurrentUser = item.sender === currentUser.email;
    const messageAlignment = isCurrentUser ? styles.messageRight : styles.messageLeft;
    return (
      <View style={[styles.messageContainer, messageAlignment]}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const renderRequestModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
    >
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
          <Button title="Send Request" onPress={handleSendRequest} />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {renderRequestModal()}
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
          <Text style={styles.addButtonText}>+</Text>
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
    backgroundColor: '#F0F8F7', // Soft matcha tint background
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 4,
    marginVertical: 2,
    justifyContent: 'flex-start', // Default alignment
  },
  messageRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 8,
    borderRadius: 16,
    maxWidth: '80%',
  },
  currentUserBubble: {
    backgroundColor: '#64A88C', // Adjust the color as needed
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  otherUserBubble: {
    backgroundColor: '#CFE8E2', // Adjust the color as needed
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#DDFEE7', // Light matcha border for profile pics
  },
  messageText: {
    color: '#2E4239', // Dark matcha green for text, improving readability
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // Optional: for contrast against container background
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginHorizontal: 8, // Space between input and buttons
    borderRadius: 20, // Rounded corners for the input field
    fontSize: 16, // Adjust font size as necessary
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#A8D5BA',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#81C784',
    borderRadius: 20,
    width: 60,
    height: 60,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent overlay for modals
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    elevation: 5,
  },
  modalInput: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10, // Rounded corners for input fields
    backgroundColor: '#FFFFFF', // Keeping modal inputs neutral
  },
  messagesList: {
    paddingVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#76A478', // Matcha shade for accept buttons
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  acceptButtonDisabled: {
    backgroundColor: '#CCDCCB', // Greyed-out matcha for disabled state
  },
  acceptButtonText: {
    color: '#FFFFFF',
  },
  acceptedText: {
    color: '#4E805D', // Dark matcha for accepted text
  },
});

export default ChatScreen;