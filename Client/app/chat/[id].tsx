import { getUser } from "@/Services/LocallyData";
import { getMessages, getUserInfoByJid, insertMessage, updateMessageStatus } from "@/Database/ChatQuery";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TextInput, TouchableOpacity, Modal
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Contacts from 'expo-contacts';
import { useNetInfo } from "@react-native-community/netinfo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getUserById, sendFile } from "@/Services/Api";
import { useSocket } from "@/Context/SocketContext";
import { Image } from "react-native";
import showToast from "@/utils/ToastHandler";
export default function ChatScreen() {
  const { sendMessage, registerReceiveMessage, unregisterReceiveMessage } = useSocket();
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const netInfo = useNetInfo();
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<any | null>(null);
  const { id }: { id: string } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFile] = useState<string[] | null>(null);
  const [selectedFileTypes, setSelectedFileTypes] = useState<any[] | null>(null);
  const [onetime, setonetime] = useState(false)
  const User = useRef<any>(null)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chat',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerShadowVisible: false,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
          <TouchableOpacity onPress={() => console.log('Search pressed in Updates')}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const initialize = async () => {
      const user = await getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      userData.current = user;
    };
    initialize();
  }, []);

  useEffect(() => {
    const getFriend = async () => {
      if (netInfo.isConnected) {
        const result = await getUserById(id)
        if (!result.success) {
          showToast('error', 'top', 'Error', result.message)
        }
      }
      let StoredUser = await getUserInfoByJid(id)
      User.current = StoredUser
    }
    getFriend();
  }, [netInfo.isConnected])


  useEffect(() => {
    const handleReceiveMessage = async (message: any) => {
      console.log("Received message:", message);
      const messageId = await insertMessage(message);
      if (message.sender_jid === id) {
        setMessages((prev) => [...prev, message]);
      }
    }
    registerReceiveMessage(handleReceiveMessage);
    return () => {
      unregisterReceiveMessage(handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (userData.current && id) {
        const messagesData = await getMessages(id);
        setMessages(messagesData);
      }
    };
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFiles) return;

    const messageData = {
      sender_jid: userData.current?._id,
      receiver_jid: id,
      type: 'user',
      message: message.trim() || '',
      fileUrls: selectedFiles || null,
      fileTypes: selectedFileTypes || null,
      timestamp: new Date().toISOString(),
      isCurrentUserSender: true,
      oneTime: onetime,
    };

    try {
      const messageId = await insertMessage(messageData);
      setMessages(prev => [...prev, { ...messageData, id: messageId }]);
      const messageWithId = { ...messageData, id: messageId };
      let urls: string[] = [];
      if (selectedFiles && selectedFiles?.length > 0) {
        const response = await sendFile(selectedFiles);
        if (response?.success) {
          urls = response.response;
          // Update file urls in messageData if needed
          messageData.fileUrls = urls; // or properly type it
          sendMessage(messageData);
          updateMessageStatus(messageId, 'sent');
        } else {
          updateMessageStatus(messageId, 'failed');
        }
      } else {
        sendMessage(messageWithId);
        updateMessageStatus(messageId, 'sent');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    console.log('Send Message:', message);
    setMessage('');
    setSelectedFile(null);
    setSelectedFileTypes(null);
  };


  const renderMessageItem = ({ item }: { item: any }) => {
    const isSender = item.sender_jid === userData.current?._id;

    return (
      <View key={item.id} style={[styles.messageBubble, isSender ? styles.right : styles.left]}>
        <Text style={styles.messageText}>{item.message}</Text>

        {/* Render file if available */}
        {item.fileUrls && item.fileUrls.length > 0 && (
          <View style={styles.fileContainer}>
            {item.fileUrls.map((fileUrl: string, index: number) => {
              const fileType = item.fileTypes?.[index];

              if (fileType && fileType.startsWith('image/')) {
                return (
                  <Image
                    key={index}
                    source={{ uri: fileUrl }}
                    style={styles.fileImage}
                  />
                );
              } else {
                // You can handle different file types here (documents, etc.)
                return (
                  <Text key={index} style={styles.fileText}>
                    Document: {fileUrl}
                  </Text>
                );
              }
            })}
          </View>
        )}

        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  const openCamera = async (): Promise<void> => {
    // const result = await ImagePicker.launchCameraAsync({
    //   mediaTypes: [ImagePicker.MediaType.Images, ImagePicker.MediaType.Videos],
    //   allowsEditing: true,
    //   quality: 1,
    // });

    // if (!result.canceled && result.assets?.length > 0) {
    //   const media: any = result.assets[0];
    //   console.log("Captured Media:", media);
    // }
  };

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      setSelectedFile(prevFiles => (prevFiles ? [...prevFiles, image.uri] : [image.uri]));
      setSelectedFileTypes(prevTypes => (prevTypes ? [...prevTypes, image.type || 'image'] : [image.type || 'image']));
      console.log("Selected Image:", image);
    }
  };

  const pickDocument = async (): Promise<void> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setSelectedFile(prevFiles => (prevFiles ? [...prevFiles, file.uri] : [file.uri]));
      setSelectedFileTypes(prevTypes => (prevTypes ? [...prevTypes, file.mimeType || 'document'] : [file.mimeType || 'document']));
      console.log("Picked Document:", file);
    }
  };

  const pickContact = async (): Promise<void> => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync();
      if (data.length > 0) {
        console.log("Selected Contact:", data[0]);
      }
    }
  };

  const handleCalling = async () => {
    router.push({
      pathname: "/Call",
      params: {
        User: JSON.stringify(User), // must be stringified if object
      },
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={openCamera}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity onPress={() => setMediaModalVisible(true)} style={styles.emojiButton}>
          <MaterialIcons name="attach-file" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Media Popup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mediaModalVisible}
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setMediaModalVisible(false)}>
              <Text style={styles.closeIconText}>✖</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Media</Text>

            <View style={styles.iconRow}>
              <TouchableOpacity onPress={pickImage} style={styles.iconCircle}>
                <Text style={styles.iconText}>📷</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={pickDocument} style={styles.iconCircle}>
                <Text style={styles.iconText}>📄</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={pickContact} style={styles.iconCircle}>
                <Text style={styles.iconText}>📇</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b141a" },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    marginBottom: 5,
    borderRadius: 15,
  },
  right: {
    backgroundColor: '#0066ff', // blue for sent messages
    alignSelf: 'flex-end',
  },
  left: {
    backgroundColor: '#f1f1f1', // gray for received messages
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 5,
  },
  fileContainer: {
    marginTop: 10,
  },
  fileImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 5,
  },
  fileText: {
    color: '#fff',
    fontSize: 12,
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1f3b3e",
    backgroundColor: "#202c33",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "white",
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "rgb(95, 252, 123)",
    padding: 10,
    borderRadius: 20,
  },
  emojiButton: {
    marginLeft: 10,
  },
  chatList: {
    paddingBottom: 70,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeIconText: {
    fontSize: 20,
    color: "#555",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  iconCircle: {
    backgroundColor: "#f0f0f0",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  iconText: {
    fontSize: 28,
  }
});