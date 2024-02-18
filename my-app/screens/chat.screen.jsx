import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, KeyboardAvoidingView, Button, Image, Platform, Alert, Modal } from 'react-native';
import { StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed

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
      await addDoc(collection(db, 'groupMessages'), {
        text: `${transactionType.toUpperCase()}: ${item}, Quantity: ${quantity}`,
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
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
        {!isCurrentUser && item.senderProfilePic && (
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.senderId })}>
            <Image source={{ uri: item.senderProfilePic }} style={styles.profilePic} />
          </TouchableOpacity>
        )}
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
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextInput placeholder="Item" value={item} onChangeText={setItem} style={styles.modalInput} />
          <TextInput placeholder="Quantity" value={quantity} keyboardType="numeric" onChangeText={setQuantity} style={styles.modalInput} />
          <Button title="Request" onPress={handleSendRequest} />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      {renderRequestModal()}
      <FlatList data={messages} keyExtractor={item => item.id} renderItem={renderMessageItem} contentContainerStyle={styles.messagesList} />
      <View style={styles.inputContainer}>
        <TextInput value={inputText} onChangeText={setInputText} placeholder="Type your message here..." style={styles.input} />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileNavButton}>
        <Ionicons name="arrow-forward-circle" size={30} color="#007bff" />
      </TouchableOpacity>
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