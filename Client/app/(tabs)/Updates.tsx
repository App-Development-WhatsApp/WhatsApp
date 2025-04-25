import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const statuses = [
  { id: '1', name: 'Add status', avatar: 'https://via.placeholder.com/150', isAdd: true },
];

const channels = [
  {
    id: '1',
    name: 'Computer Science',
    message: 'Join me live for todays teaching on...',
    date: '06/05/2024',
  },
  {
    id: '2',
    name: 'EEE',
    message: 'Atlanta this',
    date: '03/05/2024',
  },
  {
    id: '3',
    name: 'ECE',
    message: 'Anyone else watching this weekend?',
    date: '01/05/2024',
  },
];

export default function UpdatesScreen() {
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    setShowPicker(false);
    if (!result.canceled) {
      const asset = result.assets[0]; // Getting the first media asset
      const uri = asset.uri;
      const type = asset.type; // Type is either 'image' or 'video'

      router.push({
        pathname: '/status/uploadstatus',
        params: { uri, type }, // Pass uri and type to the upload status page
      });
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    setShowPicker(false);
    if (!result.canceled) {
      const asset = result.assets[0]; // Getting the first media asset
      const uri = asset.uri;
      const type = asset.type; // Type is either 'image' or 'video'
      console.log('image:',uri)

      router.push({
        pathname: '/status/uploadstatus',
        params: { uri: encodeURIComponent(uri), type }, // Pass uri and type to the upload status page
      });
      console.log(uri, type);
    }
  };

  const renderStatus = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.isAdd) {
          setShowPicker(true);
        }
      }}
    >
      <View style={styles.statusItem}>
        <View style={styles.statusAvatarWrapper}>
          <Image source={{ uri: item.avatar }} style={styles.statusAvatar} />
          {item.isAdd && (
            <View style={styles.addIcon}>
              <Ionicons name="add-circle" size={20} color="#00ff6a" />
            </View>
          )}
        </View>
        <Text style={styles.statusName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChannel = ({ item }: { item: any }) => (
    <TouchableOpacity key={item.id} style={styles.channelItem}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }}
        style={styles.channelAvatar}
      />
      <View style={styles.channelContent}>
        <Text style={styles.channelName}>{item.name}</Text>
        <Text style={styles.channelMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
      <View style={styles.channelRight}>
        <Text style={styles.channelDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {statuses.map((item) => (
            <View key={item.id}>{renderStatus({ item })}</View>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Channels</Text>
        {channels.map((item) => renderChannel({ item }))}

        <Text style={styles.sectionLabel}>Find Channels</Text>
        {channels.map((item, index) => renderChannel({ item }))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose Option</Text>
            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <Ionicons name="camera" size={20} color="#00c853" />
              <Text style={styles.modalButtonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
              <Ionicons name="image" size={20} color="#00c853" />
              <Text style={styles.modalButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  statusItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
    height: 50,
    marginBottom: 25,
  },
  statusAvatarWrapper: {
    position: 'relative',
  },
  statusAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'gray',
  },
  addIcon: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  statusName: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  channelItem: {
    height: 70,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  channelAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: 'white',
  },
  channelContent: {
    flex: 1,
  },
  channelName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  channelMessage: {
    color: '#aaa',
    fontSize: 13,
  },
  channelRight: {
    alignItems: 'flex-end',
  },
  channelDate: {
    color: '#00ff6a',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#00c853',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff5252',
    fontSize: 16,
  },
});
