import React, { useState } from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Video } from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

interface MediaViewerProps {
  visible: boolean;
  fileType: "image" | "video" | "pdf";
  fileUrl: string;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ visible, fileType, fileUrl, onClose }) => {
  const [selectedPrinter, setSelectedPrinter] = useState<any>();

  const print = async () => {
    await Print.printAsync({
      html: `<html><body><img src="${fileUrl}" style="width: 100%;" /></body></html>`,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    const { uri } = await Print.printToFileAsync({
      html: `<html><body><img src="${fileUrl}" style="width: 100%;" /></body></html>`,
    });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

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
          ) : fileType === "video" ? (
            <Video
              source={{ uri: fileUrl }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          ) : (
            <Text style={styles.media}>PDF View</Text>
          )}

          {/* Print Options */}
          {Platform.OS === 'ios' && (
            <>
              <TouchableOpacity style={styles.printButton} onPress={selectPrinter}>
                <Text style={styles.buttonText}>Select Printer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.printButton} onPress={print}>
                <Text style={styles.buttonText}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.printButton} onPress={printToFile}>
                <Text style={styles.buttonText}>Save as PDF</Text>
              </TouchableOpacity>
              {selectedPrinter ? (
                <Text style={styles.selectedPrinter}>
                  {`Selected printer: ${selectedPrinter.name}`}
                </Text>
              ) : undefined}
            </>
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
    padding: 10,
  },
  media: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  printButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedPrinter: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
});

export default MediaViewer;
