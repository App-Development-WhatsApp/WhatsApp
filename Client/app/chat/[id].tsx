import { getUser } from "@/Services/LocallyData";
import {
  getMessages,
  getUserInfoByJid,
  insertMessage,
  InsertMessageParams,
  markMessageAsViewed,
  SaveUser,
  updateMessageStatus,
} from "@/Database/ChatQuery";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Linking,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Contacts from "expo-contacts";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getUserById, sendFile } from "@/Services/Api";
import { useSocket } from "@/Context/SocketContext";
import { Image } from "react-native";
import showToast from "@/utils/ToastHandler";
import { MessageItem, UserItem } from "@/types/ChatsType";
import { Video } from "expo-av";
import MediaViewer from "@/components/MediaViewer";

export default function ChatScreen() {
  const { sendMessage, registerReceiveMessage, unregisterReceiveMessage } =
    useSocket();
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const netInfo = useNetInfo();
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<any | null>(null);
  const { id }: { id: string } = useLocalSearchParams();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const message = useRef<string>("");
  const [selectedFiles, setSelectedFile] = useState<string[] | []>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[] | []>([]);
  const [selectedFileNames, setSelectedFilenames] = useState<string[] | []>([]);
  const [onetime, setonetime] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const User = useRef<any>(null);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    fileUrl: string;
    fileType: "image" | "video" | "pdf";
  } | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "#25292e",
      },
      headerTintColor: "#fff",
      headerShadowVisible: false,
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: "#25D366",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#5efc82",
              shadowOpacity: 0.6,
              shadowRadius: 8,
              elevation: 12,
            }}
          >
            <Image
              source={{
                uri: User.current?.image || "https://via.placeholder.com/150",
              }}
              style={{ width: 44, height: 44, borderRadius: 21 }}
            />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
              marginLeft: 10,
            }}
          >
            {User.current?.name || "User"}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            marginRight: 12,
          }}
        >
          {/* Search Icon Wrapper */}
          <TouchableOpacity
            onPress={() => console.log("Search pressed")}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={{ padding: 3 }}>
              <Ionicons name="search" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Call Icon Wrapper */}
          <TouchableOpacity
            onPress={() =>
              handleCalling({
                id: User.current.id,
                jid: User.current.jid,
                name: User.current.name,
                image: User.current.image,
                phone: User.current.phone,
              })
            }
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={{ padding: 3 }}>
              <Ionicons name="call-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Video Icon Wrapper */}
          <TouchableOpacity
            onPress={() => console.log("video")}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={{ padding: 3 }}>
              <Ionicons name="videocam-outline" size={24} color="#fff" />
            </View>
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
      console.log(userData.current, "userData");
    };
    initialize();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesData: MessageItem[] = await getMessages(id);
      // console.log(messagesData)
      setMessages(messagesData);
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = async (message: InsertMessageParams) => {
      console.log("Received message:", message);
      message = { ...message, status: "sent" };

      const messageId = await insertMessage({
        ...message,
        isCurrentUserSender: false,
      });

      const addMessage = {
        id: messageId,
        sender_jid: message.sender_jid,
        receiver_jid: message.receiver_jid,
        receiver_type: message.type || "user", // fallback
        message: message.message || "",
        file_urls: message.fileUrls ? JSON.stringify(message.fileUrls) : null,
        file_types: message.fileTypes
          ? JSON.stringify(message.fileTypes)
          : null,
        status: "sent",
        timestamp: message.timestamp || new Date().toISOString(),
        oneTime: message.oneTime || false,
        Other_image: message.Sender_image || "",
        Other_name: message.Sender_name || "",
      };

      setSelectedFile([]);
      setSelectedFileTypes([]);

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
        const result = await getUserById(id);
        if (!result.success) {
          showToast("error", "top", "Error", result.message);
        }
      }
      let StoredUser = await getUserInfoByJid(id);
      User.current = StoredUser;
      console.log(StoredUser, "user");
    };
    getFriend();
  }, [netInfo.isConnected]);

  const handleSendMessage = async () => {
    if (!message.current.trim() && !selectedFiles) return;

    const messageData: InsertMessageParams = {
      sender_jid: userData.current?._id,
      receiver_jid: id,
      type: "user",
      message: message.current.trim() || "",
      fileUrls: selectedFiles || null,
      fileTypes: selectedFileTypes || null,
      timestamp: new Date().toISOString(),
      isCurrentUserSender: true,
      oneTime: onetime,
      Sender_image: userData.current?.image || null,
      Sender_name: userData.current?.username || null,
    };

    try {
      const messageId = await insertMessage(messageData);
      const addMessage = {
        id: messageId,
        sender_jid: userData.current?._id,
        receiver_jid: id,
        receiver_type: "user",
        message: message.current.trim() || "",
        file_urls: JSON.stringify(selectedFiles) || "",
        file_types: JSON.stringify(selectedFileTypes) || "",
        status: "sending",
        timestamp: new Date().toISOString(),
        oneTime: selectedFiles.length === 1 && onetime,
        Other_image: userData.current?.image || null,
        Other_name: userData.current?.username || null,
      };
      setMessages((prev) => [...prev, addMessage]);
      let urls: string[] = [];
      if (selectedFiles && selectedFiles?.length > 0) {
        const response = await sendFile(
          selectedFiles.map((file, index) => ({
            uri: file,
            fileName: selectedFileNames[index],
          }))
        );
        if (response?.success) {
          urls = response.response;
          messageData.fileUrls = urls;
          sendMessage(messageData);
          updateMessageStatus(messageId, "sent", urls);
          console.log(messageId, "coming");
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, status: "sent", file_urls: JSON.stringify(urls) }
                : msg
            )
          );
        } else {
          updateMessageStatus(messageId, "failed");
        }
      } else {
        sendMessage(messageData);
        updateMessageStatus(messageId, "sent");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      message.current = "";
      inputRef.current?.clear();
      setSelectedFile([]);
      setSelectedFileTypes([]);
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
    console.log(result.assets);

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      setSelectedFile((prevFiles) =>
        prevFiles ? [...prevFiles, image.uri] : [image.uri]
      );
      setSelectedFileTypes((prevFiles) =>
        prevFiles
          ? [...prevFiles, image.mimeType || "image/png"]
          : [image.mimeType || "image/png"]
      );
      setSelectedFilenames((prevFiles) =>
        prevFiles
          ? [...prevFiles, image.fileName || "Untitled"]
          : [image.fileName || "image/png"]
      );
      console.log("Selected Image:", image);
    }

    setMediaModalVisible(false);
  };

  const pickDocument = async (): Promise<void> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setSelectedFile((prevFiles) =>
        prevFiles ? [...prevFiles, file.uri] : [file.uri]
      );
      setSelectedFileTypes((prevFiles) =>
        prevFiles
          ? [...prevFiles, file.mimeType || "image/png"]
          : [file.mimeType || "image/png"]
      );
      setSelectedFilenames((prevFiles) =>
        prevFiles
          ? [...prevFiles, file.name || "Untitled"]
          : [file.name || "image/png"]
      );
      console.log("Picked Document:", file);
    }
    setMediaModalVisible(false);
  };

  const pickContact = async (): Promise<void> => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync();
      if (data.length > 0) {
        console.log("Selected Contact:", data[0]);
      }
    }
    setMediaModalVisible(false);
  };

  const handleCalling = async (user: UserItem) => {
    console.log("Calling");
    router.push({
      pathname: "/call",
      params: {
        User: JSON.stringify(user),
      },
    });
  };

  const removeFile = (fileToRemove: string, index: any) => {
    setSelectedFile((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
    setSelectedFileTypes((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const renderFile = (file: string) => {
    const fileExtension = file.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || "")) {
      // If it's an image
      return (
        <Image
          source={{ uri: file }}
          style={{ width: 50, height: 50, borderRadius: 5 }}
        />
      );
    }

    if (["mp4", "mov", "avi"].includes(fileExtension || "")) {
      // If it's a video
      return (
        <Video
          source={{ uri: file }}
          style={{ width: 50, height: 50, borderRadius: 5 }}
          useNativeControls
        />
      );
    }

    if (["pdf"].includes(fileExtension || "")) {
      return (
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: "#25D366",
            borderRadius: 5,
            padding: 2,
          }}
        >
          <Feather name="file-text" size={40} color="gray" />
        </TouchableOpacity>
      );
    }

    // Default for unsupported file types
    return <Text>Unsupported File</Text>;
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isSender = item.sender_jid === userData.current?._id;
    const urls = JSON.parse(item.file_urls || "[]");
    const fileTypes = JSON.parse(item.file_types || "[]");
    console.log(urls);

    const handleOneTimeView = async () => {
      console.log("One-time view clicked:", item.id);
      const success = await markMessageAsViewed(item.id);
      if (success) {
        console.log("One-time message updated successfully");
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === item.id
              ? {
                  ...msg,
                  oneTime: false,
                  file_urls: "[]",
                  file_types: "[]",
                  message: "One time viewed",
                }
              : msg
          )
        );
      } else {
        console.error("Failed to update one-time message");
      }
    };

    return (
      <View
        key={item.id}
        style={[styles.messageRow, isSender ? styles.rowReverse : {}]}
      >
        {/* Small User Image */}
        <Image source={{ uri: item.Other_image }} style={styles.userImage} />

        {/* Message Bubble */}
        <View
          style={[
            styles.messageBubble,
            isSender ? styles.rightBubble : styles.leftBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.message} </Text>

          {urls && urls.length > 0 && (
            <View style={styles.fileContainer}>
              {item.oneTime && urls.length === 1 ? (
                <TouchableOpacity
                  style={styles.singleFileButton}
                  onPress={handleOneTimeView}
                >
                  <Text style={styles.singleFileButtonText}>
                    View Attachment (One Time)
                  </Text>
                </TouchableOpacity>
              ) : (
                urls.map((fileUrl: string, index: number) => {
                  const fileType = fileTypes?.[index];

                  if (fileType?.startsWith("image")) {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedMedia({ fileUrl, fileType: "image" });
                          setMediaViewerVisible(true);
                          console.log(fileUrl);
                        }}
                      >
                        <Image
                          source={{ uri: fileUrl }}
                          style={styles.fileImage}
                        />
                      </TouchableOpacity>
                    );
                  } else if (fileType?.startsWith("video/")) {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedMedia({ fileUrl, fileType: "video" });
                          setMediaViewerVisible(true);
                        }}
                      >
                        <Video
                          source={{ uri: fileUrl }}
                          style={styles.fileImage}
                          useNativeControls
                          resizeMode="contain"
                          shouldPlay={false}
                        />
                      </TouchableOpacity>
                    );
                  } else if (fileType === "application/pdf") {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.documentBox}
                        onPress={() => {
                          setSelectedMedia({ fileUrl, fileType: "pdf" });
                          setMediaViewerVisible(true);
                        }}
                      >
                        <FontAwesome
                          name="file-pdf-o"
                          size={20}
                          color="#d32f2f"
                        />
                        <Text numberOfLines={1} style={styles.fileText}>
                          {fileUrl.split("/").pop()}
                        </Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.documentBox}
                        onPress={() => Linking.openURL(fileUrl)}
                      >
                        <FontAwesome name="file" size={20} color="#555" />
                        <Text numberOfLines={1} style={styles.fileText}>
                          {fileUrl.split("/").pop()}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                })
              )}
            </View>
          )}

          {/* Timestamp and Status */}
          <View style={styles.timeStatusRow}>
            <Text style={styles.timestamp}>
              {" "}
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
            </Text>

            {isSender && (
              <View style={styles.statusIcon}>
                {item.status === "sending" ? (
                  <Ionicons name="time-outline" size={14} color="gray" />
                ) : item.status === "failed" ? (
                  <FontAwesome
                    name="exclamation-circle"
                    size={14}
                    color="red"
                  />
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

  const handleOneTime = () => {
    setonetime((prev) => !prev);
    console.log(onetime);
  };

  return (
    <View style={styles.container}>
      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatList}
      />
      <View>
        {/* Preview Section  */}
        {selectedFiles && selectedFiles.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
          >
            {selectedFiles.map((file, index) => (
              <View
                key={index}
                style={{ position: "relative", marginRight: 10 }}
              >
                {renderFile(file)}

                {/* Cross button */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "white", // Optional: to make the button stand out
                    borderRadius: 15,
                    padding: 0.1,
                  }}
                  onPress={() => removeFile(file, index)} // Remove file when cross is clicked
                >
                  <Ionicons name="close-circle" size={20} color="#1e1e1e" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="camera" size={26} color="white" marginRight={5} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            onChangeText={(text) => {
              message.current = text;
            }}
          />

          {selectedFiles.length === 1 && (
            <TouchableOpacity onPress={handleOneTime} style={styles.iconButton}>
              <Image
                source={require("../../assets/images/onetime.png")}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: "contain",
                  tintColor: "white",
                }}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setMediaModalVisible(true)}
            style={styles.iconButton}
          >
            <MaterialIcons name="attach-file" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.iconButton}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {selectedMedia && (
        <MediaViewer
          visible={mediaViewerVisible}
          fileType={selectedMedia.fileType}
          fileUrl={selectedMedia.fileUrl}
          onClose={() => {
            setMediaViewerVisible(false);
            setSelectedMedia(null);
          }}
        />
      )}

      {/* Media Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={mediaModalVisible}
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setMediaModalVisible(false)}
            >
              <Text style={styles.closeIconText}>✖</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Media</Text>

            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
                <Icon name="camera-alt" size={35} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircle}
                onPress={pickDocument}
              >
                <Icon name="insert-drive-file" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircle} onPress={pickContact}>
                <Icon name="contact-phone" size={35} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  chatList: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Top align image and bubble
    marginVertical: 6,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  userImage: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginHorizontal: 6,
    backgroundColor: "#444",
    shadowColor: "#5efc82",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  leftBubble: {
    backgroundColor: "#2f2f2f",
    borderTopLeftRadius: 2,
  },
  rightBubble: {
    backgroundColor: "#075e54",
    borderTopRightRadius: 2,
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  fileContainer: {
    marginTop: 6,
  },
  fileImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
  },
  documentBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#555",
    padding: 8,
    borderRadius: 8,
  },
  fileText: {
    marginLeft: 8,
    color: "#eee",
    fontSize: 13,
    maxWidth: 160,
  },
  timeStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: 10,
    color: "#bbb",
  },
  statusIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#fff",
    marginRight: 8,
  },
  iconButton: {
    padding: 6,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(10px)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#292929",
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    elevation: 10,
  },
  closeIcon: {
    alignSelf: "flex-end",
    padding: 10,
    marginRight: 10,
  },
  closeIconText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5efc82",
    shadowColor: "#5efc82",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    margin: 10,
  },
  iconText: {
    fontSize: 30,
    color: "#fff",
  },
  singleFileButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  singleFileButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
