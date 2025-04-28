// MediaViewer.tsx
import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Video } from "expo-av";
import { AntDesign } from "@expo/vector-icons";

interface MediaViewerProps {
  visible: boolean;
  fileType: "image" | "video";
  fileUrl: string;
  onClose: () => void;
}
const MediaViewer: React.FC<MediaViewerProps> = ({visible,fileType,fileUrl,onClose,}) => {
  console.log(fileUrl, fileType);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="closecircle" size={24} color="white" />
          </TouchableOpacity>

          {/* Media */}
          {fileType === "image" ? (
            <Image
              source={{ uri: fileUrl }}
              style={styles.media}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={{ uri: fileUrl }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    height: "80%",
    width: "90%",
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },
  media: {
    flex: 1,
    backgroundColor:'#25292e'
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});

export default MediaViewer;
