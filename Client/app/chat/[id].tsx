import { getUser } from "@/Services/LocallyData";
import { getAllUsers, getMessages, getUserInfoByJid, insertMessage, InsertMessageParams, SaveUser, updateMessageStatus } from "@/Database/ChatQuery";
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
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { getUserById, sendFile } from "@/Services/Api";
import { useSocket } from "@/Context/SocketContext";
import { Image } from "react-native";
import showToast from "@/utils/ToastHandler";
import { MessageItem } from "@/types/ChatsType";
export default function ChatScreen() {
  const { sendMessage, registerReceiveMessage, unregisterReceiveMessage } = useSocket();
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const netInfo = useNetInfo();
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<any | null>(null);
  const { id }: { id: string } = useLocalSearchParams();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const message = useRef<string>('');
  const [selectedFiles, setSelectedFile] = useState<string[] | null>(null);
  const [selectedFileTypes, setSelectedFileTypes] = useState<any[] | null>(null);
  const [onetime, setonetime] = useState(false)
  const inputRef = useRef<TextInput>(null);
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
    const fetchMessages = async () => {
      const messagesData: MessageItem[] = await getMessages(id);
      setMessages(messagesData);
    };
    fetchMessages();
  }, []);


  useEffect(() => {
    const handleReceiveMessage = async (message: InsertMessageParams) => {
      // console.log("Received message:", message);
      message={...message,status:"sent"}

      const messageId = await insertMessage(message);

      const addMessage = {
        id: messageId,
        sender_jid: message.sender_jid,
        receiver_jid: message.receiver_jid,
        receiver_type: message.type || "user", // fallback
        message: message.message || "",
        file_urls: message.fileUrls ? JSON.stringify(message.fileUrls) : null,
        file_types: message.fileTypes ? JSON.stringify(message.fileTypes) : null,
        status: "sent",
        timestamp: message.timestamp || new Date().toISOString(),
        oneTime: message.oneTime || false,
        Other_image: userData.current?.image || '',
        Other_name: userData.current?.username || ''
      };

      if (message.sender_jid === id) {
        setMessages((prev) => [...prev, addMessage]);
      }
    };

    registerReceiveMessage(handleReceiveMessage);

    return () => {
      unregisterReceiveMessage(handleReceiveMessage);
    };
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

  const handleSendMessage = async () => {
    if (!message.current.trim() && !selectedFiles) return;

    const messageData: InsertMessageParams = {
      sender_jid: userData.current?._id,
      receiver_jid: id,
      type: 'user',
      message: message.current.trim() || '',
      fileUrls: selectedFiles || null,
      fileTypes: selectedFileTypes || null,
      timestamp: new Date().toISOString(),
      isCurrentUserSender: true,
      oneTime: onetime,
      Sender_image: userData.current?.image || null,
      Sender_name: userData.current?.username || null
    };

    try {
      const messageId = await insertMessage(messageData);
      const addMessage = {
        id: messageId,
        sender_jid: userData.current?._id,
        receiver_jid: id,
        receiver_type: 'user',
        message: message.current.trim() || '',
        file_urls: JSON.stringify(selectedFiles) || "",
        file_types: JSON.stringify(selectedFileTypes) || "",
        status: "sending",
        timestamp: new Date().toISOString(),
        oneTime: onetime,
        Other_image: userData.current?.image || null,
        Other_name: userData.current?.username || null
      };
      setMessages(prev => [...prev, addMessage]);
      let urls: string[] = [];
      if (selectedFiles && selectedFiles?.length > 0) {
        const response = await sendFile(selectedFiles);
        if (response?.success) {
          urls = response.response;
          messageData.fileUrls = urls; 
          sendMessage(messageData);
          updateMessageStatus(messageId, 'sent');
          console.log(messageId,"coming")
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId ? { ...msg, status: 'sent', file_urls: JSON.stringify(urls) } : msg
            )
          );
        } else {
          updateMessageStatus(messageId, 'failed');
        }
      } else {
        sendMessage(messageData);
        updateMessageStatus(messageId, 'sent');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      message.current = '';
      inputRef.current?.clear();
      setSelectedFile(null);
      setSelectedFileTypes(null);
    }
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
    });}

const renderMessageItem = ({ item }: { item: any }) => {
    const isSender = item.sender_jid === userData.current?._id;
    const urls = JSON.parse(item.file_urls || '[]');
    const fileTypes = JSON.parse(item.file_types || '[]');
    return (
      <View key={item.id} style={[styles.messageRow, isSender ? styles.rowReverse : {}]}>
        {/* Small User Image */}
        <Image
          source={{ uri: item.Other_image }}
          style={styles.userImage}
        />

        {/* Message Bubble */}
        <View style={[styles.messageBubble, isSender ? styles.rightBubble : styles.leftBubble]}>
          <Text style={styles.messageText}>{item.message}</Text>

          {/* Render files if available */}
          {urls && urls.length > 0 && (
            <View style={styles.fileContainer}>
              {urls.map((fileUrl: string, index: number) => {
                const fileType = fileTypes?.[index];
                if (fileType && fileType.startsWith('image/')) {
                  return (
                    <Image
                      key={index}
                      source={{ uri: fileUrl }}
                      style={styles.fileImage}
                    />
                  );
                } else {
                  return (
                    <Text key={index} style={styles.fileText}>
                      Document: {fileUrl}
                    </Text>
                  );
                }
              })}
            </View>
          )}

          {/* Timestamp and Status Row */}
          <View style={styles.timeStatusRow}>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

            {isSender && (
              <View style={styles.statusIcon}>
                {item.status === 'sending' ? (
                  <Ionicons name="time-outline" size={14} color="gray" />
                ) : item.status === 'failed' ? (
                  <FontAwesome name="exclamation-circle" size={14} color="red" />
                ) : (
                  <FontAwesome name="check" size={12} color="gray" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
};

  return (
    <View style={styles.container}>
      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatList}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => { }}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          onChangeText={(text) => {
            message.current = text;
          }}
        />

        <TouchableOpacity onPress={() => setMediaModalVisible(true)} style={styles.emojiButton}>
          <MaterialIcons name="attach-file" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Media Modal */}
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
              <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
                <Text style={styles.iconText}>📷</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircle} onPress={pickDocument}>
                <Text style={styles.iconText}>📄</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircle} onPress={pickContact}>
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

  chatList: { paddingBottom: 70, padding: 10 },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  userImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 5,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  leftBubble: {
    backgroundColor: '#e1ffc7',
  },
  rightBubble: {
    backgroundColor: '#dcf8c6',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    marginRight: 4,
  },
  timeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  statusIcon: {
    marginLeft: 2,
  },
  fileContainer: {
    marginTop: 8,
  },
  fileImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 5,
  },
  fileText: {
    fontSize: 13,
    color: '#333',
    marginTop: 5,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "white",
    fontSize: 16,
    marginHorizontal: 8,
    backgroundColor: '#2a3942',
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#25D366",
    padding: 10,
    borderRadius: 20,
  },
  emojiButton: {
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeIconText: {
    fontSize: 22,
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
  },
});
