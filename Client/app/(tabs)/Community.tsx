import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TextInput,
  ScrollView,
  Linking,
  Button,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getAllCommunities,
  deleteCommunityById,
  getCommunityMembers,
  getNonCommunityMembers,
  addUsersToCommunity,
  InsertMessageParams,
  insertMessage,
  updateMessageStatus,
} from "@/Database/ChatQuery";
import {
  CommunityItem,
  InsertCommunityMessageParams,
  UserItem,
} from "@/types/ChatsType";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { deleteFiles, sendFile } from "@/Services/Api";
import showToast from "@/utils/ToastHandler";
import * as ImagePicker from "expo-image-picker";
import { useSocket } from "@/Context/SocketContext";
import { getUser } from "@/Services/LocallyData";

export default function Communities() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "view">("add");
  const [selectedCommunityIndex, setSelectedCommunityIndex] = useState<
    number | null
  >(null);
  const userData = useRef<any | null>(null);
  const { sendCommunityMessage } = useSocket();
  const [members, setMembers] = useState<UserItem[]>([]);
  const [nonMembers, setNonMembers] = useState<UserItem[]>([]);
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<{
    [key: string]: boolean;
  }>({});

  const router = useRouter();
  useEffect(() => {
    const initialize = async () => {
      const user = await getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      userData.current = user;
      // console.log(userData.current, "userData");
    };
    initialize();
  }, []);

  const loadCommunities = async () => {
    try {
      const community_info: CommunityItem[] = await getAllCommunities();
      // console.log(community_info);
      setCommunities(community_info);
    } catch (error) {
      console.error("Error loading communities:", error);
    }
  };

  const deleteCommunity = ({ indexToDelete }: { indexToDelete: number }) => {
    Alert.alert("Delete Community", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // setLoading(true); // 🌀 Start Loading

            const community = communities[indexToDelete];

            if (community.image) {
              await deleteFiles([{ uri: community.image }]);
            }

            const result = await deleteCommunityById(community.id);
            if (result) {
              const updated = [...communities];
              updated.splice(indexToDelete, 1);
              setCommunities(updated);
              console.log("Deleted successfully");
              showToast(
                "success",
                "top",
                "Deleted",
                "Community deleted successfully"
              );
            } else {
              console.error("Failed to delete community from database");
            }
            // setLoading(false); // ✅ Stop Loading after operation
          } catch (error) {
            console.error("Error while deleting community:", error);
            // setLoading(false); // ❌ Stop loading even if error occurs
          }
        },
      },
    ]);
  };

  const handleAddMembers = async () => {
    if (selectedCommunityIndex === null) return;

    const selectedUserIds = Object.keys(selectedMembers).filter(
      (id) => selectedMembers[id]
    );

    if (selectedUserIds.length === 0) {
      Toast.show({ type: "error", text1: "Please select at least one member" });
      return;
    }

    try {
      const communityId = communities[selectedCommunityIndex].id;

      await addUsersToCommunity(communityId, selectedUserIds);
      showToast("success", "top", "Added", "Members added successfully!");
      const updatedMembers = await getCommunityMembers(communityId);
      setMembers(updatedMembers);

      setShowModal(false);
    } catch (error) {
      console.error("Error adding members:", error);
      Toast.show({ type: "error", text1: "Failed to add members" });
    }
  };

  const handleSaveMembers = () => {
    Toast.show({ type: "success", text1: "Members list updated!" });
    setShowModal(false);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openModal = async (type: "add" | "view", index: number) => {
    if (index < 0 || index >= communities.length) return;

    const fetchedMembers = await getCommunityMembers(communities[index].id);
    const fetchedNonMembers = await getNonCommunityMembers(
      communities[index].id
    );

    setMembers(fetchedMembers);
    setNonMembers(fetchedNonMembers);

    setModalType(type);
    setSelectedCommunityIndex(index);
    setShowModal(true);

    if (type === "view") {
      const defaultMembers = Object.fromEntries(
        fetchedMembers.map((m) => [m.id, true])
      );
      setSelectedMembers(defaultMembers);
    } else {
      const defaultNonMembers = Object.fromEntries(
        fetchedNonMembers.map((m) => [m.id, false])
      );
      setSelectedMembers(defaultNonMembers);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCommunities();
    }, [])
  );

  function AnnouncementModal({
    isVisible,
    onClose,
  }: {
    isVisible: boolean;
    onClose: () => void;
  }) {
    const [textInput, setTextInput] = useState("");
    const [media, setMedia] = useState<{
      type: string;
      uri: string;
      name: string;
    } | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);

    const openCamera = async () => {
      const result = await ImagePicker.launchCameraAsync();
      if (!result.canceled && result.assets.length > 0) {
        setMedia({
          type: "image",
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || "image.png",
        });
      }
    };

    const pickImage = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
          const image = result.assets[0];
          setMedia({
            type: "image",
            uri: image.uri,
            name: image.fileName || "image.png",
          });
        }
      } catch (error) {
        console.error("Error picking image:", error);
      } finally {
        setPickerVisible(false);
      }
    };
    const handleSend = async () => {
      if(selectedCommunityIndex === null)return;
      const fetchedMembers = await getCommunityMembers(communities[selectedCommunityIndex].id);
      // console.log(selectedCommunityIndex,textInput,communities[selectedCommunityIndex].id,"-----",fetchedMembers)
      if ( fetchedMembers.length===0 || (!textInput.trim() && !media)) return;

      let uploadedUrls: string[] = [];

      try {
        // Step 1: Upload media once (if media exists)
        if (media) {
          const response = await sendFile([
            {
              uri: media.uri,
              fileName: media.name,
            },
          ]);
          if (response?.success) {
            uploadedUrls = response.response; // Save the uploaded file URLs
            console.log(uploadedUrls)
          } else {
            console.error("File upload failed");
            return;
          }
        }
        // Step 2: Send message to all selected members
        await Promise.all(
          fetchedMembers.map(async (member: UserItem) => {
            const messageData: InsertMessageParams = {
              sender_jid: userData.current?._id,
              receiver_jid: member.jid,
              type: "user",
              message: textInput.trim() || "",
              fileUrls: uploadedUrls.length > 0 ? uploadedUrls : null,
              fileTypes: media ? [media.type] : null,
              timestamp: new Date().toISOString(),
              isCurrentUserSender: true,
              oneTime: false,
              Sender_image: userData.current?.image || null,
              Sender_name: userData.current?.username || null,
            };
            console.log(messageData)

            const messageId = await insertMessage(messageData);
            // Now simply update the status (no need to upload again)
            updateMessageStatus(messageId, "sent");
          })
        )
        const addMessage: InsertCommunityMessageParams = {
          sender_jid: userData.current?._id,
          receiver_jids: fetchedMembers.map((member: any) => member.jid),
          type: "user",
          message: textInput.trim() || "",
          fileUrls: uploadedUrls.length > 0 ? uploadedUrls : null,
          fileTypes: media ? [media.type] : null,
          timestamp: new Date().toISOString(),
          isCurrentUserSender: true,
          oneTime: false,
          Sender_image: userData.current?.image || null,
          Sender_name: userData.current?.username || null,
        };
        sendCommunityMessage(addMessage)
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setTextInput("");
        setMedia(null);
        onClose();
        setSelectedCommunityIndex(null)
      }
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={announcementStyles.modalContainer}>
          <View style={announcementStyles.headerRow}>
            <TouchableOpacity onPress={openCamera}>
              <Ionicons name="camera" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPickerVisible(true)}>
              <MaterialIcons name="attach-file" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {media && (
            <View style={announcementStyles.previewBox}>
              <Image
                source={{ uri: media.uri }}
                style={announcementStyles.previewImage}
              />
            </View>
          )}

          <TextInput
            placeholder="Write something..."
            placeholderTextColor="#ccc"
            style={announcementStyles.input}
            value={textInput}
            onChangeText={setTextInput}
          />

          <TouchableOpacity
            style={announcementStyles.sendButton}
            onPress={handleSend}
          >
            <Text style={announcementStyles.sendButtonText}>Send</Text>
          </TouchableOpacity>

          {/* Media Picker Popup */}
          <Modal
            isVisible={pickerVisible}
            onBackdropPress={() => setPickerVisible(false)}
          >
            <View style={announcementStyles.pickerPopup}>
              <TouchableOpacity
                onPress={pickImage}
                style={announcementStyles.pickerOption}
              >
                <Ionicons name="image" size={24} color="white" />
                <Text style={announcementStyles.pickerText}>Pick Image </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </Modal>
    );
  }

  const renderCommunity = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity onPress={() => {
      setAnnouncementVisible(true)
      setSelectedCommunityIndex(index)
    }}>
      <View style={styles.communityBox}>
        <View style={styles.communityHeader}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.communityImage} />
          ) : (
            <Ionicons
              name="people"
              size={32}
              color="white"
              style={styles.communityIcon}
            />
          )}
          <Text style={styles.communityTitle} numberOfLines={1}>
            {item.name}
          </Text>

          <Menu>
            <MenuTrigger>
              <MaterialIcons name="more-vert" size={24} color="#aaa" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  backgroundColor: "#2c2c2c",
                  borderRadius: 25,
                  paddingVertical: 4,
                  minWidth: 130,
                  borderColor: "#25D366",
                  borderWidth: 1,
                },
              }}
            >
              <MenuOption
                onSelect={() => deleteCommunity({ indexToDelete: index })}
              >
                <Text style={{ padding: 10, color: "red" }}>Delete</Text>
              </MenuOption>
              <MenuOption onSelect={() => openModal("add", index)}>
                <Text style={{ padding: 10, color: "white" }}>Add Member</Text>
              </MenuOption>
              <MenuOption onSelect={() => openModal("view", index)}>
                <Text style={{ padding: 10, color: "white" }}>Members</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>

        <View style={styles.messageBox}>
          <View style={styles.messageRow}>
            <MaterialIcons name="campaign" size={20} color="#25D366" />
            <Text style={styles.messageTitle}>Announcements</Text>
            <Text style={styles.time}>3:15 am</Text>
          </View>
          <Text style={styles.messageSubtitle} numberOfLines={1}>
            {item.description || "Welcome to your community!"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.newCommunity}
        onPress={() => router.push("/Communities/CreateCommunity")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color="white" />
          <View style={styles.addIcon}>
            <Ionicons name="add" size={16} color="white" />
          </View>
        </View>
        <Text style={styles.newCommunityText}>New community</Text>
      </TouchableOpacity>

      <FlatList
        data={communities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCommunity}
        contentContainerStyle={communities.length === 0 && { flexGrow: 1 }}
      />

      {/* Bottom Sheet Modal */}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {modalType === "add" ? "Add Members" : "Community Members"}
          </Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {(modalType === "add" ? nonMembers : members).map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => toggleMember(member.id.toString())}
                style={styles.memberRow}
              >
                <Text style={styles.memberName}>{member.name}</Text>
                <MaterialIcons
                  name={
                    selectedMembers[member.id]
                      ? "check-circle"
                      : "radio-button-unchecked"
                  }
                  size={24}
                  color={selectedMembers[member.id] ? "#00A884" : "#aaa"}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={modalType === "add" ? handleAddMembers : handleSaveMembers}
          >
            <Text style={styles.modalButtonText}>
              {modalType === "add" ? "Add" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <AnnouncementModal
        isVisible={announcementVisible}
        onClose={() => setAnnouncementVisible(false)}
      />

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e" },
  newCommunity: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  iconContainer: {
    position: "relative",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3E3E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#25D366",
    borderRadius: 10,
    padding: 2,
  },
  newCommunityText: { color: "white", fontSize: 18, marginLeft: 16 },
  communityBox: {
    backgroundColor: "#1F1F1F",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  communityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "gray",
  },
  communityIcon: { marginRight: 12 },
  communityTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  messageBox: { paddingLeft: 6, marginBottom: 8 },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageTitle: { color: "white", fontWeight: "bold", flex: 1, marginLeft: 8 },
  messageSubtitle: { color: "#ccc", marginLeft: 28 },
  time: { color: "#aaa", fontSize: 12 },

  // Modal styles
  modalContainer: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  memberName: {
    color: "white",
    fontSize: 16,
  },
  modalButton: {
    marginTop: 12,
    backgroundColor: "#00A884",
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
  },
  input: {
    flex: 1,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  previewBox: {
    marginTop: 15,
    alignItems: "center",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginTop: 10,
  },
  documentText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderColor: "#25D366",
    borderWidth: 1,
  },
  pickerOption: {
    paddingVertical: 12,
    width: 180,
    alignItems: "center",
  },
  pickerText: {
    color: "white",
    fontSize: 16,
  },
});

const announcementStyles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backdropFilter: "blur(10px)", // <-- only works on web, mobile equivalent handled by glassy color
    borderColor: "#25D366",
    borderWidth: 1,
    borderBottomWidth: 0
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  previewBox: {
    alignItems: "center",
    marginBottom: 15,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  docBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#3a3a3a",
    borderRadius: 15,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 15,
    color: "white",
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickerPopup: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  pickerText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
});
