import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { getAuth } from 'firebase/auth';

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

  const [acceptedRequests, setAcceptedRequests] = useState({});

  const handleAcceptRequest = async (messageId) => {
  const messageRef = doc(db, 'groupMessages', messageId);
  await updateDoc(messageRef, {
    acceptedBy: arrayUnion(auth.currentUser.uid)
  }).then(() => {
    setAcceptedRequests(prevState => ({ ...prevState, [messageId]: true }));
    Alert.alert("Request Accepted", "You have accepted the request.");
  }).catch((error) => {
    console.error("Error updating document: ", error);
  });
};
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

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.sender === currentUser.email;
    const hasAccepted = item.acceptedBy?.includes(currentUser.uid) || acceptedRequests[item.id];
  
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.messageRight : styles.messageLeft]}>
        {!isCurrentUser && item.senderProfilePic && (
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.senderId })}>
            <Image source={{ uri: item.senderProfilePic }} style={styles.profilePic} />
          </TouchableOpacity>
        )}
        <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          {item.type === 'request' ? (
            !hasAccepted ? (
              <TouchableOpacity onPress={() => handleAcceptRequest(item.id)} style={styles.acceptButton}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.acceptedText}>Request Accepted</Text>
            )
          ) : null}
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
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalLabel}>Item</Text>
            <TextInput
              placeholder="Item"
              value={item}
              onChangeText={setItem}
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>Quantity</Text>
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
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {renderRequestModal()}
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
      <Text style={styles.profileButtonText}> Home</Text>
    </TouchableOpacity>
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
    backgroundColor: '#F0F8F7', 
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 4,
    marginVertical: 2,
    justifyContent: 'flex-start', 
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
    backgroundColor: '#64A88C', 
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  otherUserBubble: {
    backgroundColor: '#CFE8E2', 
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#DDFEE7', 
  },
  messageText: {
    color: '#2E4239', 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', 
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginHorizontal: 8, 
    borderRadius: 20, 
    fontSize: 16, 
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
    backgroundColor: 'rgba(0,0,0,0.4)', 
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
    borderRadius: 10,
    backgroundColor: '#FFFFFF', 
  },
  messagesList: {
    paddingVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#76A478', 
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  acceptButtonDisabled: {
    backgroundColor: '#CCDCCB', 
  },
  acceptButtonText: {
    color: '#FFFFFF',
  },
  acceptedText: {
    color: '#4E805D', 
  },
});

export default ChatScreen;