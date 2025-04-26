import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getAllCommunities, deleteCommunityById
} from "@/Database/ChatQuery";
import { CommunityItem } from "@/types/ChatsType";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { deleteFiles } from "@/Services/Api";
import showToast from "@/utils/ToastHandler";

export default function Communities() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "view">("add");
  const [selectedCommunityIndex, setSelectedCommunityIndex] = useState<number | null>(null);

  const [availableMembers] = useState([
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
    { id: "4", name: "David" },
    { id: "5", name: "Eve" },
    { id: "6", name: "Alice" },
    { id: "7", name: "Bob" },
    { id: "8", name: "Charlie" },
    { id: "9", name: "David" },
    { id: "10", name: "Eve" },
  ]);

  const [selectedMembers, setSelectedMembers] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

  const loadCommunities = async () => {
    try {
      const community_info: CommunityItem[] = await getAllCommunities();
      console.log(community_info)
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
              showToast('success', 'top', 'Deleted', 'Community deleted successfully');
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


  const handleAddMembers = () => {
    Toast.show({ type: "success", text1: "Members added!" });
    setShowModal(false);
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

  const openModal = (type: "add" | "view", index: number) => {
    setModalType(type);
    setSelectedCommunityIndex(index);
    setShowModal(true);
    if (type === "view") {
      // Default all to selected for demo
      const defaultMembers = Object.fromEntries(
        availableMembers.map((m) => [m.id, true])
      );
      setSelectedMembers(defaultMembers);
    } else {
      setSelectedMembers({});
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

  const renderCommunity = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.communityBox}>
      <View style={styles.communityHeader}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.communityImage} />
        ) : (
          <Ionicons name="people" size={32} color="white" style={styles.communityIcon} />
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
                borderColor: '#25D366',
                borderWidth: 1
              },
            }}
          >
            <MenuOption onSelect={() => deleteCommunity({ indexToDelete: index })}>
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
          <MaterialIcons name="campaign" size={20} color="#00A884" />
          <Text style={styles.messageTitle}>Announcements</Text>
          <Text style={styles.time}>3:15 am</Text>
        </View>
        <Text style={styles.messageSubtitle} numberOfLines={1}>
          {item.description || "Welcome to your community!"}
        </Text>
      </View>
    </View>
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
            {availableMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => toggleMember(member.id)}
                style={styles.memberRow}
              >
                <Text style={styles.memberName}>{member.name}</Text>
                <MaterialIcons
                  name={
                    selectedMembers[member.id] ? "check-circle" : "radio-button-unchecked"
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
    backgroundColor: "#00A884",
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
});
